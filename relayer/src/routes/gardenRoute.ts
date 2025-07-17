import { Router } from 'express';
import { gardenController } from '../controllers/gardenController';

const router = Router();

// ===================== Pot Routes =====================
// Get latest pot NFT for a user
router.get('/pot/latest/:address', async (req, res) => {
  await gardenController.getLatestPot(req, res);
});

// Get pot info by address
router.get('/pot/:potAddress', async (req, res) => {
  await gardenController.getPotByAddress(req, res);
});

// Get all pots for a user
router.get('/pots/:address', async (req, res) => {
  await gardenController.getAllPots(req, res);
});

// Get pot addresses for a user
router.get('/pot/addresses/:address', async (req, res) => {
  await gardenController.getPotAddresses(req, res);
});

// Get pot addresses and info for a user
router.get('/pot/addresses-info/:address', async (req, res) => {
  await gardenController.getPotAddressesAndInfo(req, res);
});

// Create pot
router.post('/pot/create', async (req, res) => {
  await gardenController.createPot(req, res);
});

// Upgrade pot
router.post('/pot/upgrade', async (req, res) => {
  await gardenController.upgradePot(req, res);
});

// Burn pot
router.post('/pot/burn', async (req, res) => {
  await gardenController.burnPot(req, res);
});

// Increase pot quantity
router.post('/pot/increase-quantity', async (req, res) => {
  await gardenController.increasePotQuantity(req, res);
});

// Decrease pot quantity
router.post('/pot/decrease-quantity', async (req, res) => {
  await gardenController.decreasePotQuantity(req, res);
});

// ===================== Plant Routes =====================
// Get latest plant NFT for a user
router.get('/plant/latest/:address', async (req, res) => {
  await gardenController.getLatestPlant(req, res);
});

// Get plant info by address
router.get('/plant/:plantAddress', async (req, res) => {
  await gardenController.getPlantByAddress(req, res);
});

// Get all plants for a user
router.get('/plants/:address', async (req, res) => {
  await gardenController.getAllPlants(req, res);
});

// Get plant addresses for a user
router.get('/plant/addresses/:address', async (req, res) => {
  await gardenController.getPlantAddresses(req, res);
});

// Get plant addresses and info for a user
router.get('/plant/addresses-info/:address', async (req, res) => {
  await gardenController.getPlantAddressesAndInfo(req, res);
});

// Create plant
router.post('/plant/create', async (req, res) => {
  await gardenController.createPlant(req, res);
});

// Plant a seed (POST)
router.post('/plant/seed', async (req, res) => {
  await gardenController.plantSeed(req, res);
});

// Update growth stage
router.post('/plant/update-growth', async (req, res) => {
  await gardenController.updateGrowthStage(req, res);
});

// Transfer plant
router.post('/plant/transfer', async (req, res) => {
  await gardenController.transferPlant(req, res);
});

// Advance growth
router.post('/plant/advance-growth', async (req, res) => {
  await gardenController.advanceGrowth(req, res);
});

// Harvest plant
router.post('/plant/harvest', async (req, res) => {
  await gardenController.harvest(req, res);
});

// Burn plant
router.post('/plant/burn', async (req, res) => {
  await gardenController.burnPlant(req, res);
});

// Increase plant quantity
router.post('/plant/increase-quantity', async (req, res) => {
  await gardenController.increasePlantQuantity(req, res);
});

// Decrease plant quantity
router.post('/plant/decrease-quantity', async (req, res) => {
  await gardenController.decreasePlantQuantity(req, res);
});

// Set plant base grow duration
router.post('/plant/set-grow-duration', async (req, res) => {
  await gardenController.setPlantBaseGrowDuration(req, res);
});

// Check if plant is in pot
router.get('/plant/in-pot/:plantAddress/:potAddress', async (req, res) => {
  await gardenController.isPlantInPot(req, res);
});

// ===================== Item Routes =====================
// Get latest item NFT for a user
router.get('/item/latest/:address', async (req, res) => {
  await gardenController.getLatestItem(req, res);
});

// Get item info by address
router.get('/item/:itemAddress', async (req, res) => {
  await gardenController.getItemByAddress(req, res);
});

// Get all items for a user
router.get('/items/:address', async (req, res) => {
  await gardenController.getAllItems(req, res);
});

// Get item addresses for a user
router.get('/item/addresses/:address', async (req, res) => {
  await gardenController.getItemAddresses(req, res);
});

// Get item addresses and info for a user
router.get('/item/addresses-info/:address', async (req, res) => {
  await gardenController.getItemAddressesAndInfo(req, res);
});

// Create item
router.post('/item/create', async (req, res) => {
  await gardenController.createItem(req, res);
});

// Burn item
router.post('/item/burn', async (req, res) => {
  await gardenController.burnItem(req, res);
});

// Increase item quantity
router.post('/item/increase-quantity', async (req, res) => {
  await gardenController.increaseItemQuantity(req, res);
});

// Decrease item quantity
router.post('/item/decrease-quantity', async (req, res) => {
  await gardenController.decreaseItemQuantity(req, res);
});

// Set item usage type
router.post('/item/set-usage-type', async (req, res) => {
  await gardenController.setItemUsageType(req, res);
});

// Set item effect value
router.post('/item/set-effect-value', async (req, res) => {
  await gardenController.setItemEffectValue(req, res);
});

// Set item max usage
router.post('/item/set-max-usage', async (req, res) => {
  await gardenController.setItemMaxUsage(req, res);
});

// Use item to reduce grow time
router.post('/item/use-reduce-grow-time', async (req, res) => {
  await gardenController.useItemReduceGrowTime(req, res);
});

// ===================== Pet Routes =====================
// Get latest pet NFT for a user
router.get('/pet/latest/:address', async (req, res) => {
  await gardenController.getLatestPet(req, res);
});

// Get pet info by address
router.get('/pet/:petAddress', async (req, res) => {
  await gardenController.getPetByAddress(req, res);
});

// Get all pets for a user
router.get('/pets/:address', async (req, res) => {
  await gardenController.getAllPets(req, res);
});

// Get pet addresses for a user
router.get('/pet/addresses/:address', async (req, res) => {
  await gardenController.getPetAddresses(req, res);
});

// Get pet addresses and info for a user
router.get('/pet/addresses-info/:address', async (req, res) => {
  await gardenController.getPetAddressesAndInfo(req, res);
});

// Create pet
router.post('/pet/create', async (req, res) => {
  await gardenController.createPet(req, res);
});

// Evolve plant to pet
router.post('/pet/evolve', async (req, res) => {
  await gardenController.evolveToPet(req, res);
});

// Burn pet
router.post('/pet/burn', async (req, res) => {
  await gardenController.burnPet(req, res);
});

export default router; 