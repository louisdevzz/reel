import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '../contexts/userContext';
import { relayerService } from '../lib/relayerService';
import toast from 'react-hot-toast';


function PlantCard({plantAddress, handleSeedClick, selectedSeed, handlePlantSeed}:{plantAddress: string, handleSeedClick: (seedId: string) => void, selectedSeed: string | null, handlePlantSeed: (seedId: string) => void}){
  const [plantInfo, setPlantInfo] = useState<any[]|null>(null)
  const fetchPlantInfo = useCallback(async()=>{
    const plantRes = await relayerService.getPlantInfo(plantAddress)
    if(plantRes){
      setPlantInfo(plantRes)
    }
  },[plantAddress])

  useEffect(()=>{
    fetchPlantInfo()
  },[fetchPlantInfo])

  const rarity: { [key: number]: string } = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Epic",
    5: "Legendary"
  }

  if(!plantInfo){
    return null
  }

  // Extract data from plantInfo array
  const plantName = plantInfo[0] as string
  const rarityLevel = plantInfo[1] as number
  const rarityText = rarity[rarityLevel] || "Unknown"

  return(
    <div 
      className="bg-[#23232b] border border-[#27272a] rounded-xl p-3 flex flex-col items-center shadow relative cursor-pointer hover:bg-[#27272a] transition-colors"
      onClick={() => handleSeedClick(plantAddress)}
    >
      <span className="absolute top-2 left-2 bg-green-500 text-xs text-white px-2 py-0.5 rounded">{rarityText}</span>
      <span className="absolute top-2 right-2 text-yellow-400 font-semibold">x1</span>
      {
        plantName == "Tomato" && (
          <img 
            src="https://gateway.pinata.cloud/ipfs/bafybeigey3wju7qaieyoqbk6izwh4sq56nnvb57rlajozx24ljniguz7ye" 
            alt={plantName} 
            className='object-contain h-16 w-16 mt-5'
          />
        )
      }
      <span className="text-white text-lg font-semibold">{plantName}</span>
      
      {selectedSeed === plantAddress && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
          <button
            className="bg-purple-600 text-xs hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handlePlantSeed(plantAddress);
            }}
          >
            Plant
          </button>
        </div>
      )}
    </div>
  )
}

function PotCard({potAddress, seedAddress, handlePotClick, selectedPot, handleUsePot}:{potAddress: string, seedAddress: string, handlePotClick: (potId: string) => void, selectedPot: string | null, handleUsePot: (potId: string) => void}){
  const [potInfo, setPotInfo] = useState<any[]|null>(null)
  
  const fetchPotInfo = useCallback(async()=>{
    const potRes = await relayerService.getPotInfo(potAddress)
    if(potRes){
      setPotInfo(potRes)
    }
  },[potAddress])

  useEffect(()=>{
    fetchPotInfo()
  },[fetchPotInfo])
  
  if(!potInfo){
    return null
  }


  const potName = potInfo[0] as string

  return(
    <div 
      className="bg-[#23232b] border border-[#27272a] rounded-xl p-3 flex flex-col items-center shadow relative cursor-pointer hover:bg-[#27272a] transition-colors"
      onClick={() => handlePotClick(potAddress)}
    >
      <span className="absolute top-2 left-2 bg-green-500 text-xs text-white px-2 py-0.5 rounded">Common</span>
      {
        potName == "Leafy" && (
          <img 
            src="https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa" 
            alt="Leafy" 
            className='object-contain h-24 w-24'
          />
        )
      }
      <div className="text-white font-semibold">{potName}</div>
      
      {selectedPot === potAddress && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
          <button
            className="bg-purple-600 text-xs hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleUsePot(potAddress);
            }}
          >
            Use
          </button>
        </div>
      )}
    </div>
  )
} 

