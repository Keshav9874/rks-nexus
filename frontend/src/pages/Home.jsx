import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Common/Navbar';
import Footer from '../components/Common/Footer';
import AuthModal from '../components/Auth/AuthModal';
import { Toaster } from 'react-hot-toast';
import '../styles/home.css';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ users: 0, applications: 0, placements: 0, certificates: 0 });
  const [typedText, setTypedText] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const fullText = "Transform Your Career Journey";
  
  // Auth and navigation
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Google Form URL - Replace with your actual form URL
  const GOOGLE_FORM_URL = 'https://forms.gle/PKB3M7mEqVHBZGYt7';

  // Typing effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Stats animation
  useEffect(() => {
    animateStats();
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    const targets = { users: 500, applications: 1200, placements: 350, certificates: 280 };
    const duration = 2000;
    const steps = 50;
    const stepDuration = duration / steps;

    Object.keys(targets).forEach(key => {
      let current = 0;
      const increment = targets[key] / steps;
      const interval = setInterval(() => {
        current += increment;
        if (current >= targets[key]) {
          current = targets[key];
          clearInterval(interval);
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, stepDuration);
    });
  };

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Web Developer",
      company: "TCS",
      image: "👨‍💻",
      text: "RKS Nexus helped me land my dream job! The mentorship and real projects made all the difference."
    },
    {
      name: "Priya Singh",
      role: "Java Developer",
      company: "Infosys",
      image: "👩‍💻",
      text: "Amazing experience! The structured program and industry exposure prepared me perfectly for my career."
    },
    {
      name: "Amit Patel",
      role: "Python Developer",
      company: "Wipro",
      image: "👨‍💼",
      text: "Best decision I made! Got hands-on experience with real-world projects and excellent placement support."
    }
  ];

  const faqs = [
    {
      question: "How long are the internship programs?",
      answer: "Our programs range from 12-14 weeks, depending on the chosen track. Each includes hands-on projects and mentorship."
    },
    {
      question: "Do I need prior experience?",
      answer: "No! Our programs are designed for beginners to intermediate learners. We start from basics and build up gradually."
    },
    {
      question: "Will I get a certificate?",
      answer: "Yes! Upon successful completion, you'll receive an industry-recognized certificate and project portfolio."
    },
    {
      question: "Is placement assistance provided?",
      answer: "Absolutely! We provide resume building, interview prep, and direct connections with our partner companies."
    },
    {
      question: "What is the fee structure?",
      answer: "We offer flexible payment options starting from ₹199/month. Choose from 1, 2, or 3 month internship plans."
    }
  ];

  const timeline = [
    { step: "1", title: "Apply", desc: "Submit your application through our portal" },
    { step: "2", title: "Get Selected", desc: "Receive confirmation within 48 hours" },
    { step: "3", title: "Learn", desc: "Start your training with expert mentors" },
    { step: "4", title: "Build", desc: "Work on real-world industry projects" },
    { step: "5", title: "Get Hired", desc: "Land your dream job with our partners" }
  ];

  return (
    <div className="home-container">
      <Toaster position="top-right" />
      <Navbar />
      
      {/* Particle Background */}
      <div className="particles-bg">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero animate-on-scroll" id="home">
        <div className="hero-badge">🎓 India's Leading Internship Platform</div>
        <h1 className="hero-title">
          Welcome to <span className="gradient-text">RKS Nexus</span>
        </h1>
        <p className="hero-subtitle typing-effect">{typedText}<span className="cursor">|</span></p>
        <p className="hero-description">
          Join thousands of students who have kickstarted their professional journey with 
          industry-leading internship programs, expert mentorship, and guaranteed placement support.
        </p>
        <div className="hero-buttons">
          <button 
            className="cta-button primary" 
            onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
          >
            Enroll Now →
          </button>
          <button className="cta-button secondary" onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}>
            Explore Programs
          </button>
        </div>
        <div className="hero-badges">
          <div className="hero-badge-item">
            <span className="badge-icon">⭐</span>
            <span>4.9/5 Rating</span>
          </div>
          <div className="hero-badge-item">
            <span className="badge-icon">🏆</span>
            <span>Award Winning</span>
          </div>
          <div className="hero-badge-item">
            <span className="badge-icon">🎯</span>
            <span>95% Success Rate</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section animate-on-scroll">
        <div className="stat-item">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.users}+</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{stats.applications}+</div>
          <div className="stat-label">Applications Processed</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{stats.placements}+</div>
          <div className="stat-label">Successful Placements</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🎓</div>
          <div className="stat-number">{stats.certificates}+</div>
          <div className="stat-label">Certificates Issued</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section animate-on-scroll" id="features">
        <h2 className="section-title">Why Choose RKS Nexus?</h2>
        <div className="features-grid">
          {[
            { icon: "🎯", title: "Industry Projects", desc: "Work on real-world projects from top companies and gain practical experience" },
            { icon: "👨‍🏫", title: "Expert Mentorship", desc: "Learn from industry professionals with years of experience" },
            { icon: "📜", title: "Certifications", desc: "Earn recognized certificates to boost your resume" },
            { icon: "💼", title: "Job Opportunities", desc: "Direct placement with 50+ partner companies" },
            { icon: "🚀", title: "Skill Development", desc: "Build in-demand technical and soft skills" },
            { icon: "🤝", title: "Networking", desc: "Connect with peers and industry professionals" }
          ].map((feature, idx) => (
            <div key={idx} className="feature-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="feature-icon-wrapper">
                <div className="feature-icon">{feature.icon}</div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section animate-on-scroll">
        <h2 className="section-title">Your Journey to Success</h2>
        <div className="timeline">
          {timeline.map((item, idx) => (
            <div key={idx} className="timeline-item" style={{ animationDelay: `${idx * 0.2}s` }}>
              <div className="timeline-step">{item.step}</div>
              <div className="timeline-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs-section animate-on-scroll" id="programs">
        <h2 className="section-title">Our Featured Programs</h2>
        <div className="programs-grid">
          {[
            { 
              badge: "Most Popular", 
              title: "Web Development", 
              desc: "Master HTML, CSS, JavaScript, React, Node.js and build full-stack applications",
              features: ["12 weeks intensive", "10+ real projects", "Industry mentorship", "Job placement"],
              color: "#32b8c6"
            },
            { 
              badge: "Trending", 
              title: "Java Development", 
              desc: "Learn Java, Spring Boot, Microservices, and Backend Development",
              features: ["14 weeks comprehensive", "Enterprise projects", "Advanced concepts", "Job placement"],
              color: "#7df9ff"
            },
            { 
              badge: "New Launch", 
              title: "Python Development", 
              desc: "Python, Django, Flask, Data Science, and Machine Learning",
              features: ["12 weeks hands-on", "AI/ML introduction", "Portfolio building", "Job placement"],
              color: "#9333ea"
            }
          ].map((program, idx) => (
            <div key={idx} className="program-card" style={{ '--card-color': program.color }}>
              <div className="program-badge">{program.badge}</div>
              <h3>{program.title}</h3>
              <p>{program.desc}</p>
              
              {/* Pricing Section */}
              <div className="program-pricing">
                <div className="pricing-item">
                  <span className="duration">1 Month</span>
                  <span className="price">₹199</span>
                </div>
                <div className="pricing-item popular">
                  <span className="popular-tag">Popular</span>
                  <span className="duration">2 Months</span>
                  <span className="price">₹299</span>
                </div>
                <div className="pricing-item">
                  <span className="duration">3 Months</span>
                  <span className="price">₹399</span>
                </div>
              </div>

              <ul className="program-features">
                {program.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              <button 
                className="program-btn" 
                onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
              >
                Enroll Now →
              </button>
            </div>
          ))}
        </div>

        {/* Explore More Section */}
        <div className="explore-more-section">
          <button 
            className="explore-more-btn"
            onClick={() => navigate('/programs')}
          >
            Explore All Programs →
          </button>
          <p className="explore-text">
            Discover more specialized programs in Development, Design, Analytics & Cloud
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section animate-on-scroll">
        <h2 className="section-title">Success Stories</h2>
        <div className="testimonials-carousel">
          <div className="testimonial-card">
            <div className="testimonial-image">{testimonials[currentTestimonial].image}</div>
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            <h4 className="testimonial-name">{testimonials[currentTestimonial].name}</h4>
            <p className="testimonial-role">
              {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
            </p>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, idx) => (
              <span 
                key={idx} 
                className={`dot ${idx === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(idx)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section animate-on-scroll">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-container">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <span>{faq.question}</span>
                <span className={`faq-icon ${activeFaq === idx ? 'active' : ''}`}>▼</span>
              </div>
              <div className={`faq-answer ${activeFaq === idx ? 'active' : ''}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of students who transformed their careers with RKS Nexus</p>
        <button 
          className="cta-button large" 
          onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
        >
          Enroll Now →
        </button>
      </section>

      <Footer />
      <AuthModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
}
