import { withdrawService } from "../services/withdrawService";
import { account_treasury } from "../config";
import type { Request, Response } from "express";

class WithdrawController {
    async withdrawToUser(req: Request, res: Response) {
        try {
            const { userAddress, amount } = req.body;
            
            if (!userAddress || !amount) {
                return res.status(400).json({
                    status: "error",
                    message: "userAddress and amount are required"
                });
            }

            const result = await withdrawService.withdrawToUser(userAddress, amount);
            
            if (result.success) {
                res.json({
                    status: "success",
                    message: result.message,
                    data: {
                        hash: result.hash,
                        userAddress,
                        amount
                    }
                });
            } else {
                res.status(400).json({
                    status: "error",
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Error in withdrawToUser controller:", error);
            res.status(500).json({
                status: "error",
                message: "Failed to process withdrawal",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    async getTreasuryBalance(req: Request, res: Response) {
        try {
            const balance = await withdrawService.getTreasuryBalance();
            
            res.json({
                status: "success",
                data: {
                    balance: balance.toString(),
                    treasuryAddress: account_treasury.accountAddress.toString()
                }
            });
        } catch (error) {
            console.error("Error getting treasury balance:", error);
            res.status(500).json({
                status: "error",
                message: "Failed to get treasury balance",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}

export const withdrawController = new WithdrawController(); 