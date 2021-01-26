import React, { useState, useEffect } from 'react';
import { getWeb3, getContracts } from './utils.js';
import App from './App.js';

function LoadingContainer() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contracts, setContracts] = useState(undefined);
}

export default LoadingContainer;
