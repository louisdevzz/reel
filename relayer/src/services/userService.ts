import { UserData } from "../types";
import { aptos, FACTORY_MODULE } from "../config";
import { registerUser, updateBalance, updateUserInfo, updateFollowers, updateFollowing } from "../lib/utils";

class UserService {    
    async createUser(userData: UserData): Promise<string> {
      try{
        const result = await registerUser(userData);
        if(result.success){
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