import { Link } from 'react-router-dom'
import {ArrowRight, CheckCircle2, Clock3, FileWarning, MapPin, Menu, ShieldCheck, Smartphone, Users, X,} from 'lucide-react'
import { useState } from 'react'
import '../styles/home.css'

function HomePage() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <main className="home-page">
            <nav className="navbar">
                <Link to="/" className="brand">
                    <div className="brand-logo">
                        SC
                    </div>

                    <span>Smart Civic</span>
                </Link>

                <div className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
                    <a href="#how-it-works">How it works</a>
                    <a href="#features">Features</a>

                    <Link to="/login" className="nav-login">
                        Sign in
                    </Link>

                    <Link to="/register" className="nav-register">
                        Get started
                    </Link>
                </div>

                <button
                    type="button"
                    className="menu-button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <CheckCircle2 size={16} />
                        Making civic reporting simpler
                    </div>

                    <h1>
                        Report problems.
                        <span> Improve your city.</span>
                    </h1>

                    <p>
                        Smart Civic makes it easier to report local issues,
                        track their progress, and help create better communities.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="primary-button">
                            Get started
                            <ArrowRight size={18} />
                        </Link>

                        <Link to="/login" className="secondary-button">
                            Sign in
                        </Link>
                    </div>

                    <div className="hero-trust">
                        <div>
                            <MapPin size={18} />
                            <span>Location-based reporting</span>
                        </div>

                        <div>
                            <ShieldCheck size={18} />
                            <span>Transparent issue tracking</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="city-card">
                        <div className="city-card-header">
                            <div>
                                <span className="live-indicator"></span>
                                Live civic issues
                            </div>

                            <span className="city-status">
                Active
              </span>
                        </div>

                        <div className="issue-preview">
                            <div className="issue-icon road">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <h3>Damaged Road</h3>
                                <p>Hazratganj, Lucknow</p>
                            </div>

                            <span className="status-progress">
                In Progress
              </span>
                        </div>

                        <div className="issue-preview">
                            <div className="issue-icon water">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <h3>Water Leakage</h3>
                                <p>Gomti Nagar, Lucknow</p>
                            </div>

                            <span className="status-resolved">
                Resolved
              </span>
                        </div>

                        <div className="issue-preview">
                            <div className="issue-icon light">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <h3>Street Light Issue</h3>
                                <p>Aliganj, Lucknow</p>
                            </div>

                            <span className="status-new">
                Reported
              </span>
                        </div>

                        <div className="city-summary">
                            <div>
                                <strong>24</strong>
                                <span>Reported</span>
                            </div>

                            <div>
                                <strong>12</strong>
                                <span>In Progress</span>
                            </div>

                            <div>
                                <strong>8</strong>
                                <span>Resolved</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="how-it-works" id="how-it-works">
                <div className="section-heading">
                    <span className="section-tag">HOW IT WORKS</span>

                    <h2>
                        From reporting a problem
                        <span> to seeing it resolved.</span>
                    </h2>

                    <p>
                        A simple and transparent process that connects citizens
                        with the people responsible for resolving civic issues.
                    </p>
                </div>

                <div className="steps-grid">
                    <article className="step-card">
                        <div className="step-number">01</div>

                        <div className="step-icon">
                            <MapPin size={24} />
                        </div>

                        <h3>Report an issue</h3>

                        <p>
                            Share the problem, select its category, add a location,
                            and provide the details.
                        </p>
                    </article>

                    <article className="step-card">
                        <div className="step-number">02</div>

                        <div className="step-icon">
                            <ShieldCheck size={24} />
                        </div>

                        <h3>Track progress</h3>

                        <p>
                            Follow status updates as your issue is reviewed,
                            assigned, and processed.
                        </p>
                    </article>

                    <article className="step-card">
                        <div className="step-number">03</div>

                        <div className="step-icon">
                            <CheckCircle2 size={24} />
                        </div>

                        <h3>See it resolved</h3>

                        <p>
                            Get transparency into the resolution process and know
                            when the issue has been completed.
                        </p>
                    </article>
                </div>
            </section>

            <section className="features-section" id="features">
                <div className="features-intro">
                    <span className="section-tag">BUILT FOR BETTER CITIES</span>

                    <h2>
                        Everything you need to
                        <span> report and track issues.</span>
                    </h2>

                    <p>
                        Smart Civic brings reporting, location tracking, issue
                        management, and progress monitoring into one simple system.
                    </p>
                </div>

                <div className="features-grid">
                    <article className="feature-card feature-card-large">
                        <div className="feature-icon">
                            <MapPin size={24} />
                        </div>

                        <h3>Location-based reporting</h3>

                        <p>
                            Pin the exact location of a civic issue so it can be
                            identified and handled more efficiently.
                        </p>

                        <div className="feature-visual map-visual">
                            <div className="map-grid"></div>

                            <div className="map-pin pin-one">
                                <MapPin size={22} />
                            </div>

                            <div className="map-pin pin-two">
                                <MapPin size={18} />
                            </div>

                            <div className="map-pin pin-three">
                                <MapPin size={16} />
                            </div>
                        </div>
                    </article>

                    <article className="feature-card">
                        <div className="feature-icon">
                            <Clock3 size={24} />
                        </div>

                        <h3>Real-time status tracking</h3>

                        <p>
                            Follow your issue from reporting to resolution with
                            clear status updates.
                        </p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-icon">
                            <Users size={24} />
                        </div>

                        <h3>Better coordination</h3>

                        <p>
                            Help administrators and field workers manage issues
                            through a structured workflow.
                        </p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-icon">
                            <FileWarning size={24} />
                        </div>

                        <h3>Transparent reporting</h3>

                        <p>
                            Keep issue information, updates, and progress visible
                            throughout the resolution process.
                        </p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-icon">
                            <Smartphone size={24} />
                        </div>

                        <h3>Simple and accessible</h3>

                        <p>
                            A straightforward experience designed to make civic
                            reporting quick and easy.
                        </p>
                    </article>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    <div>
      <span className="section-tag cta-tag">
        READY TO MAKE A DIFFERENCE?
      </span>

                        <h2>
                            See a problem in your city?
                            <span> Start reporting it.</span>
                        </h2>

                        <p>
                            Join Smart Civic to report local issues, track their
                            progress, and stay informed throughout the resolution process.
                        </p>
                    </div>

                    <div className="cta-actions">
                        <Link to="/register" className="cta-primary">
                            Create free account
                            <ArrowRight size={18} />
                        </Link>

                        <Link to="/login" className="cta-secondary">
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-content">
                    <Link to="/" className="brand footer-brand">
                        <div className="brand-logo">
                            SC
                        </div>

                        <span>Smart Civic</span>
                    </Link>

                    <p>
                        Making civic issue reporting simpler, more transparent,
                        and easier to track.
                    </p>

                    <div className="footer-links">
                        <a href="#how-it-works">How it works</a>
                        <a href="#features">Features</a>
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>

                <div className="footer-bottom">
    <span>
      © 2026 Smart Civic Reporting System
    </span>

                    <span>
      Built for better communities.
    </span>
                </div>
            </footer>

        </main>
    )
}

export default HomePage