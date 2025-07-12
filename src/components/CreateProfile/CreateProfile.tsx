import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateProfile.css';


const CreateProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillsOffered: '',
    skillsWanted: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem('userProfile', JSON.stringify({
      ...formData,
      skillsOffered: formData.skillsOffered.split(','),
      skillsWanted: formData.skillsWanted.split(','),
      swapHistory: [],
      pendingRequests: ['Request from Sarah', 'Request from John']
    }));

    navigate('/profile');
  };

  return (
    <div className="create-profile-container">
      <h2 className="create-profile-title">Create Your Profile</h2>
      <form onSubmit={handleSubmit} className="create-profile-form">
        <input
          name="name"
          onChange={handleChange}
          value={formData.name}
          placeholder="Name"
          required
        />
        <input
          name="email"
          onChange={handleChange}
          value={formData.email}
          placeholder="Email"
          required
        />
        <textarea
          name="skillsOffered"
          onChange={handleChange}
          value={formData.skillsOffered}
          placeholder="Skills Offered (comma separated)"
        />
        <textarea
          name="skillsWanted"
          onChange={handleChange}
          value={formData.skillsWanted}
          placeholder="Skills Wanted (comma separated)"
        />
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default CreateProfile;
