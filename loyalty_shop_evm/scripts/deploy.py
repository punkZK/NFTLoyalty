from brownie import MyLoyaltyShop, MockV3Aggregator, network, config
from scripts.helper_scripts import (
    get_account,
    deploy_mocks,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)

def deploy_my_loyalty_shop():
    print()
    print("---- deploy() ----")
    account = get_account()

    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        price_feed_address = config["networks"][network.show_active()][
            "eth_usd_price_feed"
        ]
    else:
        deploy_mocks()
        price_feed_address = MockV3Aggregator[-1].address

    my_loyalty_shop = MyLoyaltyShop.deploy(
        ## Loyalty NFTs
        price_feed_address,
        # Names 
        ["Earth", "Architecture", "Nature"],
        # Images
        ["QmVF91vSShirL1w81GfJTFvXM6AAxchTT99CZWkAVupnxJ",
        "QmQ66KbomTrKUUBMD8rE9gAyda4nVF5XevbnizHkXjHQ2t",
        "QmTQNceCeGemLkCGk4k6yic1VrtUbgmho1k1PimytHWU83",
        ],
        # Initial Stamps
        [0, 0, 0],
        # Max Stamps
        [5, 5, 5],

        ## Product List
        # Names
        ["Greek Yogurt", "Blue Glazed Donut", "Choco-Shaky Cupcake"],
        # Images
        ["QmQx9NxAAyaubN4CcB6dhQpE368foLypKrNsfGBFxoPZ52",
        "QmUuVFhC3saCC6ReECyDdGHknfdaWRG9WvMmhCenoaT2d5",
        "QmQuwtTPH6MFPwz8FYkUas9rVjpk73cCkyPyc5Jhpbq63D",
        ],
        # Cost
        [45, 125, 375],
        {"from": account}
    )
    print(f"Contact deployed to {my_loyalty_shop.address}")
    return my_loyalty_shop


def main():
    print()
    print("---- main() ----")
    print("Welcome User:", get_account())
    deploy_my_loyalty_shop()
 
   


