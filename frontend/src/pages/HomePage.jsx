import { Link } from 'react-router-dom'
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Bell,
    Camera,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileCheck2,
    FileWarning,
    Image as ImageIcon,
    MapPin,
    Menu,
    Navigation,
    Radar,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import '../styles/home.css'

const civicIssues = [
    {
        title: 'Road Damage',
        description: 'Report potholes, damaged roads and unsafe surfaces.',
        location: 'Road Infrastructure',
        image:
            'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85',
    },
    {
        title: 'Street Light',
        description: 'Help report broken or non-functional street lighting.',
        location: 'Public Lighting',
        image:
            'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85',
    },
    {
        title: 'Water Leakage',
        description: 'Report visible water leaks and related infrastructure issues.',
        location: 'Water & Utilities',
        image:
            'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=85',
    },
    {
        title: 'Waste Management',
        description: 'Report garbage accumulation and illegal dumping.',
        location: 'Cleanliness',
        image:
            'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=85',
    },
    {
        title: 'Drainage Issue',
        description: 'Report blocked or damaged drainage infrastructure.',
        location: 'Drainage',
        image:
            'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1200&q=85',
    },
]

const featureHighlights = [
    {
        icon: MapPin,
        title: 'Location-aware reporting',
        text: 'Pin the exact location of a civic problem so it can be identified more accurately.',
    },
    {
        icon: Radar,
        title: 'Duplicate-aware reporting',
        text: 'Nearby possible duplicate reports can be identified before unnecessary duplication grows.',
    },
    {
        icon: Users,
        title: 'Structured assignment',
        text: 'Issues move through a defined workflow between administration and field workers.',
    },
    {
        icon: Bell,
        title: 'Status notifications',
        text: 'Stay informed when important changes happen to your reported issue.',
    },
    {
        icon: FileCheck2,
        title: 'Evidence-based resolution',
        text: 'Resolved issues can include supporting evidence so completion is easier to verify.',
    },
    {
        icon: Clock3,
        title: 'SLA awareness',
        text: 'The platform supports tracking issues that require timely attention.',
    },
]

