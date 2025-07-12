import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Spool, AlertCircle } from 'lucide-react';
import { useUser } from '../contexts/userContext';
import { useAuth } from '../contexts/authContext';
import { transactionService } from '../lib/transactionService';
import { PaymentLoadingModal, PaymentStatus } from './PaymentLoadingModal';
import { toast } from 'react-hot-toast';

interface WithdrawDialogProps {
  children: React.ReactNode;
}

export function WithdrawDialog({ children }: WithdrawDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'processing',
    message: 'Processing withdrawal...'
  });
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const { currentUser, refetchCurrentUser } = useUser();
  const { account } = useAuth();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleWithdraw = async () => {
    if (!currentUser?.id || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > currentUser.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setConfirmedAmount(withdrawAmount); // Lưu lại số tiền rút thực tế
    setShowPaymentModal(true);
    setPaymentStatus({
      status: 'processing',
      message: 'Initiating withdrawal...'
    });

    try {
      const withdrawRequest = {
        amount: withdrawAmount,
        userId: currentUser.id,
        userAddr: account,
      };

      await transactionService.processWithdrawWithStatus(
        withdrawRequest,
        async (status) => {
          setPaymentStatus(status);
          // Close dialog and reset form on success
          if (status.status === 'success') {
            setIsOpen(false);
            setAmount('');
            // Refetch user data to update balance
            await refetchCurrentUser();
          }
        }
      );
    } catch (error) {
      console.error('Withdrawal error:', error);
      setPaymentStatus({
        status: 'failed',
        message: 'Withdrawal failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmount('');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="bg-[#23232a] border-[#27272a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Withdraw REEL Tokens</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-[#18181b] rounded-lg p-4 border border-[#27272a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Available Balance</span>
                <div className="flex items-center gap-1">
                  <Spool className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-white">{currentUser?.balance || 0} $REEL</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="withdraw-amount" className="text-sm font-medium text-gray-300">
                Amount to Withdraw
              </label>
              <div className="relative">
                <input
                  id="withdraw-amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Spool className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </div>

            {parseFloat(amount) > (currentUser?.balance || 0) && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Amount exceeds available balance</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 bg-[#18181b] border border-[#27272a] text-white px-4 py-3 rounded-lg hover:bg-[#27272a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (currentUser?.balance || 0)}
                className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Loading Modal */}
      <PaymentLoadingModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentStatus={paymentStatus}
        amount={confirmedAmount}
        price={0}
        type="withdraw"
      />
    </>
  );
} 