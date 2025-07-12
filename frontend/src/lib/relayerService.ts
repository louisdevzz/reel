const RELAYER_BASE_URL = process.env.PUBLIC_RELAYER_URL || 'http://localhost:7777';

// Helper function to handle errors silently or log only in development
const handleError = (error: any, context: string) => {
  // Only log errors in development environment
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]:`, error);
  }
  // In production, errors are handled silently
};

export interface SocialLinks {
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  twitch?: string;
  instagram?: string;
  website?: string;
  discord?: string;
  telegram?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  other?: string;
}

export interface UserData {
  user_addr: string;
  username: string;
  full_name: string;
  description: string;
  avatar?: string;
  banner?: string;
  category: string;
  sub_category: string;
  email: string;
  tags: string;
  social: SocialLinks;
}

export interface RegisterUserRequest {
  userData: UserData;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  transactionHash: string;
  userAddress: string;
  username: string;
}

export interface SwapRequest {
  amount: number;
  user_addr: string;
  userId: string;
  amountAPT: number;
  rate: number;
  referralCode?: string;
}

export interface SwapResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  depositTransaction?: any;
}

export interface TreasuryBalanceResponse {
  success: boolean;
  balance?: number;
  error?: string;
}

export interface UpdateBalanceRequest {
  amount: number;
}

export interface UpdateBalanceResponse {
  success: boolean;
  message: string;
  data?: {
    hash: string;
  };
}

export interface WithdrawRequest {
  userAddress: string;
  amount: number;
}

export interface WithdrawResponse {
  success: boolean;
  hash?: string;
  message: string;
  userAddress?: string;
  amount?: number;
}

export interface RelayerUser {
  user_addr: string;
  username: string;
  full_name: string;
  description: string;
  avatar?: string;
  banner?: string;
  category: string;
  sub_category: string;
  email: string;
  tags: string;
  social: SocialLinks;
}

class RelayerService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${RELAYER_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Silently throw error without logging to console
      throw error;
    }
  }

  // User APIs
  async registerUser(userData: UserData): Promise<RegisterUserResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: RegisterUserResponse }>('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ userData }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'registerUser');
      return null;
    }
  }

  async getUserByAddress(address: string): Promise<RelayerUser | null> {
    try {
      const response = await this.request<{ status: string; data: RelayerUser }>(`/api/users/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getUserByAddress');
      return null;
    }
  }

  async updateBalance(address: string, amount: number): Promise<UpdateBalanceResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: UpdateBalanceResponse }>(`/api/users/${address}/balance`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateBalance');
      return null;
    }
  }

  // Withdraw tokens method
  async withdrawTokens(withdrawRequest: WithdrawRequest): Promise<WithdrawResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: WithdrawResponse }>('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify(withdrawRequest),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'withdrawTokens');
      return null;
    }
  }
  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.request<{ status: string }>('/health');
      return true;
    } catch (error) {
      handleError(error, 'healthCheck');
      return false;
    }
  }
}

export const relayerService = new RelayerService(); 