import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileCard } from '../components/profile/ProfileCard';
import { PlusIcon, XIcon, SaveIcon } from 'lucide-react';
export const Profile = () => {
  const {
    currentUser,
    updateProfile
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');
  const [isPublic, setIsPublic] = useState(currentUser?.isPublic || false);
  const [skillOffered, setSkillOffered] = useState('');
  const [skillsOffered, setSkillsOffered] = useState(currentUser?.skillsOffered || []);
  const [skillWanted, setSkillWanted] = useState('');
  const [skillsWanted, setSkillsWanted] = useState(currentUser?.skillsWanted || []);
  const [availability, setAvailability] = useState<string[]>(currentUser?.availability || []);
  const availabilityOptions = ['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings'];
  const handleAddSkillOffered = () => {
    if (skillOffered.trim() && !skillsOffered.includes(skillOffered.trim())) {
      setSkillsOffered([...skillsOffered, skillOffered.trim()]);
      setSkillOffered('');
    }
  };
  const handleRemoveSkillOffered = (skill: string) => {
    setSkillsOffered(skillsOffered.filter(s => s !== skill));
  };
  const handleAddSkillWanted = () => {
    if (skillWanted.trim() && !skillsWanted.includes(skillWanted.trim())) {
      setSkillsWanted([...skillsWanted, skillWanted.trim()]);
      setSkillWanted('');
    }
  };
  const handleRemoveSkillWanted = (skill: string) => {
    setSkillsWanted(skillsWanted.filter(s => s !== skill));
  };
  const handleAvailabilityChange = (option: string) => {
    if (availability.includes(option)) {
      setAvailability(availability.filter(a => a !== option));
    } else {
      setAvailability([...availability, option]);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await updateProfile({
        name,
        location,
        photoUrl,
        isPublic,
        skillsOffered,
        skillsWanted,
        availability
      });
      setIsEditing(false);
    }
  };
  if (!currentUser) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your profile
          </h2>
        </div>
      </div>;
  }
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:space-x-8">
        <div className="md:w-1/3 mb-8 md:mb-0">
          <ProfileCard user={currentUser} isCurrentUser={true} />
          {!isEditing && <div className="mt-4">
              <button onClick={() => setIsEditing(true)} className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                Edit Profile
              </button>
            </div>}
        </div>
        <div className="md:w-2/3">
          {isEditing ? <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Edit Your Profile
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location (Optional)
                    </label>
                    <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City, Country" />
                  </div>
                  <div>
                    <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo URL (Optional)
                    </label>
                    <input type="url" id="photoUrl" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/photo.jpg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills You Offer
                    </label>
                    <div className="flex mb-2">
                      <input type="text" value={skillOffered} onChange={e => setSkillOffered(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a skill you can teach" />
                      <button type="button" onClick={handleAddSkillOffered} className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700">
                        <PlusIcon size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillsOffered.map((skill, index) => <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkillOffered(skill)} className="ml-1 text-blue-800 hover:text-blue-900">
                            <XIcon size={14} />
                          </button>
                        </span>)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills You Want to Learn
                    </label>
                    <div className="flex mb-2">
                      <input type="text" value={skillWanted} onChange={e => setSkillWanted(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a skill you want to learn" />
                      <button type="button" onClick={handleAddSkillWanted} className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700">
                        <PlusIcon size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillsWanted.map((skill, index) => <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkillWanted(skill)} className="ml-1 text-gray-600 hover:text-gray-900">
                            <XIcon size={14} />
                          </button>
                        </span>)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availabilityOptions.map(option => <div key={option} className="flex items-center">
                          <input type="checkbox" id={option.replace(/\s+/g, '-').toLowerCase()} checked={availability.includes(option)} onChange={() => handleAvailabilityChange(option)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <label htmlFor={option.replace(/\s+/g, '-').toLowerCase()} className="ml-2 block text-sm text-gray-700">
                            {option}
                          </label>
                        </div>)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                      Make my profile public (visible to other users)
                    </label>
                  </div>
                  <div className="flex space-x-4">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center">
                      <SaveIcon size={18} className="mr-1" />
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div> : <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Your Skill Swap Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700">0</div>
                  <div className="text-sm text-blue-600">Completed Swaps</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700">0</div>
                  <div className="text-sm text-green-600">Pending Requests</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700">
                    {currentUser.rating > 0 ? currentUser.rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-purple-600">Average Rating</div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No recent activity to display.
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};