script {
    fun register(account: &signer) {
        aptos_framework::managed_coin::register<reel::coin::Reel>(account)
    }
}