import { UserData } from "../types";
import { aptos, FACTORY_MODULE, account_relayer } from "../config";
import { registerUser, updateBalance, updateUserInfo, updateFollowers, updateFollowing } from "../lib/utils";
import { gardenService } from "./gardenService";

class UserService {    
    async createUser(userData: UserData): Promise<string> {
      try{
        const result = await registerUser(userData);
        if(result.success){
            // Create default pot and plant for the user
            try {
                // Create default pot
                const potHash = await gardenService.createPot(
                    account_relayer,
                    "Leafy",
                    1,
                    1,
                    "https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa",
                    "Leafy is a cheerful and vibrant plant pot, wrapped in soft green leaves and always wearing a warm smile. With its leaf-twisted handles and nature-inspired design, it brings life and joy to any plant it holds. Whether you're growing a tiny sprout or a magical herb, Leafy will nurture it with love and charm.",
                    userData.user_addr
                );
                console.log("Default pot created with hash:", potHash);

                // Create default plant
                const plantHash = await gardenService.createPlant(
                    account_relayer,
                    "Tomato",
                    1,
                    1,
                    1800,
                    "https://gateway.pinata.cloud/ipfs/bafybeigey3wju7qaieyoqbk6izwh4sq56nnvb57rlajozx24ljniguz7ye",
                    "A plump, juicy tomato bursting with flavor and color. Freshly picked from the garden, this red delight is loved by all—from hungry players to picky plant pets. Be careful though... it's so squishy, you might accidentally throw it!",
                    userData.user_addr
                );
                console.log("Default plant created with hash:", plantHash);
            } catch (gardenError) {
                console.error("Error creating default pot/plant:", gardenError);
                // Don't fail the user registration if garden creation fails
            }
            
            return result.data?.hash || "";
        }else{
            return result.message || "Failed to register user";
        }
      }catch(error){
        console.error("Error registering user:", error);
        return "Failed to register user";
      }
    }

    async getUserByAddress(userAddress: string): Promise<any> {
      try {
        const user = await aptos.view({
          payload: {
            function: `${FACTORY_MODULE}::get_user`,
            functionArguments: [userAddress],
          }
        });
        return user[0];
      } catch (error) {
        console.error("Error getting user:", error);
        throw error;
      }
    }

    async updateBalance(userAddress: string, amount: number): Promise<string> {
      try{
        const result = await updateBalance(userAddress, amount);
        if(result.success){
            return result.data?.hash || "";
        }else{
            return result.message || "Failed to update balance";
        }
      }catch(error){
        console.error("Error updating balance:", error);
        return "Failed to update balance";
      }
    }

    async updateUserInfo(userData: {
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
    }): Promise<string> {
      try {
        const result = await updateUserInfo(userData);
        if (result.success) {
          return result.data?.hash || "";
        } else {
          return result.message || "Failed to update user info";
        }
      } catch (error) {
        console.error("Error updating user info:", error);
        return "Failed to update user info";
      }
    }

    async updateFollowers(userAddress: string, newFollowers: number): Promise<string> {
      try {
        const result = await updateFollowers(userAddress, newFollowers);
        if (result.success) {
          return result.data?.hash || "";
        } else {
          return result.message || "Failed to update followers";
        }
      } catch (error) {
        console.error("Error updating followers:", error);
        return "Failed to update followers";
      }
    }

    async updateFollowing(userAddress: string, newFollowing: number): Promise<string> {
      try {
        const result = await updateFollowing(userAddress, newFollowing);
        if (result.success) {
          return result.data?.hash || "";
        } else {
          return result.message || "Failed to update following";
        }
      } catch (error) {
        console.error("Error updating following:", error);
        return "Failed to update following";
      }
    }

}

export const userService = new UserService();