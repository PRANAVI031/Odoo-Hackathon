import React from 'react';
import './profilepage.css';

const dummyUser = {
  name: 'Divanshu Gokharu',
  email: 'divanshu@example.com',
  skillsOffered: ['React', 'Photography', 'Public Speaking'],
  skillsWanted: ['UI/UX', 'Marketing', 'Python'],
  swapHistory: [
    { with: 'Sarah J.', skill: 'React', date: '2025-06-10' },
    { with: 'Ravi K.', skill: 'Photography', date: '2025-05-22' }
  ]
};

const Profile: React.FC = () => {
  return (
    <div className="profile-container">
      <h1 className="profile-heading">My Profile</h1>
      
      <div className="profile-card">
        <h2>{dummyUser.name}</h2>
        <p>Email: {dummyUser.email}</p>

        <div className="skills-section">
          <h3>Skills I Offer</h3>
          <ul>
            {dummyUser.skillsOffered.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>

          <h3>Skills I Want to Learn</h3>
          <ul>
            {dummyUser.skillsWanted.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </div>

        <div className="history-section">
          <h3>Swap History</h3>
          <ul>
            {dummyUser.swapHistory.map((item, i) => (
              <li key={i}>
                Exchanged <strong>{item.skill}</strong> with {item.with} on {item.date}
              </li>
            ))}
          </ul>
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
