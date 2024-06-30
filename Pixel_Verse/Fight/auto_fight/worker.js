const { workerData, parentPort } = require('worker_threads');
const WebSocket = require('ws');
const fs = require('fs');
const { setTimeout } = require('timers/promises');
const { randomInt } = require('crypto');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios');
const cliProgress = require('cli-progress');
const color = require('colors');

// Get config and proxy from workerData
const config = workerData.config;
const proxy = workerData.proxy;

let profit = 0;

const colors = {
    fight: '\x1b[38;5;208m', // Màu cam
    win: '\x1b[38;5;226m',   // Màu vàng
    lose: '\x1b[31m',        // Màu đỏ
    draw: '\x1b[2m',         // Màu xám
    ready: '\x1b[32m',       // Màu xanh
    reset: '\x1b[0m'         // Reset màu sắc về mặc định
};

const word = {
    profit: profit >= 0 ? `[ PROFIT ]`.inverse.bold.yellow : `[ PROFIT ]`.inverse.bold.red,
    fight: `[ FIGHT ]`.inverse.blue.bold,
    win: `[  WIN  ]`.inverse.yellow.bold,
    lose: `[ LOSE  ]`.red.inverse.bold,
    ready: `[ READY ]`.green.inverse.bold,
    start: `[ START ]`.inverse.cyan.bold,
    super: `[ SUPER ]`.inverse.bold.magenta
};

const formatLog = (action) => {
    const actionFormatted = word[action];
    const profitPart = `${word.profit} : ${profit}`.padEnd(50);
    return `${profitPart}  | ${actionFormatted} : `;
};

class Battle {
    constructor(config, proxy) {
        this.url = 'https://api-clicker.pixelverse.xyz/api/users';

        this.secret = config.secret;
        this.tgId = config.tgId;
        this.initData = config.initData;
        this.websocket = null;
        this.battleId = "";
        this.superHit = false;
        this.message = '';
        this.strike = {
            defense: false,
            attack: false
        };
        this.stop_event = false;
        this.rateLimitDelay = 250;

        this.proxyAgent = new HttpsProxyAgent(proxy);
        this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        this.player1 = null;
        this.player2 = null;
    }

    async sendHit() {
        while (!this.stop_event) {
            if (!this.superHit) {
                const content = [
                    "HIT",
                    {
                        battleId: this.battleId
                    }
                ];

                try {
                    // Gửi gói tin đầu tiên
                    this.websocket.send(`42${JSON.stringify(content)}`);
                    await setTimeout(40);
                    // Gửi gói tin thứ hai ngay sau đó
                    this.websocket.send(`42${JSON.stringify(content)}`);
                    await setTimeout(40);
                    // Gửi gói tin thứ hai ngay sau đó
                    this.websocket.send(`42${JSON.stringify(content)}`);
                } catch (error) {
                    console.error("Error sending message:", error);
                    break;
                }
            }
            await setTimeout(230); // Gửi tin nhắn mỗi 110ms
        }
    }

