const Block = require("../block/block");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const cryptoHash = require("../crypto/crypto-hash");
const Transaction = require("../services/transaction");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for (let index = 1; index < chain.length; index++) {
            const block = chain[index];
            const actualLastHash = chain[index - 1].hash;
            const { timestamp, lastHash, hash, data, nonce, difficulty } = block;

            const lastDifficulty = chain[index - 1].difficulty;
            if (lastHash !== actualLastHash) return false;

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) return false;
            if ((lastDifficulty - validatedHash) - 1) return false;
        }

        return true;
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        })
        this.chain.push(newBlock);
    }

    replaceChain(chain, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        };
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        };

        onSuccess && onSuccess();
        this.chain = chain;
        console.log(chain);
    }

    validTransactionData({chain}){
        for (let index = 1; index < chain.length; index++) {
            const block = chain[index];
            
            let rewardTransactionCount = 0;

            for (const transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction');
                        return false;
                    }
                }
            }
        }

        return true;
    }
};

module.exports = Blockchain;