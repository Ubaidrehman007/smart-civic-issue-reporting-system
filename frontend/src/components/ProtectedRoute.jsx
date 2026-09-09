import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ allowedRoles }) {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    let user = null

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null
    } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute