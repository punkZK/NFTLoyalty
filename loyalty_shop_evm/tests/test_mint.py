from scripts.helper_scripts import get_account, LOCAL_BLOCKCHAIN_ENVIRONMENTS
from scripts.deploy import deploy_my_loyalty_shop
from brownie import network, accounts, exceptions
import pytest


def test_can_mint_and_stamp():
    account = get_account()
    my_loyalty_shop = deploy_my_loyalty_shop()

    tx = my_loyalty_shop.mintLoyaltyCard(0, {"from": account});
    tx.wait(1);
    print(f"Minted Loyalty NFT Card with Tx: {tx}")

    tx = my_loyalty_shop.stampLoyaltyCard({"from": account});
    tx.wait(1);
    print(f"Loyalty NFT Card stamped with Tx: {tx}")

    # entrance_fee = fund_me.getEntranceFee() + 100
    # tx = fund_me.fund({"from": account, "value": entrance_fee})
    # tx.wait(1)
    # assert fund_me.addressToAmountFunded(account.address) == entrance_fee
    # tx2 = fund_me.withdraw({"from": account})
    # tx2.wait(1)
    # assert fund_me.addressToAmountFunded(account.address) == 0


def test_can_purchase_and_get_stamped():
    pass

def test_can_purchase_without_stamp():
    pass

def test_can_redeem():
    pass

def test_only_owner_can_withdraw():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("only for local testing")
    my_loyalty_shop = deploy_my_loyalty_shop()
    bad_actor = accounts.add()
    with pytest.raises(exceptions.VirtualMachineError):
        my_loyalty_shop.withdraw({"from": bad_actor})