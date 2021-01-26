import React, { useState, useEffect } from 'react';
import { getWeb3, getContracts } from './utils.js';
import App from './App.js';

function LoadingContainer() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contracts, setContracts] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const contracts = await getContracts(web3);
      setWeb3(web3);
      setAccounts(accounts);
      setContracts(contracts);
    }
    init();
  }, []);

  const isReady = () => {
    return (
      typeof web3 !== 'undefined'
      && typeof contracts !== 'undefined'
      && accounts.length > 0
    );
  }

  if(!isReady()) {
    return <div>Loading...</div>;
  }

  return (
    <App
      web3={web3}
      accounts={accounts}
<<<<<<< HEAD
      contract={contracts}
=======
      contract={contract}
>>>>>>> 969f70397ff38a8f07164fb79194f5573f18929c
    />
  );
}

export default LoadingContainer;
