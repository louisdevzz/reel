import { UserData } from "../types";
import { aptos, FACTORY_MODULE } from "../config";
import { registerUser, updateBalance } from "../lib/utils";

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

}

export const userService = new UserService();