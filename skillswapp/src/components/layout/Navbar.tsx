import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MenuIcon, XIcon, UserIcon } from 'lucide-react';
export const Navbar = () => {
  const {
    currentUser,
    logout
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500';
  };
  return <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">SkillSwap</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/') === 'text-blue-600' ? 'border-blue-500' : 'border-transparent'} ${isActive('/')}`}>
                Home
              </Link>
              <Link to="/browse" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/browse') === 'text-blue-600' ? 'border-blue-500' : 'border-transparent'} ${isActive('/browse')}`}>
                Browse Skills
              </Link>
              {currentUser && <>
                  <Link to="/swap-requests" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/swap-requests') === 'text-blue-600' ? 'border-blue-500' : 'border-transparent'} ${isActive('/swap-requests')}`}>
                    Swap Requests
                  </Link>
                  {currentUser.isAdmin && <Link to="/admin" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/admin') === 'text-blue-600' ? 'border-blue-500' : 'border-transparent'} ${isActive('/admin')}`}>
                      Admin
                    </Link>}
                </>}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-500">
                  {currentUser.photoUrl ? <img src={currentUser.photoUrl} alt={currentUser.name} className="h-8 w-8 rounded-full mr-2" /> : <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <UserIcon size={18} className="text-blue-600" />
                    </div>}
                  {currentUser.name}
                </Link>
                <button onClick={logout} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-500">
                  Logout
                </button>
              </div> : <div className="flex space-x-4">
                <Link to="/" onClick={() => {}} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-500">
                  Login
                </Link>
                <Link to="/" onClick={() => {}} className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                  Sign Up
                </Link>
              </div>}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              {isOpen ? <XIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isOpen && <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className={`block pl-3 pr-4 py-2 border-l-4 ${isActive('/') === 'text-blue-600' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} ${isActive('/')} text-base`} onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/browse" className={`block pl-3 pr-4 py-2 border-l-4 ${isActive('/browse') === 'text-blue-600' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} ${isActive('/browse')} text-base`} onClick={() => setIsOpen(false)}>
              Browse Skills
            </Link>
            {currentUser && <>
                <Link to="/swap-requests" className={`block pl-3 pr-4 py-2 border-l-4 ${isActive('/swap-requests') === 'text-blue-600' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} ${isActive('/swap-requests')} text-base`} onClick={() => setIsOpen(false)}>
                  Swap Requests
                </Link>
                {currentUser.isAdmin && <Link to="/admin" className={`block pl-3 pr-4 py-2 border-l-4 ${isActive('/admin') === 'text-blue-600' ? 'border-blue-500 bg-blue-50' : 'border-transparent'} ${isActive('/admin')} text-base`} onClick={() => setIsOpen(false)}>
                    Admin
                  </Link>}
              </>}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {currentUser ? <>
                <div className="flex items-center px-4">
                  {currentUser.photoUrl ? <img src={currentUser.photoUrl} alt={currentUser.name} className="h-10 w-10 rounded-full" /> : <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon size={20} className="text-blue-600" />
                    </div>}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {currentUser.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                    Your Profile
                  </Link>
                  <button onClick={() => {
              logout();
              setIsOpen(false);
            }} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              </> : <div className="mt-3 space-y-1 px-2">
                <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-500 hover:bg-gray-100">
                  Login
                </Link>
                <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-blue-500 hover:text-blue-600 hover:bg-gray-100">
                  Sign Up
                </Link>
              </div>}
          </div>
        </div>}
    </nav>;
};