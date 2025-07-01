import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/nfts')({
  component: NftsPage,
})

function NftsPage() {
  // Dữ liệu mẫu NFT động
  const nfts = [
    {
      id: 1,
      name: 'Reel OG',
      level: 5,
      exp: 1200,
      nextLevelExp: 1500,
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop',
      description: 'NFT động: Tăng cấp khi bạn tương tác nhiều trên Reel.'
    },
    {
      id: 2,
      name: 'Vibe Challenger',
      level: 2,
      exp: 300,
      nextLevelExp: 500,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
      description: 'NFT động: Tham gia thử thách để tăng cấp.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Your Dynamic NFTs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {nfts.map(nft => (
            <div key={nft.id} className="card flex flex-col items-center">
              <img src={nft.image} alt={nft.name} className="w-40 h-40 rounded-xl mb-4 border-4 border-gradient-to-r from-pink-500 to-violet-500" />
              <h2 className="text-xl font-bold text-white mb-2">{nft.name}</h2>
              <p className="text-gray-300 mb-2">{nft.description}</p>
              <div className="w-full bg-white/10 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-violet-500 h-4 rounded-full"
                  style={{ width: `${(nft.exp / nft.nextLevelExp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between w-full text-sm text-gray-300">
                <span>Level: <span className="text-pink-400 font-bold">{nft.level}</span></span>
                <span>EXP: {nft.exp}/{nft.nextLevelExp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 