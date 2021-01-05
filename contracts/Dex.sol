pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex {

  struct Token {
    bytes32 ticker;
    address tokenAddress;
  }

  mapping(bytes32 => Token) public tokens;
  address public admin;
  bytes32[] public tokenList;
  mapping(address => mapping(bytes => uint)) public traderBalances;

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
    external {
    
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, 'only admin.');
    _;
  }
}
