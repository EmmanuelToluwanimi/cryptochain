const cryptoHash = require("../crypto/crypto-hash");
const EC = require("elliptic").ec;

const ec = new EC('secp256k1');
const verifySignature = ({ publicKey, data, signature }) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  return keyFromPublic.verify(cryptoHash(data), signature)
};

module.exports = { ec, verifySignature };