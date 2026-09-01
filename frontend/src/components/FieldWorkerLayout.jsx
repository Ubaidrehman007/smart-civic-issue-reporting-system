import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/workerCSS/fieldWorkerLayout.css'

function FieldWorkerLayout() {

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

        <div className="worker-layout">

            {/* =================================================
                MOBILE HEADER
            ================================================= */}

            <header className="worker-mobile-header">

                <button
                    type="button"
                    className="worker-mobile-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open field worker navigation menu"
                >
                    ☰
                </button>


                <div className="worker-mobile-brand">

                    <div className="worker-brand-logo">
                        SC
                    </div>

                    <span>
                        Smart Civic
                    </span>

                </div>

            </header>


            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {sidebarOpen && (

                <div
                    className="worker-mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                />

            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`worker-sidebar ${
                    sidebarOpen
                        ? 'worker-sidebar-open'
                        : ''
                }`}
            >

                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="worker-brand">

                    <div className="worker-brand-logo">
                        SC
                    </div>


                    <div className="worker-brand-text">

                        <span>
                            Smart Civic
                        </span>

                        <small>
                            FIELD WORKER
                        </small>

                    </div>


                    <button
                        type="button"
                        className="worker-mobile-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close field worker navigation menu"
                    >
                        ×
                    </button>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="worker-nav">

                    <NavLink
                        to="/worker/dashboard"
                        end
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `worker-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/worker/assignments"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `worker-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        My Assignments
                    </NavLink>


                    <NavLink
                        to="/worker/active-issues"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `worker-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Active Issues
                    </NavLink>


                    <NavLink
                        to="/worker/completed-issues"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `worker-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Completed Issues
                    </NavLink>


                    <NavLink
                        to="/worker/notifications"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `worker-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Notifications
                    </NavLink>


                    <NavLink
                        to="/worker/profile"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `worker-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Profile
                    </NavLink>

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <div className="worker-sidebar-bottom">

                    <button
                        type="button"
                        className="worker-nav-item worker-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="worker-main">

                <Outlet />

            </main>

        </div>
    )
}

export default FieldWorkerLayout