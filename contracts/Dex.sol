pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex {

  struct Token {
    // byte32 at most 32 characters long and byte32 is easier to manipulate than strings
    bytes32 ticker;
    address tokenAddress;
  }

  mapping(bytes32 => Token) public tokens;
  bytes32[] public tokenList;
  address public admin;
  mapping(address => mapping(bytes32 => uint)) public traderBalances;

  constructor() public {
    admin = msg.sender;
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
