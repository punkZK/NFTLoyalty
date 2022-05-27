import React, {useEffect, useState} from 'react';
import './SelectCard.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCardData } from '../../constants';
import myLoyaltyShop from '../../utils/MyLoyaltyShop.json';

const SelectCard = ({ setCardNFT}) => {
    const [cards, setCards] = useState([]);
    const [loyaltyContract, setLoyaltyContract] = useState(null);

    // Actions
    const mintLoyaltyCardNFTAction = async (cardId) => {
        try {
            if (loyaltyContract) {
                console.log('Minting card in progress...');
                const mintTxn = await loyaltyContract.mintLoyaltyCard(cardId);
                await mintTxn.wait();
                console.log('mintTxn:', mintTxn);
            }
        } catch (error) {
            console.warn('MintCardAction Error:', error);
        }
    };

    useEffect(() => {
        const {ethereum} = window;
        if(ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const loyaltyContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              myLoyaltyShop.abi,
              signer
            );
            console.log('calling SelectCard setLoyaltyContract()');
            setLoyaltyContract(loyaltyContract);
        } else {
            console.log('Ethereum obj not found <SelectCard>')
        }
    },[]);

    useEffect(() => {
        const getCards = async () => {
            try {
                console.log('Getting contract loyalty cards to mint');
                const cardsTxn = await loyaltyContract.getAllDefaultCards();
                console.log('cardsTxn:', cardsTxn);
                const cards = cardsTxn.map( (cardData) => transformCardData(cardData));
                setCards(cards);
            } catch(error) {
                console.error('Something went wrong fetching cards:', error);
            }
        };

        const onCardMint = async (sender, tokenId, cardIndex) => {
            console.log(
                `LoyaltyCardNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} cardIndex: ${cardIndex.toNumber()}`
              );
              if (loyaltyContract) {
                const loyaltyCardNFT = await loyaltyContract.getUserHasLoyaltyCard();
                console.log('LoyaltyCardNFT: ', loyaltyCardNFT);
                setCardNFT(transformCardData(loyaltyCardNFT));
            }
        };

        if (loyaltyContract) {
            console.log("getCards()");
            getCards();
            loyaltyContract.on('LoyaltyCardNFTMinted', onCardMint);
          }

        // Clean up the listener
        return () => {
            if (loyaltyContract) {
                loyaltyContract.off('LoyaltyCardNFTMinted', onCardMint);
            }
        };

    }, [loyaltyContract]);

    const renderCards = () => cards.map( (card, index) => (
        <div className="card-item" key={card.name}>
            <div className="name-container">
                <p>{card.name}</p>
            </div>
            {/* <img src={card.imageURI} alt={card.name} /> */}
            <img src={`https://cloudflare-ipfs.com/ipfs/${card.imageURI}`} alt={card.name}/>
            <button
            type="button"
            className="card-mint-button"
            onClick={()=> mintLoyaltyCardNFTAction(index)}
            >
            {`Mint ${card.name}`}
            </button>
        </div>
    ));


    return(
        <div className="select-card-container">
            <h2>Mint Your Loyalty Card.</h2>
            {cards.length > 0 && (
              <div className="card-grid">{renderCards()}</div>
            )}
        </div>
    )
};

  
export default SelectCard;