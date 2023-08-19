const TransactionPool = require(".");
const Blockchain = require("../../blockchain/blockchain");
const Transaction = require("../transaction");
const Wallet = require("../wallet");


describe('TransactionPool', () => {
  let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet(),
      transaction = new Transaction({
        senderWallet,
        recipient: 'fake-recipient',
        amount: 50
      });
  });

  describe('setTransaction()', () => {

    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.transactionMap[transaction.id]
      ).toBe(
        transaction
      );
    })
  })

  describe('existingTransaction()', () => {

    it('returns an existing transaction given in an input address', () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(
        transaction
      );
    })
  });

  describe('validTransactions()', () => {
    let validTransactions, errorMock;

    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock

      for (let index = 0; index < 10; index++) {
        transaction = new Transaction({
          senderWallet,
          recipient: 'any-recipient',
          amount: 30
        });

        if (index % 3 === 0) {
          transaction.input.amount = 999999;
        } else if (index % 8 === 1) {
          transaction.input.signature = new Wallet().sign('foo');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('returns valid transaction', () => {
      expect(
        transactionPool.validTransactions()
      ).toEqual(
        validTransactions
      )
    })

    it('logs error for the invalid transactions', () => {
      transactionPool.validTransactions()
      expect(
        errorMock
      ).toHaveBeenCalled();
    })
  })

  describe('clear()', () => {
    it('clears the transactions', () => {
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({})
    })
  })

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing blockcchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for (let index = 0; index < 6; index++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'foo',
          amount: 20
        });

        transactionPool.setTransaction(transaction);

        if (index % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }
      transactionPool.clearBlockchainTransactions({
        chain: blockchain.chain
      });
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    })
  })
});