    async listenerMsg() {
        while (!this.stop_event) {
            try {
                const data = await new Promise((resolve, reject) => {
                    this.websocket.once('message', resolve);
                    this.websocket.once('error', reject);
                });

                this.message = data.toString();

                if (this.message.startsWith('42')) {
                    const parsedData = JSON.parse(this.message.slice(2));
                    if (parsedData[0] === "HIT") {
                        parentPort.postMessage(`${formatLog('fight')} ${colors.fight}${this.player1.name} (${parsedData[1].player1.energy}) - (${parsedData[1].player2.energy}) ${this.player2.name}${colors.reset}`);
                    } else if (parsedData[0] === "SET_SUPER_HIT_PREPARE") {
                        this.superHit = true;
                        parentPort.postMessage(`${formatLog('super')} Ready....`)
                    } else if (parsedData[0] === "SET_SUPER_HIT_ATTACK_ZONE") {
                        const content = [
                            "SET_SUPER_HIT_ATTACK_ZONE",
                            {
                                battleId: this.battleId,
                                zone: randomInt(1, 5)
                            }
                        ];
                        this.websocket.send(`42${JSON.stringify(content)}`);
                        this.strike.attack = true;
                        // parentPort.postMessage(`[ SUPER HIT ] : chọn điểm yếu ${zone}`);
                    } else if (parsedData[0] === "SET_SUPER_HIT_DEFEND_ZONE") {
                        const content = [
                            "SET_SUPER_HIT_DEFEND_ZONE",
                            {
                                battleId: this.battleId,
                                zone: randomInt(1, 5)
                            }
                        ];
                        this.websocket.send(`42${JSON.stringify(content)}`);
                        this.strike.defense = true;
                        // parentPort.postMessage(`[ SUPER DEFEND ] : chọn điểm yếu ${zone}`);
                    } else if (parsedData[0] === "SUPER_HIT_ROUND_RESULT") {
                        this.superHit = false;
                        this.strike = { defense: false, attack: false };
                    } else if (parsedData[1].error === 'Not so fast! To many requests') {
                        // parentPort.postMessage('  Đấm nhanh quá, đang giảm tốc độ...\n');
                        setTimeout(this.rateLimitDelay);
                        continue;
                    }
                    else if (parsedData[0] === "ENEMY_LEAVED") {
                    } else if (parsedData[0] === "END") {
                        // await setTimeout(1000);
                        if (parsedData[1].result === "WIN") {
                            profit += parseInt(parsedData[1].reward);
                            parentPort.postMessage(`${formatLog("win")} ${colors.win} +${parsedData[1].reward} Coins${colors.reset}`);
                            await setTimeout(1000);
                        } else {
                            profit -= parseInt(parsedData[1].reward);
                            parentPort.postMessage(`${formatLog("lose")} ${colors.lose} -${parsedData[1].reward} Coins${colors.reset}`);
                            await setTimeout(1000);
                        }
                        await new Promise((resolve) => this.websocket.once('message', resolve));
                        this.stop_event = true;
                        return;
                    }

                    try {
                        if ((this.strike.attack && !this.strike.defense) || (this.strike.defense && !this.strike.attack)) {
                            await new Promise((resolve) => this.websocket.once('message', resolve));
                            await new Promise((resolve) => this.websocket.once('message', resolve));
                        }
                        if (this.strike.attack && this.strike.defense) {
                            await new Promise((resolve) => this.websocket.once('message', resolve));
                            this.websocket.send("3");
                            await new Promise((resolve) => this.websocket.once('message', resolve));
                            this.superHit = false;
                        }
                    } catch {
                    }
                }
            } catch (err) {
                parentPort.postMessage(`Lỗi: ${err}\n`);
                this.stop_event = true;
                return;
            }
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            const uri = "wss://api-clicker.pixelverse.xyz/socket.io/?EIO=4&transport=websocket";
            const websocket = new WebSocket(uri, { agent: this.proxyAgent });
            websocket.setMaxListeners(0);

            websocket.on('open', async () => {
                this.websocket = websocket;
                await new Promise((resolve) => websocket.once('message', resolve));
                const content = {
                    "tg-id": this.tgId,
                    "secret": this.secret,
                    "initData": this.initData
                };

                websocket.send(`40${JSON.stringify(content)}`);
                await new Promise((resolve) => websocket.once('message', resolve));

                const data = await new Promise((resolve) => websocket.once('message', resolve));
                const parsedData = JSON.parse(data.toString().slice(2));
                this.battleId = parsedData[1].battleId;
                this.player1 = {
                    name: parsedData[1].player1.username
                };
                this.player2 = {
                    name: parsedData[1].player2.username
                };
                parentPort.postMessage(`${formatLog('start')} Trận chiến giữa ${parsedData[1].player1.username} - ${parsedData[1].player2.username}`)

                for (let i = 5; i > 0; i--) {
                    parentPort.postMessage(`${formatLog('ready')} ${colors.ready}Trận đấu bắt đầu sau ${i} giây${colors.reset}`);
                    await setTimeout(1000);
                }

                const listenerMsgTask = this.listenerMsg();
                const hitTask = this.sendHit();

                await Promise.all([listenerMsgTask, hitTask]);

                parentPort.postMessage('\n');
                this.progressBar.stop();
                resolve();
            });

            websocket.on('error', (err) => {
                parentPort.postMessage(`WebSocket error: ${err}\n`);
                reject(err);
            });

            websocket.on('close', (code, reason) => {
                this.stop_event = true;
                if (code === 1000 || code === 1005) {
                    // parentPort.postMessage(`  WebSocket được đóng: ${code}, lý do: ${reason}\n`);
                    resolve();
                } else {
                    reject(new Error(`  WebSocket được đóng: ${code}, lý do: ${reason}`));
                }
            });
        });
    }
}

const startNewBattle = async (config, proxy) => {
    const battle = new Battle(config, proxy);
    try {
        parentPort.postMessage(`${formatLog('fight')} --- Bắt đầu trận mới ---`);
        await battle.connect();
        parentPort.postMessage(`${formatLog('fight')} --- Kết thúc trận đấu ---`);
        startNewBattle(config, proxy); // Gọi lại hàm startNewBattle để bắt đầu trận đấu mới
    } catch (error) {
        parentPort.postMessage(`Lỗi khi bắt đầu trận chiến: ${error}\n`);
        startNewBattle(config, proxy);
    }
};

startNewBattle(config, proxy).catch((err) => {
    parentPort.postMessage(`Lỗi khi bắt đầu trận chiến: ${err}\n`);
});

