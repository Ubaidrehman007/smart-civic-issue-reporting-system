import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/citizenCSS/citizenLayout.css'

function CitizenLayout() {

    const navigate = useNavigate()

    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')

        setSidebarOpen(false)

        navigate('/login')
    }


    const handleNavigation = () => {
        setSidebarOpen(false)
    }


    return (
        <div className="dashboard-layout">

            {/* =========================
                MOBILE HEADER
            ========================= */}

            <header className="mobile-dashboard-header">

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation menu"
                >
                    ☰
                </button>


                <div className="mobile-dashboard-brand">

                    <div className="dashboard-brand-logo">
                        SC
                    </div>

                    <span>
                        Smart Civic
                    </span>

                </div>

            </header>


            {/* =========================
                MOBILE OVERLAY
            ========================= */}

            {sidebarOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside
                className={`dashboard-sidebar ${
                    sidebarOpen
                        ? 'mobile-sidebar-open'
                        : ''
                }`}
            >

                <div className="dashboard-brand">

                    <div className="dashboard-brand-logo">
                        SC
                    </div>

                    <span>
                        Smart Civic
                    </span>


                    <button
                        type="button"
                        className="mobile-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        ×
                    </button>

                </div>


                {/* =========================
                    NAVIGATION
                ========================= */}

                <nav className="dashboard-nav">

                    <NavLink
                        to="/dashboard"
                        end
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/my-issues"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        My Issues
                    </NavLink>


                    <NavLink
                        to="/report-issue"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Report Issue
                    </NavLink>


                    <NavLink
                        to="/profile"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Profile
                    </NavLink>


                    {/* =========================
                        SETTINGS
                    ========================= */}

                    <NavLink
                        to="/settings"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Settings
                    </NavLink>


                    {/* =========================
                        NOTIFICATIONS
                    ========================= */}

                    <NavLink
                        to="/notifications"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Notifications
                    </NavLink>

                </nav>


                {/* =========================
                    LOGOUT
                ========================= */}

                <div className="dashboard-sidebar-bottom">

                    <button
                        type="button"
                        className="dashboard-nav-item logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="dashboard-main">

                <Outlet />

            </main>

        </div>
    )
}

export default CitizenLayout