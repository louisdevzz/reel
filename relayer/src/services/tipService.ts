import { TipData } from "../types";
import { aptos, FACTORY_MODULE } from "../config";
import { sendTip } from "../lib/utils";

class TipService {
    async sendTip(tipData: TipData): Promise<string> {
        try {
            const result = await sendTip(
                tipData.from,
                tipData.to,
                tipData.amount,
                tipData.message,
                tipData.video_id
            );
            if (result.success) {
                return result.data?.hash || "";
            } else {
                return result.message || "Failed to send tip";
            }
        } catch (error) {
            console.error("Error sending tip:", error);
            return "Failed to send tip";
        }
    }

    async getTipHistory(userAddress: string): Promise<any> {
        try {
            const tipHistory = await aptos.view({
                payload: {
                    function: `${FACTORY_MODULE}::get_tip_history`,
                    functionArguments: [userAddress],
                }
            });
            return tipHistory[0];
        } catch (error) {
            console.error("Error getting tip history:", error);
            throw error;
        }
    }

    async getReceivedTips(userAddress: string): Promise<any> {
        try {
            const receivedTips = await aptos.view({
                payload: {
                    function: `${FACTORY_MODULE}::get_received_tips`,
                    functionArguments: [userAddress],
                }
            });
            return receivedTips[0];
        } catch (error) {
            console.error("Error getting received tips:", error);
            throw error;
        }
    }

    async getSentTips(userAddress: string): Promise<any> {
        try {
            const sentTips = await aptos.view({
                payload: {
                    function: `${FACTORY_MODULE}::get_sent_tips`,
                    functionArguments: [userAddress],
                }
            });
            return sentTips[0];
        } catch (error) {
            console.error("Error getting sent tips:", error);
            throw error;
        }
    }

    async getTotalTipsReceived(userAddress: string): Promise<number> {
        try {
            const totalReceived = await aptos.view({
                payload: {
                    function: `${FACTORY_MODULE}::get_total_tips_received`,
                    functionArguments: [userAddress],
                }
            });
            return Number(totalReceived[0]);
        } catch (error) {
            console.error("Error getting total tips received:", error);
            throw error;
        }
    }

    async getTotalTipsSent(userAddress: string): Promise<number> {
        try {
            const totalSent = await aptos.view({
                payload: {
                    function: `${FACTORY_MODULE}::get_total_tips_sent`,
                    functionArguments: [userAddress],
                }
            });
            return Number(totalSent[0]);
        } catch (error) {
            console.error("Error getting total tips sent:", error);
            throw error;
        }
    }
}

export const tipService = new TipService(); 