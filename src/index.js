const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const Blockchain = require('./app/blockchain/blockchain');
const PubSub = require('./app/services/pubsub');
const { GENERATE_PORT, DEFAULT_PORT } = require('./config');
const TransactionPool = require('./app/services/transaction-pool');
const Wallet = require('./app/services/wallet');
const TransactionMiner = require('./app/services/transaction-miner');


const app = express();
const PORT = GENERATE_PORT();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });
const wallet = new Wallet();
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub
});




const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const syncWithRootState = () => {
  request(`${ROOT_NODE_ADDRESS}/api/blocks`, {}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  })

  request(`${ROOT_NODE_ADDRESS}/api/get-transaction-pool`, {}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootTransactionMap = JSON.parse(body);

      console.log('replace transaction pool map on a sync with', rootTransactionMap);
      transactionPool.setMap(rootTransactionMap);
    }
  })
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')))

// blockchain routes
app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});
app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();

  res.redirect("/api/blocks");
});

// transaction-pool routes
app.get('/api/get-transaction-pool', (req, res) => {
  res.json(transactionPool.transactionMap);
});
app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey
  });

  try {
    if (transaction) {
      transaction.update({
        senderWallet: wallet,
        recipient,
        amount
      });
    } else {
      transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
    }
  } catch (error) {
    return res.status(400).json({
      type: 'error',
      message: error.message
    });
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({
    type: 'success',
    transaction
  });
});

// transaction-miner routes
app.get('/api/mine-transactions', (req, res) => {
  console.log('test', transactionPool);
  transactionMiner.mineTransaction();
  res.redirect("/api/blocks");
});

// wallet routes
app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain.chain,
      address
    })
  });
});

// client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Cryptochain app listening on port ${PORT}!`);
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState()
  }
})