#!/usr/bin/env python3
"""
Test script to verify the SkillSwap backend setup and basic functionality.
"""

import requests
import json
import sys

# Backend URL
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure the server is running on localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_cors():
    """Test CORS configuration"""
    print("🔍 Testing CORS configuration...")
    try:
        response = requests.options(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("✅ CORS preflight request successful")
            return True
        else:
            print(f"❌ CORS preflight failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False

def test_unauthorized_access():
    """Test that protected endpoints require authentication"""
    print("🔍 Testing unauthorized access to protected endpoints...")
    
    protected_endpoints = [
        "/api/users/profile",
        "/api/swaps",
        "/api/admin/users"
    ]
    
    for endpoint in protected_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 401:
                print(f"✅ {endpoint} properly requires authentication")
            else:
                print(f"❌ {endpoint} should require authentication but returned {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing {endpoint}: {e}")

def test_browse_users():
    """Test the browse users endpoint (should be public)"""
    print("🔍 Testing browse users endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/users/browse")
        if response.status_code == 200:
            print("✅ Browse users endpoint accessible")
            users = response.json()
            print(f"   Found {len(users)} users")
            return True
        else:
            print(f"❌ Browse users failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Browse users error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 SkillSwap Backend Test Suite")
    print("=" * 40)
    
    # Test basic connectivity
    if not test_health_check():
        print("\n❌ Backend is not running or not accessible")
        print("Please start the backend with: python app.py")
        sys.exit(1)
    
    # Test CORS
    test_cors()
    
    # Test public endpoints
    test_browse_users()
    
    # Test authentication requirements
    test_unauthorized_access()
    
    print("\n" + "=" * 40)
    print("✅ Basic backend tests completed!")
    print("\nNext steps:")
    print("1. Set up Firebase configuration")
    print("2. Configure OpenAI API key")
    print("3. Test with actual authentication")
    print("4. Integrate with the React frontend")

if __name__ == "__main__":
    main() 