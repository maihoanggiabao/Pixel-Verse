const axios = require('axios');
const readline = require('readline');
const moment = require('moment');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://sexyzbot.pxlvrs.io',
    'priority': 'u=1, i',
    'referer': 'https://sexyzbot.pxlvrs.io/',
    'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
};

const getUserData = async (queryData, proxy) => {
    const url = 'https://api-clicker.pixelverse.xyz/api/users';
    headers['initdata'] = queryData;
    try {
        const response = await axios.get(url, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        return response.data;
    } catch (error) {
        console.error(`Lỗi rồi: ${error.message}`);
        return null;
    }
};
const checkProxyIP = async (proxy) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.get('https://api.ipify.org?format=json', {
            httpsAgent: proxyAgent
        });
        if (response.status === 200) {
            console.log('\nĐịa chỉ IP của proxy là:', response.data.ip);
        } else {
            console.error('Không thể kiểm tra IP của proxy. Status code:', response.status);
        }
    } catch (error) {
        console.error('Error khi kiểm tra IP của proxy:', error);
    }
};
const getProgress = async (queryData, proxy) => {
    const url = 'https://api-clicker.pixelverse.xyz/api/mining/progress';
    headers['initdata'] = queryData;
    try {
        const response = await axios.get(url, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        return response.data;
    } catch (error) {
        console.error(`Lỗi rồi: ${error.message}`);
        return null;
    }
};

const getPetsData = async (queryData, proxy) => {
    const url = 'https://api-clicker.pixelverse.xyz/api/pets';
    headers['initdata'] = queryData;
    try {
        const response = await axios.get(url, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        return response.data;
    } catch (error) {
        console.error(`Lỗi rồi: ${error.message}`);
        return null;
    }
};

const claimBalance = async (queryData, proxy) => {
    const url = 'https://api-clicker.pixelverse.xyz/api/mining/claim';
    headers['initdata'] = queryData;
    try {
        const response = await axios.post(url, {}, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        return response.data;
    } catch (error) {
        console.error(`Lỗi rồi: ${error.message}`);
        return null;
    }
};

const calculateTimeDifference = (lastBuyTimeStr) => {
    const lastBuyTime = moment.utc(lastBuyTimeStr);
    const currentTime = moment.utc();
    const duration = moment.duration(currentTime.diff(lastBuyTime));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    console.log(`\r[ Buy Pet ] : Trong vòng ${hours} giờ ${minutes} phút`);
};

const animatedLoading = (durationInMilliseconds) => {
    const frames = ["|", "/", "-", "\\"];
    const endTime = Date.now() + durationInMilliseconds;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const remainingTime = Math.floor((endTime - Date.now()) / 1000);
            const frame = frames[Math.floor(Date.now() / 250) % frames.length];
            process.stdout.write(`\rChờ đợi lần yêu cầu tiếp theo ${frame} - Còn lại ${remainingTime} giây...`);
            if (Date.now() >= endTime) {
                clearInterval(interval);
                process.stdout.write("\rĐang chờ yêu cầu tiếp theo được hoàn thành.\n");
                resolve();
            }
        }, 250);
    });
};

const printWelcomeMessage = () => {
    console.log("==============================================================");
    console.log("Tải tool auto miễn phí tại kênh tele Dân Cày Airdrop");
    console.log("Link: https://t.me/dancayairdrop");
    console.log("==============================================================");
    const currentTime = moment();
    const upTime = moment.duration(currentTime.diff(startTime));
    const days = Math.floor(upTime.asDays());
    const hours = upTime.hours();
    const minutes = upTime.minutes();
    const seconds = upTime.seconds();
    console.log(`Thời gian bot đã chạy: ${days} Ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây\n\n`);
};

