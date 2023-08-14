const Blockchain = require("../blockchain/blockchain")

const blockchain = new Blockchain();

blockchain.addBlock({
  data: 'initial'
});

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let index = 0; index < 10000; index++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
  blockchain.addBlock({ data: `block ${index}` });
  nextBlock = blockchain.chain[blockchain.chain.length - 1];
  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = times.reduce((total, num) => (total + num)) / times.length;
  console.log((`time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms `));
}