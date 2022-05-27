// const CONTRACT_ADDRESS = '0xd49cff83d84ed089e2e77a8712a584ccf9988289';
// const CONTRACT_ADDRESS = '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24'; // local ganache
const CONTRACT_ADDRESS = '0xc59b1a01d34f6f99f0c2012f9ddff9f01a407ed0'     // mumbai
const transformCardData = (cardData) => {
    return {
      name: cardData.name,
      imageURI: cardData.imageURI,
      stampCount: cardData.stampCount.toNumber(),
      maxStampCount: cardData.maxStampCount.toNumber(),
    };
  };

  const transformProductData = (productData) => {
    return {
      name: productData.name,
      imageURI: productData.imageURI,
      cost: productData.cost.toNumber(),
    };
  };
export { CONTRACT_ADDRESS, transformCardData, transformProductData };