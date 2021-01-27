import React, { useState, useEffect } from 'react';
import Header from './Header.js';

function App({web3, accounts, contracts}) {
  const [tokens, setTokens] = useState([]);
  const [user, setUser] = useState({
    accounts: [],
    selectedToken: undefined
  });

  const selectToken = token => {
    setUser({...user, selectedToken: token});
  }

  useEffect(() => {
    const init = async () => {
      const rawTokens = await contracts.dex.methods.getTokens().call();
      const tokens = rawTokens.map(token => ({
        ...token,
        ticker: web3.utils.hexToUtf8(token.ticker)
      }));
      setTokens(tokens);
      setUser({accounts, selectedToken: tokens[0]});
    }
    init();
  }, []);

  if(typeof user.selectedToken === 'undefined') {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header
        contracts={contracts}
        tokens={tokens}
        user={user}
        selectToken={selectToken}
      />
    </div>
  );
}

export default App;
