import React, { useState } from 'react'

export default function Block({block}) {
  const {hash, timestamp, data} = block;
  const hashDisplay = `${hash.substring(0, 15)}...`;
  const stringifiedData = JSON.stringify(data);
  const dataDisplay = stringifiedData.length > 35 ? `${stringifiedData.substring(0, 35)}...` : stringifiedData;

  const [displayTransaction, setDisplayTransaction] = useState(false);
  function ToggleTransaction() {
    setDisplayTransaction(!displayTransaction);
  }
  

  return (
    <div className='Blocks'>
      <div>Hash: {hashDisplay}</div>
      <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
      <div>Data: {dataDisplay}</div>
    </div>
  )
}
