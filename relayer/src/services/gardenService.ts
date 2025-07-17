import { aptos, GARDEN_MODULE } from "../config";
import { Account } from "@aptos-labs/ts-sdk";

class GardenService {
  async createPot(
    sender: Account,
    name: string,
    level: number,
    quantity: number,
    uri: string,
    description: string,
    receiveAddr: string
  ) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::create_pot`,
        functionArguments: [name, level, quantity, uri, description, receiveAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async getPot(potAddress: string) {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_pot`,
        functionArguments: [potAddress],
      },
    });
    return res;
  }

  async createPlant(
    sender: Account,
    name: string,
    rarity: number,
    quantity: number,
    baseGrowDurationSec: number,
    uri: string,
    description: string,
    receiveAddr: string
  ) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::create_plant`,
        functionArguments: [name, rarity, quantity, baseGrowDurationSec, uri, description, receiveAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async getPlant(account: Account,plantAddress: string) {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_plant`,
        functionArguments: [plantAddress],
      },
    });
    // await this.updateGrowthStage(account,plantAddress);
    return res;
  }

  async isPlantInPot(plantAddress: string, potAddress: string) {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::is_plant_in_pot`,
        functionArguments: [plantAddress, potAddress],
      },
    });
    return res[0];
  }

  async setPlantBaseGrowDuration(sender: Account, plantAddr: string, duration: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::set_plant_base_grow_duration`,
        functionArguments: [plantAddr, duration],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async createItem(
    sender: Account,
    name: string,
    level: number,
    quantity: number,
    uri: string,
    description: string,
    receiveAddr: string
  ) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::create_item`,
        functionArguments: [name, level, quantity, uri, description, receiveAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async getItem(itemAddress: string) {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_item`,
        functionArguments: [itemAddress],
      },
    });
    return res;
  }

  async createPet(
    sender: Account,
    name: string,
    species: string,
    intelligence: number,
    strength: number,
    agility: number,
    evolvedFromPlant: string,
    receiveAddr: string
  ) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::create_pet`,
        functionArguments: [name, species, intelligence, strength, agility, evolvedFromPlant, receiveAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async getPet(petAddress: string) {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_pet`,
        functionArguments: [petAddress],
      },
    });
    return res;
  }

  async plantSeed(sender: Account, potAddr: string, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::plant_seed`,
        functionArguments: [potAddr, plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async updateGrowthStage(sender: Account, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::update_growth_stage`,
        functionArguments: [plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async upgradePot(sender: Account, potAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::upgrade_pot`,
        functionArguments: [potAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async transferPlant(sender: Account, potFromAddr: string, potToAddr: string, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::transfer_plant`,
        functionArguments: [potFromAddr, potToAddr, plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async advanceGrowth(sender: Account, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::advance_growth`,
        functionArguments: [plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async harvest(sender: Account, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::harvest`,
        functionArguments: [plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async evolveToPet(sender: Account, plantAddr: string, receiver: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::evolve_to_pet`,
        functionArguments: [plantAddr, receiver],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  // Burn functions
  async burnPot(sender: Account, potAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::burn_pot`,
        functionArguments: [potAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async burnPlant(sender: Account, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::burn_plant`,
        functionArguments: [plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async burnItem(sender: Account, itemAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::burn_item`,
        functionArguments: [itemAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async burnPet(sender: Account, petAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::burn_pet`,
        functionArguments: [petAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  // Quantity management functions
  async increasePotQuantity(sender: Account, potAddr: string, amount: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::increase_pot_quantity`,
        functionArguments: [potAddr, amount],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async decreasePotQuantity(sender: Account, potAddr: string, amount: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::decrease_pot_quantity`,
        functionArguments: [potAddr, amount],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async increasePlantQuantity(sender: Account, plantAddr: string, amount: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::increase_plant_quantity`,
        functionArguments: [plantAddr, amount],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async decreasePlantQuantity(sender: Account, plantAddr: string, amount: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::decrease_plant_quantity`,
        functionArguments: [plantAddr, amount],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async increaseItemQuantity(sender: Account, itemAddr: string, amount: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::increase_item_quantity`,
        functionArguments: [itemAddr, amount],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async decreaseItemQuantity(sender: Account, itemAddr: string, amount: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::decrease_item_quantity`,
        functionArguments: [itemAddr, amount],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  // Item property management
  async setItemUsageType(sender: Account, itemAddr: string, newUsageType: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::set_item_usage_type`,
        functionArguments: [itemAddr, newUsageType],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async setItemEffectValue(sender: Account, itemAddr: string, newEffectValue: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::set_item_effect_value`,
        functionArguments: [itemAddr, newEffectValue],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async setItemMaxUsage(sender: Account, itemAddr: string, newMaxUsage: number) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::set_item_max_usage`,
        functionArguments: [itemAddr, newMaxUsage],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  async useItemReduceGrowTime(sender: Account, itemAddr: string, plantAddr: string) {
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: `${GARDEN_MODULE}::use_item_reduce_grow_time`,
        functionArguments: [itemAddr, plantAddr],
      },
    });
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });
    return executedTransaction.hash;
  }

  // --- NFT Collection helpers ---
  async getPotCollectionAddress(): Promise<string> {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_pot_collection_address`,
        functionArguments: [],
      },
    });
    return String(res[0]);
  }

  async getAccountOwnedPots(accountAddress: string, limit = 1) {
    const collectionAddress = await this.getPotCollectionAddress();
    if (typeof aptos.getAccountOwnedTokensFromCollectionAddress === 'function') {
      return await aptos.getAccountOwnedTokensFromCollectionAddress({
        collectionAddress,
        accountAddress,
        options: {
          limit,
          orderBy: [{ last_transaction_version: "desc" }],
        },
      });
    } else {
      // TODO: Implement REST API fallback if SDK does not support
      throw new Error('aptos.getAccountOwnedTokensFromCollectionAddress not implemented');
    }
  }

  async getLatestPotOfAccount(accountAddress: string) {
    const pots = await this.getAccountOwnedPots(accountAddress, 1);
    if (!pots || pots.length === 0) return null;
    const potAddress = pots[0].token_data_id;
    if (!potAddress) return null;
    return await this.getPot(potAddress);
  }

  async getPotAddressesOfAccount(accountAddress: string, limit = 10): Promise<string[]> {
    const pots = await this.getAccountOwnedPots(accountAddress, limit);
    return pots.map(p => p.token_data_id).filter(Boolean);
  }

  async getPotAddressesAndInfo(accountAddress: string, limit = 10) {
    const pots = await this.getAccountOwnedPots(accountAddress, limit);
    return pots.map(p => ({
      address: p.token_data_id,
      info: p
    }));
  }

  async getPlantCollectionAddress(): Promise<string> {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_plant_collection_address`,
        functionArguments: [],
      },
    });
    return String(res[0]);
  }

  async getAccountOwnedPlants(accountAddress: string, limit = 1) {
    const collectionAddress = await this.getPlantCollectionAddress();
    if (typeof aptos.getAccountOwnedTokensFromCollectionAddress === 'function') {
      return await aptos.getAccountOwnedTokensFromCollectionAddress({
        collectionAddress,
        accountAddress,
        options: {
          limit,
          orderBy: [{ last_transaction_version: "desc" }],
        },
      });
    } else {
      // TODO: Implement REST API fallback if SDK does not support
      throw new Error('aptos.getAccountOwnedTokensFromCollectionAddress not implemented');
    }
  }

  async getLatestPlantOfAccount(account: Account,accountAddress: string) {
    const plants = await this.getAccountOwnedPlants(accountAddress, 1);
    if (!plants || plants.length === 0) return null;
    const plantAddress = plants[0].token_data_id;
    if (!plantAddress) return null;
    return await this.getPlant(account,plantAddress);
  }

  async getPlantAddressesOfAccount(accountAddress: string, limit = 10): Promise<string[]> {
    const plants = await this.getAccountOwnedPlants(accountAddress, limit);
    return plants.map(p => p.token_data_id).filter(Boolean);
  }

  async getPlantAddressesAndInfo(accountAddress: string, limit = 10) {
    const plants = await this.getAccountOwnedPlants(accountAddress, limit);
    return plants.map(p => ({
      address: p.token_data_id,
      info: p
    }));
  }

  async getItemCollectionAddress(): Promise<string> {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_item_collection_address`,
        functionArguments: [],
      },
    });
    return String(res[0]);
  }

  async getAccountOwnedItems(accountAddress: string, limit = 1) {
    const collectionAddress = await this.getItemCollectionAddress();
    if (typeof aptos.getAccountOwnedTokensFromCollectionAddress === 'function') {
      return await aptos.getAccountOwnedTokensFromCollectionAddress({
        collectionAddress,
        accountAddress,
        options: {
          limit,
          orderBy: [{ last_transaction_version: "desc" }],
        },
      });
    } else {
      // TODO: Implement REST API fallback if SDK does not support
      throw new Error('aptos.getAccountOwnedTokensFromCollectionAddress not implemented');
    }
  }

  async getLatestItemOfAccount(accountAddress: string) {
    const items = await this.getAccountOwnedItems(accountAddress, 1);
    if (!items || items.length === 0) return null;
    const itemAddress = items[0].token_data_id;
    if (!itemAddress) return null;
    return await this.getItem(itemAddress);
  }

  async getItemAddressesOfAccount(accountAddress: string, limit = 10): Promise<string[]> {
    const items = await this.getAccountOwnedItems(accountAddress, limit);
    return items.map(p => p.token_data_id).filter(Boolean);
  }

  async getItemAddressesAndInfo(accountAddress: string, limit = 10) {
    const items = await this.getAccountOwnedItems(accountAddress, limit);
    return items.map(p => ({
      address: p.token_data_id,
      info: p
    }));
  }

  async getPetCollectionAddress(): Promise<string> {
    const res = await aptos.view({
      payload: {
        function: `${GARDEN_MODULE}::get_pet_collection_address`,
        functionArguments: [],
      },
    });
    return String(res[0]);
  }

  async getAccountOwnedPets(accountAddress: string, limit = 1) {
    const collectionAddress = await this.getPetCollectionAddress();
    if (typeof aptos.getAccountOwnedTokensFromCollectionAddress === 'function') {
      return await aptos.getAccountOwnedTokensFromCollectionAddress({
        collectionAddress,
        accountAddress,
        options: {
          limit,
          orderBy: [{ last_transaction_version: "desc" }],
        },
      });
    } else {
      // TODO: Implement REST API fallback if SDK does not support
      throw new Error('aptos.getAccountOwnedTokensFromCollectionAddress not implemented');
    }
  }

  async getLatestPetOfAccount(accountAddress: string) {
    const pets = await this.getAccountOwnedPets(accountAddress, 1);
    if (!pets || pets.length === 0) return null;
    const petAddress = pets[0].token_data_id;
    if (!petAddress) return null;
    return await this.getPet(petAddress);
  }

  async getPetAddressesOfAccount(accountAddress: string, limit = 10): Promise<string[]> {
    const pets = await this.getAccountOwnedPets(accountAddress, limit);
    return pets.map(p => p.token_data_id).filter(Boolean);
  }

  async getPetAddressesAndInfo(accountAddress: string, limit = 10) {
    const pets = await this.getAccountOwnedPets(accountAddress, limit);
    return pets.map(p => ({
      address: p.token_data_id,
      info: p
    }));
  }
}

export const gardenService = new GardenService();