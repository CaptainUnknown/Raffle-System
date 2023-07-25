import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import styles from './styles.module.scss';

export default function Gallery() {
  const mobile = window.matchMedia("(max-width: 767px)")
  const navigate = useNavigate();
  const [nftList, setNftList] = useState([]);
  const [id, setId] = useState(0);

  const setIdInput = () => {
    if (id !== null && id > 0 && id <= 6124){
      navigate(`/details/${id}`)
    } else {
      setId(0)
    }
  }

  const generateRandom = () => {
    return 1 + Math.floor(Math.random() * 6125)
  }
  
  useEffect(() => {
    let idArr = [];
    let num;

    if(mobile.matches) {
      num = '8'
    } else {
      num = '12'
    }
    for (let i = 0; i < num; i++ ) {
      idArr.push('token_ids=' + generateRandom() + '&');
    }
    const options = {
      method: 'GET',
      headers: {Accept: 'application/json', 'X-API-KEY': 'dec6fe4199964cc7990875fb6c623441'}
    }; 
    
    let url = 'https://api.opensea.io/api/v1/assets?' + idArr.join('') + `collection_slug=whoopsiesdoopsies&order_direction=desc&asset_contract_address=0x565AbC3FEaa3bC3820B83620f4BbF16B5c4D47a3&limit=${num}&include_orders=false`
     
    fetch(url, options)
      .then(response => response.json())
      .then(response => setNftList(response.assets))
      .catch(err => console.error(err)); 
    // eslint-disable-next-line
  }, [])

  return (
    <>
    {!mobile.matches && <div id='gallery' className={styles.titleContainer}><h2>GALLERY</h2></div>}
    {mobile.matches && <div id='search' className={styles.searchContainer}>
      <h2>FIND MY WHOOPSIE</h2>
      <div className={styles.search}><input onChange={(e) => setId(e.target.value)} value={id} type='number' min="0" max="6125" />
      <button onClick={() => setIdInput()}>SEARCH</button>
      </div>
    </div>}
    {mobile.matches && <div id='gallery' className={styles.titleContainer}><h2>GALLERY</h2></div>}
   {nftList.length > 0 && ( 
    <div className={styles.galleryContainer}>
        {nftList.map(nft => (
          <a href={`/details/${nft.token_id}`} target="_blank" rel="noopener noreferrer" className={styles.nftCard} key={nft.id}>
            <div className={`${nft.traits.filter(trait => trait.trait_type === 'Faction')[0].value}`}>
              <img src={nft.image_url} alt="whoopdoop nft" />
            </div>
            <p className={styles.nftId}>{nft.name}</p>
          </a>
        ))}
    </div>
    )}
    {!mobile.matches && <div id='search' className={styles.searchContainer}>
      <h2>FIND MY WHOOPSIE</h2>
      <div className={styles.search}><input onChange={(e) => setId(e.target.value)} value={id} type='number' min="0" max="6125" />
      <button onClick={() => setIdInput()}>SEARCH</button>
      </div>
    </div>}
    </>
    
  )
}
