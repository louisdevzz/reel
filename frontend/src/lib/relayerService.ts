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

// Garden-related interfaces
export interface PotData {
  name: string;
  level: number;
  quantity: number;
  uri: string;
  description: string;
  receiveAddr: string;
}

export interface PlantData {
  name: string;
  rarity: number;
  quantity: number;
  baseGrowDurationSec: number;
  uri: string;
  description: string;
  receiveAddr: string;
}

export interface ItemData {
  name: string;
  level: number;
  quantity: number;
  uri: string;
  description: string;
  receiveAddr: string;
}

export interface PetData {
  name: string;
  species: string;
  intelligence: number;
  strength: number;
  agility: number;
  evolvedFromPlant: string;
  receiveAddr: string;
}

export interface GardenResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
  data?: any;
}

export interface GardenItemResponse {
  success: boolean;
  data?: any;
  error?: string;
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

  // ===================== Garden APIs =====================
  
  // Pot APIs
  async createPot(potData: PotData): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pot/create', {
        method: 'POST',
        body: JSON.stringify(potData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createPot');
      return null;
    }
  }

  async getLatestPot(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pot/latest/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getLatestPot');
      return null;
    }
  }

  async getPotByAddress(potAddress: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pot/${potAddress}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPotByAddress');
      return null;
    }
  }

  async getAllPots(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pots/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getAllPots');
      return null;
    }
  }

  async getPotAddresses(address: string): Promise<string[] | null> {
    try {
      const response = await this.request<{ status: string; data: string[] }>(`/api/garden/pot/addresses/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPotAddresses');
      return null;
    }
  }

  async getPotAddressesAndInfo(address: string): Promise<any | null> {
    try {
      const response = await this.request<{ status: string; data: any }>(`/api/garden/pot/addresses-info/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPotAddressesAndInfo');
      return null;
    }
  }

  async getPotInfo(address: string): Promise<any | null> {
    try {
      const response = await this.request<{ status: string; data: any }>(`/api/garden/pot/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPotInfo');
      return null;
    }
  }

  async upgradePot(potAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pot/upgrade', {
        method: 'POST',
        body: JSON.stringify({ potAddr: potAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'upgradePot');
      return null;
    }
  }

  async burnPot(potAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pot/burn', {
        method: 'POST',
        body: JSON.stringify({ potAddr: potAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'burnPot');
      return null;
    }
  }

  async increasePotQuantity(potAddress: string, amount: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pot/increase-quantity', {
        method: 'POST',
        body: JSON.stringify({ potAddr: potAddress, amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'increasePotQuantity');
      return null;
    }
  }

  async decreasePotQuantity(potAddress: string, amount: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pot/decrease-quantity', {
        method: 'POST',
        body: JSON.stringify({ potAddr: potAddress, amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'decreasePotQuantity');
      return null;
    }
  }

  // Plant APIs
  async createPlant(plantData: PlantData): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/create', {
        method: 'POST',
        body: JSON.stringify(plantData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createPlant');
      return null;
    }
  }

  async getLatestPlant(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/plant/latest/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getLatestPlant');
      return null;
    }
  }

  async getPlantByAddress(plantAddress: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/plant/${plantAddress}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPlantByAddress');
      return null;
    }
  }

  async getAllPlants(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/plants/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getAllPlants');
      return null;
    }
  }

  async getPlantAddresses(address: string): Promise<string[] | null> {
    try {
      const response = await this.request<{ status: string; data: string[] }>(`/api/garden/plant/addresses/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPlantAddresses');
      return null;
    }
  }

  async getPlantAddressesAndInfo(address: string): Promise<any | null> {
    try {
      const response = await this.request<{ status: string; data: any }>(`/api/garden/plant/addresses-info/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPlantAddressesAndInfo');
      return null;
    }
  }

  async getPlantInfo(address: string): Promise<any | null> {
    try {
      const response = await this.request<{ status: string; data: any }>(`/api/garden/plant/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPlantInfo');
      return null;
    }
  }

  async plantSeed(potAddress: string, plantAddress: string): Promise<any | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: any }>('/api/garden/plant/seed', {
        method: 'POST',
        body: JSON.stringify({ potAddr: potAddress, plantAddr: plantAddress }),
      });
      return response;
    } catch (error) {
      handleError(error, 'plantSeed');
      return null;
    }
  }

  async updateGrowthStage(plantAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/update-growth', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'updateGrowthStage');
      return null;
    }
  }

  async transferPlant(potFromAddress: string, potToAddress: string, plantAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/transfer', {
        method: 'POST',
        body: JSON.stringify({ 
          potFromAddr: potFromAddress, 
          potToAddr: potToAddress, 
          plantAddr: plantAddress 
        }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'transferPlant');
      return null;
    }
  }

  async advanceGrowth(plantAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/advance-growth', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'advanceGrowth');
      return null;
    }
  }

  async harvest(plantAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/harvest', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'harvest');
      return null;
    }
  }

  async burnPlant(plantAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/burn', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'burnPlant');
      return null;
    }
  }

  async increasePlantQuantity(plantAddress: string, amount: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/increase-quantity', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress, amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'increasePlantQuantity');
      return null;
    }
  }

  async decreasePlantQuantity(plantAddress: string, amount: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/decrease-quantity', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress, amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'decreasePlantQuantity');
      return null;
    }
  }

  async setPlantBaseGrowDuration(plantAddress: string, duration: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/plant/set-grow-duration', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress, duration }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'setPlantBaseGrowDuration');
      return null;
    }
  }

  async isPlantInPot(plantAddress: string, potAddress: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/plant/in-pot/${plantAddress}/${potAddress}`);
      return response.data;
    } catch (error) {
      handleError(error, 'isPlantInPot');
      return null;
    }
  }

  // Item APIs
  async createItem(itemData: ItemData): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/create', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createItem');
      return null;
    }
  }

  async getLatestItem(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/item/latest/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getLatestItem');
      return null;
    }
  }

  async getItemByAddress(itemAddress: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/item/${itemAddress}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getItemByAddress');
      return null;
    }
  }

  async getAllItems(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/items/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getAllItems');
      return null;
    }
  }

  async getItemAddresses(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/item/addresses/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getItemAddresses');
      return null;
    }
  }

  async getItemAddressesAndInfo(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/item/addresses-info/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getItemAddressesAndInfo');
      return null;
    }
  }

  async burnItem(itemAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/burn', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'burnItem');
      return null;
    }
  }

  async increaseItemQuantity(itemAddress: string, amount: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/increase-quantity', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress, amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'increaseItemQuantity');
      return null;
    }
  }

  async decreaseItemQuantity(itemAddress: string, amount: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/decrease-quantity', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress, amount }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'decreaseItemQuantity');
      return null;
    }
  }

  async setItemUsageType(itemAddress: string, usageType: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/set-usage-type', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress, newUsageType: usageType }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'setItemUsageType');
      return null;
    }
  }

  async setItemEffectValue(itemAddress: string, effectValue: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/set-effect-value', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress, newEffectValue: effectValue }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'setItemEffectValue');
      return null;
    }
  }

  async setItemMaxUsage(itemAddress: string, maxUsage: number): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/set-max-usage', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress, newMaxUsage: maxUsage }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'setItemMaxUsage');
      return null;
    }
  }

  async useItemReduceGrowTime(itemAddress: string, plantAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/item/use-reduce-grow-time', {
        method: 'POST',
        body: JSON.stringify({ itemAddr: itemAddress, plantAddr: plantAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'useItemReduceGrowTime');
      return null;
    }
  }

  // Pet APIs
  async createPet(petData: PetData): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pet/create', {
        method: 'POST',
        body: JSON.stringify(petData),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'createPet');
      return null;
    }
  }

  async getLatestPet(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pet/latest/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getLatestPet');
      return null;
    }
  }

  async getPetByAddress(petAddress: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pet/${petAddress}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPetByAddress');
      return null;
    }
  }

  async getAllPets(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pets/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getAllPets');
      return null;
    }
  }

  async getPetAddresses(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pet/addresses/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPetAddresses');
      return null;
    }
  }

  async getPetAddressesAndInfo(address: string): Promise<GardenItemResponse | null> {
    try {
      const response = await this.request<{ status: string; data: GardenItemResponse }>(`/api/garden/pet/addresses-info/${address}`);
      return response.data;
    } catch (error) {
      handleError(error, 'getPetAddressesAndInfo');
      return null;
    }
  }

  async evolveToPet(plantAddress: string, receiver: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pet/evolve', {
        method: 'POST',
        body: JSON.stringify({ plantAddr: plantAddress, receiver }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'evolveToPet');
      return null;
    }
  }

  async burnPet(petAddress: string): Promise<GardenResponse | null> {
    try {
      const response = await this.request<{ status: string; message: string; data: GardenResponse }>('/api/garden/pet/burn', {
        method: 'POST',
        body: JSON.stringify({ petAddr: petAddress }),
      });
      return response.data;
    } catch (error) {
      handleError(error, 'burnPet');
      return null;
    }
  }
}

export const relayerService = new RelayerService(); 