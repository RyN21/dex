const { expectRevert } = require('@openzeppelin/test-helpers');
const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

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

  it('Should DEPOSIT tokens', async () => {
    const amount = web3.utils.toWei('100');
    await dex.deposit(
      amount,
      DAI,
      {from: trader1}
    );

    const balance = await dex.traderBalances(trader1, DAI);
    assert(balance.toString() === amount);
  });

  it('Should NOT DEPOSIT token if token does not exist', async () => {
    await expectRevert(
      await dex.deposit(
        web3.utils.toWei('100'),
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        {from: trader1}
      ),
      'This token does not exist.'
    );
  });

  it.only('Should WITHDRAW tokens', async () => {
    const amount = web3.utils.toWei('100');

    await dex.deposit(
      amount,
      DAI,
      {from: trader1}
    );

    await dex.withdraw(
      amount,
      DAI,
      {from: trader1}
    );

    const [balanceDex, balanceDai] = await Promise.all([
      dex.traderBalances(trader1, DAI),
      dai.balanceOf(trader1)
    ]);

    assert(balanceDex.isZero());
    assert(balanceDai.toString() === web3.utils.toWei('1000'));
  });

  it('Should NOT WITHDRAW token if token does not exist', async () => {
    await expectRevert(
      await dex.withdraw(
        web3.utils.toWei('100'),
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        {from: trader1}
      ),
      'This token does not exist.'
    );
  });

  it('Shoult not WITHDRAW tokens if balance is too low', async () => {
    await dex.deposit(
      amount,
      DAI,
      {from: trader1}
    );
    await expectRevert(
      dex.withdraw(
        web3.utils.toWei('1000'),
        DAI,
        {from: trader1}
      ),
      'Balance too low.'
    );
  });
});
