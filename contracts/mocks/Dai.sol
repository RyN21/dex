pragma solidity ^0.6.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';

// Dia smart inherits from ERC20 and ERC20Detailed
contract Dai is ERC20, ERC20Detailed {
  constructor() ERC20Detailed('Dai', 'Dai Stablecoin', 18) public {}
}
