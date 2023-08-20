import React, { useEffect, useState } from 'react'
import Blocks from './Blocks';
import Logo from '../assets/logo.png';

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
    <div className='App'>
      <div>
        <img src={Logo} alt="logo" className='logo' />
      </div>
      <h2>Welcome to blockchain</h2>
      <div className='WalletInfo'>
        <div>Address: {walletInfo.address}</div>
        <div>Balance: {walletInfo.balance}</div>
      </div> 
      <br />
      <Blocks />
    </div>
  )
}
