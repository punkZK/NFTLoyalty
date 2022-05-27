from brownie import MyLoyaltyShop
from scripts.helper_scripts import get_account

#
# 1. Mint an NFT for a USER from one of the selected choices. ( 0nly 1 per account )
# 2. Stamp an NFT w/ conditions
#     a. One per day max
#     b. Txn amount > $min_amount
# 3. Redeem a fully redeemed NFT for $min_amount
# 4. If redeemed then goto Step#1
#

def mint_loyalty_card():
    print()
    print("---- mint_loyalty_card() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    account = get_account()
    tx = my_loyalty_shop.mintLoyaltyCard(0, {"from": account});
    tx.wait(1);
    print(f"Minted Loyalty NFT Card with Tx: {tx}")

def show_user_loyalty_card():
    print()
    print("---- show_user_loyalty_card() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    account = get_account()
    read_only_operation = my_loyalty_shop.checkIfUserHasLoyaltyCard({"from": account})
    print(f"Read: {read_only_operation}")
    read_only_operation = my_loyalty_shop.getUserHasLoyaltyCard({"from": account})
    print(f"Read: {read_only_operation}")

def show_available_cards_to_mint():
    print()
    print("---- show_available_cards_to_mint() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    read_only_operation = my_loyalty_shop.getAllDefaultCards()
    print(f"Read: {read_only_operation}")

def show_available_products_to_purchase():
    print()
    print("---- show_available_products_to_purchase() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    read_only_operation = my_loyalty_shop.getAllProducts()
    print(f"Read: {read_only_operation}")

def purchase_product():
    print()
    print("---- purchase_product() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    account = get_account()
    tx = my_loyalty_shop.getProductPriceInEth(0.001);
    print(f"The product cost is: {tx}")
    tx = my_loyalty_shop.purchaseProduct(0.001, {"from": account, "value": tx});
    tx.wait(1);
    print(f"Purchase product with Tx: {tx}")

def redeem_product():
    print()
    print("---- redeem_product() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    account = get_account()
    tx = my_loyalty_shop.redeemProduct(0, {"from": account});
    tx.wait(1);
    print(f"Redeem product with Tx: {tx}")

def contract_balance():
    print()
    print("---- contract_balance() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    account = get_account()
    tx = my_loyalty_shop.balance();
    print(f"Balance: {tx}")
    
def contract_pub_fields():
    print()
    print("---- contract_pub_fields() ----")
    my_loyalty_shop = MyLoyaltyShop[-1]
    account = get_account()
    tx = my_loyalty_shop.priceFeed();
    print(f"Balance: {tx}")


def main():
    print()
    print("---- main() ----")
    print("Welcome User:", get_account())
    contract_balance()
    show_available_cards_to_mint()
    show_available_products_to_purchase()
    show_user_loyalty_card()
    # mint_loyalty_card()
    # contract_pub_fields()
    # purchase_product()
    # purchase_product()
    # purchase_product()
    # purchase_product()
    contract_balance()
    show_user_loyalty_card()
    # redeem_product()
    # show_user_loyalty_card()
    # # read_contract()
    # # redeem_loyalty_card(get_account())


def read_contract():
    my_loyalty_shop = MyLoyaltyShop[-1]
    # print(
    #     my_loyalty_shop.loyaltyCardHolders("0xBA54A0Ea3FCC18B786D6A81f8DA109e991409acf")
    # )
    print(my_loyalty_shop.loyaltyCardHolderAttributes(3))
    print(my_loyalty_shop.tokenURI(1))


def redeem_loyalty_card(user_account):
    my_loyalty_shop = MyLoyaltyShop[-1]
    print(my_loyalty_shop.redeemLoyaltyCard({"from": user_account}))
