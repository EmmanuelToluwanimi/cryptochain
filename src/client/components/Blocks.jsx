import React, { useEffect, useState } from 'react'

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);

  async function FetchBlocks() {
    let response = await fetch('http://localhost:3000/api/blocks');
    response = await response.json()
    setBlocks(response);
    console.log('response', response);
  }

  useEffect(() => {
    FetchBlocks();
  }, [])


  return (
    <div>
      <h3>Blocks</h3>
      {
        blocks.map(block => {
          return (
            <div key={block.hash}>{block.hash}</div>
          )
        })
      }
    </div>
  )
};
