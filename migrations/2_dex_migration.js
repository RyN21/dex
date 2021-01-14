const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

// define all bytes32 representation of each token
const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX']
.map(ticker => web3.utils.fromAscii(ticker));

module.exports = async function (deployer) {
  // deploy all tokens and dex
  await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map(contract => deployer.deploy(contract))
  );
};
