import { FaCircle } from 'react-icons/fa';

const suggestedCategories = [
  { name: 'VALORANT', viewers: '41,6 N', icon: '/assets/valorant.png', type: 'FPS' },
  { name: 'League of Legends', viewers: '64,8 N', icon: '/assets/lol.png', type: 'Nhập vai' },
  { name: 'ROBLOX', viewers: '11,9 N', icon: '/assets/roblox.png', type: 'Platform game' },
  { name: 'Chỉ trò chuyện', viewers: '344,7 N', icon: '/assets/justchatting.png', type: '' },
  { name: 'Counter-Strike', viewers: '97,1 N', icon: '/assets/cs.png', type: '' },
  { name: 'Dota 2', viewers: '18,4 N', icon: '/assets/dota2.png', type: 'Chiến thuật' },
];

const liveChannels = [
  { name: 'Demon1', game: 'VALORANT', viewers: '3,3 N', avatar: '/assets/demon1.png' },
  { name: 'pickletiff', game: 'ROBLOX', viewers: '585', avatar: '/assets/pickletiff.png' },
  { name: 'Ben_', game: 'Path of Exile', viewers: '2,6 N', avatar: '/assets/ben.png' },
  { name: 'sakurashymko', game: 'Chỉ trò chuyện', viewers: '12,4 N', avatar: '/assets/sakura.png' },
  { name: 'Goldenius', game: 'Albion Online', viewers: '369', avatar: '/assets/goldenius.png' },
];

interface SidebarProps {
  isExpanded: boolean;
}

export function Sidebar({ isExpanded }: SidebarProps) {
  if (!isExpanded) {
    return null;
  }

  return (
    <aside className="w-64 flex flex-col bg-[#1f1f23] fixed top-0 left-0 h-screen p-4 z-30 border-r border-[#18181b] transition-all duration-300">
      {/* Danh mục đề xuất */}
      <div>
        <h2 className="text-xs text-[#adadb8] font-bold uppercase mb-2">Danh mục đề xuất</h2>
        <ul className="space-y-2">
          {suggestedCategories.map((cat) => (
            <li key={cat.name} className="flex items-center justify-between group hover:bg-[#27272e] rounded px-2 py-1 cursor-pointer">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#18181b] rounded-md flex items-center justify-center overflow-hidden">
                  {/* Thay bằng <img src={cat.icon} /> nếu có icon */}
                  <span className="text-white font-bold text-base">{cat.name[0]}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium leading-4">{cat.name}</div>
                  {cat.type && <div className="text-xs text-[#adadb8]">{cat.type}</div>}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <FaCircle className="text-red-600 text-[8px]" />
                <span className="text-[#adadb8] text-xs font-semibold">{cat.viewers}</span>
              </div>
            </li>
          ))}
        </ul>
        <button className="text-[#9147FF] text-xs mt-2 hover:underline">Xem thêm</button>
      </div>
      
      {/* Kênh trực tiếp */}
      <div className="mt-6">
        <h2 className="text-xs text-[#adadb8] font-bold uppercase mb-2">Kênh trực tiếp</h2>
        <ul className="space-y-2">
          {liveChannels.map((ch) => (
            <li key={ch.name} className="flex items-center justify-between group hover:bg-[#27272e] rounded px-2 py-1 cursor-pointer">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#18181b] rounded-full flex items-center justify-center overflow-hidden">
                  {/* Thay bằng <img src={ch.avatar} /> nếu có avatar */}
                  <span className="text-white font-bold text-base">{ch.name[0]}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium leading-4">{ch.name}</div>
                  <div className="text-xs text-[#adadb8]">{ch.game}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <FaCircle className="text-red-600 text-[8px]" />
                <span className="text-[#adadb8] text-xs font-semibold">{ch.viewers}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 