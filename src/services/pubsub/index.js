const { createClient } = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
}


class PubSub {
  constructor({ blockchain }) {

    this.blockchain = blockchain;

    this.publisher = createClient();
    this.subscriber = createClient();

    this.connectRedis();
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}, Message: ${message}.`);
    const parsedMessage = JSON.parse(message);

    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage);
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
    await this.subscriber.subscribe(channel, (message) => {}, true);
  }

  async broadcastChain() {
    await this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }
}

module.exports = PubSub;