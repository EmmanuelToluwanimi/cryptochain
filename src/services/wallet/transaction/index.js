const { v1 } = require('uuid');

class Transaction {
  constructor({ senderWallet, recipient, amount }) {
    this.id = v1();
    this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    // console.log('output',outputMap);
    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    const input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
    // console.log('input',input);
    return input;
  }
}

module.exports = Transaction;