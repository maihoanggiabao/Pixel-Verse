const { Worker } = require('worker_threads');
const readline = require('readline');
const fs = require('fs');

// Đọc proxies từ file
const proxies = fs.readFileSync('./proxy.txt', 'utf-8').trim().split('\n');

// Đọc configurations từ file
const configs = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Lưu trữ vị trí con trỏ cho từng worker
const workerLines = {};
const workers = []

// Function để khởi động một worker mới
const startWorker = (config, proxy, workerIndex) => {
    try {
        const worker = new Worker('./worker.js', {
            workerData: { config, proxy }
        });

        worker.on('message', (message) => {
            logging(workerIndex, `${message}\n`);
        });

        worker.on('error', (error) => {
            logging(workerIndex, `error: ${error}`,);
            restartWorker(workerIndex);  // Khởi động lại worker khi gặp lỗi
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                logging(workerIndex, `stopped with exit code ${code}`);
                restartWorker(workerIndex);
            }
            // Khởi động lại worker khi kết thúc
        });
        workers[workerIndex] = worker;
    } catch (error) {
        logging(workerIndex, `Cannot create thread : ${error}`);
        restartWorker(workerIndex);
    }

};

const restartWorker = (workerIndex) => {
    const config = configs[workerIndex % configs.length];
    const proxy = proxies[workerIndex % proxies.length];
    if (workers[workerIndex]) {
        workers[workerIndex].terminate();
    }
    startWorker(config, proxy, workerIndex);
};

const logging = (workerIndex, text) => {
    readline.cursorTo(process.stdout, 0, workerLines[workerIndex]);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`ACC ${workerIndex + 1} | ${text}\n`);
};

const battleLoop = async () => {
    for (let index = 0; index < configs.length && index < proxies.length; index++) {
        workerLines[index] = index + 2; // Đặt vị trí dòng cho mỗi worker (bỏ qua các dòng tiêu đề)
        const config = configs[index % configs.length];
        const proxy = proxies[index % proxies.length];
        startWorker(config, proxy, index);  // Khởi động worker đầu tiên
        await new Promise(resolve => setTimeout(resolve, 500)); // Đợi 500ms giây trước khi khởi động worker tiếp theo
    }
};

battleLoop();
