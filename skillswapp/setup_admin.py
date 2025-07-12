#!/usr/bin/env python3
"""
Utility script to set up admin users in Firebase Authentication.
This script should be run manually to grant admin privileges to specific users.
"""

import firebase_admin
from firebase_admin import credentials, auth
import sys

def setup_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        cred = credentials.Certificate('path/to/your/serviceAccountKey.json')  # Update path
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        sys.exit(1)

def set_admin_claim(email, is_admin=True):
    """Set admin custom claims for a user"""
    try:
        # Get user by email
        user = auth.get_user_by_email(email)
        
        # Set custom claims
        custom_claims = {'admin': is_admin}
        auth.set_custom_user_claims(user.uid, custom_claims)
        
        status = "admin" if is_admin else "regular user"
        print(f"✅ Successfully set {email} as {status}")
        
    except Exception as e:
        print(f"❌ Failed to set admin claim for {email}: {e}")

def remove_admin_claim(email):
    """Remove admin custom claims from a user"""
    set_admin_claim(email, is_admin=False)

def main():
    """Main function"""
    print("🔧 SkillSwap Admin Setup Utility")
    print("=" * 40)
    
    # Initialize Firebase
    setup_firebase()
    
    while True:
        print("\nOptions:")
        print("1. Set user as admin")
        print("2. Remove admin from user")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            email = input("Enter user email: ").strip()
            if email:
                set_admin_claim(email, is_admin=True)
            else:
                print("❌ Email cannot be empty")
                
        elif choice == '2':
            email = input("Enter user email: ").strip()
            if email:
                remove_admin_claim(email)
            else:
                print("❌ Email cannot be empty")
                
        elif choice == '3':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main() 