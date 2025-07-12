import React, { useState } from 'react';
import { SwapRequest } from '../../contexts/SwapContext';
import { useAuth } from '../../contexts/AuthContext';
import { ClockIcon, CheckIcon, XIcon, StarIcon, TrashIcon, ArrowRightIcon } from 'lucide-react';
interface SwapRequestCardProps {
  request: SwapRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onAddFeedback: (id: string, rating: number, comment: string) => void;
}
export const SwapRequestCard: React.FC<SwapRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  onDelete,
  onAddFeedback
}) => {
  const {
    currentUser
  } = useAuth();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRequester = currentUser?.id === request.requesterId;
  const formattedDate = new Date(request.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Pending
          </span>;
      case 'accepted':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Accepted
          </span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Declined
          </span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Completed
          </span>;
      default:
        return null;
    }
  };
  const handleSubmitFeedback = () => {
    setIsSubmitting(true);
    onAddFeedback(request.id, rating, comment);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowFeedbackForm(false);
    }, 500);
  };
  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <h3 className="text-lg font-medium text-gray-900">
                {isRequester ? request.providerName : request.requesterName}
              </h3>
              <div className="ml-2">{getStatusBadge()}</div>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Requested on {formattedDate}
            </p>
          </div>
          {request.status === 'pending' && !isRequester && <div className="flex space-x-2">
              <button onClick={() => onAccept(request.id)} className="bg-green-100 text-green-700 hover:bg-green-200 p-1.5 rounded-full" title="Accept">
                <CheckIcon size={16} />
              </button>
              <button onClick={() => onReject(request.id)} className="bg-red-100 text-red-700 hover:bg-red-200 p-1.5 rounded-full" title="Decline">
                <XIcon size={16} />
              </button>
            </div>}
          {request.status === 'pending' && isRequester && <button onClick={() => onDelete(request.id)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-1.5 rounded-full" title="Cancel Request">
              <TrashIcon size={16} />
            </button>}
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex-1">
              <span className="font-medium">
                {isRequester ? 'You offer:' : 'They offer:'}
              </span>
              <div className="mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {isRequester ? request.skillOffered : request.skillRequested}
                </span>
              </div>
            </div>
            <ArrowRightIcon size={20} className="mx-4 text-gray-400" />
            <div className="flex-1">
              <span className="font-medium">
                {isRequester ? 'You receive:' : 'They receive:'}
              </span>
              <div className="mt-1">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {isRequester ? request.skillRequested : request.skillOffered}
                </span>
              </div>
            </div>
          </div>
        </div>
        {request.message && <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
            <p className="italic">"{request.message}"</p>
          </div>}
        {request.status === 'accepted' && <div className="mt-4">
            <button onClick={() => setShowFeedbackForm(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled={!!request.feedback || showFeedbackForm}>
              {request.feedback ? 'Feedback submitted' : 'Add Feedback'}
            </button>
          </div>}
        {showFeedbackForm && <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Leave Feedback
            </h4>
            <div className="mb-3">
              <div className="flex items-center">
                <p className="text-sm text-gray-600 mr-2">Rating:</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setRating(star)} className={`${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}>
                      <StarIcon size={20} />
                    </button>)}
                </div>
              </div>
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={2} placeholder="Share your experience..."></textarea>
            <div className="mt-3 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowFeedbackForm(false)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleSubmitFeedback} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
                Submit
              </button>
            </div>
          </div>}
      </div>
    </div>;
};