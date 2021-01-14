pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex {

  using SafeMath for uint;

  enum Side { BUY, SELL }

  struct Token {
    // bytes32 at most 32 characters long and bytes32 is easier to manipulate than strings
    bytes32 ticker;
    address tokenAddress;
  }

  struct Order {
    uint id;
    address trader;
    Side side;
    bytes32 ticker;
    uint amount;
    uint filled;
    uint price;
    uint date;
  }

  mapping(bytes32 => Token) public tokens;
  bytes32[] public tokenList;
  mapping(address => mapping(bytes32 => uint)) public traderBalances;
  // for orderBook, uint will represent the enum SIDE: 0 = BUY or 1 = SELL
  mapping(bytes32 => mapping(uint => Order[])) public orderBook;
  address public admin;
  // variable to keep track of what is the current order id
  uint public nextOrderId;
  uint public nextTradeId;
  bytes32 constant DAI = bytes32('DAI');

  event NewTrade(
    uint tradeId,
    uint orderId,
    // indexed: filter the events on the front end
    bytes32 indexed ticker,
    address indexed trader1,
    address indexed trader2,
    uint amount,
    uint price,
    uint date
  );

  constructor() public {
    admin = msg.sender;
  }

  function getOrders(
    bytes32 ticker,
    Side side)
    external
    view
    returns(Order[] memory) {
      return orderBook[ticker][uint(side)];
    }

  function addToken(
    bytes32 ticker,
    address tokenAddress)
    onlyAdmin()
    external {
    tokens[ticker] = Token(ticker, tokenAddress);
    tokenList.push(ticker);
  }

  function deposit(
    uint amount,
    bytes32 ticker)
    tokenExists(ticker)
    external {
    IERC20(tokens[ticker].tokenAddress).transferFrom(
      msg.sender, // sends from sender
      address(this), // sends to this smart contract
      amount // amount to be sent
    );
    traderBalances[msg.sender][ticker] += amount;
  }

  function withdraw(
    uint amount,
    bytes32 ticker)
    tokenExists(ticker)
    external {
    require(
      traderBalances[msg.sender][ticker] >= amount,
      'Balance too low.'
    );
    traderBalances[msg.sender][ticker] -= amount;
    IERC20(tokens[ticker].tokenAddress).transfer(
      msg.sender, // recipient is the sender of this transaction
      amount // amount to be withdrawn
    );
  }

  function createLimitOrder(
    bytes32 ticker,
    uint amount,
    uint price,
    Side side)
    tokenExists(ticker)
    tokenIsNotDai(ticker)
    external {
    if(side == Side.SELL) {
      require(
        traderBalances[msg.sender][ticker] >= amount,
        'Token balance is too low.'
      );
    } else {
      require(
        // mul = amount multiplied by price
        traderBalances[msg.sender][DAI] >= amount.mul(price),
        'DAI balance is too low.'
      );
    }
    Order[] storage orders = orderBook[ticker][uint(side)]; // cast side enum into an integer
    orders.push(Order(
      nextOrderId,
      msg.sender,
      side,
      ticker,
      amount,
      0,
      price,
      now
    ));

    uint i = orders.length - 1;
    while(i > 0) {
      if(side == Side.BUY && orders[i - 1].price > orders[i].price) {
        break;
      }
      if(side == Side.SELL && orders[i - 1].price < orders[i].price) {
        break;
      }

      // save previous order element in in memory
      Order memory order = orders[i - 1];

      // orders[i] == current element
      // order == previous element

      // swap current order element to previous index
      orders[i - 1] = orders[i];

      // swap previous order element to next index
      orders[i] = order;

      // decrement i
      i--;
    }
    // increment nextOrderId
    nextOrderId++;
  }

  function createMarketOrder(
    bytes32 ticker,
    uint amount,
    Side side)
    tokenExists(ticker)
    tokenIsNotDai(ticker)
    external {
    if(side == Side.SELL) {
      require(
        traderBalances[msg.sender][ticker] >= amount,
        'Token balance is too low.'
      );
    }
    // if side == Side.BUY then we want the SELL orders otherwhise we want the BUY orders
    // cast into integer so that we can access the correct key in the order book as an integer
    Order[] storage orders = orderBook[ticker][uint (side == Side.BUY ? Side.SELL : Side.BUY)]
    uint i;
    uint remaining = amount;

    while(i < orders.lenght && remaining > 0) {
      uint available = orders[i].amount - orders[i].filled;
      uint matched = (remaining > available) ? available : remaining;
      remaining -= matched;
      order[i].filled += matched;
    }
  }

  modifier tokenExists(bytes32 ticker) {
    require(
      tokens[ticker].tokenAddress != address(0),
      'This token does not exist.'
    );
    _;
  }

  modifier tokenIsNotDai(bytes32 ticker) {
    require(ticker != DAI, 'Cannot trade DAI');
    _;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, 'only admin.');
    _;
  }
}
