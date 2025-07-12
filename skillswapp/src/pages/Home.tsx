import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightIcon, CheckIcon, UsersIcon, StarIcon, RefreshCwIcon } from 'lucide-react';

export const Home = () => {
  const {
    currentUser,
    login,
    signup,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLoginForm) {
        await login(email, password);
        navigate('/profile');
      } else {
        await signup(email, password, name);
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  // Demo login function
  const handleDemoLogin = async (userType: 'regular' | 'admin') => {
    try {
      if (userType === 'regular') {
        await login('jane@example.com', 'password');
      } else {
        await login('admin@example.com', 'password');
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to log in with demo account.');
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex md:items-center md:space-x-8">
            <div className="md:w-1/2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Exchange Skills, Grow Together
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Connect with others, share your expertise, and learn new skills
                through direct exchanges. No money needed - just your time and
                knowledge.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => handleDemoLogin('regular')} 
                  className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors" 
                  disabled={isLoading}
                >
                  Try Demo Account
                </button>
                <button 
                  onClick={() => handleDemoLogin('admin')} 
                  className="px-6 py-3 bg-blue-900 text-white rounded-md font-medium hover:bg-blue-800 transition-colors" 
                  disabled={isLoading}
                >
                  Try Admin Demo
                </button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="People collaborating" 
                className="rounded-lg shadow-lg" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How SkillSwap Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create Your Profile
            </h3>
            <p className="text-gray-600">
              List the skills you can offer and the ones you want to learn. Set
              your availability and preferences.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCwIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Request Skill Swaps
            </h3>
            <p className="text-gray-600">
              Browse users with the skills you want to learn and send them swap
              requests with your offer.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <StarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Exchange & Rate
            </h3>
            <p className="text-gray-600">
              Meet online or in person, exchange skills, and provide feedback
              after completing your swap.
            </p>
          </div>
        </div>
      </div>

      {/* Login/Signup Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLoginForm ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="mt-2 text-gray-600">
                {isLoginForm 
                  ? 'Sign in to your account to start swapping skills' 
                  : 'Join our community and start sharing your skills'
                }
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {!isLoginForm && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              
              <div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {isLoginForm ? 'Sign In' : 'Create Account'}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setIsLoginForm(!isLoginForm);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                }} 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isLoginForm ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            {!isLoginForm && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  💡 <strong>Demo Mode:</strong> For testing, you can also use these demo accounts:
                </p>
                <ul className="text-sm text-blue-600 mt-1 ml-4">
                  <li>• jane@example.com (Regular User)</li>
                  <li>• john@example.com (Regular User)</li>
                  <li>• admin@example.com (Admin User)</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};