import { gardenService } from "../services/gardenService";
import { account_relayer } from "../config";
import type { Request, Response } from "express";

class GardenController {
  // ===================== Pot Methods =====================
  async getLatestPot(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const pot = await gardenService.getLatestPotOfAccount(address);
      res.json({ status: "success", data: pot });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get latest pot", error });
    }
  }

  async getPotByAddress(req: Request, res: Response) {
    try {
      const { potAddress } = req.params;
      if (!potAddress) {
        return res.status(400).json({ status: "error", message: "Missing potAddress" });
      }
      const potInfo = await gardenService.getPot(potAddress);
      res.json({ status: "success", data: potInfo });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pot info", error });
    }
  }

  async getAllPots(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const pots = await gardenService.getAccountOwnedPots(address, 100);
      res.json({ status: "success", data: pots });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pots", error });
    }
  }

  async getPotAddresses(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const addresses = await gardenService.getPotAddressesOfAccount(address, limit);
      res.json({ status: "success", data: addresses });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pot addresses", error });
    }
  }

  async getPotAddressesAndInfo(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await gardenService.getPotAddressesAndInfo(address, limit);
      res.json({ status: "success", data });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pot addresses and info", error });
    }
  }

  async createPot(req: Request, res: Response) {
    try {
      const { name, level, quantity, uri, description, receiveAddr } = req.body;
      if (!name || level === undefined || quantity === undefined || !uri || !description || !receiveAddr) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
      }
      const txHash = await gardenService.createPot(account_relayer, name, level, quantity, uri, description, receiveAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to create pot", error });
    }
  }

  async upgradePot(req: Request, res: Response) {
    try {
      const { potAddr } = req.body;
      if (!potAddr) {
        return res.status(400).json({ status: "error", message: "Missing potAddr" });
      }
      const txHash = await gardenService.upgradePot(account_relayer, potAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to upgrade pot", error });
    }
  }

  async burnPot(req: Request, res: Response) {
    try {
      const { potAddr } = req.body;
      if (!potAddr) {
        return res.status(400).json({ status: "error", message: "Missing potAddr" });
      }
      const txHash = await gardenService.burnPot(account_relayer, potAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to burn pot", error });
    }
  }

  async increasePotQuantity(req: Request, res: Response) {
    try {
      const { potAddr, amount } = req.body;
      if (!potAddr || amount === undefined) {
        return res.status(400).json({ status: "error", message: "Missing potAddr or amount" });
      }
      const txHash = await gardenService.increasePotQuantity(account_relayer, potAddr, amount);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to increase pot quantity", error });
    }
  }

  async decreasePotQuantity(req: Request, res: Response) {
    try {
      const { potAddr, amount } = req.body;
      if (!potAddr || amount === undefined) {
        return res.status(400).json({ status: "error", message: "Missing potAddr or amount" });
      }
      const txHash = await gardenService.decreasePotQuantity(account_relayer, potAddr, amount);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to decrease pot quantity", error });
    }
  }

  // ===================== Plant Methods =====================
  async getLatestPlant(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const plant = await gardenService.getLatestPlantOfAccount(account_relayer ,address);
      res.json({ status: "success", data: plant });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get latest plant", error });
    }
  }

  async getPlantByAddress(req: Request, res: Response) {
    try {
      const { plantAddress } = req.params;
      if (!plantAddress) {
        return res.status(400).json({ status: "error", message: "Missing plantAddress" });
      }
      const plantInfo = await gardenService.getPlant(account_relayer,plantAddress);
      res.json({ status: "success", data: plantInfo });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get plant info", error });
    }
  }

  async getAllPlants(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const plants = await gardenService.getAccountOwnedPlants(address, 100);
      res.json({ status: "success", data: plants });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get plants", error });
    }
  }

  async getPlantAddresses(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const addresses = await gardenService.getPlantAddressesOfAccount(address, limit);
      res.json({ status: "success", data: addresses });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get plant addresses", error });
    }
  }

  async getPlantAddressesAndInfo(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await gardenService.getPlantAddressesAndInfo(address, limit);
      res.json({ status: "success", data });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get plant addresses and info", error });
    }
  }

  async createPlant(req: Request, res: Response) {
    try {
      const { name, rarity, quantity, baseGrowDurationSec, uri, description, receiveAddr } = req.body;
      if (!name || rarity === undefined || quantity === undefined || baseGrowDurationSec === undefined || !uri || !description || !receiveAddr) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
      }
      const txHash = await gardenService.createPlant(account_relayer, name, rarity, quantity, baseGrowDurationSec, uri, description, receiveAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to create plant", error });
    }
  }

  async plantSeed(req: Request, res: Response) {
    try {
      const { potAddr, plantAddr } = req.body;
      if (!potAddr || !plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing potAddr or plantAddr" });
      }
      const txHash = await gardenService.plantSeed(account_relayer, potAddr, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to plant seed", error });
    }
  }

  async updateGrowthStage(req: Request, res: Response) {
    try {
      const { plantAddr } = req.body;
      if (!plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr" });
      }
      const txHash = await gardenService.updateGrowthStage(account_relayer, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to update growth stage", error });
    }
  }

  async transferPlant(req: Request, res: Response) {
    try {
      const { potFromAddr, potToAddr, plantAddr } = req.body;
      if (!potFromAddr || !potToAddr || !plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
      }
      const txHash = await gardenService.transferPlant(account_relayer, potFromAddr, potToAddr, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to transfer plant", error });
    }
  }

  async advanceGrowth(req: Request, res: Response) {
    try {
      const { plantAddr } = req.body;
      if (!plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr" });
      }
      const txHash = await gardenService.advanceGrowth(account_relayer, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to advance growth", error });
    }
  }

  async harvest(req: Request, res: Response) {
    try {
      const { plantAddr } = req.body;
      if (!plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr" });
      }
      const txHash = await gardenService.harvest(account_relayer, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to harvest plant", error });
    }
  }

  async burnPlant(req: Request, res: Response) {
    try {
      const { plantAddr } = req.body;
      if (!plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr" });
      }
      const txHash = await gardenService.burnPlant(account_relayer, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to burn plant", error });
    }
  }

  async increasePlantQuantity(req: Request, res: Response) {
    try {
      const { plantAddr, amount } = req.body;
      if (!plantAddr || amount === undefined) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr or amount" });
      }
      const txHash = await gardenService.increasePlantQuantity(account_relayer, plantAddr, amount);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to increase plant quantity", error });
    }
  }

  async decreasePlantQuantity(req: Request, res: Response) {
    try {
      const { plantAddr, amount } = req.body;
      if (!plantAddr || amount === undefined) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr or amount" });
      }
      const txHash = await gardenService.decreasePlantQuantity(account_relayer, plantAddr, amount);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to decrease plant quantity", error });
    }
  }

  async setPlantBaseGrowDuration(req: Request, res: Response) {
    try {
      const { plantAddr, duration } = req.body;
      if (!plantAddr || duration === undefined) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr or duration" });
      }
      const txHash = await gardenService.setPlantBaseGrowDuration(account_relayer, plantAddr, duration);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to set plant base grow duration", error });
    }
  }

  async isPlantInPot(req: Request, res: Response) {
    try {
      const { plantAddress, potAddress } = req.params;
      if (!plantAddress || !potAddress) {
        return res.status(400).json({ status: "error", message: "Missing plantAddress or potAddress" });
      }
      const result = await gardenService.isPlantInPot(plantAddress, potAddress);
      res.json({ status: "success", data: result });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to check if plant is in pot", error });
    }
  }

  // ===================== Item Methods =====================
  async getLatestItem(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const item = await gardenService.getLatestItemOfAccount(address);
      res.json({ status: "success", data: item });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get latest item", error });
    }
  }

  async getItemByAddress(req: Request, res: Response) {
    try {
      const { itemAddress } = req.params;
      if (!itemAddress) {
        return res.status(400).json({ status: "error", message: "Missing itemAddress" });
      }
      const itemInfo = await gardenService.getItem(itemAddress);
      res.json({ status: "success", data: itemInfo });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get item info", error });
    }
  }

  async getAllItems(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const items = await gardenService.getAccountOwnedItems(address, 100);
      res.json({ status: "success", data: items });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get items", error });
    }
  }

  async getItemAddresses(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const addresses = await gardenService.getItemAddressesOfAccount(address, limit);
      res.json({ status: "success", data: addresses });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get item addresses", error });
    }
  }

  async getItemAddressesAndInfo(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await gardenService.getItemAddressesAndInfo(address, limit);
      res.json({ status: "success", data });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get item addresses and info", error });
    }
  }

  async createItem(req: Request, res: Response) {
    try {
      const { name, level, quantity, uri, description, receiveAddr } = req.body;
      if (!name || level === undefined || quantity === undefined || !uri || !description || !receiveAddr) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
      }
      const txHash = await gardenService.createItem(account_relayer, name, level, quantity, uri, description, receiveAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to create item", error });
    }
  }

  async burnItem(req: Request, res: Response) {
    try {
      const { itemAddr } = req.body;
      if (!itemAddr) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr" });
      }
      const txHash = await gardenService.burnItem(account_relayer, itemAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to burn item", error });
    }
  }

  async increaseItemQuantity(req: Request, res: Response) {
    try {
      const { itemAddr, amount } = req.body;
      if (!itemAddr || amount === undefined) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr or amount" });
      }
      const txHash = await gardenService.increaseItemQuantity(account_relayer, itemAddr, amount);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to increase item quantity", error });
    }
  }

  async decreaseItemQuantity(req: Request, res: Response) {
    try {
      const { itemAddr, amount } = req.body;
      if (!itemAddr || amount === undefined) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr or amount" });
      }
      const txHash = await gardenService.decreaseItemQuantity(account_relayer, itemAddr, amount);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to decrease item quantity", error });
    }
  }

  async setItemUsageType(req: Request, res: Response) {
    try {
      const { itemAddr, newUsageType } = req.body;
      if (!itemAddr || newUsageType === undefined) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr or newUsageType" });
      }
      const txHash = await gardenService.setItemUsageType(account_relayer, itemAddr, newUsageType);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to set item usage type", error });
    }
  }

  async setItemEffectValue(req: Request, res: Response) {
    try {
      const { itemAddr, newEffectValue } = req.body;
      if (!itemAddr || newEffectValue === undefined) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr or newEffectValue" });
      }
      const txHash = await gardenService.setItemEffectValue(account_relayer, itemAddr, newEffectValue);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to set item effect value", error });
    }
  }

  async setItemMaxUsage(req: Request, res: Response) {
    try {
      const { itemAddr, newMaxUsage } = req.body;
      if (!itemAddr || newMaxUsage === undefined) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr or newMaxUsage" });
      }
      const txHash = await gardenService.setItemMaxUsage(account_relayer, itemAddr, newMaxUsage);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to set item max usage", error });
    }
  }

  async useItemReduceGrowTime(req: Request, res: Response) {
    try {
      const { itemAddr, plantAddr } = req.body;
      if (!itemAddr || !plantAddr) {
        return res.status(400).json({ status: "error", message: "Missing itemAddr or plantAddr" });
      }
      const txHash = await gardenService.useItemReduceGrowTime(account_relayer, itemAddr, plantAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to use item reduce grow time", error });
    }
  }

  // ===================== Pet Methods =====================
  async getLatestPet(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const pet = await gardenService.getLatestPetOfAccount(address);
      res.json({ status: "success", data: pet });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get latest pet", error });
    }
  }

  async getPetByAddress(req: Request, res: Response) {
    try {
      const { petAddress } = req.params;
      if (!petAddress) {
        return res.status(400).json({ status: "error", message: "Missing petAddress" });
      }
      const petInfo = await gardenService.getPet(petAddress);
      res.json({ status: "success", data: petInfo });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pet info", error });
    }
  }

  async getAllPets(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const pets = await gardenService.getAccountOwnedPets(address, 100);
      res.json({ status: "success", data: pets });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pets", error });
    }
  }

  async getPetAddresses(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const addresses = await gardenService.getPetAddressesOfAccount(address, limit);
      res.json({ status: "success", data: addresses });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pet addresses", error });
    }
  }

  async getPetAddressesAndInfo(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await gardenService.getPetAddressesAndInfo(address, limit);
      res.json({ status: "success", data });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to get pet addresses and info", error });
    }
  }

  async createPet(req: Request, res: Response) {
    try {
      const { name, species, intelligence, strength, agility, evolvedFromPlant, receiveAddr } = req.body;
      if (!name || !species || intelligence === undefined || strength === undefined || agility === undefined || !evolvedFromPlant || !receiveAddr) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
      }
      const txHash = await gardenService.createPet(account_relayer, name, species, intelligence, strength, agility, evolvedFromPlant, receiveAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to create pet", error });
    }
  }

  async evolveToPet(req: Request, res: Response) {
    try {
      const { plantAddr, receiver } = req.body;
      if (!plantAddr || !receiver) {
        return res.status(400).json({ status: "error", message: "Missing plantAddr or receiver" });
      }
      const txHash = await gardenService.evolveToPet(account_relayer, plantAddr, receiver);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to evolve plant to pet", error });
    }
  }

  async burnPet(req: Request, res: Response) {
    try {
      const { petAddr } = req.body;
      if (!petAddr) {
        return res.status(400).json({ status: "error", message: "Missing petAddr" });
      }
      const txHash = await gardenService.burnPet(account_relayer, petAddr);
      res.json({ status: "success", transactionHash: txHash });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to burn pet", error });
    }
  }
}

export const gardenController = new GardenController(); 