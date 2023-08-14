const express = require('express');
const Blockchain = require('./blockchain/blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./services/pubsub');
const { GENERATE_PORT, DEFAULT_PORT } = require('./config');
const request = require('request');


const app = express();
const PORT = GENERATE_PORT();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

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


app.listen(PORT, () => {
  console.log(`Cryptochain app listening on port ${PORT}!`);
  if (PORT !== DEFAULT_PORT) {
    syncChains()
  }
})