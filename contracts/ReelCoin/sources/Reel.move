module reel::coin {
    use std::string::utf8;
    use std::signer;
    use aptos_framework::aptos_account;

    use aptos_framework::coin;

    struct Reel {}

    public entry fun initialize(acc: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<Reel>(
            acc,
            utf8(b"Reel"),
            utf8(b"REEL"),
            8,
            true,
        );

        let minted_coins = coin::mint(100000000000000000, &mint_cap);
        aptos_account::deposit_coins(signer::address_of(acc), minted_coins);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_freeze_cap(freeze_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}