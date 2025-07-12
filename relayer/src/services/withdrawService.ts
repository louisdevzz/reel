import { aptos, account_treasury, REEL_ADDRESS } from "../config";
import { AccountAddress } from "@aptos-labs/ts-sdk";

class WithdrawService {
    async transferCoin(
        receiverAddress: AccountAddress,
        amount: number | bigint,
    ): Promise<string> {
        try {
            const transaction = await aptos.transaction.build.simple({
                sender: account_treasury.accountAddress,
                data: {
                    function: "0x1::aptos_account::transfer_coins",
                    typeArguments: [REEL_ADDRESS],
                    functionArguments: [receiverAddress, amount],
                },
            });

            const senderAuthenticator = aptos.transaction.sign({ 
                signer: account_treasury, 
                transaction 
            });
            
            const pendingTxn = await aptos.transaction.submit.simple({ 
                transaction, 
                senderAuthenticator 
            });

            return pendingTxn.hash;
        } catch (error) {
            console.error("Error transferring coins:", error);
            throw error;
        }
    }

    async withdrawToUser(userAddress: string, amount: number | bigint): Promise<{ success: boolean; hash?: string; message: string }> {
        try {
            const receiverAddress = AccountAddress.fromString(userAddress);
            const amountBigInt = BigInt(amount) * BigInt(10 ** 8);
            const hash = await this.transferCoin(receiverAddress, amountBigInt);
            
            return {
                success: true,
                hash,
                message: "Withdrawal successful"
            };
        } catch (error) {
            console.error("Error in withdrawToUser:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to process withdrawal"
            };
        }
    }

    async getTreasuryBalance(): Promise<bigint> {
        try {
            const balance = await aptos.getAccountResource({
                accountAddress: account_treasury.accountAddress,
                resourceType: `0x1::coin::CoinStore<${REEL_ADDRESS}>`,
            });
            
            return BigInt(balance.data.coin.value);
        } catch (error) {
            console.error("Error getting treasury balance:", error);
            throw error;
        }
    }
}

export const withdrawService = new WithdrawService(); 