import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSwap, SwapRequest } from '../contexts/SwapContext';
import { SwapRequestCard } from '../components/swaps/SwapRequestCard';
import { InboxIcon } from 'lucide-react';
export const SwapRequests = () => {
  const {
    currentUser
  } = useAuth();
  const {
    swapRequests,
    updateSwapStatus,
    deleteSwapRequest,
    addFeedback
  } = useSwap();
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  if (!currentUser) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your swap requests
          </h2>
        </div>
      </div>;
  }
  const userRequests = swapRequests.filter(req => req.requesterId === currentUser.id || req.providerId === currentUser.id);
  const filteredRequests = userRequests.filter(req => {
    if (activeTab === 'sent') return req.requesterId === currentUser.id;
    if (activeTab === 'received') return req.providerId === currentUser.id;
    return true;
  });
  const handleAccept = (id: string) => {
    updateSwapStatus(id, 'accepted');
  };
  const handleReject = (id: string) => {
    updateSwapStatus(id, 'rejected');
  };
  const handleDelete = (id: string) => {
    deleteSwapRequest(id);
  };
  const handleAddFeedback = (id: string, rating: number, comment: string) => {
    addFeedback(id, rating, comment);
  };
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Swap Requests
      </h1>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('all')} className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            All Requests
          </button>
          <button onClick={() => setActiveTab('sent')} className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'sent' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Sent
          </button>
          <button onClick={() => setActiveTab('received')} className={`pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'received' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Received
          </button>
        </nav>
      </div>
      {filteredRequests.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map(request => <SwapRequestCard key={request.id} request={request} onAccept={handleAccept} onReject={handleReject} onDelete={handleDelete} onAddFeedback={handleAddFeedback} />)}
        </div> : <div className="bg-gray-50 rounded-lg p-8 text-center">
          <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No requests found
          </h3>
          <p className="mt-1 text-gray-500">
            {activeTab === 'all' ? "You don't have any swap requests yet." : activeTab === 'sent' ? "You haven't sent any swap requests yet." : "You haven't received any swap requests yet."}
          </p>
        </div>}
    </div>;
};