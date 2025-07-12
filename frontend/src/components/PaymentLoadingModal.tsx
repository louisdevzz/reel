import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface PaymentStatus {
  status: 'processing' | 'success' | 'failed' | 'pending';
  message: string;
  transactionHash?: string;
  error?: string;
}

interface PaymentLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentStatus: PaymentStatus;
  amount: number;
  price?: number; // Optional for withdraw operations
  type: 'deposit' | 'withdraw';
}

export function PaymentLoadingModal({ 
  isOpen, 
  onClose, 
  paymentStatus, 
  amount, 
  price,
  type
}: PaymentLoadingModalProps) {
  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'processing':
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'processing':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStatusTitle = () => {
    const operation = type === 'deposit' ? 'Deposit' : 'Withdrawal';
    switch (paymentStatus.status) {
      case 'processing':
        return `${operation} Processing`;
      case 'success':
        return `${operation} Successful`;
      case 'failed':
        return `${operation} Failed`;
      case 'pending':
        return `${operation} Pending`;
      default:
        return `${operation} Processing`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#23232a] border-[#27272a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            {getStatusIcon()}
            {getStatusTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Payment Details */}
          {type === 'withdraw' && (
            <div className="bg-[#18181b] rounded-lg p-4 border border-[#27272a]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Amount:</span>
                <span className="font-semibold text-white">{amount} REEL</span>
              </div>
            </div>
          )}
          {type === 'deposit' && (
            <div className="bg-[#18181b] rounded-lg p-4 border border-[#27272a]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Amount:</span>
                <span className="font-semibold text-white">{amount} REEL</span>
              </div>
              {price && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price:</span>
                  <span className="font-semibold text-white">{price} APT</span>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            <p className={`font-medium ${getStatusColor()}`}>
              {paymentStatus.message}
            </p>
          </div>

          {/* Transaction Hash (only for withdraw and only if success) */}
          {type === 'withdraw' && paymentStatus.status === 'success' && paymentStatus.transactionHash && (
            <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
              <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
              <a href={`https://explorer.aptoslabs.com/txn/${paymentStatus.transactionHash}?network=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-white font-mono break-all hover:underline">
                {paymentStatus.transactionHash.slice(0,30)}...
              </a>
            </div>
          )}

          {/* Transaction Hash for deposit (if any) */}
          {type === 'deposit' && paymentStatus.transactionHash && (
            <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
              <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
              <a href={`https://explorer.aptoslabs.com/txn/${paymentStatus.transactionHash}?network=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-white font-mono break-all hover:underline">
                {paymentStatus.transactionHash.slice(0,30)}...
              </a>
            </div>
          )}

          {/* Error Message */}
          {paymentStatus.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400">
                Error: {paymentStatus.error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {paymentStatus.status === 'success' && (
              <button
                onClick={onClose}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Done
              </button>
            )}
            {paymentStatus.status === 'failed' && (
              <button
                onClick={onClose}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
            {(paymentStatus.status === 'processing' || paymentStatus.status === 'pending') && (
              <button
                className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg opacity-70 cursor-not-allowed"
                disabled
              >
                Please Wait...
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 