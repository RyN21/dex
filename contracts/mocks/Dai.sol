pragma solidity ^0.6.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// Dia smart inherits from ERC20
contract Dai is ERC20 {
  constructor() ERC20('Dai Stablecoin', 'Dai') public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}
