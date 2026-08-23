import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/adminCSS/adminLayout.css'

function AdminLayout() {

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
        <div className="admin-layout">

            {/* =========================
                MOBILE HEADER
            ========================= */}

            <header className="admin-mobile-header">

                <button
                    type="button"
                    className="admin-mobile-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open admin navigation menu"
                >
                    ☰
                </button>

                <div className="admin-mobile-brand">

                    <div className="admin-brand-logo">
                        SC
                    </div>

                    <span>Smart Civic Admin</span>

                </div>

            </header>


            {/* =========================
                MOBILE OVERLAY
            ========================= */}

            {sidebarOpen && (
                <div
                    className="admin-mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside
                className={`admin-sidebar ${
                    sidebarOpen ? 'admin-sidebar-open' : ''
                }`}
            >

                <div className="admin-brand">

                    <div className="admin-brand-logo">
                        SC
                    </div>

                    <div className="admin-brand-text">
                        <span>Smart Civic</span>
                        <small>ADMIN PANEL</small>
                    </div>

                    <button
                        type="button"
                        className="admin-mobile-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close admin navigation menu"
                    >
                        ×
                    </button>

                </div>


                {/* =========================
                    NAVIGATION
                ========================= */}

                <nav className="admin-nav">

                    <NavLink
                        to="/admin/dashboard"
                        end
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/admin/issues"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Issues
                    </NavLink>


                    <NavLink
                        to="/admin/workers"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Workers
                    </NavLink>


                    <NavLink
                        to="/admin/users"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Users
                    </NavLink>


                    <NavLink
                        to="/admin/assignments"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Assignments
                    </NavLink>


                    <NavLink
                        to="/admin/sla"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        SLA
                    </NavLink>


                    <NavLink
                        to="/admin/analytics"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Analytics
                    </NavLink>


                    <NavLink
                        to="/admin/notifications"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Notifications
                    </NavLink>


                    <NavLink
                        to="/admin/audit-logs"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Audit Logs
                    </NavLink>


                    <NavLink
                        to="/admin/settings"
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                            `admin-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Settings
                    </NavLink>

                </nav>


                {/* =========================
                    LOGOUT
                ========================= */}

                <div className="admin-sidebar-bottom">

                    <button
                        type="button"
                        className="admin-nav-item admin-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="admin-main">

                <Outlet />

            </main>

        </div>
    )
}

export default AdminLayout