import React, { useState, useEffect } from 'react';
import './MVPEdit.scss';
import { useMoralis } from 'react-moralis';
import { useAccount } from 'wagmi';
import RaffleLogin from '../../components/RaffleLogin/RaffleLogin';
import {toast} from 'react-toastify';
import Navbar from '../../components/NavBar/NavBar';

export default function MVPEdit() {
    // Context
    const { Moralis, isInitialized } = useMoralis();
    const { address, isConnecting, isDisconnected } = useAccount();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [MVPMetadata, setMVPMetadata] = useState({});

    useEffect(() => {
        if (!isInitialized && isConnecting && isDisconnected) return;
        if (address === '0x8C5f238c27Df81bde92b79990A2620979D51E37c') setIsAuthenticated(true);
    }, [address, isConnecting, isDisconnected, isInitialized]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMVPMetadata((prevMetadata) => ({
            ...prevMetadata,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // Save the metadata
        console.log('Metadata:', MVPMetadata);

        // const response2 = await Moralis.Cloud.run('getMVP');
        // console.log('Response2:', response2);

        const response = await Moralis.Cloud.run('saveMVP', MVPMetadata);
        console.log('Response:', response);
        toast.success('MVP saved successfully!');
    };

    return (
        <>
            <Navbar />
            <br />

            {!address && <RaffleLogin heading={'Connect to Edit'} tag={'Connect your wallet to add MVP'}/> }
            {!isAuthenticated && !isConnecting && <h1> You're not supposed to be here Mr.Curious! </h1>}
            {isAuthenticated && (
                <div className='MVPEditorWrap'>
                    <div className='MVPEditor'>
                        <h1>Add MVP: </h1>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            placeholder='Name'
                            onChange={handleInputChange}
                        />
                        <textarea
                            type='text'
                            id='description'
                            name='description'
                            placeholder='Description'
                            onChange={handleInputChange}
                        />
                        <input
                            type='text'
                            id='twitter'
                            name='twitter'
                            placeholder='Twitter Profile URL'
                            onChange={handleInputChange}
                        />
                        <input
                            type='text'
                            id='image'
                            name='image'
                            placeholder='Image Avatar URL'
                            onChange={handleInputChange}
                        />
                        <button onClick={handleSave}>Save</button>
                    </div>
                </div>
            )}
        </>
    );
}
