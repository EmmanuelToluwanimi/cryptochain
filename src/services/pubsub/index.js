const { createClient } = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',

}


class PubSub {
  constructor({ blockchain, transactionPool }) {

    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = createClient();
    this.subscriber = createClient();

    this.connectRedis();
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}, Message: ${message}.`);
    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage);
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.parse(parsedMessage);
        break;

      default:
        break;
    }
  }

  async connectRedis() {
    await this.publisher.connect();
    await this.subscriber.connect();
    await this.subscribeToChannels();
  }

  async subscribeToChannels() {
    for (const _name of Object.values(CHANNELS)) {
      await this.subscriber.subscribe(_name, (message, channel) => {
        this.handleMessage(channel, message)
      }, true);
    }
  }

  async publish({ channel, message }) {
    await this.subscriber.unsubscribe(channel);
    await this.publisher.publish(channel, message);
    await this.subscriber.subscribe(channel, (message) => { }, true);
  }

  async broadcastChain() {
    await this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }

  async broadcastTransaction(transaction) {
    await this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    })
  }
}

module.exports = PubSub;