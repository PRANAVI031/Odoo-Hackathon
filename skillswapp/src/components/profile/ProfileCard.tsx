import React from 'react';
import { User } from '../../contexts/AuthContext';
import { MapPinIcon, StarIcon, UserIcon, CalendarIcon } from 'lucide-react';
interface ProfileCardProps {
  user: User;
  isCurrentUser?: boolean;
  onRequestSwap?: () => void;
}
export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  isCurrentUser = false,
  onRequestSwap
}) => {
  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24"></div>
      <div className="px-6 pt-0 pb-6">
        <div className="flex justify-center -mt-12 mb-3">
          {user.photoUrl ? <img src={user.photoUrl} alt={user.name} className="h-24 w-24 rounded-full border-4 border-white bg-white" /> : <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white">
              <UserIcon size={40} className="text-blue-500" />
            </div>}
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          {user.location && <div className="flex items-center justify-center mt-1 text-gray-500">
              <MapPinIcon size={16} className="mr-1" />
              <span>{user.location}</span>
            </div>}
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center">
              <StarIcon size={18} className="text-yellow-500 mr-1" />
              <span className="font-medium">
                {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">Skills Offered</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered.length > 0 ? user.skillsOffered.map((skill, index) => <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {skill}
                </span>) : <span className="text-gray-500 text-sm">No skills listed</span>}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Skills Wanted</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted.length > 0 ? user.skillsWanted.map((skill, index) => <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {skill}
                </span>) : <span className="text-gray-500 text-sm">No skills listed</span>}
          </div>
        </div>
        {user.availability && user.availability.length > 0 && <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
            <div className="flex items-center text-gray-600">
              <CalendarIcon size={16} className="mr-2" />
              <span>{user.availability.join(', ')}</span>
            </div>
          </div>}
        {!isCurrentUser && onRequestSwap && <div className="mt-6">
            <button onClick={onRequestSwap} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Request Skill Swap
            </button>
          </div>}
        {isCurrentUser && <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Profile Visibility
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {user.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>}
      </div>
    </div>;
};