function PlantedPlantInfo({ plantInfo }: { plantInfo: any[] }) {
  if (!plantInfo || plantInfo.length === 0) {
    return null;
  }

  // Extract data from plantInfo array based on Move contract structure
  const plantName = plantInfo[0] as string;
  const extendedGrowthPercent = plantInfo[7] as number;
  const stage = plantInfo[8] as number;
  const isReadyToHarvest = plantInfo[9] as boolean;

  const rarity: { [key: number]: string } = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Epic",
    5: "Legendary"
  }

  // Get stage name
  const getStageName = (stage: number) => {
    switch (stage) {
      case 1: return "Sprout";
      case 2: return "Sapling";
      case 3: return "Mature";
      case 4: return "Ready";
      case 5: return "Evolve to Pet";
      default: return "Unknown";
    }
  };

  // Get stage emoji
  const getStageEmoji = (stage: number) => {
    switch (stage) {
      case 1: return "🌱";
      case 2: return "🌳";
      case 3: return "🌲";
      case 4: return "🐾";
      default: return "❓";
    }
  };

  return (
    <div className="bg-[#23232b] border border-[#27272a] rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStageEmoji(stage)}</span>
          <div>
            <h3 className="text-white font-semibold text-lg">{plantName}</h3>
            <p className="text-gray-400 text-sm">Stage: {getStageName(stage)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${isReadyToHarvest ? 'text-green-400' : 'text-yellow-400'}`}>
            {isReadyToHarvest ? '✅ Ready to Harvest' : '⏳ Growing'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
        <div>
          <span className="block">Rarity:</span>
          <span className="text-white font-semibold">{rarity[plantInfo[1]]}</span>
        </div>
        <div>
          <span className="block">Extended Growth:</span>
          <span className="text-white font-semibold">{extendedGrowthPercent}%</span>
        </div>
      </div>
    </div>
  );
}

export const PetFeed = () => {
  const [selectedPot, setSelectedPot] = useState<string | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [potAddresses, setPotAddresses] = useState<string[]>([]);
  const [plantAddresses, setPlantAddresses] = useState<string[]>([]);
  const [plantInfo, setPlantInfo] = useState<any|[]>([])
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();

  const fetchAddresses = useCallback(async() => {
    if (!currentUser?.aptosAddress) return;
    
    setLoading(true);
    try {

      const [potRes, plantRes] = await Promise.all([
        relayerService.getPotAddresses(currentUser.aptosAddress),
        relayerService.getPlantAddresses(currentUser.aptosAddress)
      ])
      if(potRes||plantRes){
        setPotAddresses(potRes || [])
        // Filter out planted seeds from plantAddresses
        const plantedSeedId = localStorage.getItem("plantSeed");
        if(plantedSeedId){
          const plantRes = await relayerService.getPlantInfo(plantedSeedId||'')
          await relayerService.updateGrowthStage(plantedSeedId||'')
          setPlantInfo(plantRes)
        }
        const availableSeeds = plantRes ? plantRes.filter((seedId: string) => seedId !== plantedSeedId) : [];
        setPlantAddresses(availableSeeds || [])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.aptosAddress]);

  // Fetch pot and plant addresses when component mounts or user changes
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Load selected pot and seed from localStorage when component mounts
  useEffect(() => {
    const savedPot = localStorage.getItem("selectedPot");
    const savedSeed = localStorage.getItem("plantSeed");
    if (savedPot) {
      setSelectedPot(savedPot);
    }
    if (savedSeed) {
      setSelectedSeed(savedSeed);
    }
  }, []);


  const handlePotClick = (potId: string) => {
    setSelectedPot(selectedPot === potId ? null : potId);
  };

  const handleSeedClick = (seedId: string) => {
    setSelectedSeed(selectedSeed === seedId ? null : seedId);
  };

  const handleUsePot = (potId: string) => {
    // TODO: Implement pot usage logic here
    console.log('Using pot:', potId);
    setSelectedPot(null);
    localStorage.setItem("selectedPot", potId)
  };

  const handlePlantSeed = async (seedId: string) => {
    if(!selectedPot){
      toast.error("Please select a pot")
      return
    }

    if(!seedId){
      toast.error("Please select a seed")
      return
    }


    const plantRes = await relayerService.plantSeed(selectedPot, seedId)
    if(plantRes){
      toast.success("Seed planted successfully")
      setSelectedSeed(null);
      localStorage.setItem("plantSeed", seedId)
      // Remove the planted seed from available seeds
      setPlantAddresses(prev => prev.filter(seed => seed !== seedId))
    }
  };


  return (
    <div className="min-h-[600px] w-full bg-[#18181b] rounded-2xl shadow-lg p-4 flex flex-col relative overflow-hidden">
      <h1 className='text-white text-2xl font-bold mb-2'>Garden Reel</h1>
      <div>
        {plantInfo && plantInfo.length > 0 && (
          <PlantedPlantInfo plantInfo={plantInfo} />
        )}
      </div>

      <div className="flex flex-col items-center mt-16 mb-4 min-h-[200px] relative">
        <img 
          src={
            plantInfo && plantInfo.length > 0 
              ? (() => {
                  const stage = plantInfo[8] as number;
                  switch (stage) {
                    case 1: return "https://gateway.pinata.cloud/ipfs/bafybeibufrurucfvjneiglq46rsr4qxq3wah5kjxxoermjc7662sggdcjy";
                    case 2: return "https://gateway.pinata.cloud/ipfs/bafybeibsnpr5bualcs4k7hcv3u22tzsotwlpatcdezxmkzzbqvoar3atii";
                    case 3: return "https://gateway.pinata.cloud/ipfs/bafybeidw7abywymd2wq7lb3hvwbyep4exltcq3le3nmluxwuucdeusaase";
                    case 4: return "https://gateway.pinata.cloud/ipfs/bafybeigehu2rfm6tgfhne42pd5ufxq325damvgsbrzygocaschigegodga";
                    default: return "https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa";
                  }
                })()
              : "https://gateway.pinata.cloud/ipfs/bafybeifnpsyecoefmhsskj74fl45abt4qnparqnuszrzxkyu5cggzm7wxa"
          }
          alt="pet"
          className="w-64 h-64 object-cover rounded-lg absolute -bottom-20" 
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button className="bg-[#23232b] border border-[#27272a] rounded-lg px-4 py-2 text-white text-xl hover:bg-[#27272a] transition">🛍️</button>
      </div>

      <Tabs defaultValue="seeds" className="mb-4 w-full">
        <TabsList className='w-full'>
          <TabsTrigger value="seeds">🌱 <span className="ml-1 hidden sm:inline">Seeds</span></TabsTrigger>
          <TabsTrigger value="items">📦 <span className="ml-1 hidden sm:inline">Items</span></TabsTrigger>
          <TabsTrigger value="pots">🪴 <span className="ml-1 hidden sm:inline">Pots</span></TabsTrigger>
          <TabsTrigger value="pets">🐾 <span className="ml-1 hidden sm:inline">Pets</span></TabsTrigger>
        </TabsList>
        <TabsContent value="seeds">
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl mt-2">
            {
              plantAddresses.map((plantAddress)=>(
                <PlantCard key={plantAddress} plantAddress={plantAddress} handleSeedClick={handleSeedClick} selectedSeed={selectedSeed} handlePlantSeed={handlePlantSeed} />
              ))
            }
          </div>
        </TabsContent>
        <TabsContent value="items">
          <div className="text-center text-gray-400 py-8">Items (coming soon)</div>
        </TabsContent>
        <TabsContent value="pots">
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl mt-2">
            {
              potAddresses.map((potAddress)=>{
                return <PotCard key={potAddress} potAddress={potAddress} seedAddress={selectedSeed || ""} handlePotClick={handlePotClick} selectedPot={selectedPot} handleUsePot={handleUsePot}/>
              })
            }
          </div>
        </TabsContent>
        <TabsContent value="pets">
          <div className="text-center text-gray-400 py-8">Pets (coming soon)</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
