const MINE_RATE = 1000;
const INITIAL_DIFIICULTY = 3;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash--one',
    difficulty: INITIAL_DIFIICULTY,
    nonce: 0,
    data: []
};

var lookup = {
    '0': '0000',
    '1': '0001',
    '2': '0010',
    '3': '0011',
    '4': '0100',
    '5': '0101',
    '6': '0110',
    '7': '0111',
    '8': '1000',
    '9': '1001',
    'a': '1010',
    'b': '1011',
    'c': '1100',
    'd': '1101',
    'e': '1110',
    'f': '1111',
    'A': '1010',
    'B': '1011',
    'C': '1100',
    'D': '1101',
    'E': '1110',
    'F': '1111'
};

function hexToBinary(s) {
    var ret = '';
    for (var i = 0, len = s.length; i < len; i++) {
        ret += lookup[s[i]];
    }
    return ret;
}

const DEFAULT_PORT = 3000;

function GENERATE_PORT() {
    let PEER_PORT;

    if (process.env.GENERATE_PEER_PORT === 'true') {
        PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
    }

    return PEER_PORT || DEFAULT_PORT;
}
const STARTING_BALANCE = 1000; 

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    hexToBinary,
    GENERATE_PORT,
    DEFAULT_PORT,
    STARTING_BALANCE
};