// const { expectRevert } = require('@openzeppelin/test-helpers');
// const Dai = artifacts.require('mocks/Dai.sol');
// const Bat = artifacts.require('mocks/Bat.sol');
// const Rep = artifacts.require('mocks/Rep.sol');
// const Zrx = artifacts.require('mocks/Zrx.sol');
// const Dex = artifacts.require('Dex.sol');
//
// const SIDE = {
//   BUY: 0,
//   SELL: 1
// };
//
// contract('Dex', (accounts) => {
//   // create mock token variables and dex
//   let dai, bat, rep, zrx, dex;
//   // create traders
//   const [trader1, trader2] = [accounts[1], accounts[2]];
//   // produce tickers for through Ascii
//   const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX']
//     .map(ticker => web3.utils.fromAscii(ticker));
//
//   beforeEach(async() => {
//     ([dai, bat, rep, zrx] = await Promise.all([
//       Dai.new(),
//       Bat.new(),
//       Rep.new(),
//       Zrx.new()
//     ]));
//     // create deployed instance of dex smart contract
//     dex = await Dex.new();
//     // add tokens to dex smart contract instance
//     await Promise.all([
//       dex.addToken(DAI ,dai.address),
//       dex.addToken(BAT ,bat.address),
//       dex.addToken(REP ,rep.address),
//       dex.addToken(ZRX ,zrx.address)
//     ]);
//     // create amount variable
//     const amount = web3.utils.toWei('1000');
//     // create function to seed tokens to a trader
//     const seedTokenBalance = async (token, trader) => {
//       await token.faucet(trader, amount);
//       await token.approve(
//         dex.address,
//         amount,
//         {from: trader}
//       );
//     };
//     // seed trader 1 with tokens
//     await Promise.all(
//       [dai, bat, rep, zrx].map(
//         token => seedTokenBalance(token, trader1)
//       )
//     );
//     // seed trader 2 with tokens
//     await Promise.all(
//       [dai, bat, rep, zrx].map(
//         token => seedTokenBalance(token, trader2)
//       )
//     );
//   });
//
//   it('Should create limit order', async () => {
//     // deposit into smart contract
//     await dex.deposit(
//       web3.utils.toWei('100'),
//       DAI,
//       {from: trader1}
//     );
//
//     // create limit order with arguments
//     await dex.createLimitOrder(
//       REP, // ticker symbol
//       web3.utils.toWei('10'), // amount of token
//       10, // price of token
//       SIDE.BUY, // type of order
//       {from: trader1} // from trader
//     );
//
//     // need to create a getOrders function to retrive list of orders
//     const buyOrders = await dex.getOrders(REP, SIDE.BUY);
//     const sellOrders = await dex.getOrders(REP, SIDE.SELL);
//
//     // test limit order was created through buyOrders list
//     assert(buyOrders.length === 1);
//     assert(sellOrders.length === 0);
//     assert(buyOrders[0].trader === trader1);
//     assert(buyOrders[0].ticker === web3.utils.padRight(REP, 64));
//     assert(buyOrders[0].price === '10');
//     assert(buyOrders[0].amount === web3.utils.toWei('10'));
//   });
//
//   it('Should place new limnit orders in the correct place in orderList', async () => {
//     // trader deposits
//     await dex.deposit(
//       web3.utils.toWei('100'),
//       DAI,
//       {from: trader1}
//     );
//     await dex.deposit(
//       web3.utils.toWei('200'),
//       DAI,
//       {from: trader2}
//     );
//
//     // created orders
//     await dex.createLimitOrder(
//       REP,
//       web3.utils.toWei('10'),
//       10,
//       SIDE.BUY,
//       {from: trader1}
//     );
//     await dex.createLimitOrder(
//       REP,
//       web3.utils.toWei('10'),
//       11,
//       SIDE.BUY,
//       {from: trader2}
//     );
//     await dex.createLimitOrder(
//       REP,
//       web3.utils.toWei('10'),
//       9,
//       SIDE.BUY,
//       {from: trader2}
//     );
//
//     // order lists
//     const buyOrders = await dex.getOrders(REP, SIDE.BUY);
//     const sellOrders = await dex.getOrders(REP, SIDE.SELL);
//
//     // assertions
//     assert(buyOrders.length === 3);
//     assert(sellOrders.length === 0);
//     assert(buyOrders[0].trader === trader2);
//     assert(buyOrders[1].trader === trader1);
//     assert(buyOrders[2].trader === trader2);
//     assert(buyOrders[2].price === '9');
//   });
//
//   it('Should NOT create limit order if token does not exist', async () => {
//     await expectRevert(
//       dex.createLimitOrder(
//         web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
//         web3.utils.toWei('1000'),
//         10,
//         SIDE.BUY,
//         {from:trader1}
//       ),
//       'This token does not exist.'
//     );
//   });
//
//   it('Should NOT create limit order if token is DAI', async () => {
//     await expectRevert(
//       dex.createLimitOrder(
//         DAI,
//         web3.utils.toWei('1000'),
//         10,
//         SIDE.BUY,
//         {from:trader1}
//       ),
//       'Cannot trade DAI.'
//     );
//   });
//
//   it('Should NOT create limit order if token balance is too low', async () => {
//     await dex.deposit(
//       web3.utils.toWei('99'),
//       REP,
//       {from: trader1}
//     );
//
//     await expectRevert(
//       dex.createLimitOrder(
//         REP,
//         web3.utils.toWei('100'),
//         10,
//         SIDE.SELL,
//         {from: trader1}
//       ),
//       'Token balance is too low.'
//     );
//   });
//
//   it('Should NOT create limit order if DAI balance is too low', async () => {
//     await dex.deposit(
//       web3.utils.toWei('99'),
//       DAI,
//       {from: trader1}
//     );
//
//     await expectRevert(
//       dex.createLimitOrder(
//         REP,
//         web3.utils.toWei('10'),
//         10,
//         SIDE.BUY,
//         {from: trader1}
//       ),
//       'DAI balance is too low.'
//     );
//   });
// });
