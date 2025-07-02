import { FaCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { apiService, User } from '../lib/apiService';
import { Link } from '@tanstack/react-router';

interface Category {
  name: string;
  subCategories: string[];
}

interface SidebarProps {
  isExpanded: boolean;
}

export function Sidebar({ isExpanded }: SidebarProps) {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, categoriesData] = await Promise.all([
          apiService.getTopUsersByFollowers(10),
          apiService.getCategories()
        ]);
        setTopUsers(users);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded) {
      fetchData();
    }
  }, [isExpanded]);

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  return (
    <aside className={`relative flex flex-col bg-[#1f1f23] border-r transition-all duration-300 border border-[#2f2f35] ${isExpanded ? 'w-64' : 'w-0'} mt-16 h-[calc(100vh-64px)]`}>
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4">
          <div>
            <h2 className="text-xs text-[#adadb8] font-bold uppercase mb-2">Categories</h2>
            {loading ? (
              <div className="text-[#adadb8] text-xs">Loading...</div>
            ) : (
              <ul className="space-y-1">
                {categories.map((category,index) => (
                  <li key={index}>
                    {/* Main Category */}
                    <div 
                      className="flex items-center justify-between group hover:bg-[#27272e] rounded px-2 py-1 cursor-pointer"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#18181b] rounded-md flex items-center justify-center overflow-hidden">
                          <span className="text-white font-bold text-base">{category.name[0]}</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium leading-4">{category.name}</div>
                          <div className="text-xs text-[#adadb8]">{category.subCategories.length} subcategories</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[#adadb8] text-xs font-semibold">
                          {selectedCategory === category.name ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Subcategories */}
                    {selectedCategory === category.name && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {category.subCategories.map((subCategory) => (
                          <li key={subCategory} className="flex items-center justify-between group hover:bg-[#27272e] rounded px-2 py-1 cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-[#18181b] rounded-md flex items-center justify-center overflow-hidden">
                                <span className="text-white font-bold text-xs">{subCategory[0]}</span>
                              </div>
                              <div>
                                <div className="text-white text-xs font-medium leading-4">{subCategory}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaCircle className="text-red-600 text-[6px]" />
                              <span className="text-[#adadb8] text-xs font-semibold">0</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button className="text-[#9147FF] text-xs mt-2 hover:underline">Xem thêm</button>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xs text-[#adadb8] font-bold uppercase mb-2">Top Creators</h2>
            {loading ? (
              <div className="text-[#adadb8] text-xs">Loading...</div>
            ) : (
              <ul className="space-y-2">
                {topUsers.map((user) => (
                  <Link key={user.id} to="/u/$username" params={{ username: user.username }}>
                    <li className="flex items-center justify-between group hover:bg-[#27272e] rounded px-2 py-1 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#18181b] rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-base">{user.username[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium leading-4">{user.fullName}</div>
                          <div className="text-xs text-[#adadb8]">{user.followers.toLocaleString()} followers</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[#adadb8] text-xs font-semibold">#{user.rank}</span>
                      </div>
                    </li>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </aside>
  );
} 