import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSwap } from '../contexts/SwapContext';
import { UserIcon, MessageSquareIcon, AlertTriangleIcon, DownloadIcon, UsersIcon, RefreshCwIcon, BarChart2Icon, BellIcon } from 'lucide-react';
export const Admin = () => {
  const {
    currentUser
  } = useAuth();
  const {
    swapRequests
  } = useSwap();
  const [activeTab, setActiveTab] = useState<'users' | 'swaps' | 'reports' | 'messages'>('users');
  const [systemMessage, setSystemMessage] = useState('');
  if (!currentUser?.isAdmin) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You do not have permission to access the admin dashboard.
                  Please log in with an admin account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  const mockUsers = [{
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active',
    joined: 'May 12, 2023',
    swapsCompleted: 3
  }, {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    joined: 'Jun 5, 2023',
    swapsCompleted: 2
  }, {
    id: '4',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    status: 'active',
    joined: 'Jul 18, 2023',
    swapsCompleted: 1
  }, {
    id: '5',
    name: 'Michael Chen',
    email: 'michael@example.com',
    status: 'flagged',
    joined: 'Aug 3, 2023',
    swapsCompleted: 0
  }];
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending a message
    setTimeout(() => {
      setSystemMessage('');
      alert('System message sent to all users!');
    }, 500);
  };
  const handleDownloadReport = (reportType: string) => {
    alert(`Downloading ${reportType} report...`);
  };
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Sidebar */}
        <div className="md:w-64 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h2>
            <nav className="space-y-1">
              <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <UsersIcon className="mr-3 h-5 w-5" />
                User Management
              </button>
              <button onClick={() => setActiveTab('swaps')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'swaps' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <RefreshCwIcon className="mr-3 h-5 w-5" />
                Swap Monitoring
              </button>
              <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <BarChart2Icon className="mr-3 h-5 w-5" />
                Reports & Analytics
              </button>
              <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'messages' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <BellIcon className="mr-3 h-5 w-5" />
                System Messages
              </button>
            </nav>
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'users' && <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  User Management
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Swaps
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockUsers.map(user => <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                                <UserIcon className="h-6 w-6 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.joined}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.swapsCompleted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              View
                            </button>
                            {user.status === 'flagged' ? <button className="text-green-600 hover:text-green-900 mr-3">
                                Approve
                              </button> : <button className="text-yellow-600 hover:text-yellow-900 mr-3">
                                Flag
                              </button>}
                            <button className="text-red-600 hover:text-red-900">
                              Ban
                            </button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>}
            {activeTab === 'swaps' && <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Swap Monitoring
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-700">
                      {swapRequests.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-sm text-blue-600">
                      Pending Requests
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700">
                      {swapRequests.filter(r => r.status === 'accepted').length}
                    </div>
                    <div className="text-sm text-green-600">Accepted Swaps</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-700">
                      {swapRequests.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-sm text-purple-600">
                      Completed Swaps
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Users
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skills
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {swapRequests.map(request => <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.requesterName}
                            </div>
                            <div className="text-sm text-gray-500">
                              with {request.providerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.skillOffered}
                            </div>
                            <div className="text-sm text-gray-500">
                              for {request.skillRequested}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'accepted' ? 'bg-green-100 text-green-800' : request.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              View
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>}
            {activeTab === 'reports' && <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Reports & Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Download Reports
                    </h3>
                    <div className="space-y-3">
                      <button onClick={() => handleDownloadReport('user-activity')} className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <span>User Activity Report</span>
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDownloadReport('swap-statistics')} className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <span>Swap Statistics Report</span>
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDownloadReport('feedback-summary')} className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <span>Feedback Summary Report</span>
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Platform Statistics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            Total Users
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            5
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{
                        width: '100%'
                      }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            Total Swaps
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            3
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{
                        width: '60%'
                      }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            Avg. Rating
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            4.7
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{
                        width: '94%'
                      }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Most Popular Skills
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Top skills being offered and requested on the platform
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Most Offered
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Programming</span>
                            <span className="font-medium">24%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-green-500 h-2 rounded-full" style={{
                          width: '24%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Graphic Design</span>
                            <span className="font-medium">18%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-green-500 h-2 rounded-full" style={{
                          width: '18%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Language Teaching</span>
                            <span className="font-medium">15%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-green-500 h-2 rounded-full" style={{
                          width: '15%'
                        }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Most Wanted
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Cooking</span>
                            <span className="font-medium">22%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-blue-500 h-2 rounded-full" style={{
                          width: '22%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Photography</span>
                            <span className="font-medium">20%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-blue-500 h-2 rounded-full" style={{
                          width: '20%'
                        }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Web Design</span>
                            <span className="font-medium">14%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-blue-500 h-2 rounded-full" style={{
                          width: '14%'
                        }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}
            {activeTab === 'messages' && <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  System Messages
                </h2>
                <form onSubmit={handleSendMessage}>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Send Platform-wide Message
                    </label>
                    <textarea id="message" rows={4} value={systemMessage} onChange={e => setSystemMessage(e.target.value)} placeholder="Enter a message to send to all users..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={!systemMessage.trim()}>
                      Send Message
                    </button>
                  </div>
                </form>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent System Messages
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Platform Update Notice
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            We're excited to announce new features coming next
                            week, including improved messaging and skill
                            categorization!
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          2 days ago
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Maintenance Alert
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            The platform will be undergoing scheduled
                            maintenance on Saturday from 2-4 AM EST. Some
                            features may be temporarily unavailable.
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          1 week ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};