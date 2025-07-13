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

    async updateUserInfo(req: Request, res: Response) {
        try {
            const userData = req.body;
            const result = await userService.updateUserInfo(userData);
            res.json({
                status: "success",
                message: "User info updated successfully",
                data: {
                    hash: result
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to update user info",
                error: error
            });
        }
    }

    async updateFollowers(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const { newFollowers } = req.body;
            if (!address || typeof newFollowers !== 'number') {
                return res.status(400).json({
                    status: "error",
                    message: "Address and newFollowers (number) are required"
                });
            }
            const result = await userService.updateFollowers(address, newFollowers);
            res.json({
                status: "success",
                message: "Followers updated successfully",
                data: { hash: result }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to update followers",
                error: error
            });
        }
    }

    async updateFollowing(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const { newFollowing } = req.body;
            if (!address || typeof newFollowing !== 'number') {
                return res.status(400).json({
                    status: "error",
                    message: "Address and newFollowing (number) are required"
                });
            }
            const result = await userService.updateFollowing(address, newFollowing);
            res.json({
                status: "success",
                message: "Following updated successfully",
                data: { hash: result }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to update following",
                error: error
            });
        }
    }

}

export const userController = new UserController();