const colors = require('colors');

console.log('Regular text');
console.log('Bold text'.bold);
console.log('Dim text'.dim);
console.log('Italic text'.italic);
console.log('Underlined text'.underline);
console.log('Inverse text'.inverse);
console.log('Hidden text'.hidden);
console.log('Strikethrough text'.strikethrough);
console.log('Reset text'.reset); // Trở về mặc định

console.log('Red text'.red);
console.log('Green text'.green);
console.log('Yellow text'.yellow);
console.log('Blue text'.blue);
console.log('Magenta text'.magenta);
console.log('Cyan text'.cyan);
console.log('White text'.white);
console.log('Gray text'.gray); // hoặc grey

let profit = -100; // Ví dụ giá trị của Profit
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
// Test các trường hợp
console.log(formatLog(200, 'fight', '7162105823 (3897.4) - (3770.5) 490134933')); // Ví dụ in ra dòng log cho hành động "fight"
console.log(formatLog(900000, 'fight', '7162105823 (3897.4) - (3770.5) 490134933')); // Ví dụ in ra dòng log cho hành động "fight"
console.log(formatLog('win', '')); // Ví dụ in ra dòng log cho hành động "win"
console.log(formatLog('lose', '')); // Ví dụ in ra dòng log cho hành động "lose"
console.log(formatLog('ready', 'Ready....')); // Ví dụ in ra dòng log cho hành động "ready"

