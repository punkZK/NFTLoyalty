import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import {CONTRACT_ADDRESS, transformProductData} from '../../constants';
import myLoyaltyShop from '../../utils/MyLoyaltyShop.json';
import SelectCard from '../SelectCard';

import './Product.css';

const Product = ({cardNFT, setCardNFT}) => {
    const [products, setProducts] = useState([]);
    const [loyaltyContract, setLoyaltyContract] = useState(null);

    const [stampState, setStampState] = useState(null);
    const [redeemState, setRedeemState] = useState(null);

    const buyProductAction = async () => {
        try {
            if(loyaltyContract) {
                console.log('Buying a delicacy ...');
                const priceTxn = await loyaltyContract.getProductPriceInEth(50);
                console.log('The product cost is: {}', priceTxn);
                setStampState('purchasing');
                const purchaseTxn = await loyaltyContract.purchaseProduct(50, { "value": priceTxn});
                await purchaseTxn.wait();
                console.log('purchaseTxn:', purchaseTxn);
                setStampState('purchased');
            }
        } catch (error) {
            console.error("Error purchasing product {}", error);
            setStampState('');
        }
    };

    const redeemLoyaltyCardNFTAction = async () => {
        try{
            if(loyaltyContract) {
                setRedeemState('reedeeming');
                console.log('Redeem loyalty card ...');
                const redeemTxn = await loyaltyContract.redeemLoyaltyCard();
                await redeemTxn.wait();
                console.log('redeemTxn:', redeemTxn);
                setRedeemState('reedeemed');
            }

        } catch(error) {
            console.log("Error redeeming card");
            setRedeemState('');
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
            console.log('calling Product setLoyaltyContract()');
            setLoyaltyContract(loyaltyContract);
        } else {
            console.log('Eth obj not found!');
        }
    },[]);

    useEffect( () => {
        const getProducts = async () => {
            try {
                console.log('Getting products for purchase');
                const productsTxn = await loyaltyContract.getAllProducts();
                console.log('productsTxn:', productsTxn);
                const products = productsTxn.map( (productData) => transformProductData(productData));
                setProducts(products);

            } catch(error) {
                console.error('Something went wrong fetching products:', error);
            }
        };

        const onStampComplete = async (from, cardTokenId, newStampCount) => {
            const tokenId = cardTokenId.toNumber();
            const stampCount = newStampCount.toNumber();
            const sender = from.toString();
            console.log(`StampComplete: ${sender} TokenId: ${tokenId} Stamp Count: ${stampCount}`);

            setCardNFT((prevState) => {
                return { ...prevState, stampCount: stampCount};
            });    
        };

        const onRedeemComplete = async (from, cardTokenId) => {
            const tokenId = cardTokenId.toNumber();
            const sender = from.toString();
            console.log(`RedeemComplete: ${sender} TokenId: ${tokenId}`);

            // setCardNFT(false);
            // setCardNFT(null);
            // setCardNFT((prevState) => {
            //     return { ...prevState};
            // });     
        };

        if (loyaltyContract) {
            console.log("getProducts()");
            getProducts();
            loyaltyContract.on('LoyaltyCardNFTStamped', onStampComplete);
            loyaltyContract.on('LoyaltyCardNFTRedeemed', onRedeemComplete);
        }

        return () => {
            if (loyaltyContract) {
                loyaltyContract.off('LoyaltyCardNFTStamped', onStampComplete);
                loyaltyContract.off('LoyaltyCardNFTRedeemed', onRedeemComplete);
            }
        }

    }, [loyaltyContract]);

    const renderProducts = () => products.map( (product, index) => (
        <div className="card-item" key={product.name}>
            <div className="name-container">
                <p>{product.name}</p>
            </div>
            <img src={product.imageURI} alt={product.name} />
            <button
            type="button"
            className="card-mint-button"
            onClick={()=> buyProductAction()}
            >
            {`Buy ${product.name}`}
            </button>
        </div>
    ));

    const renderContent = () => {
        if(!cardNFT) {
            console.log("render() SelectCard");
            return <SelectCard setCardNFT={setCardNFT}/>;
        } else if(cardNFT) {
            return <Product cardNFT={cardNFT} setCardNFT={setCardNFT}/>;
        }
    };

    return(
        <div className="product-container">
            <div className="select-card-container">
                <p>Products come here</p>
                {products.length > 0 && (
                <div className="card-grid">{renderProducts()}</div>
                )}
            </div>

            <button
            type="button"
            className="card-mint-button"
            onClick={()=> redeemLoyaltyCardNFTAction()}
            >
            {`Redeem ${cardNFT.name}`}
            </button>
            {cardNFT && (
                <div className='cards-container'>
                    <div className='card-container'>
                        <h2>Your card</h2>
                        <div className="card">
                            <div className="image-content">
                                <h2>{cardNFT.name}</h2>
                                <img src={cardNFT.imageURI}
                                alt={`Card ${cardNFT.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={cardNFT.stampCount} max={cardNFT.maxStampCount} />
                                    <p>{`${cardNFT.stampCount} / ${cardNFT.maxStampCount} Stamped`}</p>
                                </div>
                            </div>
                        </div>
                    </div>                    
                </div>
            )}
        </div>
    );
};

export default Product;