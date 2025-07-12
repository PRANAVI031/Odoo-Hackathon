
import React, { useEffect, useState } from 'react';

import './profilepage.css';

interface UserProfile {
  name: string;
  email: string;
  skillsOffered: string[];
  skillsWanted: string[];
  swapHistory: { with: string; skill: string; date: string }[];
  pendingRequests?: string[];
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h1 className="profile-heading">My Profile</h1>
      
      <div className="profile-card">
        <h2>{user.name}</h2>
        <p>Email: {user.email}</p>

        <div className="skills-section">
          <h3>Skills I Offer</h3>
          <ul>{user.skillsOffered.map((skill, i) => <li key={i}>{skill}</li>)}</ul>

          <h3>Skills I Want to Learn</h3>
          <ul>{user.skillsWanted.map((skill, i) => <li key={i}>{skill}</li>)}</ul>
        </div>

        {user.pendingRequests && (
          <div className="pending-section">
            <h3>Pending Requests</h3>
            <ul>{user.pendingRequests.map((req, i) => <li key={i}>{req}</li>)}</ul>
          </div>
        )}

        <div className="history-section">
          <h3>Swap History</h3>
          {user.swapHistory.length === 0 ? <p>No history yet.</p> :
            <ul>{user.swapHistory.map((item, i) => (
              <li key={i}>
                Exchanged <strong>{item.skill}</strong> with {item.with} on {item.date}
              </li>
            ))}</ul>
          }
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
