const Transaction = require("../transaction");


class TransactionMiner {
  constructor({
    blockchain, transactionPool, wallet, pubsub
  }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransaction() {
    // get valid transactions from transaction pool
    const validTransactions = this.transactionPool.validTransactions();

    // generate the miner's reward
    const transactionReward = Transaction.rewardTransaction({
      minerWallet: this.wallet
    });
    validTransactions.push(transactionReward);

    // add a block containing transactions to thte blockchain
    this.blockchain.addBlock({ data: validTransactions });

    // broadcast the updated blockchain
    this.pubsub.broadcastChain();

    // clear the pool
    this.transactionPool.clear();
  }
};

module.exports = TransactionMiner;