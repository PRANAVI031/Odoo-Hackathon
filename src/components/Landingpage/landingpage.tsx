import React, { useEffect, useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: '🔁', title: 'Skill Exchange', description: 'Swap your skills with others and learn something new in return without spending a rupee.' },
    { icon: '📋', title: 'List Skills', description: 'Showcase what you can teach and highlight what you want to learn – all in one place.' },
    { icon: '🔗', title: 'Connect Easily', description: 'Browse profiles and connect with learners or mentors who match your goals.' },
    { icon: '💸', title: 'Zero Cost', description: 'No money involved! Trade knowledge directly and grow together with value exchange.' },
    { icon: '🧭', title: 'Personal Roadmap', description: 'Follow a guided learning path tailored to your goals and the skills you want to master.' },
    { icon: '📈', title: 'Track Your Progress', description: 'Monitor your skill development, completed swaps, and growth milestones over time.' }
  ];

  const testimonials = [
    { name: 'Divanshu Gokharu', role: 'Web Developer', image: '👩‍💻', text: 'SkillSwap helped me learn React from an experienced developer while teaching photography. Amazing platform!' },
    { name: 'Pranavi', role: 'Designer', image: '👨‍🎨', text: 'The skill matching is incredible. I found the perfect mentor for UI/UX design within hours.' },
    { name: 'Piyush', role: 'Data Scientist', image: '👩‍🔬', text: 'Teaching Python while learning marketing has been an amazing experience. Highly recommended!' }
  ];

  return (
    <div className="landing-page">
      
      <div className="top-bar">
        <input type="text" placeholder="Search skills or users..." className="search-bar" />
        <span className="accessibility-icon" role="img" aria-label="accessibility"></span>
        <button className="search-button">Search</button>
      </div>

      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-elements">
            <div className="floating-element" style={{ top: '20%', left: '10%' }}>📚</div>
            <div className="floating-element" style={{ top: '60%', left: '80%' }}>🎨</div>
            <div className="floating-element" style={{ top: '40%', left: '20%' }}>💻</div>
            <div className="floating-element" style={{ top: '70%', left: '60%' }}>🎵</div>
          </div>
        </div>

        <div className="container">
          <div className={`hero-content ${isVisible ? 'fade-in' : ''}`}>
            <h1 className="hero-title">
              Swap Skills, <span className="text-gradient"> Grow Together</span>
            </h1>
            <p className="hero-subtitle">
              Connect with skilled individuals to exchange knowledge, learn new abilities, 
              and build meaningful relationships in our thriving community.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-outline" onClick={() => window.open('/profile', '_blank')}>
                View My Profile
              </button>
              <button className="btn btn-outline">
                Explore Skills
              </button>
              <button
                className="btn btn-outline"
                onClick={() => window.open('http://localhost:5000/chatbot', '_blank')}
              >
                💬 ChatBot
              </button>
            </div>

            <section className="connect-section">
              <div className="container">
                <div className="section-header">
                  <h2>Find & Connect with Learners</h2>
                  <p>Send a request to connect and start your skill swap journey</p>
                </div>
                <div className="connect-cards">
                  {[1, 2].map((id) => (
                    <div key={id} className="connect-card">
                      <div className="avatar">👩‍💻</div>
                      <div className="user-info">
                        <h3>ARJUN</h3>
                        <p>UI/UX Designer | Wants to learn React</p>
                        <button className="connect-btn">🔗 Connect</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose SkillSwap?</h2>
            <p>
              The Skill Swap Platform enables users to exchange skills freely, promoting accessible learning and mutual growth.
              It fosters a collaborative community where talents are shared, networks grow, and everyone benefits.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card ${isVisible ? 'slide-in-up' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">
                  <span className="feature-emoji">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in just three simple steps</p>
          </div>
          <div className="steps-container">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="step">
                  <div className="step-number">{step}</div>
                  <div className="step-content">
                    <h3>
                      {step === 1 && 'Create Your Profile'}
                      {step === 2 && 'Find Your Match'}
                      {step === 3 && 'Start Swapping'}
                    </h3>
                    <p>
                      {step === 1 && 'List your skills and what you want to learn. Let others know what you can teach!'}
                      {step === 2 && 'Browse through profiles and connect with people who complement your skills.'}
                      {step === 3 && 'Begin your learning journey through video calls, workshops, or hands-on projects.'}
                    </p>
                  </div>
                </div>
                {step !== 3 && <div className="step-connector"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Real stories from our amazing community</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.image}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Skills?</h2>
            <p>Join thousands of learners and teachers in our vibrant community today!</p>
            <button onClick={() => navigate('/create-profile')} className="btn btn-cta">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      <div className="pagination">
        <button className="page-btn">Previous</button>
        <span className="page-number">1</span>
        <button className="page-btn">Next</button>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SkillSwap</h3>
              <p>Connecting learners and teachers worldwide</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#explore">Explore Skills</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#community">Community</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">📱</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📸</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
