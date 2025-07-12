import React from 'react';
import { Link } from 'react-router-dom';
export const Footer = () => {
  return <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <span className="text-lg font-bold text-blue-600">SkillSwap</span>
          </div>
          <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <Link to="/browse" className="text-sm text-gray-500 hover:text-gray-900">
              Browse Skills
            </Link>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Privacy
            </a>
          </div>
        </div>
        <div className="mt-4 text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};