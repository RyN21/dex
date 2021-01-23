const { expectRevert } = require('@openzeppelin/test-helpers');
const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

const SIDE = {
  BUY: 0,
  SELL: 1
};

contract('Dex', (accounts) => {
  // create mock token variables and dex
  let dai, bat, rep, zrx, dex;
  // create traders
  const [trader1, trader2] = [accounts[1], accounts[2]];
  // produce tickers for through Ascii
  const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX']
    .map(ticker => web3.utils.fromAscii(ticker));

  beforeEach(async() => {
    ([dai, bat, rep, zrx] = await Promise.all([
      Dai.new(),
      Bat.new(),
      Rep.new(),
      Zrx.new()
    ]));
    // create deployed instance of dex smart contract
    dex = await Dex.new();
    // add tokens to dex smart contract instance
    await Promise.all([
      dex.addToken(DAI ,dai.address),
      dex.addToken(BAT ,bat.address),
      dex.addToken(REP ,rep.address),
      dex.addToken(ZRX ,zrx.address)
    ]);
    // create amount variable
    const amount = web3.utils.toWei('1000');
    // create function to seed tokens to a trader
    const seedTokenBalance = async (token, trader) => {
      await token.faucet(trader, amount);
      await token.approve(
        dex.address,
        amount,
        {from: trader}
      );
    };
    // seed trader 1 with tokens
    await Promise.all(
      [dai, bat, rep, zrx].map(
        token => seedTokenBalance(token, trader1)
      )
    );
    // seed trader 2 with tokens
    await Promise.all(
      [dai, bat, rep, zrx].map(
        token => seedTokenBalance(token, trader2)
      )
    );
  });

  it('Should create market order', async () => {
    // Fund trader 1 and create limit order
    await dex.deposit(
      web3.utils.toWei('100'),
      DAI,
      {from: trader1}
    );
    await dex.createLimitOrder(
      REP,
      web3.utils.toWei('10'),
      10,
      SIDE.BUY,
      {from: trader1}
    );

    // Fund trader 2 and create market order
    await dex.deposit(
      web3.utils.toWei('100'),
      REP,
      {from: trader2}
    );
    await dex.createMarketOrder(
      REP,
      web3.utils.toWei('5'),
      SIDE.SELL,
      {from: trader2}
    );

    // Get balances
    const balances = await Promise.all([
      dex.traderBalances(trader1, DAI),
      dex.traderBalances(trader1, REP),
      dex.traderBalances(trader2, DAI),
      dex.traderBalances(trader2, REP)
    ]);

    // Orders for buy side
    const orders = await dex.getOrders(REP, SIDE.BUY);

    assert(orders[0].filled === web3.utils.toWei('5'));
    assert(balances[0].toString() === web3.utils.toWei('50'));
    assert(balances[1].toString() === web3.utils.toWei('5'));
    assert(balances[2].toString() === web3.utils.toWei('50'));
    assert(balances[3].toString() === web3.utils.toWei('95'));
  });

  it('Should NOT create market order if token does not exist', async () => {
    await expectRevert(
      dex.createMarketOrder(
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('1000'),
        SIDE.BUY,
        {from:trader1}
      ),
      'This token does not exist.'
    );
  });

  it('Should NOT create market order if token is DAI', async () => {
    await expectRevert(
      dex.createMarketOrder(
        DAI,
        web3.utils.toWei('1000'),
        SIDE.BUY,
        {from:trader1}
      ),
      'Cannot trade DAI.'
    );
  });

  it('Should NOT create market order if token balance is too low', async () => {
    await dex.deposit(
      web3.utils.toWei('99'),
      REP,
      {from: trader1}
    );

    await expectRevert(
      dex.createMarketOrder(
        REP,
        web3.utils.toWei('100'),
        SIDE.SELL,
        {from: trader1}
      ),
      'Token balance is too low.'
    );
  });

  it('Shoule NOT create market order if DAI balance is too low', async () => {
    await dex.deposit(
      web3.utils.toWei('100'),
      REP,
      {from: trader1}
    );

    await dex.createLimitOrder(
      REP,
      web3.utils.toWei('100'),
      10,
      SIDE.SELL,
      {from: trader1}
    );

    await expectRevert(
      dex.createMarketOrder(
        REP,
        web3.utils.toWei('100'),
        SIDE.BUY,
        {from: trader2}
      ),
      'DAI balance is too low.'
    );
  });
});
