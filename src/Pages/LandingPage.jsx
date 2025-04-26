import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./LandingPage.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateLogin = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="logo" onClick={() => (window.location.href = "/")}>
              <span>SkillSphere</span>
            </div>

            {/* Desktop Navigation */}
            <div className="desktop-nav">
              <a href="/" className="nav-link">
                Home
              </a>
              <a href="#features" className="nav-link">
                Features
              </a>
              <a href="#about" className="nav-link">
                About
              </a>
              <a
                href="/login"
                className="nav-link"
                onClick={handleNavigateLogin}
              >
                Login
              </a>
              <button className="primary-button" onClick={handleNavigateLogin}>
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="mobile-menu-toggle">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="menu-button"
              >
                <svg
                  className="menu-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <a href="/" className="mobile-nav-link">
                Home
              </a>
              <a href="#features" className="mobile-nav-link">
                Features
              </a>
              <a href="#about" className="mobile-nav-link">
                About
              </a>
              <a
                href="/login"
                className="mobile-nav-link"
                onClick={handleNavigateLogin}
              >
                Login
              </a>
              <button
                className="mobile-primary-button"
                onClick={handleNavigateLogin}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span>Share & Learn Skills with</span>
              <span className="highlight">SkillSphere</span>
            </h1>
            <p className="hero-description">
              Connect with a vibrant community to share skills like coding,
              cooking, photography, and more. Create learning plans, track
              progress, and engage with others through likes, comments, and
              follows.
            </p>
            <div className="hero-buttons">
              <a
                href="/login"
                className="primary-button hero-button"
                onClick={handleNavigateLogin}
              >
                Get Started
              </a>
              <a href="#about" className="secondary-button hero-button">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Why Choose SkillSphere?</h2>
            <p className="features-description">
              Discover powerful features to enhance your skill-sharing and
              learning journey.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1: Skill Sharing Posts */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="feature-title">Skill Sharing Posts</h3>
              <p className="feature-description">
                Share up to 3 photos or 30-second videos of your skills with
                descriptive posts to inspire others.
              </p>
            </div>

            {/* Feature 2: Learning Plans & Progress */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="feature-title">Learning Plans & Progress</h3>
              <p className="feature-description">
                Create structured learning plans and track your progress with
                easy-to-use templates.
              </p>
            </div>

            {/* Feature 3: Interactivity */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="feature-title">Engage & Connect</h3>
              <p className="feature-description">
                Like, comment, and follow others to build a community around
                your shared interests.
              </p>
            </div>

            {/* Feature 4: User Profiles */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="feature-title">User Profiles</h3>
              <p className="feature-description">
                Showcase your skills, posts, and learning journey on a public
                profile page.
              </p>
            </div>

            {/* Feature 5: Notifications */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="feature-title">Stay Notified</h3>
              <p className="feature-description">
                Get real-time notifications for likes, comments, and follows on
                your posts.
              </p>
            </div>

            {/* Feature 6: Secure Authentication */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2c0 .738.402 1.378 1 1.723V15a1 1 0 001 1h1a1 1 0 001-1v-2.277c.598-.345 1-.985 1-1.723zm9-3v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5h8a5 5 0 015 5z"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="feature-title">Secure Login</h3>
              <p className="feature-description">
                Log in securely using your social media accounts with OAuth 2.0
                authentication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="about-section">
        <div className="about-container">
          <div className="about-header">
            <h2 className="about-title">About SkillSphere</h2>
            <p className="about-description">
              SkillSphere is your go-to platform for learning and sharing skills
              in a supportive community.
            </p>
          </div>
          <div className="about-content">
            <p>
              Whether you're passionate about coding, cooking, photography, or
              DIY crafts, SkillSphere empowers you to share your expertise and
              learn from others. Create structured learning plans, track your
              progress, and engage with a vibrant community through likes,
              comments, and follows. Join us today and start your skill-sharing
              journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
