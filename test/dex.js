const Dai = artifacts.require('mocks/Dai.sol');
const Bat = artifacts.require('mocks/Bat.sol');
const Rep = artifacts.require('mocks/Rep.sol');
const Zrx = artifacts.require('mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

contract('Dex', (accounts) => {
  // create mock token variables
  let dai, bat, rep, zrx;
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
    const dex = await Dex.new();
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

    const balance = await dex.traderBalances(trader, DAI);
    assert(balance.toString() === amount);
  });
});
