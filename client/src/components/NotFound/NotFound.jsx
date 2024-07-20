import React, { useEffect, useState } from 'react'

import styles from './styles.module.scss';

import antler from '../../assets/fanArt/antler.png'
import babelit from '../../assets/fanArt/babelit.jpg'
import budheavyv1 from '../../assets/fanArt/budheavyv1.jpg'
import c14ron from '../../assets/fanArt/c14ron.png'
import c14ron2 from '../../assets/fanArt/c14ron2.png'
import c14ron3 from '../../assets/fanArt/c14ron3.png'
import c14ron4 from '../../assets/fanArt/c14ron4.png'
import c14ron5 from '../../assets/fanArt/c14ron5.png'
import c14ron6 from '../../assets/fanArt/c14ron6.png'
import c14ron7 from '../../assets/fanArt/c14ron7.png'
import c14ron8 from '../../assets/fanArt/c14ron8.png'
import c14ron9 from '../../assets/fanArt/c14ron9.png'
import chris from '../../assets/fanArt/chris.jpg'
import joey from '../../assets/fanArt/joey.jpg'
import kingussy from '../../assets/fanArt/kingussy.jpg'
import lorektemplar from '../../assets/fanArt/lorektemplar.jpg'
import lorektemplar2 from '../../assets/fanArt/lorektemplar2.jpg'
import lorektemplar3 from '../../assets/fanArt/lorektemplar3.jpg'
import rippindownresin from '../../assets/fanArt/rippindownresin.png'
import sham from '../../assets/fanArt/sham.png'
import sham2 from '../../assets/fanArt/sham2.png'
import sham3 from '../../assets/fanArt/sham3.jpg'
import thumbs from '../../assets/fanArt/thumbs.jpg'
import whoopsiesymesy from '../../assets/fanArt/whoopsiesymesy.jpg'
import whoopsiesymesy2 from '../../assets/fanArt/whoopsiesymesy2.jpg'
import NavBar from '../NavBar/NavBar';

let fanArt = [
  {img: antler,
    artist: 'antler'}, 
{img: babelit,
  artist: 'babelit',},
 { img: budheavyv1,
  artist: 'budheavy1'},
  {
    img: c14ron,
    artist: 'c14ron'
  },
  {
    img: c14ron2,
    artist: 'c14ron'
  },
  {
    img: c14ron3,
    artist: 'c14ron'
  },
  {
    img: c14ron4,
    artist: 'c14ron'
  },
  {
    img: c14ron5,
    artist: 'c14ron'
  },
  {
    img: c14ron6,
    artist: 'c14ron'
  },
  {
    img: c14ron7,
    artist: 'c14ron'
  },
  {
    img: c14ron8,
    artist: 'c14ron'
  },
  {
    img: c14ron9,
    artist: 'c14ron'
  },
  {
    img: chris,
    artist: 'Chris',
  },
  {
    img: joey,
    artist: 'Joey',
  },
  {
    img: kingussy,
    artist: 'Kingussy',
  },
  {
    img: lorektemplar,
    artist: 'lorektemplar',
  },
  {
    img: lorektemplar2,
    artist: 'lorektemplar',
  },
  {
    img: lorektemplar3,
    artist: 'lorektemplar',
  },
  {
    img: rippindownresin,
    artist: 'rippindownresin',
  },
  {
    img: sham,
    artist: 'sham',
  },
  {
    img: sham2,
    artist: 'sham',
  },
  {
    img: sham3,
    artist: 'sham',
  },
  {
    img: thumbs,
    artist: 'thumbs',
  },
  {
    img: whoopsiesymesy,
    artist: 'whoopsiesymesy',
  },
  {
    img: whoopsiesymesy2,
    artist: 'whoopsiesymesy',
  },
]

export default function NotFound() {
  const [random, setRandom] = useState(0);

  const generateRandom = () => {
    setRandom(Math.floor(Math.random() * fanArt.length))
  }

  useEffect(() => {
    generateRandom()
  }, [])

  return (
    <>
    <NavBar />
    <div className={styles.notFoundContainer}>
      <h2>Whoa, you got lost in space! enjoy some fan art while you're here.</h2>
      <div className={styles.fanArtContainer}>
      <button onClick={() => generateRandom()} className={styles.rightButton}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg></button>
          <button onClick={() => generateRandom()} className={styles.leftButton}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg></button>
        <img src={fanArt[random].img} alt="fan made art" />
        <p>Artist Discord: {fanArt[random].artist}</p>
      </div>
    </div>
    </>
    
  )
}
