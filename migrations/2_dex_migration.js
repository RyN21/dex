const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

// define all bytes32 representation of each token
const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX']
  .map(ticker => web3.utils.fromAscii(ticker));

const SIDE = {
  BUY: 0,
  SELL: 1
};

module.exports = async function(deployer, _network, accounts) {
  const [trader1, trader2, trader3, trader4, _] = accounts;
  // deploy all tokens and dex
  await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map(contract => deployer.deploy(contract))
  );

  // add promise to get the pointers to all the deployed instances
  const [dai, bat, rep, zrx, dex] = await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map(contract => contract.deployed())
  );

  // add tokens to dex
  await Promise.all([
    dex.addToken(DAI, dai.address),
    dex.addToken(BAT, bat.address),
    dex.addToken(REP, rep.address),
    dex.addToken(ZRX, zrx.address)
  ]);

  // Seed traders with tokens
  const amount = web3.utils.toWei('1000');
  const seedTokenBalance = async (token, trader) => {
    await token.faucet(trader, amount)
    await token.approve(
      dex.address,
      amount,
      {from: trader}
    );
    const ticker = await token.name();
    await dex.deposit(
      amount,
      web3.utils.fromAscii(ticker),
      {from: trader}
    );
  };
  await Promise.all(
    [dai, bat, rep, zrx].map(
      token => seedTokenBalance(token, trader1)
    )
  );
  await Promise.all(
    [dai, bat, rep, zrx].map(
      token => seedTokenBalance(token, trader2)
    )
  );
  await Promise.all(
    [dai, bat, rep, zrx].map(
      token => seedTokenBalance(token, trader3)
    )
  );
  await Promise.all(
    [dai, bat, rep, zrx].map(
      token => seedTokenBalance(token, trader4)
    )
  );

  const increaseTime = async (seconds) => {
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: 0,
    }, () => {});
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: 0,
    }, () => {});
  }
};
