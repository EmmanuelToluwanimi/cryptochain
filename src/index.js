const express = require('express');
const Blockchain = require('./blockchain/blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./services/pubsub');
const { GENERATE_PORT, DEFAULT_PORT } = require('./config');
const request = require('request');
const TransactionPool = require('./services/transaction-pool');
const Wallet = require('./services/wallet');


const app = express();
const PORT = GENERATE_PORT();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
const transactionPool = new TransactionPool();
const wallet = new Wallet();


const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const syncChains = () => {
  request(`${ROOT_NODE_ADDRESS}/api/blocks`, {}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  })
}

app.use(bodyParser.json());
app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});
app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();

  res.redirect("/api/blocks");
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
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res.status(400).json({
      type: 'error',
      message: error.message
    });
  }

  transactionPool.setTransaction(transaction);

  console.log('transactionPool', transactionPool);
  res.json({
    type: 'success',
    transaction
  });
});


app.listen(PORT, () => {
  console.log(`Cryptochain app listening on port ${PORT}!`);
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})