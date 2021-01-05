pragma solidity ^0.6.3;

contract Dex {

  struct Token {
    bytes32 ticker;
    address tokenAddress;
  }

  mapping(bytes32 => Token) public tokens;
  address public admin;
  bytes32[] public tokenList;

  constructor() {
    admin = msg.sender;
  }

  function addToken(
    bytes32 ticker,
    address tokenAddress)
    onlyAdmin()
    external {
    token[ticker] = Token(ticker, tokenAddress);
    tokenList.push(ticker);
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, 'only admin.');
    _;
  }
}
