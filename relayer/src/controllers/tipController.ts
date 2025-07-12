import { tipService } from "../services/tipService";
import type { Request, Response } from "express";

class TipController {
    async sendTip(req: Request, res: Response) {
        try {
            const tipData = req.body;
            
            // Validate required fields
            if (!tipData || !tipData.from || !tipData.to || !tipData.amount) {
                return res.status(400).json({
                    status: "error",
                    message: "Missing required fields: from, to, and amount are required"
                });
            }
            
            const transactionHash = await tipService.sendTip(tipData);

            console.log(transactionHash)
            
            if (transactionHash && !transactionHash.includes("Failed")) {
                res.json({
                    status: "success",
                    message: "Tip sent successfully",
                    data: {
                        transactionHash,
                        fromAddress: tipData.from,
                        toAddress: tipData.to,
                        amount: tipData.amount
                    }
                });
            } else {
                res.status(400).json({
                    status: "error",
                    message: transactionHash || "Failed to send tip"
                });
            }
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to send tip",
                error: error
            });
        }
    }

    async getTipHistory(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const tipHistory = await tipService.getTipHistory(address);
            res.json({
                status: "success",
                data: tipHistory
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to get tip history",
                error: error
            });
        }
    }

    async getReceivedTips(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const receivedTips = await tipService.getReceivedTips(address);
            res.json({
                status: "success",
                data: receivedTips
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to get received tips",
                error: error
            });
        }
    }

    async getSentTips(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const sentTips = await tipService.getSentTips(address);
            res.json({
                status: "success",
                data: sentTips
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to get sent tips",
                error: error
            });
        }
    }

    async getTotalTipsReceived(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const totalReceived = await tipService.getTotalTipsReceived(address);
            res.json({
                status: "success",
                data: {
                    total_received: totalReceived
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to get total tips received",
                error: error
            });
        }
    }

    async getTotalTipsSent(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const totalSent = await tipService.getTotalTipsSent(address);
            res.json({
                status: "success",
                data: {
                    total_sent: totalSent
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to get total tips sent",
                error: error
            });
        }
    }

    async getTipStats(req: Request, res: Response) {
        try {
            const { address } = req.params;
            const [totalReceived, totalSent] = await Promise.all([
                tipService.getTotalTipsReceived(address),
                tipService.getTotalTipsSent(address)
            ]);
            
            res.json({
                status: "success",
                data: {
                    total_received: totalReceived,
                    total_sent: totalSent
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Failed to get tip statistics",
                error: error
            });
        }
    }
}

export const tipController = new TipController(); 