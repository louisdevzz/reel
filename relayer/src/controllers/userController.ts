import { userService } from "../services/userService";
import { UserData } from "../types";
import type { Request, Response } from "express";

class UserController {
    async createUser(req: Request, res: Response) {
        try{
            const { userData } = req.body;
            const user = await userService.createUser(userData);
            res.json({
                status: "success",
                message: "User created successfully",
                data: user
            });
        }catch(error){
            res.status(500).json({
                status: "error",
                message: "Failed to create user",
                error: error
            });
        }
    }

    async getUserByAddress(req: Request, res: Response) {
        try{
            const { address } = req.params;
            const user = await userService.getUserByAddress(address);
            res.json({
                status: "success",
                data: user
            })
        }catch(error){
            res.status(500).json({
                status: "error",
                message: "Failed to get user",
                error: error
            });
        }
    }

    async updateBalance(req: Request, res: Response) {
        try{
            const { address } = req.params;
            const { amount } = req.body;
            const result = await userService.updateBalance(address, amount);
            res.json({
                status: "success",
                message: "Balance updated successfully",
                data: result
            });
        }catch(error){
            res.status(500).json({
                status: "error",
                message: "Failed to update balance",
                error: error
            });
        }
    }

}

export const userController = new UserController();