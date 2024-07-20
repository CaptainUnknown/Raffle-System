import React, { useState, useEffect } from 'react';
import './MVP.scss';
import { useMoralis } from 'react-moralis';
import { ReactComponent as Twitter } from '../../assets/icons/twitter.svg';
export default function MVP() {
    // Context
    const { Moralis, isInitialized } = useMoralis();
    const [MVPMetadata, setMVPMetadata] = useState({
        name: 'Otherguy',
        description: 'Is awesome, does really cool stuff. Is awesome, does really cool stuff. Is awesome, does really cool stuff.',
        twitterURL: 'https://twitter.com/Otherguydoteth',
        avatarURL: 'https://whoopdisk.com/images/343.png'
    });

    return (
        <>
            <div className='MVPWrap'>
                <h1>THIS WEEKS MVP</h1>
                <div className='MVPCard'>
                    <div className='MVPImage' style={{ backgroundImage: `url(${MVPMetadata.avatarURL})` }}>
                        <div className='MVPProfile'
                             onClick={() => window.open(MVPMetadata.twitterURL, '_blank')
                        }>
                            <Twitter />
                        </div>
                    </div>
                    <div className='MVPContent'>
                        <h2>{MVPMetadata.name}</h2>
                        <p>{MVPMetadata.description}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
