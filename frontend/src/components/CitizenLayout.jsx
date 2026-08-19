import {NavLink, Outlet, useNavigate} from 'react-router-dom'

function CitizenLayout() {

    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className="dashboard-layout">

            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-brand">

                    <div className="dashboard-brand-logo">
                        SC
                    </div>

                    <span>Smart Civic</span>

                </div>


                {/* NAVIGATION */}
                <nav className="dashboard-nav">

                    <NavLink
                        to="/dashboard"
                        end
                        className={({isActive}) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/my-issues"
                        className={({isActive}) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        My Issues
                    </NavLink>


                    <NavLink
                        to="/report-issue"
                        className={({isActive}) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Report Issue
                    </NavLink>


                    <NavLink
                        to="/profile"
                        className={({isActive}) =>
                            `dashboard-nav-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        Profile
                    </NavLink>

                </nav>


                {/* LOGOUT */}
                <div className="dashboard-sidebar-bottom">

                    <button
                        className="dashboard-nav-item logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* MAIN CONTENT */}
            <main className="dashboard-main">
                <Outlet/>
            </main>

        </div>
    )
}

export default CitizenLayout