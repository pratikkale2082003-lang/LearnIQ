import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Home.css";

function Home() {
  return (
    <div className="learniq-home">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-dark learniq-navbar">
        <div className="container">

          <Link to="/" className="navbar-brand learniq-logo">
            <span className="logo-icon">🎓</span>
            <span>
              <strong>Learni<span>iQ</span></strong>
              <small>Learn • Practice • Grow</small>
            </span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#learniqNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="learniqNav"
          >
            <ul className="navbar-nav mx-auto nav-menu">
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/tests">
                  Tests
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/schedule">
                  Schedule
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/results">
                  Results
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  About
                </Link>
              </li>
            </ul>

            <div className="nav-buttons">
              <Link to="/login" className="login-btn">
                Login
              </Link>

              <Link to="/register" className="register-btn">
                Register
              </Link>
            </div>
          </div>

        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="hero-section">

        {/* Background effects */}
        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>
        <div className="hero-dots"></div>

        <div className="container hero-container">

          <div className="row align-items-center">

            {/* LEFT CONTENT */}
            <div className="col-lg-6 hero-content">

              <div className="success-badge">
                🚀 <span>Your Success Starts Here</span>
              </div>

              <h1>
                Learni<span>Q</span>
                <br />

                <strong>
                  Online Aptitude Test
                </strong>
              </h1>

              <h2>
                Practice. Schedule. Evaluate.
              </h2>

              <p>
                Sharpen your skills with our online aptitude tests.
                Take practice tests, join scheduled exams and get
                instant results with detailed analysis.
              </p>

              <div className="hero-buttons">

                <Link to="/login" className="primary-btn">
                  <span>▶</span>
                  Start Practice
                  <b>→</b>
                </Link>

                <Link to="/tests" className="secondary-btn">
                  Explore Tests
                </Link>

              </div>

              <div className="hero-mini-info">
                <div>
                  <span>✓</span>
                  Free Practice
                </div>

                <div>
                  <span>✓</span>
                  Instant Results
                </div>

                <div>
                  <span>✓</span>
                  Track Progress
                </div>
              </div>

            </div>


            {/* RIGHT ILLUSTRATION */}
            <div className="col-lg-6 hero-image-area">

              <div className="floating-card question-card">
                <div className="question-header">
                  <span>☑</span>
                  Aptitude Question
                </div>

                <div className="question-line"></div>
                <div className="question-line short"></div>

                <div className="answer">
                  <span>✓</span> A
                </div>

                <div className="answer">
                  <span>○</span> B
                </div>

                <div className="answer">
                  <span>○</span> C
                </div>
              </div>

              <div className="floating-card chart-card">
                <div className="chart-icon">📈</div>

                <div>
                  <strong>Performance</strong>
                  <small>+24% this week</small>
                </div>
              </div>

              <div className="student-circle">
                <div className="student">
                  👨🏻‍💻
                </div>
              </div>

              <div className="laptop">
                <div className="laptop-screen">
                  <span>🎓</span>
                  <strong>LearniQ</strong>
                </div>
                <div className="laptop-base"></div>
              </div>

              <div className="books">
                📚
              </div>

              <div className="plant">
                🌿
              </div>

              <div className="floating-text">
                Better Skills
                <br />
                Bigger Dreams
              </div>

            </div>

          </div>
        </div>


        {/* Wave */}
        <div className="hero-wave"></div>

      </section>


      {/* ================= STATS ================= */}
      <section className="stats-section">

        <div className="container">

          <div className="stats-container">

            <div className="stat-item">
              <div className="stat-icon purple">☷</div>

              <div>
                <h3>100+</h3>
                <p>Tests Available</p>
              </div>
            </div>


            <div className="stat-item">
              <div className="stat-icon blue">?</div>

              <div>
                <h3>5000+</h3>
                <p>Practice Questions</p>
              </div>
            </div>


            <div className="stat-item">
              <div className="stat-icon orange">👥</div>

              <div>
                <h3>1000+</h3>
                <p>Happy Students</p>
              </div>
            </div>


            <div className="stat-item">
              <div className="stat-icon pink">◷</div>

              <div>
                <h3>24/7</h3>
                <p>Access Anytime</p>
              </div>
            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="features-section">

        <div className="container">

          <div className="section-heading">

            <span>
              WHY CHOOSE LEARNIQ?
            </span>

            <h2>
              Everything You Need to Succeed
            </h2>

            <p>
              A complete platform for your aptitude test
              preparation and growth.
            </p>

          </div>


          <div className="row g-4">

            {/* CARD 1 */}
            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon purple-icon">
                  📄
                </div>

                <h4>
                  Practice Tests
                </h4>

                <p>
                  Practice with a variety of questions
                  and boost your confidence.
                </p>

                <span className="feature-arrow">
                  →
                </span>

              </div>

            </div>


            {/* CARD 2 */}
            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon blue-icon">
                  📅
                </div>

                <h4>
                  Scheduled Exams
                </h4>

                <p>
                  Join tests as per your schedule
                  and stay on track with your goals.
                </p>

                <span className="feature-arrow">
                  →
                </span>

              </div>

            </div>


            {/* CARD 3 */}
            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon green-icon">
                  📊
                </div>

                <h4>
                  Instant Results
                </h4>

                <p>
                  Get your scores and performance
                  analysis instantly.
                </p>

                <span className="feature-arrow">
                  →
                </span>

              </div>

            </div>


            {/* CARD 4 */}
            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon orange-icon">
                  🎯
                </div>

                <h4>
                  Track Progress
                </h4>

                <p>
                  Monitor your performance and identify
                  areas of improvement.
                </p>

                <span className="feature-arrow">
                  →
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="cta-section">

        <div className="container">

          <div className="cta-box">

            <div className="rocket">
              🚀
            </div>

            <div className="cta-content">

              <h3>
                Ready to Start Your Journey?
              </h3>

              <p>
                Create your account and take the first
                step towards your success.
              </p>

            </div>

            <Link
              to="/register"
              className="cta-btn"
            >
              Get Started
              <span>→</span>
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="container footer-content">

          <div className="footer-logo">
            🎓
            <strong>
              Learni<span>Q</span>
            </strong>

            <small>
              Learn • Practice • Grow
            </small>
          </div>

          <div className="footer-links">

            <Link to="/">Home</Link>
            <Link to="/tests">Tests</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/results">Results</Link>
            <Link to="/about">About</Link>

          </div>

          <div className="social-links">
            f &nbsp; 𝕏 &nbsp; in &nbsp; ▶
          </div>

          <div className="copyright">
            © 2026 LearniQ. All Rights Reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;