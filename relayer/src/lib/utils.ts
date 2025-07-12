import { aptos, account_relayer, FACTORY_MODULE } from "../config";
import { UserData } from "../types";

export const updateBalance = async(user_addr: string, amount: number) => {
    const amountBigInt = BigInt(amount);
    try{
        const txn = await aptos.transaction.build.simple({
            sender: account_relayer.accountAddress,
            data: {
              function: `${FACTORY_MODULE}::update_balance`,
              functionArguments: [
                user_addr,
                amountBigInt
              ],
            },
        });

        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account_relayer,
            transaction: txn,
        });
      
        const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
        });

        return {
            success: true,
            data: executedTransaction
        }
    }catch(error){
        return {
            success: false,
            message: "Failed to update balance",
            error: error
        }
    }
}

export const registerUser = async (userData: UserData) => {
    try{
        const txn = await aptos.transaction.build.simple({
            sender: account_relayer.accountAddress,
            data: {
              function: `${FACTORY_MODULE}::register_user`,
              functionArguments: [
                userData.user_addr, // user_addr
                userData.username, // username
                userData.full_name, // full_name
                userData.description, // description
                userData.avatar, // avatar (Option<String>)
                userData.banner, // banner (Option<String>)
                userData.category, // category
                userData.sub_category, // sub_category
                userData.email, // email
                userData.tags, // tags
                userData.social.youtube, // youtube
                userData.social.twitter, // twitter
                userData.social.tiktok, // tiktok
                userData.social.twitch, // twitch
                userData.social.instagram, // instagram
                userData.social.website, // website
                userData.social.discord, // discord
                userData.social.telegram, // telegram
                userData.social.facebook, // facebook
                userData.social.linkedin, // linkedin
                userData.social.github, // github
                userData.social.other, // other
              ],
            },
        });
    
        const committedTxn = await aptos.signAndSubmitTransaction({
          signer: account_relayer,
          transaction: txn,
        });
    
        const executedTransaction = await aptos.waitForTransaction({
          transactionHash: committedTxn.hash,
        });

        return {
            success: true,
            data: executedTransaction
        }

    }catch(error){
        return {
            success: false,
            message: "Failed to register user",
            error: error
        }
    }
}

export const sendTip = async(from: string, to: string, amount: number, message?: string, video_id?: string) =>{
    try{
        console.log("from", from)
        console.log("to", to)
        console.log("amount", amount)
        console.log("message", message)
        console.log("video_id", video_id)
        
        const txn = await aptos.transaction.build.simple({
            sender: account_relayer.accountAddress,
            data: {
                function: `${FACTORY_MODULE}::send_tip`,
                functionArguments: [
                    from, // from
                    to, // to
                    amount, // amount
                    message, // message
                    video_id
                ]
            },
        });
    
        const committedTxn = await aptos.signAndSubmitTransaction({
          signer: account_relayer,
          transaction: txn,
        });
    
        const executedTransaction = await aptos.waitForTransaction({
          transactionHash: committedTxn.hash,
        });

        console.log("executedTransaction", executedTransaction)

        return {
            success: true,
            data: executedTransaction
        }

    }catch(error){
        return {
            success: false,
            message: "Failed to send tip",
            error: error
        }
    }
}