import React, { useState } from 'react';
import { User } from '../../contexts/AuthContext';
import { useSwap } from '../../contexts/SwapContext';
import { XIcon } from 'lucide-react';
interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetUser: User;
}
export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser
}) => {
  const {
    createSwapRequest
  } = useSwap();
  const [selectedSkillOffered, setSelectedSkillOffered] = useState('');
  const [selectedSkillRequested, setSelectedSkillRequested] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      providerId: targetUser.id,
      providerName: targetUser.name,
      skillRequested: selectedSkillRequested,
      skillOffered: selectedSkillOffered,
      message
    });
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Request Skill Swap with {targetUser.name}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XIcon size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="skillRequested" className="block text-sm font-medium text-gray-700 mb-1">
                  Skill You Want to Learn
                </label>
                <select id="skillRequested" value={selectedSkillRequested} onChange={e => setSelectedSkillRequested(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select a skill</option>
                  {targetUser.skillsOffered.map((skill, index) => <option key={index} value={skill}>
                      {skill}
                    </option>)}
                </select>
              </div>
              <div>
                <label htmlFor="skillOffered" className="block text-sm font-medium text-gray-700 mb-1">
                  Skill You'll Offer in Return
                </label>
                <select id="skillOffered" value={selectedSkillOffered} onChange={e => setSelectedSkillOffered(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select a skill</option>
                  {currentUser.skillsOffered.map((skill, index) => <option key={index} value={skill}>
                      {skill}
                    </option>)}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell them a bit more about what you're looking to learn and teach..."></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !selectedSkillOffered || !selectedSkillRequested} className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>;
};