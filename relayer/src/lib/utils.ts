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

export const updateUserInfo = async (userData: {
  user_addr: string;
  full_name: string;
  description: string;
  avatar?: string;
  banner?: string;
  category: string;
  sub_category: string;
  tags: string[];
  social: {
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    twitch?: string;
    instagram?: string;
    website?: string;
    discord?: string;
    telegram?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
    other?: string;
  };
}) => {
  try {
    const txn = await aptos.transaction.build.simple({
      sender: account_relayer.accountAddress,
      data: {
        function: `${FACTORY_MODULE}::update_user_info`,
        functionArguments: [
          userData.user_addr, // user_addr
          userData.full_name, // full_name
          userData.description, // description
          userData.avatar, // avatar (Option<String>)
          userData.banner, // banner (Option<String>)
          userData.category, // category
          userData.sub_category, // sub_category
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

  } catch (error) {
    return {
      success: false,
      message: "Failed to update user info",
      error: error
    }
  }
}

export const updateFollowers = async(user_addr: string, new_followers: number) => {
    const followersBigInt = BigInt(new_followers);
    console.log("followersBigInt", followersBigInt)
    console.log("user_addr", user_addr)
    try{
        const txn = await aptos.transaction.build.simple({
            sender: account_relayer.accountAddress,
            data: {
              function: `${FACTORY_MODULE}::update_followers`,
              functionArguments: [
                user_addr,
                followersBigInt
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
            message: "Failed to update followers",
            error: error
        }
    }
}

export const updateFollowing = async(user_addr: string, new_following: number) => {
    const followingBigInt = BigInt(new_following);
    try{
        const txn = await aptos.transaction.build.simple({
            sender: account_relayer.accountAddress,
            data: {
              function: `${FACTORY_MODULE}::update_following`,
              functionArguments: [
                user_addr,
                followingBigInt
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
            message: "Failed to update following",
            error: error
        }
    }
}