const upgradePetIfNeeded = async (queryData, maxLevel, proxy) => {
    const petsData = await getPetsData(queryData, proxy);
    if (petsData) {
        for (const pet of petsData.data) {
            const currentLevel = pet.userPet.level;
            if (currentLevel < maxLevel) {
                const petId = pet.userPet.id;
                const upgradeUrl = `https://api-clicker.pixelverse.xyz/api/pets/user-pets/${petId}/level-up`;
                try {
                    headers['initdata'] = queryData;
                    const upgradeResponse = await axios.post(upgradeUrl, {}, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
                    console.log(`\r[ Upgrade Pet ] : ${pet.name} đã nâng cấp thành công lên Lv. ${currentLevel + 1}`);
                } catch (error) {
                    console.error(`\r[ Upgrade Pet ] : Nâng cấp pet không thành công ${pet.name}: ${error.message}`);
                }
            } else {
                console.log(`\r[ Upgrade Pet ] : ${pet.name} đã đạt tới lv ${maxLevel}`);
            }
        }
    } else {
        console.error(`\r[ Upgrade Pet ] : Không lấy được dữ liệu pet`);
    }
};

const checkDailyRewards = async (queryData, proxy) => {
    const url = 'https://api-clicker.pixelverse.xyz/api/daily-rewards';
    headers['initdata'] = queryData;
    try {
        const response = await axios.get(url, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        const data = response.data;
        const totalClaimed = data.totalClaimed;
        const day = data.day;
        const rewardAmount = data.rewardAmount;
        const todaysRewardAvailable = data.todaysRewardAvailable;
        const statusKlaim = todaysRewardAvailable ? "Chưa được yêu cầu" : "Đã được yêu cầu";
        console.log(`\r[ Daily Reward ] : Day ${day} Amount ${rewardAmount} | Status: ${statusKlaim} | Total Claimed: ${totalClaimed}`);
        if (todaysRewardAvailable) {
            console.log(`\r[ Daily Reward ] : Bắt đầu claim...`);
            await claimDailyReward(queryData, proxy);
        }
        return data;
    } catch (error) {
        console.error(`\r[ Daily Reward ] : Error: ${error.message}`);
        return null;
    }
};

const claimDailyReward = async (queryData, proxy) => {
    const url = 'https://api-clicker.pixelverse.xyz/api/daily-rewards/claim';
    headers['initdata'] = queryData;
    try {
        const response = await axios.post(url, {}, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        const data = response.data;
        const day = data.day;
        const amount = data.amount;
        console.log(`\r[ Daily Reward ] : Claim thành công | Day ${day} | Amount: ${amount}`);
        return data;
    } catch (error) {
        console.error(`\r[ Daily Reward ] : Lỗi: ${error.message}`);
        return null;
    }
};
const jsonData = [
    { "id": "0a6306e5-cc33-401a-9664-a872e3eb2b71", "number": "1" },
    { "id": "d364254e-f22f-4a43-9a1c-5a7c71ea9ecd", "number": "2" },
    { "id": "50e9e942-36d5-4f19-9bb7-c892cb956fff", "number": "3" },
    { "id": "3bfab57c-a57f-48d9-8819-c93c9f531478", "number": "4" },
    { "id": "571523ae-872d-49f0-aa71-53d4a41cd810", "number": "5" },
    { "id": "dc5236dc-06be-456b-a311-cccedbd213ca", "number": "6" },
    { "id": "7ee9ed52-c808-4187-a942-b53d972cd399", "number": "7" },
    { "id": "341195b4-f7d8-4b9c-a8f1-448318f32e8e", "number": "8" },
    { "id": "78e0146f-0dfb-4af8-a48d-4033d3efdd39", "number": "9" },
    { "id": "e8c505ed-df93-47e0-bd2e-0e664d09ba86", "number": "10" },
    { "id": "36621a17-81f3-4d5d-b4e1-4b0cf51d4610", "number": "11" },
    { "id": "bc3f938f-8f4c-467b-a57d-2b40cd500f4b", "number": "12" },
    { "id": "7c3a95c6-75a3-4c62-a20e-896a21132060", "number": "13" },
    { "id": "ef0adeca-be18-4503-9e9a-d93c22bd7a6e", "number": "14" },
    { "id": "90a07a32-431a-4299-be59-598180ee4a8c", "number": "16" },
    { "id": "8074e9c5-f6c2-4012-bfa2-bcc98ceb5175", "number": "17" },
    { "id": "f097634a-c8e8-4de9-b707-575d20c5fd88", "number": "18" },
    { "id": "45f2e16e-fb64-4e15-a3fa-2fb99c8d4a04", "number": "19" },
    { "id": "d59cd843-1b53-4131-9966-641d41aa634b", "number": "20" },

];

const claimDailyCombo = async (queryData, userInputOrder, proxy) => {
    try {
        headers['initdata'] = queryData;
        const response = await axios.get('https://api-clicker.pixelverse.xyz/api/cypher-games/current', { headers, httpsAgent: new HttpsProxyAgent(proxy) });
        if (response.status === 200) {
            const data = response.data;
            const comboId = data.id;
            const numberToIdMap = {};
            jsonData.forEach(item => {
                numberToIdMap[item.number] = item.id;
            });
            const requestData = {};
            userInputOrder.forEach((order, index) => {
                const id = numberToIdMap[order];
                if (id) {
                    requestData[id] = index;
                }
            });
            console.log(`\r[ Daily Combo ] : Đang pick pet...`);
            const answerResponse = await axios.post(`https://api-clicker.pixelverse.xyz/api/cypher-games/${comboId}/answer`, requestData, { headers, httpsAgent: new HttpsProxyAgent(proxy) });
            if (answerResponse.status !== 400) {
                const answerData = answerResponse.data;
                const jumlah = answerData.rewardAmount;
                const percent = answerData.rewardPercent;
                console.log(`\r[ Daily Combo ] : Claim thành công ${jumlah} | ${percent}%`);
            } else {
                const answerData = answerResponse.data;
                console.error(`\r[ Daily Combo ] : Không thể claim ${answerData.message}`);
                return null;
            }
        } else {
            const responseData = response.data;
            if (responseData.code === "BadRequestException") {
                console.error(`\r[ Daily Combo ] : Bạn đã claim daily combo hôm nay`);
            } else {
                console.error(`\r[ Daily Combo ] : Không lấy được dữ liệu combo`);
            }
            return null;
        }
    } catch (error) {
        console.error(`\r[ Daily Combo ] : Error: ${error.message}`);
        return null;
    }
};

const main = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    const autoUpgradePet = (await question("Tự động nâng cấp pet? (mặc định no) (y/n): ")).trim().toLowerCase();
    let maxLevelPet = 10;
    if (autoUpgradePet === 'y') {
        const inputLevel = await question("Bro muốn nâng đến lv bao nhiêu? (mặc định 10 ) : ");
        maxLevelPet = inputLevel ? parseInt(inputLevel, 10) : 10;
    }

    const autoDailyCombo = (await question("Tự động pick Daily Combo? (mặc định no) (y/n): ")).trim().toLowerCase();
    let userInputOrder = [];
    if (autoDailyCombo === 'y') {
        const userInput = await question("Nhập theo số pet trên nhóm: ");
        userInputOrder = userInput.split(',').map(x => parseInt(x.trim(), 10));
    }

    rl.close();

    while (true) {
        printWelcomeMessage();
        try {
            const queries = fs.readFileSync('query.txt', 'utf-8').split('\n').map(line => line.trim());
            const proxies = fs.readFileSync('proxy.txt', 'utf-8').split('\n').map(line => line.trim());

            for (let i = 0; i < queries.length; i++) {
                const queryData = queries[i];
                const proxy = proxies[i % proxies.length];

                await checkProxyIP(proxy);

                const userResponse = await getUserData(queryData, proxy);

                if (userResponse) {
                    const username = userResponse.username || "Không có tên người dùng";
                    const clicksCount = userResponse.clicksCount.toLocaleString('id-ID');
                    const pet = userResponse.pet || {};
                    const levelUpPrice = pet.levelUpPrice ? pet.levelUpPrice.toLocaleString('id-ID') : 'N/A';
                    const petDetails = `Level: ${pet.level || 'N/A'} | Năng lượng: ${pet.energy || 'N/A'} | Tăng cấp pet cần: ${levelUpPrice}`;
                    console.log(`\n========[ ${username} ]========`);
                    console.log(`[ Balance ] : ${clicksCount}`);
                    console.log(`[ Active Pet ] : ${petDetails}`);
                    console.log(`[ Pets ] : Lấy dữ liệu pet...`);

                    const petsData = await getPetsData(queryData, proxy);
                    if (petsData) {
                        petsData.data.forEach(pet => {
                            const petLevel = pet.userPet.level;
                            console.log(`[ Pets ] : ${pet.name} | Lv. ${petLevel}`);
                        });
                    } else {
                        console.error(`[ Pets ] : Không lấy được dữ liệu pet`);
                    }

                    if (autoUpgradePet === 'y') {
                        console.log(`[ Upgrade Pet ] : Nâng cấp pet`);
                        await upgradePetIfNeeded(queryData, maxLevelPet, proxy);
                    }

                    const cekProgress = await getProgress(queryData, proxy);
                    if (cekProgress) {
                        const data = cekProgress;
                        const maxCoin = data.maxAvailable.toLocaleString('id-ID');
                        const canClaim = data.currentlyAvailable.toLocaleString('id-ID');
                        const minClaim = data.minAmountForClaim.toLocaleString('id-ID');
                        const fullClaim = moment(data.nextFullRestorationDate).format("H [giờ] m [phút]");
                        const restoreSpeed = data.restorationPeriodMs;
                        console.log(`[ Progress ] : Max Claim: ${maxCoin} | Min Claim: ${minClaim}`);
                        console.log(`[ Progress ] : Có thể Claim: ${canClaim} | Full Claim: ${fullClaim}`);
                        console.log(`[ Progress ] : Khôi phục tốc độ: ${restoreSpeed}`);
                        console.log(`[ Claim ] : Bắt đầu claim...`);

                        const claim = await claimBalance(queryData, proxy);
                        if (claim) {
                            const claimedAmount = claim.claimedAmount || 0;
                            const amount = claimedAmount.toLocaleString('id-ID');
                            console.log(`[ Claim ] : Claim thành công ${amount}`);
                        } else {
                            console.error(`[ Claim ] : Thất bại`);
                        }
                    } else {
                        console.error(`[ Progress ] : kiểm tra không thành công`);
                    }

                    console.log(`[ Daily Reward ] : Kiểm tra...`);
                    await checkDailyRewards(queryData, proxy);

                    if (autoDailyCombo === 'y') {
                        await claimDailyCombo(queryData, userInputOrder, proxy);
                    }
                } else {
                    console.error(`\n======= Truy vấn sai =======`);
                }
            }

            console.log("Nghỉ ngơi 1 giờ trước khi chạy lại...");
            await animatedLoading(1 * 60 * 60 * 1000);
        } catch (error) {
            console.error(`Đã xảy ra lỗi: ${error.message}`);
        }
    }
};

const startTime = moment();

if (require.main === module) {
    main();
}