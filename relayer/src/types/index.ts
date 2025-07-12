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
  avatar?: string; // Option<String> in the original
  banner?: string; // Option<String> in the original
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

export interface ErrorResponse {
  success: boolean;
  error: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface AccountInfoResponse {
  address: string;
  publicKey: string;
}

export interface WithdrawRequest {
  userAddress: string;
  amount: number | bigint;
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  data?: {
    hash: string;
    userAddress: string;
    amount: number | bigint;
  };
}

export interface TreasuryBalanceResponse {
  success: boolean;
  data: {
    balance: string;
    treasuryAddress: string;
  };
}

// Tip-related types
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
