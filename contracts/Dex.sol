pragma solidity ^0.6.3;

contract Dex {

  struct Token {
    bytes32 ticker;
    address tokenAddress;
  }

  bytes32[] public tokenList;

  function addToken(
    bytes32 ticker,
    address tokenAddress)
    onlyAdmin()
    external {
    token[ticker] = Token(ticker, tokenAddress);
    tokenList.push(ticker);
  }
};
