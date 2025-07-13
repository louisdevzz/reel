import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { useState, useEffect } from "react";
import { Spool, Loader2 } from "lucide-react";
import { apiService } from "../lib/apiService";
import { relayerService } from "../lib/relayerService";
import { ChatService } from "../lib/streamService";
import { useUser } from "../contexts/userContext";
import { toast } from "react-hot-toast";

const gifts = [
  { name: "FFWS", icon: "🏆", price: 10 },
  { name: "TikTok", icon: "🎵", price: 1 },
  { name: "Heart", icon: "💖", price: 100 },
  { name: "Gamer 2025", icon: "🎮", price: 299 },
  { name: "Gift Box", icon: "🎁", price: 100 },
  { name: "Donut", icon: "🍩", price: 30 },
  { name: "Flowers", icon: "💐", price: 20 },
  { name: "Money Gun", icon: "💸", price: 500 },
  { name: "Bouquet", icon: "🌸", price: 100 },
  { name: "Car", icon: "🚗", price: 1000 },
  { name: "Yacht", icon: "🛥️", price: 2000 },
  { name: "Airplane", icon: "✈️", price: 3000 },
  { name: "Crown", icon: "👑", price: 500 },
  { name: "Diamond", icon: "💎", price: 800 },
  { name: "Pizza", icon: "🍕", price: 50 },
  { name: "Ice Cream", icon: "🍦", price: 40 },
  { name: "Beer", icon: "🍺", price: 60 },
  { name: "Coffee", icon: "☕", price: 25 },
  { name: "Birthday Cake", icon: "🎂", price: 120 },
  { name: "Fireworks", icon: "🎆", price: 150 },
];

interface TipModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  receiverId?: string;
  receiverAddress?: string;
  receiverName?: string; // Add receiverName prop for tip notifications
  tipType?: 'general' | 'stream' | 'video' | 'short';
  contentId?: string;
  message?: string;
  streamKey?: string; // Add streamKey prop for live stream tips
}

/**
 * TipModal Component
 * 
 * Usage examples:
 * 
 * // For live streams
 * <TipModal 
 *   open={isTipModalOpen} 
 *   onOpenChange={setIsTipModalOpen}
 *   receiverId={user?.id}
 *   receiverAddress={user?.aptosAddress}
 *   receiverName={user?.username}
 *   tipType="stream"
 *   contentId={session?.id}
 *   streamKey={streamKey}
 * />
 * 
 * // For videos
 * <TipModal 
 *   open={isTipModalOpen} 
 *   onOpenChange={setIsTipModalOpen}
 *   receiverId={video?.creatorId}
 *   receiverAddress={video?.creatorAddress}
 *   receiverName={video?.creatorName}
 *   tipType="video"
 *   contentId={video?.id}
 * />
 * 
 * // For shorts
 * <TipModal 
 *   open={isTipModalOpen} 
 *   onOpenChange={setIsTipModalOpen}
 *   receiverId={short?.creatorId}
 *   receiverAddress={short?.creatorAddress}
 *   receiverName={short?.creatorName}
 *   tipType="short"
 *   contentId={short?.id}
 * />
 * 
 * // For general tips (no specific content)
 * <TipModal 
 *   open={isTipModalOpen} 
 *   onOpenChange={setIsTipModalOpen}
 *   receiverId={user?.id}
 *   receiverAddress={user?.aptosAddress}
 *   receiverName={user?.username}
 *   tipType="general"
 * />
 */