function HomePage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [activeIssue, setActiveIssue] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIssue((current) => (current + 1) % civicIssues.length)
        }, 4500)

        return () => clearInterval(interval)
    }, [])

    const previousIssue = () => {
        setActiveIssue((current) =>
            current === 0 ? civicIssues.length - 1 : current - 1
        )
    }

    const nextIssue = () => {
        setActiveIssue((current) => (current + 1) % civicIssues.length)
    }

    const scrollToSection = (id) => {
        setMenuOpen(false)

        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    return (
        <main className="home-page">

            {/* =====================================================
                NAVBAR
            ====================================================== */}

            <nav className="navbar">
                <Link to="/" className="brand">
                    <div className="brand-logo">
                        SC
                    </div>

                    <span>Smart Civic</span>
                </Link>

                <div className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
                    <button
                        type="button"
                        onClick={() => scrollToSection('how-it-works')}
                    >
                        How it works
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToSection('issues')}
                    >
                        Issues
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToSection('features')}
                    >
                        Features
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToSection('why-smart-civic')}
                    >
                        Why Smart Civic
                    </button>

                    <Link
                        to="/login"
                        className="nav-login"
                        onClick={() => setMenuOpen(false)}
                    >
                        Sign in
                    </Link>

                    <Link
                        to="/register"
                        className="nav-register"
                        onClick={() => setMenuOpen(false)}
                    >
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


            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="hero-section">

                <div className="hero-content">

                    <div className="hero-badge">
                        <Sparkles size={15} />
                        A smarter way to report civic issues
                    </div>

                    <h1>
                        Report problems.
                        <span> Track progress. </span>
                        See resolution.
                    </h1>

                    <p className="hero-description">
                        Smart Civic connects citizens, field workers, and
                        administrators through one transparent civic issue
                        management platform.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="primary-button">
                            Report an issue
                            <ArrowRight size={18} />
                        </Link>

                        <Link to="/login" className="secondary-button">
                            Track my issues
                        </Link>
                    </div>

                    <div className="hero-trust">
                        <div>
                            <MapPin size={18} />
                            <span>Precise location</span>
                        </div>

                        <div>
                            <ShieldCheck size={18} />
                            <span>Transparent tracking</span>
                        </div>

                        <div>
                            <Bell size={18} />
                            <span>Status updates</span>
                        </div>
                    </div>

                </div>


                {/* HERO VISUAL */}

                <div className="hero-visual">

                    <div className="hero-glow hero-glow-one"></div>
                    <div className="hero-glow hero-glow-two"></div>

                    <div className="hero-map">

                        <div className="map-road road-one"></div>
                        <div className="map-road road-two"></div>
                        <div className="map-road road-three"></div>
                        <div className="map-road road-four"></div>

                        <div className="map-block block-one"></div>
                        <div className="map-block block-two"></div>
                        <div className="map-block block-three"></div>
                        <div className="map-block block-four"></div>

                        <div className="map-location location-one">
                            <MapPin size={19} />
                        </div>

                        <div className="map-location location-two">
                            <MapPin size={17} />
                        </div>

                        <div className="map-location location-three">
                            <MapPin size={15} />
                        </div>

                        <div className="map-center">
                            <div className="map-center-pulse"></div>
                            <Navigation size={21} />
                        </div>

                        <div className="hero-map-label">
                            <MapPin size={15} />
                            Civic issue location
                        </div>

                    </div>


                    <div className="floating-status status-card-one">
                        <div className="floating-status-icon reported-icon">
                            <Camera size={17} />
                        </div>

                        <div>
                            <strong>Issue Reported</strong>
                            <span>Location attached</span>
                        </div>

                        <CheckCircle2 size={17} />
                    </div>


                    <div className="floating-status status-card-two">
                        <div className="floating-status-icon assigned-icon">
                            <Users size={17} />
                        </div>

                        <div>
                            <strong>Assigned</strong>
                            <span>Field worker notified</span>
                        </div>

                        <CheckCircle2 size={17} />
                    </div>


                    <div className="floating-status status-card-three">
                        <div className="floating-status-icon resolved-icon">
                            <FileCheck2 size={17} />
                        </div>

                        <div>
                            <strong>Resolved</strong>
                            <span>Evidence available</span>
                        </div>

                        <CheckCircle2 size={17} />
                    </div>

                </div>
            </section>


            {/* =====================================================
                CAPABILITY STRIP
            ====================================================== */}

            <section className="capability-strip">

                <div className="capability-item">
                    <MapPin size={21} />
                    <div>
                        <strong>Location-aware</strong>
                        <span>Precise issue locations</span>
                    </div>
                </div>

                <div className="capability-item">
                    <Search size={21} />
                    <div>
                        <strong>Duplicate-aware</strong>
                        <span>Nearby issue detection</span>
                    </div>
                </div>

                <div className="capability-item">
                    <Users size={21} />
                    <div>
                        <strong>Structured workflow</strong>
                        <span>Citizen to field worker</span>
                    </div>
                </div>

                <div className="capability-item">
                    <Bell size={21} />
                    <div>
                        <strong>Stay informed</strong>
                        <span>Important status updates</span>
                    </div>
                </div>

                <div className="capability-item">
                    <FileCheck2 size={21} />
                    <div>
                        <strong>Evidence-based</strong>
                        <span>Resolution evidence</span>
                    </div>
                </div>

            </section>


            {/* =====================================================
                HOW IT WORKS
            ====================================================== */}

            <section className="how-it-works" id="how-it-works">

                <div className="section-heading">

                    <span className="section-tag">
                        HOW SMART CIVIC WORKS
                    </span>

                    <h2>
                        From a reported problem
                        <span> to a visible resolution.</span>
                    </h2>

                    <p>
                        A connected workflow designed to make civic issue
                        reporting easier to follow and easier to manage.
                    </p>

                </div>


                <div className="workflow-line"></div>

                <div className="steps-grid">

                    <article className="step-card">

                        <div className="step-number">
                            01
                        </div>

                        <div className="step-icon">
                            <Camera size={24} />
                        </div>

                        <span className="step-mini-label">
                            REPORT
                        </span>

                        <h3>Report the problem</h3>

                        <p>
                            Add the issue details, category, photo, and
                            location so the problem is clearly documented.
                        </p>

                    </article>


                    <article className="step-card">

                        <div className="step-number">
                            02
                        </div>

                        <div className="step-icon">
                            <MapPin size={24} />
                        </div>

                        <span className="step-mini-label">
                            LOCATE
                        </span>

                        <h3>Pin the location</h3>

                        <p>
                            Connect the report to its geographic location
                            and help identify nearby related issues.
                        </p>

                    </article>


                    <article className="step-card">

                        <div className="step-number">
                            03
                        </div>

                        <div className="step-icon">
                            <Users size={24} />
                        </div>

                        <span className="step-mini-label">
                            ASSIGN
                        </span>

                        <h3>Coordinate the work</h3>

                        <p>
                            Issues can move through a structured assignment
                            and field-worker workflow.
                        </p>

                    </article>


                    <article className="step-card">

                        <div className="step-number">
                            04
                        </div>

                        <div className="step-icon">
                            <Bell size={24} />
                        </div>

                        <span className="step-mini-label">
                            TRACK
                        </span>

                        <h3>Follow progress</h3>

                        <p>
                            Track status changes and receive important
                            notifications throughout the process.
                        </p>

                    </article>


                    <article className="step-card">

                        <div className="step-number">
                            05
                        </div>

                        <div className="step-icon">
                            <FileCheck2 size={24} />
                        </div>

                        <span className="step-mini-label">
                            RESOLVE
                        </span>

                        <h3>See the resolution</h3>

                        <p>
                            Completed issues can include supporting evidence
                            so resolution is easier to understand.
                        </p>

                    </article>

                </div>

            </section>


            {/* =====================================================
                CIVIC ISSUE CAROUSEL
            ====================================================== */}

            <section className="issues-section" id="issues">

                <div className="issues-heading">

                    <div>

                        <span className="section-tag">
                            CIVIC ISSUES
                        </span>

                        <h2>
                            Problems worth
                            <span> reporting.</span>
                        </h2>

                        <p>
                            From damaged roads to water and drainage issues,
                            help bring attention to problems that affect
                            everyday life.
                        </p>

                    </div>

                    <div className="carousel-controls">

                        <button
                            type="button"
                            onClick={previousIssue}
                            aria-label="Previous civic issue"
                        >
                            <ChevronLeft size={21} />
                        </button>

                        <button
                            type="button"
                            onClick={nextIssue}
                            aria-label="Next civic issue"
                        >
                            <ChevronRight size={21} />
                        </button>

                    </div>

                </div>


                <div className="issues-carousel">

                    <div
                        className="issues-track"
                        style={{
                            transform: `translateX(-${activeIssue * 100}%)`,
                        }}
                    >

                        {civicIssues.map((issue) => (
                            <article
                                className="issue-slide"
                                key={issue.title}
                            >

                                <div
                                    className="issue-slide-image"
                                    style={{
                                        backgroundImage: `url("${issue.image}")`,
                                    }}
                                >

                                    <div className="issue-image-overlay"></div>

                                    <div className="issue-slide-content">

                                        <span>
                                            {issue.location}
                                        </span>

                                        <h3>
                                            {issue.title}
                                        </h3>

                                        <p>
                                            {issue.description}
                                        </p>

                                    </div>

                                </div>

                            </article>
                        ))}

                    </div>

                </div>


                <div className="carousel-indicators">

                    {civicIssues.map((issue, index) => (
                        <button
                            type="button"
                            key={issue.title}
                            className={
                                index === activeIssue
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => setActiveIssue(index)}
                            aria-label={`Show ${issue.title}`}
                        />
                    ))}

                </div>

            </section>


            {/* =====================================================
                LOCATION INTELLIGENCE
            ====================================================== */}

            <section className="location-section">

                <div className="location-visual">

                    <div className="location-map-card">

                        <div className="location-map-header">
                            <div>
                                <span className="map-live-dot"></span>
                                Location intelligence
                            </div>

                            <span>
                                Nearby
                            </span>
                        </div>


                        <div className="location-map">

                            <div className="location-road location-road-one"></div>
                            <div className="location-road location-road-two"></div>
                            <div className="location-road location-road-three"></div>

                            <div className="nearby-ring ring-one"></div>
                            <div className="nearby-ring ring-two"></div>

                            <div className="location-pin main-location">
                                <MapPin size={22} />
                            </div>

                            <div className="location-pin nearby-one">
                                <MapPin size={17} />
                            </div>

                            <div className="location-pin nearby-two">
                                <MapPin size={16} />
                            </div>

                            <div className="location-pin nearby-three">
                                <MapPin size={15} />
                            </div>

                            <div className="location-map-tooltip">
                                <strong>Your reported issue</strong>
                                <span>Precise location attached</span>
                            </div>

                        </div>


                        <div className="nearby-report-card">

                            <div className="nearby-report-icon">
                                <Search size={18} />
                            </div>

                            <div>
                                <strong>
                                    Possible nearby report
                                </strong>

                                <span>
                                    Same category · nearby location
                                </span>
                            </div>

                            <Check size={17} />

                        </div>

                    </div>

                </div>


                <div className="location-content">

                    <span className="section-tag">
                        LOCATION INTELLIGENCE
                    </span>

                    <h2>
                        Every report
                        <span> has a place.</span>
                    </h2>

                    <p>
                        Accurate location information helps civic issues
                        become easier to identify, understand, and route
                        through the right workflow.
                    </p>


                    <div className="location-points">

                        <div>
                            <div className="point-icon">
                                <MapPin size={19} />
                            </div>

                            <div>
                                <strong>Precise issue location</strong>

                                <span>
                                    Attach the report to the place where
                                    the problem actually exists.
                                </span>
                            </div>
                        </div>


                        <div>
                            <div className="point-icon">
                                <Search size={19} />
                            </div>

                            <div>
                                <strong>Nearby issue awareness</strong>

                                <span>
                                    Possible nearby duplicate reports can
                                    be identified.
                                </span>
                            </div>
                        </div>


                        <div>
                            <div className="point-icon">
                                <Navigation size={19} />
                            </div>

                            <div>
                                <strong>Better coordination</strong>

                                <span>
                                    Location information gives the workflow
                                    useful geographic context.
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                RESOLUTION JOURNEY
            ====================================================== */}

            <section className="resolution-section">

                <div className="section-heading">

                    <span className="section-tag">
                        FROM REPORT TO RESOLUTION
                    </span>

                    <h2>
                        More than a complaint form.
                        <span> A complete workflow.</span>
                    </h2>

                    <p>
                        Smart Civic connects the journey from the first
                        citizen report to field-level resolution.
                    </p>

                </div>


                <div className="resolution-flow">

                    <div className="resolution-item">

                        <div className="resolution-icon">
                            <Camera size={22} />
                        </div>

                        <strong>Reported</strong>

                        <span>
                            Issue submitted
                        </span>

                    </div>


                    <div className="resolution-connector">
                        <ArrowRight size={19} />
                    </div>


                    <div className="resolution-item">

                        <div className="resolution-icon">
                            <Users size={22} />
                        </div>

                        <strong>Assigned</strong>

                        <span>
                            Work coordinated
                        </span>

                    </div>


                    <div className="resolution-connector">
                        <ArrowRight size={19} />
                    </div>


                    <div className="resolution-item">

                        <div className="resolution-icon">
                            <Clock3 size={22} />
                        </div>

                        <strong>In Progress</strong>

                        <span>
                            Work underway
                        </span>

                    </div>


                    <div className="resolution-connector">
                        <ArrowRight size={19} />
                    </div>


                    <div className="resolution-item">

                        <div className="resolution-icon">
                            <ImageIcon size={22} />
                        </div>

                        <strong>Evidence</strong>

                        <span>
                            Supporting photo
                        </span>

                    </div>


                    <div className="resolution-connector">
                        <ArrowRight size={19} />
                    </div>


                    <div className="resolution-item resolution-complete">

                        <div className="resolution-icon">
                            <CheckCircle2 size={22} />
                        </div>

                        <strong>Resolved</strong>

                        <span>
                            Issue completed
                        </span>

                    </div>

                </div>

            </section>


            {/* =====================================================
                NOTIFICATIONS + EVIDENCE
            ====================================================== */}

            <section className="transparency-section">

                <div className="transparency-content">

                    <span className="section-tag">
                        TRANSPARENT RESOLUTION
                    </span>

                    <h2>
                        Know what happened
                        <span> to your report.</span>
                    </h2>

                    <p>
                        Reporting an issue should not mean wondering what
                        happened next. Follow status changes and understand
                        when the issue reaches resolution.
                    </p>


                    <div className="transparency-checks">

                        <div>
                            <Check size={17} />
                            <span>
                                Clear issue status history
                            </span>
                        </div>

                        <div>
                            <Check size={17} />
                            <span>
                                Important status notifications
                            </span>
                        </div>

                        <div>
                            <Check size={17} />
                            <span>
                                Resolution evidence when available
                            </span>
                        </div>

                    </div>

                </div>


                <div className="notification-preview">

                    <div className="notification-window">

                        <div className="notification-window-header">
                            <div>
                                <Bell size={18} />
                                <strong>
                                    Issue updates
                                </strong>
                            </div>

                            <span>
                                3 updates
                            </span>
                        </div>


                        <div className="notification-item">

                            <div className="notification-dot notification-dot-blue">
                                <Users size={15} />
                            </div>

                            <div>
                                <strong>
                                    Issue assigned
                                </strong>

                                <span>
                                    Your reported issue has been assigned
                                    for field action.
                                </span>

                                <small>
                                    Recently
                                </small>
                            </div>

                        </div>


                        <div className="notification-item">

                            <div className="notification-dot notification-dot-orange">
                                <Clock3 size={15} />
                            </div>

                            <div>
                                <strong>
                                    Status updated
                                </strong>

                                <span>
                                    Your issue is now being worked on.
                                </span>

                                <small>
                                    Recently
                                </small>
                            </div>

                        </div>


                        <div className="notification-item">

                            <div className="notification-dot notification-dot-green">
                                <FileCheck2 size={15} />
                            </div>

                            <div>
                                <strong>
                                    Issue resolved
                                </strong>

                                <span>
                                    Resolution evidence has been added.
                                </span>

                                <small>
                                    Recently
                                </small>
                            </div>

                        </div>

                    </div>


                    <div className="evidence-card">

                        <div className="evidence-image">

                            <div className="evidence-before">
                                BEFORE
                            </div>

                            <div className="evidence-after">
                                RESOLUTION
                            </div>

                        </div>

                        <div className="evidence-card-content">

                            <div>
                                <strong>
                                    Resolution evidence
                                </strong>

                                <span>
                                    Supporting photo attached
                                </span>
                            </div>

                            <CheckCircle2 size={22} />

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FEATURES
            ====================================================== */}

            <section className="features-section" id="features">

                <div className="features-intro">

                    <span className="section-tag">
                        BUILT FOR BETTER CIVIC COORDINATION
                    </span>

                    <h2>
                        The tools behind
                        <span> a connected civic workflow.</span>
                    </h2>

                    <p>
                        From reporting and location intelligence to
                        assignment, notifications, and resolution evidence,
                        Smart Civic brings the workflow together.
                    </p>

                </div>


                <div className="features-grid">

                    {featureHighlights.map((feature) => {

                        const Icon = feature.icon

                        return (
                            <article
                                className="feature-card"
                                key={feature.title}
                            >

                                <div className="feature-icon">
                                    <Icon size={23} />
                                </div>

                                <h3>
                                    {feature.title}
                                </h3>

                                <p>
                                    {feature.text}
                                </p>

                                <div className="feature-card-arrow">
                                    <ArrowRight size={17} />
                                </div>

                            </article>
                        )
                    })}

                </div>

            </section>


            {/* =====================================================
                ROLES
            ====================================================== */}

            <section className="roles-section">

                <div className="section-heading">

                    <span className="section-tag">
                        ONE PLATFORM
                    </span>

                    <h2>
                        Built for everyone involved
                        <span> in the resolution.</span>
                    </h2>

                    <p>
                        Different responsibilities, one connected workflow.
                    </p>

                </div>


                <div className="roles-grid">

                    <article className="role-card citizen-role">

                        <div className="role-icon">
                            <MapPin size={25} />
                        </div>

                        <span className="role-label">
                            FOR CITIZENS
                        </span>

                        <h3>
                            Report and track
                        </h3>

                        <p>
                            Report local problems with photos and location,
                            follow progress, and stay informed about updates.
                        </p>

                        <ul>
                            <li>
                                <Check size={16} />
                                Report civic issues
                            </li>

                            <li>
                                <Check size={16} />
                                Track issue progress
                            </li>

                            <li>
                                <Check size={16} />
                                Receive notifications
                            </li>
                        </ul>

                    </article>


                    <article className="role-card worker-role">

                        <div className="role-icon">
                            <Users size={25} />
                        </div>

                        <span className="role-label">
                            FOR FIELD WORKERS
                        </span>

                        <h3>
                            Work and resolve
                        </h3>

                        <p>
                            View assigned issues, follow status workflows,
                            and provide evidence when work is completed.
                        </p>

                        <ul>
                            <li>
                                <Check size={16} />
                                Manage assigned issues
                            </li>

                            <li>
                                <Check size={16} />
                                Update issue status
                            </li>

                            <li>
                                <Check size={16} />
                                Submit resolution evidence
                            </li>
                        </ul>

                    </article>


                    <article className="role-card admin-role">

                        <div className="role-icon">
                            <ShieldCheck size={25} />
                        </div>

                        <span className="role-label">
                            FOR ADMINISTRATORS
                        </span>

                        <h3>
                            Coordinate and oversee
                        </h3>

                        <p>
                            Manage issues, coordinate assignments, and
                            oversee operational workflows from one platform.
                        </p>

                        <ul>
                            <li>
                                <Check size={16} />
                                Manage civic issues
                            </li>

                            <li>
                                <Check size={16} />
                                Coordinate assignments
                            </li>

                            <li>
                                <Check size={16} />
                                Monitor issue workflows
                            </li>
                        </ul>

                    </article>

                </div>

            </section>


            {/* =====================================================
                WHY SMART CIVIC
            ====================================================== */}

            <section
                className="why-section"
                id="why-smart-civic"
            >

                <div className="why-visual">

                    <div className="why-panel">

                        <div className="why-panel-header">
                            <div>
                                <span className="why-panel-dot"></span>
                                Smart Civic workflow
                            </div>

                            <ShieldCheck size={19} />
                        </div>


                        <div className="why-timeline">

                            <div className="why-timeline-item completed">
                                <span></span>

                                <div>
                                    <strong>
                                        Issue reported
                                    </strong>

                                    <small>
                                        Photo + location added
                                    </small>
                                </div>
                            </div>


                            <div className="why-timeline-item completed">
                                <span></span>

                                <div>
                                    <strong>
                                        Issue assigned
                                    </strong>

                                    <small>
                                        Structured field workflow
                                    </small>
                                </div>
                            </div>


                            <div className="why-timeline-item active">
                                <span></span>

                                <div>
                                    <strong>
                                        Work in progress
                                    </strong>

                                    <small>
                                        Citizen can follow updates
                                    </small>
                                </div>
                            </div>


                            <div className="why-timeline-item">
                                <span></span>

                                <div>
                                    <strong>
                                        Resolution
                                    </strong>

                                    <small>
                                        Supporting evidence available
                                    </small>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>


                <div className="why-content">

                    <span className="section-tag">
                        WHY SMART CIVIC
                    </span>

                    <h2>
                        Built around
                        <span> transparency and action.</span>
                    </h2>

                    <p>
                        Civic reporting should not end when someone presses
                        "Submit". Smart Civic is designed around the complete
                        journey of an issue.
                    </p>


                    <div className="why-grid">

                        <div>
                            <span>01</span>
                            <h3>Location-aware</h3>
                            <p>
                                Give every issue useful geographic context.
                            </p>
                        </div>

                        <div>
                            <span>02</span>
                            <h3>Transparent</h3>
                            <p>
                                Follow what happens after reporting.
                            </p>
                        </div>

                        <div>
                            <span>03</span>
                            <h3>Evidence-driven</h3>
                            <p>
                                Support completed work with evidence.
                            </p>
                        </div>

                        <div>
                            <span>04</span>
                            <h3>Structured</h3>
                            <p>
                                Connect citizens, workers, and administrators.
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                CTA
            ====================================================== */}

            <section className="cta-section">

                <div className="cta-pattern"></div>

                <div className="cta-content">

                    <span className="section-tag cta-tag">
                        MAKE YOUR CITY BETTER
                    </span>

                    <h2>
                        See a civic problem?
                        <span> Don't just walk past it.</span>
                    </h2>

                    <p>
                        Report it with Smart Civic and follow the journey
                        from your report to resolution.
                    </p>

                    <div className="cta-actions">

                        <Link
                            to="/register"
                            className="cta-primary"
                        >
                            Create free account
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            to="/login"
                            className="cta-secondary"
                        >
                            Sign in
                        </Link>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer className="footer">

                <div className="footer-content">

                    <div className="footer-main">

                        <Link
                            to="/"
                            className="brand footer-brand"
                        >
                            <div className="brand-logo">
                                SC
                            </div>

                            <span>
                                Smart Civic
                            </span>
                        </Link>

                        <p>
                            Making civic issue reporting simpler,
                            more transparent, and easier to track.
                        </p>

                    </div>


                    <div className="footer-column">

                        <h4>
                            Platform
                        </h4>

                        <button
                            type="button"
                            onClick={() => scrollToSection('how-it-works')}
                        >
                            How it works
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('issues')}
                        >
                            Civic issues
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('features')}
                        >
                            Features
                        </button>

                    </div>


                    <div className="footer-column">

                        <h4>
                            Learn
                        </h4>

                        <button
                            type="button"
                            onClick={() => scrollToSection('why-smart-civic')}
                        >
                            Why Smart Civic
                        </button>

                        <Link to="/login">
                            Sign in
                        </Link>

                        <Link to="/register">
                            Get started
                        </Link>

                    </div>


                    <div className="footer-column">

                        <h4>
                            Get started
                        </h4>

                        <Link
                            to="/register"
                            className="footer-start-button"
                        >
                            Report an issue
                            <ArrowRight size={16} />
                        </Link>

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


            {/* Scroll hint */}

            <button
                type="button"
                className="scroll-top-hint"
                onClick={() =>
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    })
                }
                aria-label="Scroll to top"
            >
                <ArrowDown size={16} />
            </button>

        </main>
    )
}

export default HomePage