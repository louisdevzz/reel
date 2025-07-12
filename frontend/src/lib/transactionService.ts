import { relayerService } from './relayerService';
import { apiService } from './apiService';
import { PaymentStatus } from '../components/PaymentLoadingModal';
import { devnetClient } from './core/constants';


export interface DepositRequest {
  amount: number;
  price: number;
  rate: number;
  userId: string;
  userAddr: string;
  referralCode?: string;
}

export interface WithdrawRequest {
  amount: number;
  userId: string;
  userAddr: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  transaction?: any;
}

const TREASURY_ADDRESS = '0xbf724c1cdb79455c27a9b8c30b0d1e246bd93878961b298598b78e99644bb2e4';
const APTOS_COIN_TYPE = '0x1::aptos_coin::AptosCoin' as `${string}::${string}::${string}`;

class TransactionService {
  // Get APT balance of user
  async getAptosBalance(address: string): Promise<number> {
    try {
      const resource = await devnetClient.getAccountCoinAmount({
        accountAddress: String(address),
        coinType: APTOS_COIN_TYPE,
      });
      // resource can be string or number
      const value = typeof resource === 'string' ? parseFloat(resource) : resource;
      return value / 1e8;
    } catch (error) {
      return 0;
    }
  }

  // Transfer APT from user to treasury using window.aptos to sign transaction
  async transferAptosCoin(amount: number): Promise<string> {
    if (typeof window === 'undefined' || !window.aptos) throw new Error('Aptos wallet not found');
    // amount is APT amount, convert to Octa
    const amountOcta = Math.floor(amount * 1e8).toString();
    const payload = {
      type: 'entry_function_payload',
      function: '0x1::aptos_account::transfer',
      type_arguments: [],
      arguments: [TREASURY_ADDRESS, amountOcta],
    };
    // Send transaction
    let txHash = '';
    if (typeof window.aptos.signAndSubmitTransaction === 'function') {
      const tx = await window.aptos.signAndSubmitTransaction(payload);
      txHash = tx.hash;
    } else if (typeof window.aptos.signTransaction === 'function' && typeof window.aptos.submitTransaction === 'function') {
      const signedTx = await window.aptos.signTransaction(payload);
      const submitted = await window.aptos.submitTransaction(signedTx);
      txHash = submitted.hash;
    } else {
      throw new Error('Your wallet does not support programmatic transaction signing.');
    }
    return txHash;
  }

