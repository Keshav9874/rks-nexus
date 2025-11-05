import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Common/Navbar';
import Footer from '../components/Common/Footer';
import '../styles/programs.css';

export default function Programs() {
  const { isAuthenticated } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Google Form URL - Replace with your actual form URL
  const GOOGLE_FORM_URL = 'https://forms.gle/PKB3M7mEqVHBZGYt7';

  const programs = [
    {
      id: 1,
      title: 'Web Development',
      category: 'Development',
      description: 'Master HTML, CSS, JavaScript, React.js, Node.js and build real-world projects',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['HTML/CSS', 'JavaScript', 'React.js', 'Node.js', 'MongoDB', 'Git'],
      icon: '🌐',
      color: '#3b82f6'
    },
    {
      id: 2,
      title: 'Java Development',
      category: 'Development',
      description: 'Learn Core Java, Advanced Java, Spring Boot and enterprise application development',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['Core Java', 'JDBC', 'Servlets', 'Spring Boot', 'Hibernate', 'MySQL'],
      icon: '☕',
      color: '#f59e0b'
    },
    {
      id: 3,
      title: 'Python Development',
      category: 'Development',
      description: 'Master Python programming, Django/Flask frameworks and automation',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['Python', 'Django', 'Flask', 'REST APIs', 'PostgreSQL', 'Pandas'],
      icon: '🐍',
      color: '#10b981'
    },
    {
      id: 4,
      title: 'Data Science',
      category: 'Analytics',
      description: 'Learn data analysis, machine learning, visualization and real-world applications',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Visualization', 'SQL'],
      icon: '📊',
      color: '#8b5cf6'
    },
    {
      id: 5,
      title: 'Mobile Development',
      category: 'Development',
      description: 'Build Android/iOS apps using React Native and Flutter frameworks',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['React Native', 'Flutter', 'Dart', 'Firebase', 'API Integration', 'Publishing'],
      icon: '📱',
      color: '#ec4899'
    },
    {
      id: 6,
      title: 'UI/UX Design',
      category: 'Design',
      description: 'Master user interface design, user experience principles and design tools',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research'],
      icon: '🎨',
      color: '#ef4444'
    },
    {
      id: 7,
      title: 'Digital Marketing',
      category: 'Marketing',
      description: 'Learn SEO, social media marketing, content strategy and analytics',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['SEO', 'Social Media', 'Content Marketing', 'Google Ads', 'Analytics', 'Email Marketing'],
      icon: '📢',
      color: '#06b6d4'
    },
    {
      id: 8,
      title: 'Cloud Computing',
      category: 'Infrastructure',
      description: 'Master AWS, Azure, DevOps practices and cloud infrastructure management',
      duration: ['1 Month', '2 Months', '3 Months'],
      price: { '1': 199, '2': 299, '3': 399 },
      skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      icon: '☁️',
      color: '#14b8a6'
    }
  ];

  const categories = ['all', 'Development', 'Analytics', 'Design', 'Marketing', 'Infrastructure'];

  const filteredPrograms = programs.filter(program => {
    const categoryMatch = selectedCategory === 'all' || program.category === selectedCategory;
    return categoryMatch;
  });

  return (
    <div className="programs-page">
      <Navbar />

      {/* Hero Section */}
      <section className="programs-hero">
        <div className="container">
          <h1>🚀 Internship Programs</h1>
          <p>Choose from our industry-leading programs and kickstart your career</p>
          <div className="hero-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Students Enrolled</p>
            </div>
            <div className="stat">
              <h3>8+</h3>
              <p>Programs Available</p>
            </div>
            <div className="stat">
              <h3>95%</h3>
              <p>Completion Rate</p>
            </div>
            <div className="stat">
              <h3>100%</h3>
              <p>Certificate Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>✨ What You'll Get</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">📜</div>
              <h3>Industry Certificate</h3>
              <p>Get a verified completion certificate to boost your resume</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💼</div>
              <h3>Real Projects</h3>
              <p>Work on industry-relevant projects and build your portfolio</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👨‍🏫</div>
              <h3>Mentor Support</h3>
              <p>Get guidance from experienced industry professionals</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⏱️</div>
              <h3>Flexible Duration</h3>
              <p>Choose 1-3 months duration based on your schedule</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters">
            <div className="filter-group">
              <label>Category:</label>
              <div className="filter-buttons">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'All Programs' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="programs-grid-section">
        <div className="container">
          <div className="programs-grid">
            {filteredPrograms.map(program => (
              <div key={program.id} className="program-card">
                <div className="program-header" style={{ backgroundColor: `${program.color}15` }}>
                  <div className="program-icon" style={{ fontSize: '48px' }}>
                    {program.icon}
                  </div>
                  <h3>{program.title}</h3>
                  <span className="program-category">{program.category}</span>
                </div>

                <div className="program-body">
                  <p className="program-description">{program.description}</p>

                  <div className="skills-section">
                    <h4>Skills You'll Learn:</h4>
                    <div className="skills-tags">
                      {program.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pricing-section">
                    <h4>Pricing:</h4>
                    <div className="pricing-options">
                      <div className="price-option">
                        <span className="duration">1 Month</span>
                        <span className="price">₹{program.price['1']}</span>
                      </div>
                      <div className="price-option popular">
                        <span className="duration">2 Months</span>
                        <span className="price">₹{program.price['2']}</span>
                        <span className="badge">Popular</span>
                      </div>
                      <div className="price-option">
                        <span className="duration">3 Months</span>
                        <span className="price">₹{program.price['3']}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="enroll-btn" 
                    style={{ backgroundColor: program.color }}
                    onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
                  >
                    Enroll Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>📋 How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Choose Program</h3>
              <p>Select your preferred program and duration</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Register & Pay</h3>
              <p>Fill Google Form and complete payment (₹199-₹399)</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Tasks</h3>
              <p>Receive project tasks via Google Forms</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Submit Work</h3>
              <p>Complete tasks and submit for review</p>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <h3>Get Certificate</h3>
              <p>Receive verified completion certificate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What is the internship duration?</h3>
              <p>You can choose between 1 month (₹199), 2 months (₹299), or 3 months (₹399) based on your availability and learning goals.</p>
            </div>
            <div className="faq-item">
              <h3>Will I get a certificate?</h3>
              <p>Yes! You'll receive a verified completion certificate after successfully completing all assigned tasks.</p>
            </div>
            <div className="faq-item">
              <h3>How are tasks assigned?</h3>
              <p>Tasks are assigned through Google Forms. You'll receive project details, deadlines, and submission links.</p>
            </div>
            <div className="faq-item">
              <h3>Can I change my program?</h3>
              <p>Yes, you can switch programs within the first week by contacting our support team.</p>
            </div>
            <div className="faq-item">
              <h3>Is mentor support available?</h3>
              <p>Yes! Our experienced mentors are available via chat to guide you throughout your internship journey.</p>
            </div>
            <div className="faq-item">
              <h3>What if I miss a deadline?</h3>
              <p>We understand! You can request deadline extensions by contacting your mentor with valid reasons.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
