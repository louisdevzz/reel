import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  // Dữ liệu mẫu user
  const user = {
    name: 'CryptoFan',
    address: '0x1234...abcd',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Web3 builder. NFT collector. SocialFi enthusiast.',
    stats: {
      videos: 12,
      followers: 340,
      tips: 120,
      nfts: 2
    }
  }

  const nfts = [
    {
      id: 1,
      name: 'Reel OG',
      level: 5,
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Vibe Challenger',
      level: 2,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop',
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* User Info */}
        <div className="flex flex-col items-center mb-8">
          <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full border-4 border-gradient-to-r from-pink-500 to-violet-500 mb-4" />
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <div className="text-gray-400 text-sm mb-2">{user.address}</div>
          <p className="text-gray-300 text-center mb-4">{user.bio}</p>
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-xl font-bold text-pink-400">{user.stats.videos}</div>
              <div className="text-gray-300 text-xs">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-violet-400">{user.stats.followers}</div>
              <div className="text-gray-300 text-xs">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{user.stats.tips}</div>
              <div className="text-gray-300 text-xs">Tips</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{user.stats.nfts}</div>
              <div className="text-gray-300 text-xs">NFTs</div>
            </div>
          </div>
        </div>

        {/* NFT động */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Dynamic NFTs</h2>
          <div className="flex space-x-4">
            {nfts.map(nft => (
              <div key={nft.id} className="card flex flex-col items-center w-40">
                <img src={nft.image} alt={nft.name} className="w-20 h-20 rounded-xl mb-2 border-2 border-gradient-to-r from-pink-500 to-violet-500" />
                <div className="text-white font-semibold text-sm">{nft.name}</div>
                <div className="text-pink-400 text-xs">Level {nft.level}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hoạt động nổi bật */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="text-gray-300">• Tipped <span className="text-pink-400 font-bold">2 APT</span> to <span className="text-white">@DeFiGuru</span> for a video</li>
            <li className="text-gray-300">• Joined challenge <span className="text-white">NFT Art Showcase</span></li>
            <li className="text-gray-300">• Uploaded new video: <span className="text-white">"How to use Aptos Wallet"</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
} 