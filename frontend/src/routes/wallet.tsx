import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wallet')({
  component: WalletPage,
})

function WalletPage() {
  return (
    <div className="bg-[#18181b] min-h-screen py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4">
        {/* Cột trái: My Wallets */}
        <div className="md:w-1/3 w-full space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">My Wallets</h2>
          {/* Card ví */}
          <div className="bg-[#23232a] rounded-2xl p-6 shadow-lg space-y-4">
            {/* Thẻ ngân hàng */}
            <div className="bg-gradient-to-r from-[#23232a] to-[#35354a] rounded-xl p-4 text-white mb-2">
              <div className="font-bold text-lg">Maglo. <span className="text-xs text-gray-400 border-l border-gray-700 px-2 py-1 ml-2">Universal Bank</span></div>
              {/* Chip icon */}
              <div className="w-10 h-7 bg-gradient-to-br from-gray-300 to-gray-500 rounded-md flex items-center justify-center my-5">
                <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="26" height="16" rx="4" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="2"/>
                  <rect x="6" y="5" width="16" height="8" rx="2" fill="#BDBDBD"/>
                  <line x1="8" y1="1" x2="8" y2="17" stroke="#BDBDBD" strokeWidth="1"/>
                  <line x1="20" y1="1" x2="20" y2="17" stroke="#BDBDBD" strokeWidth="1"/>
                  <line x1="1" y1="9" x2="27" y2="9" stroke="#BDBDBD" strokeWidth="1"/>
                </svg>
              </div>
              <div className="tracking-widest text-xl my-2">5495 7381 3759 2321</div>
              <div className="flex justify-between items-center text-sm">
                <span>09/25</span>
                <span>VISA</span>
              </div>
            </div>
            {/* Số dư */}
            <div className="bg-[#23232a] w-full rounded-xl p-4 mt-2">
              <div className="flex flex-col justify-between items-start w-full">
                <span className="text-gray-400">Your Balance</span>
                <div className="flex justify-between items-center mt-2 text-sm w-full">
                  <span className="text-white font-bold text-lg">$5240.00</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                        <path d="M8 12V4M8 4l-3 3M8 4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      23.65%
                    </span>
                    <span className="text-red-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                        <path d="M8 4v8M8 12l-3-3M8 12l3-3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      10.40%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-gray-400">
                <span>Currency</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-white ">
                <span>USD / US Dollar</span>
              </div>
            </div>
            {/* Thêm thẻ mới */}
            <div className="w-full flex gap-3 mt-4">
              <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Deposit</button>
              <button className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Withdraw</button>
            </div>
          </div>
        </div>
        {/* Cột phải: My Payments */}
        <div className="md:w-2/3 w-full space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold text-white">My Payments</h2>
            <div className="inline-flex items-end border border-gray-700 rounded-full p-2 w-auto max-w-xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar tượng trưng */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  J
                </div>
                {/* Tên người dùng tượng trưng */}
                <span className="text-sm font-semibold text-white truncate max-w-[120px]">John Doe</span>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-700 mb-4">
            <button className="text-white border-b-2 border-green-400 pb-2">All Payments</button>
            <button className="text-gray-400 pb-2">Regular Payments</button>
          </div>
          {/* Lịch sử giao dịch */}
          <div className="space-y-4">
            <div className="text-gray-400 text-sm mb-2">Today</div>
            <div className="flex flex-col gap-2">
              {/* 1 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">P</span>
                  <div>
                    <div className="text-white font-medium">Payoneer</div>
                    <div className="text-xs text-gray-400">20 Apr 2022, 06:55 PM</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+ $4800.24</div>
              </div>
              {/* 2 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">P</span>
                  <div>
                    <div className="text-white font-medium">Paypal</div>
                    <div className="text-xs text-gray-400">20 Apr 2022, 04:20 PM</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+ $120.00</div>
              </div>
              {/* 3 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-tr from-green-400 to-lime-400 rounded-full flex items-center justify-center">B</span>
                  <div>
                    <div className="text-white font-medium">Binance</div>
                    <div className="text-xs text-gray-400">20 Apr 2022, 01:10 PM</div>
                  </div>
                </div>
                <div className="text-red-400 font-bold">- $300.00</div>
              </div>
              {/* 4 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center">S</span>
                  <div>
                    <div className="text-white font-medium">Stripe</div>
                    <div className="text-xs text-gray-400">20 Apr 2022, 10:00 AM</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+ $50.00</div>
              </div>
            </div>
            {/* Upcoming Payments */}
            <div className="text-white mt-6 mb-2">Upcoming Payments</div>
            <div className="text-gray-400 text-sm mb-2">Next month</div>
            <div className="flex flex-col gap-2">
              {/* 1 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">F</span>
                  <div>
                    <div className="text-white font-medium">Facebook Ads</div>
                    <div className="text-xs text-gray-400">20 May 2022, 06:55 PM</div>
                  </div>
                </div>
                <div className="text-white font-bold">$400.00</div>
              </div>
              {/* 2 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">G</span>
                  <div>
                    <div className="text-white font-medium">Google Cloud</div>
                    <div className="text-xs text-gray-400">22 May 2022, 09:00 AM</div>
                  </div>
                </div>
                <div className="text-white font-bold">$120.00</div>
              </div>
              {/* 3 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">N</span>
                  <div>
                    <div className="text-white font-medium">Netflix</div>
                    <div className="text-xs text-gray-400">25 May 2022, 08:00 PM</div>
                  </div>
                </div>
                <div className="text-white font-bold">$15.99</div>
              </div>
              {/* 4 giao dịch */}
              <div className="flex justify-between items-center bg-[#23232a] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">S</span>
                  <div>
                    <div className="text-white font-medium">Spotify</div>
                    <div className="text-xs text-gray-400">28 May 2022, 07:30 AM</div>
                  </div>
                </div>
                <div className="text-white font-bold">$9.99</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}