  // Create transaction in backend
  async createTransaction(data: {
    userId: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    txHash: string;
    userAddr: string;
    referralCode?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${process.env.PUBLIC_API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Confirm transaction and update balance
  async confirmTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.PUBLIC_API_URL}/api/transactions/${transactionId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm transaction');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      throw error;
    }
  }

  // Process deposit payment
  async processDeposit(depositRequest: DepositRequest, aptosTxHash: string): Promise<TransactionResult> {
    try {
      const balance = await apiService.getUserBalanceByAddress(depositRequest.userAddr);
      // 1. Create transaction in backend
      const transaction = await this.createTransaction({
        userId: depositRequest.userId,
        amount: depositRequest.amount,
        type: 'deposit',
        txHash: aptosTxHash,
        userAddr: depositRequest.userAddr,
        referralCode: depositRequest.referralCode,
      });

      const newBalance = Number(balance) + Number(depositRequest.amount);

      // 2. Call relayer service to update balance
      const updateResult = await relayerService.updateBalance(
        depositRequest.userAddr, 
        newBalance
      );

      if (!updateResult) {
        return {
          success: false,
          error: 'Failed to update balance via relayer'
        };
      }

      // 3. Confirm transaction to update balance in database
      const confirmResult = await this.confirmTransaction(transaction.id);
      if (!confirmResult) {
        return {
          success: false,
          error: 'Failed to confirm transaction'
        };
      }

      return {
        success: true,
        transactionHash: updateResult.data?.hash,
        transaction: transaction
      };
    } catch (error) {
      console.error('Deposit service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Process withdraw payment
  async processWithdraw(withdrawRequest: WithdrawRequest): Promise<TransactionResult> {
    try {
      // 1. Create withdraw transaction in backend
      const transaction = await this.createTransaction({
        userId: withdrawRequest.userId,
        amount: withdrawRequest.amount,
        type: 'withdraw',
        txHash: `withdraw_${Date.now()}`, // Generate temporary hash for withdraw
        userAddr: withdrawRequest.userAddr,
      });

      // 2. Call relayer service to withdraw tokens
      const withdrawResult = await relayerService.withdrawTokens({
        userAddress: withdrawRequest.userAddr,
        amount: withdrawRequest.amount,
      });

      if (!withdrawResult) {
        return {
          success: false,
          error: 'Failed to withdraw tokens via relayer'
        };
      }
      const balance = await apiService.getUserBalanceByAddress(withdrawRequest.userAddr);
      const newBalance = Number(balance) - Number(withdrawRequest.amount);

      // 3. Call relayer service to update balance
      const updateResult = await relayerService.updateBalance(
        withdrawRequest.userAddr, 
        newBalance
      );

      if (!updateResult) {
        return {
          success: false,
          error: 'Failed to update balance via relayer'
        };
      }

      // 4. Update transaction with actual hash from relayer
      if (withdrawResult.hash) {
        try {
          await fetch(`${process.env.PUBLIC_API_URL}/api/transactions/${transaction.id}/hash`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txHash: withdrawResult.hash }),
          });
        } catch (error) {
          console.error('Failed to update transaction hash:', error);
          // Continue with the process even if hash update fails
        }
      }

      // 5. Confirm transaction to update balance in database
      const confirmResult = await this.confirmTransaction(transaction.id);
      if (!confirmResult) {
        return {
          success: false,
          error: 'Failed to confirm transaction'
        };
      }

      return {
        success: true,
        transactionHash: withdrawResult.hash,
        transaction: transaction
      };
    } catch (error) {
      console.error('Withdraw service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get user's transactions
  async getUserTransactions(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const response = await fetch(`${process.env.PUBLIC_API_URL}/api/transactions/user/${userId}?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user transactions');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Get user's transaction statistics
  async getUserTransactionStats(userId: string) {
    try {
      const response = await fetch(`${process.env.PUBLIC_API_URL}/api/transactions/user/${userId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch user transaction stats');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching user transaction stats:', error);
      return null;
    }
  }

  // Get transaction by ID
  async getTransactionById(id: string) {
    try {
      const response = await fetch(`${process.env.PUBLIC_API_URL}/api/transactions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  // Get transaction by transaction hash
  async getTransactionByTxHash(txHash: string) {
    try {
      const response = await fetch(`${process.env.PUBLIC_API_URL}/api/transactions/hash/${txHash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction by hash');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching transaction by hash:', error);
      return null;
    }
  }

  // Helper method to create payment status updates
  createPaymentStatus(status: PaymentStatus['status'], message: string, transactionHash?: string, error?: string): PaymentStatus {
    return {
      status,
      message,
      transactionHash,
      error
    };
  }

  // Process deposit with status updates
  async processDepositWithStatus(
    depositRequest: DepositRequest,
    onStatusUpdate: (status: PaymentStatus) => void
  ): Promise<TransactionResult> {
    try {
      // 1. Check balance
      onStatusUpdate(this.createPaymentStatus('processing', 'Checking your APT balance...'));
      const balance = await this.getAptosBalance(depositRequest.userAddr);
      if (balance < depositRequest.price) {
        onStatusUpdate(this.createPaymentStatus('failed', 'Insufficient APT balance.'));
        return { success: false, error: 'Insufficient APT balance' };
      }

      // 2. Transfer APT to treasury
      onStatusUpdate(this.createPaymentStatus('processing', 'Transferring APT to Reel...'));
      let aptosTxHash = '';
      try {
        aptosTxHash = await this.transferAptosCoin(depositRequest.price);
      } catch (err) {
        onStatusUpdate(this.createPaymentStatus('failed', 'Failed to transfer APT. Please approve the transaction in your wallet.', undefined, err instanceof Error ? err.message : ''));
        return { success: false, error: 'Failed to transfer APT' };
      }

      onStatusUpdate(this.createPaymentStatus('processing', 'APT transferred! Processing REEL tokens...'));

      // 3. Process deposit (create transaction, update balance, confirm)
      const result = await this.processDeposit(depositRequest, aptosTxHash);

      if (result.success) {
        onStatusUpdate(this.createPaymentStatus(
          'success',
          'Deposit completed successfully! Your REEL tokens have been added to your balance.',
          result.transactionHash
        ));
      } else {
        onStatusUpdate(this.createPaymentStatus(
          'failed',
          'Deposit failed. Please try again.',
          result.transactionHash,
          result.error
        ));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Error status
      onStatusUpdate(this.createPaymentStatus(
        'failed',
        'An unexpected error occurred during deposit.',
        undefined,
        errorMessage
      ));

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Process withdraw with status updates
  async processWithdrawWithStatus(
    withdrawRequest: WithdrawRequest,
    onStatusUpdate: (status: PaymentStatus) => void
  ): Promise<TransactionResult> {
    try {
      // 1. Check user balance (this would need to be implemented)
      onStatusUpdate(this.createPaymentStatus('processing', 'Checking your REEL balance...'));

      // 2. Process withdraw
      onStatusUpdate(this.createPaymentStatus('processing', 'Processing withdrawal...'));
      const result = await this.processWithdraw(withdrawRequest);

      if (result.success) {
        onStatusUpdate(this.createPaymentStatus(
          'success',
          'Withdrawal completed successfully! Your REEL tokens have been sent to your wallet.',
          result.transactionHash
        ));
      } else {
        onStatusUpdate(this.createPaymentStatus(
          'failed',
          'Withdrawal failed. Please try again.',
          result.transactionHash,
          result.error
        ));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Error status
      onStatusUpdate(this.createPaymentStatus(
        'failed',
        'An unexpected error occurred during withdrawal.',
        undefined,
        errorMessage
      ));

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export const transactionService = new TransactionService(); 