export function TipModal({ 
  open, 
  onOpenChange, 
  receiverId, 
  receiverAddress,
  receiverName,
  tipType = 'general',
  contentId,
  message = '',
  streamKey
}: TipModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isTipping, setIsTipping] = useState(false);
  const [customMessage, setCustomMessage] = useState(message);
  const { currentUser, account, refetchCurrentUser } = useUser();
  
  // Create a separate chat service instance for tip notifications
  const tipChatService = new ChatService();

  // Cleanup tip chat service on unmount
  useEffect(() => {
    return () => {
      tipChatService.disconnect();
    };
  }, []);

  const handleTip = async () => {
    if (selected === null || !currentUser || !receiverId || !receiverAddress || !account) {
      toast.error("Missing required information for tipping");
      return;
    }

    const gift = gifts[selected];
    const tipAmount = gift.price;
    const tipMessage = customMessage || `Sent ${gift.name} gift`;

    setIsTipping(true);

    try {
      // Step 1: Create tip history in database
      const tipData = await apiService.sendTipToUser(
        currentUser.id,
        receiverId,
        tipAmount,
        tipMessage,
        tipType,
        contentId
      );

      if (!tipData) {
        throw new Error("Failed to create tip record");
      }

      // Step 2: Send tip on-chain via relayer
      const relayerTipData = {
        from: account,
        to: receiverAddress,
        amount: tipAmount,
        message: tipMessage
      };

      const relayerResponse = await relayerService.sendTip(relayerTipData);

      if (!relayerResponse || !relayerResponse.transactionHash) {
        throw new Error("Failed to send tip on-chain");
      }

      // Step 3: Update tip with transaction hash
      const updatedTip = await apiService.updateTipTxHash(tipData.id, relayerResponse.transactionHash);

      if (!updatedTip) {
        throw new Error("Failed to update tip with transaction hash");
      }

      // Step 4: Confirm tip and update stats
      const confirmResult = await apiService.confirmTipAndUpdateStats(tipData.id);

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || "Failed to confirm tip");
      }

      // Success!
      toast.success(`Successfully sent ${gift.name} gift for ${tipAmount} coins!`);
      
      // Refetch user data to update balance
      await refetchCurrentUser();
      
      onOpenChange(false);
      setSelected(null);
      setCustomMessage('');

      // Send tip notification to stream if applicable
      if (streamKey && tipType === 'stream') {
        console.log('Sending tip notification to stream');

        // Set up connection event handlers
        tipChatService.onConnect(() => {
          
          tipChatService.sendTipNotification(
            currentUser.username || 'Anonymous',
            receiverName || 'Streamer',
            gift.name,
            gift.icon,
            tipAmount,
            customMessage
          );
          
          // Disconnect after sending notification
          setTimeout(() => {
            tipChatService.disconnect();
          }, 2000); // Increased delay to ensure message is fully processed
        });
        
        tipChatService.onDisconnect(() => {
          console.log('Tip chat service disconnected');
        });
        
        tipChatService.connect(streamKey);
      }

    } catch (error) {
      console.error('Tip error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to send tip");
    } finally {
      setIsTipping(false);
    }
  };

  const handleClose = () => {
    if (!isTipping) {
      onOpenChange(false);
      setSelected(null);
      setCustomMessage('');
      // Cleanup tip chat service
      tipChatService.disconnect();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#232327] border-[#2f2f35] text-white md:min-w-[700px] scrollbar-hide max-h-[95vh]">
        <DialogTitle className="text-white text-xl font-bold text-center">Send gift to streamer</DialogTitle>
        
        <div className="grid grid-cols-3 gap-4 mt-4 max-h-60 overflow-y-auto">
          {gifts.map((gift, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition select-none ${
                selected === idx ? "border-[#9147ff] bg-[#18181b]" : "border-[#2f2f35] hover:border-[#9147ff]/40 hover:bg-[#18181b]"
              } ${isTipping ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isTipping && setSelected(idx)}
            >
              <span className="text-3xl mb-2">{gift.icon}</span>
              <span className="font-semibold text-center text-sm text-white">{gift.name}</span>
              <span className="text-yellow-400 font-bold mt-1 text-xs flex items-center gap-1">
                <Spool className="w-3 h-3" />
                {gift.price}
              </span>
            </div>
          ))}
        </div>

        {/* Custom Message Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message (optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a message with your gift..."
            className="w-full px-3 py-2 bg-[#18181b] border border-[#2f2f35] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#9147ff] resize-none"
            rows={3}
            disabled={isTipping}
          />
        </div>

        {/* User Balance Info */}
        {currentUser && (
          <div className="mt-4 p-3 bg-[#18181b] rounded-lg border border-[#2f2f35]">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Your Balance:</span>
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <Spool className="w-3 h-3" />
                {currentUser.balance} $REEL
              </span>
            </div>
            {selected !== null && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-300">After Tip:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  currentUser.balance - gifts[selected].price < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  <Spool className="w-3 h-3" />
                  {Math.max(0, currentUser.balance - gifts[selected].price)} $REEL
                </span>
              </div>
            )}
          </div>
        )}

        <button
          className="mt-6 w-full bg-[#9147ff] hover:bg-[#772ce8] text-white font-bold py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-row justify-center"
          disabled={selected === null || isTipping || (currentUser && selected !== null && currentUser.balance < gifts[selected].price) || false}
          onClick={handleTip}
        >
          <div className="flex flex-row justify-center items-center gap-2">
            {isTipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Tip {selected !== null ? (
                  <span className="flex items-center gap-1">
                    <Spool className="w-4 h-4" />
                    {gifts[selected].price}
                  </span>
                ) : ''}
              </>
            )}
          </div>
        </button>

        {/* Insufficient Balance Warning */}
        {currentUser && selected !== null && currentUser.balance < gifts[selected].price && (
          <div className="mt-2 text-center text-red-400 text-sm">
            Insufficient balance. Please add more $REEL coins to your wallet.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 