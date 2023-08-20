import React, { useEffect, useState } from 'react'
import Block from './Block';

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
    <div className=''>
      <h3>Blocks</h3>
      {
        blocks.map(block => {
          return ( 
            <Block block={block} key={block.hash} />
          )
        })
      }
    </div>
  )
};
