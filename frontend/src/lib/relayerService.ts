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
  tags: string[];
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

// Tip-related interfaces
export interface TipData {
  from: string;
  to: string;
  amount: number;
  message?: string;
  video_id?: string;
}

export interface SendTipRequest {
  tipData: TipData;
}

export interface SendTipResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
}

export interface TipHistoryResponse {
  success: boolean;
  data: {
    received_tips: TipData[];
    sent_tips: TipData[];
  };
}

export interface TipStatsResponse {
  success: boolean;
  data: {
    total_received: number;
    total_sent: number;
  };
}

export interface TotalTipsResponse {
  success: boolean;
  data: {
    total_received?: number;
    total_sent?: number;
  };
}

export interface UpdateUserInfoRequest {
  user_addr: string;
  full_name: string;
  description: string;
  avatar?: string;
  banner?: string;
  category: string;
  sub_category: string;
  tags: string[];
  social: SocialLinks;
}

export interface UpdateUserInfoResponse {
  success: boolean;
  message: string;
  data?: {
    hash: string;
  };
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

  async updateUserInfo(userData: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: UpdateUserInfoResponse }>('/api/users/update-info', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateUserInfo');
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

  // Tip APIs
  async sendTip(tipData: TipData): Promise<SendTipResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: SendTipResponse }>('/api/tips/send', {
        method: 'POST',
        body: JSON.stringify(tipData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'sendTip');
      return null;
    }
  }

  async getTipHistory(address: string): Promise<TipHistoryResponse | null> {
    try {
      const response = await this.request<{ status: string; data: TipHistoryResponse }>(`/api/tips/history/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipHistory');
      return null;
    }
  }

  async getReceivedTips(address: string): Promise<TipData[] | null> {
    try {
      const response = await this.request<{ status: string; data: TipData[] }>(`/api/tips/received/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getReceivedTips');
      return null;
    }
  }

  async getSentTips(address: string): Promise<TipData[] | null> {
    try {
      const response = await this.request<{ status: string; data: TipData[] }>(`/api/tips/sent/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getSentTips');
      return null;
    }
  }

  async getTotalTipsReceived(address: string): Promise<number | null> {
    try {
      const response = await this.request<{ status: string; data: { total_received: number } }>(`/api/tips/total-received/${address}`);
      return response.data.total_received;
    } catch (error) {
      handleError(error, 'getTotalTipsReceived');
      return null;
    }
  }

  async getTotalTipsSent(address: string): Promise<number | null> {
    try {
      const response = await this.request<{ status: string; data: { total_sent: number } }>(`/api/tips/total-sent/${address}`);
      return response.data.total_sent;
    } catch (error) {
      handleError(error, 'getTotalTipsSent');
      return null;
    }
  }

  async getTipStats(address: string): Promise<TipStatsResponse | null> {
    try {
      const response = await this.request<{ status: string; data: TipStatsResponse }>(`/api/tips/stats/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getTipStats');
      return null;
    }
  }

  async updateFollowers(address: string, newFollowers: number): Promise<{ hash: string } | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: { hash: string } }>(`/api/users/${address}/update-followers`, {
        method: 'POST',
        body: JSON.stringify({ newFollowers }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateFollowers');
      return null;
    }
  }

  async updateFollowing(address: string, newFollowing: number): Promise<{ hash: string } | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: { hash: string } }>(`/api/users/${address}/update-following`, {
        method: 'POST',
        body: JSON.stringify({ newFollowing }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateFollowing');
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