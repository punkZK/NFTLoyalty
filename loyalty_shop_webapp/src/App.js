import React, {useEffect, useState} from 'react';
import './App.css';

import SelectCard from './Components/SelectCard';
import Product from './Components/Product';
import { CONTRACT_ADDRESS, transformCardData } from './constants';

import myLoyaltyShop from './utils/MyLoyaltyShop.json';

import { ethers } from 'ethers';


const App = () => {

    const [currentAccount, setCurrentAccount] = useState(null);
    const [cardNFT, setCardNFT] = useState(null);

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;
            if(!ethereum) {
                console.log("Wen u download Metamask?");
                return;
            } else {
    
                console.log("^-^ MM in the house ^-^");
                const accounts = await ethereum.request({method: 'eth_accounts'});
    
                if (accounts.length !== 0) {
                    const account = accounts[0];
                    console.log("Found an active account: ", account);
                    setCurrentAccount(account);
                } else {
                    console.log("No active account!!!");
                }
            }
        } catch(error) {
            console.log(error);
        }
    }

    const connectWalletAction = async () => {
        console.log("Button connected");
        try {

            const {ethereum} =  window;

            if(!ethereum) {
                console.log("?? You really Need to Install Metamask ??");
                alert("?? You really Need to Install Metamask ??");
                return;
            } else {
                const accounts = await ethereum.request({method: 'eth_requestAccounts'});
                console.log("Connected: ", accounts[0])
                setCurrentAccount(accounts[0]);
            }
        } catch(error) {
            console.log(error);
        }
    }

    const renderContent = () => {
        if(!currentAccount){
            return(
                <div className="connect-wallet-container">
                    {/* <img src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv" alt="Monty Python Gif"/> */}
                    <img src="https://media.giphy.com/media/TJri0v0Vi6b5n2cMxz/giphy.gif" alt="Track Loyalty"/>
                    <button className="cta-button connect-wallet-button" onClick={connectWalletAction}>
                        Login via Wallet
                    </button>
                </div>
            )
        } else if(currentAccount && !cardNFT) {
            console.log("render() SelectCard");
            return <SelectCard setCardNFT={setCardNFT}/>;
        } else if(currentAccount && cardNFT) {
            return <Product cardNFT={cardNFT} setCardNFT={setCardNFT}/>;
        }
    };

    useEffect(() => {checkIfWalletIsConnected();},[]);

    useEffect(() => {
        const fetchCardNFTMetadata = async () => {
            console.log('Checking for a Loyalty NFT Card for user address:', currentAccount);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const loyaltyShopContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              myLoyaltyShop.abi,
              signer
            );

            const txn = await loyaltyShopContract.checkIfUserHasLoyaltyCard();
            if (txn) {
                console.log("True {}", txn);
                const txn_ = await loyaltyShopContract.getUserHasLoyaltyCard();
                if (txn_.name) {
                    console.log('User has Loyalty Card NFT');
                    setCardNFT(transformCardData(txn_));
                }      
            } else {
              console.log('No Loyalty Card NFT found');
            }

        };
        if (currentAccount) {
            console.log('CurrentAccount:', currentAccount);
            fetchCardNFTMetadata();
          }
    },[currentAccount]);


    return(
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text"> Loyalty Store </p>
                    <p className="sub-text">Get your loyalty card and track purchases!</p>
                </div>
                { renderContent() }
                <div className="footer-container">
                </div>
            </div>
        </div>
    )
};

export default App;