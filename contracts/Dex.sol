pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex {

  using SafeMath for uint;

  enum Side { BUY, SELL }

  struct Token {
    // byte32 at most 32 characters long and byte32 is easier to manipulate than strings
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
  mapping(bytes32 => mapping(uint => Order[])) public orderBook;
  address public admin;

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
    uint amoun,
    uint price,
    Side side)
    tokenExists(ticker)
    external {

    }

  modifier tokenExists(bytes32 ticker) {
    require(
      tokens[ticker].tokenAddress != address(0),
      'This token does not exist.'
    );
    _;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, 'only admin.');
    _;
  }
}
