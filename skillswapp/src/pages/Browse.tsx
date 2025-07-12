import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileCard } from '../components/profile/ProfileCard';
import { User } from '../contexts/AuthContext';
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import { SwapRequestModal } from '../components/swaps/SwapRequestModal';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export const Browse = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users from backend
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSkillFilter) params.append('skill', selectedSkillFilter);
      
      const response = await fetch(`${API_BASE_URL}/users/browse?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await response.json();
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedSkillFilter]);

  // Get all unique skills for filtering
  const allSkills = Array.from(new Set(users.flatMap(user => user.skillsOffered))).sort();

  const handleRequestSwap = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Browse Skills</h1>
        <p className="text-gray-600 mb-6">
          Find users with the skills you want to learn and request a skill swap.
        </p>
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search by name or skill..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div className="sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select 
                value={selectedSkillFilter || ''} 
                onChange={e => setSelectedSkillFilter(e.target.value || null)} 
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Filter by skill</option>
                {allSkills.map((skill, index) => (
                  <option key={index} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedSkillFilter && (
            <button 
              onClick={() => setSelectedSkillFilter(null)} 
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Clear filter
            </button>
          )}
        </div>
      </div>

      {!currentUser && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please log in to request skill swaps with other users.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <ProfileCard 
              key={user.id} 
              user={user} 
              onRequestSwap={currentUser ? () => handleRequestSwap(user) : undefined} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {searchQuery || selectedSkillFilter 
              ? 'No users found matching your search criteria.' 
              : 'No users available at the moment.'
            }
          </p>
        </div>
      )}

      {isModalOpen && selectedUser && currentUser && (
        <SwapRequestModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          currentUser={currentUser} 
          targetUser={selectedUser} 
        />
      )}
    </div>
  );
};