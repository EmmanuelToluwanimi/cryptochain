import React, { useEffect, useState } from 'react'
import Blocks from './Blocks';

export default function App() {
  const [walletInfo, setWalletInfo] = useState({
    address: '',
    balance: ''
  });

  async function FetchWalletInfo() {
    let response = await fetch('http://localhost:3000/api/wallet-info');
    response = await response.json() 
    setWalletInfo(response);
  }

  useEffect(() => {
    FetchWalletInfo();
  }, [])
  

  return (
    <div>
      <h2>Welcome to blockchain</h2>
      <div>Address: {walletInfo.address}</div>
      <div>Balance: {walletInfo.balance}</div>
      <br/>
      <Blocks />
    </div>
  )
}
