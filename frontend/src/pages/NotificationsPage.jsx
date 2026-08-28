import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/citizenCSS/notifications.css'

function NotificationsPage() {

    const navigate = useNavigate()

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [markingAll, setMarkingAll] = useState(false)

    const getToken = () => {
        return localStorage.getItem('token')
    }

    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications = async () => {

        try {

            setLoading(true)
            setError('')

            const token = getToken()

            if (!token) {
                navigate('/login')
                return
            }

            const response = await fetch(
                'http://localhost:8080/api/v1/notifications',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('userRole')

                navigate('/login')
                return
            }

            if (!response.ok) {
                throw new Error(
                    'Failed to fetch notifications'
                )
            }

            const data = await response.json()

            setNotifications(
                Array.isArray(data)
                    ? data
                    : []
            )

        } catch (err) {

            console.error(
                'Notification fetch error:',
                err
            )

            setError(
                'Unable to load notifications. Please try again.'
            )

        } finally {

            setLoading(false)

        }
    }


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    const markAsRead = async (notificationId) => {

        try {

            const token = getToken()

            const response = await fetch(
                `http://localhost:8080/api/v1/notifications/${notificationId}/read`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                throw new Error(
                    'Failed to mark notification as read'
                )
            }

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            isRead: true
                        }
                        : notification
                )
            )

        } catch (err) {

            console.error(
                'Mark notification read error:',
                err
            )

        }
    }


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    const markAllAsRead = async () => {

        try {

            setMarkingAll(true)

            const token = getToken()

            const response = await fetch(
                'http://localhost:8080/api/v1/notifications/read-all',
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                throw new Error(
                    'Failed to mark all notifications as read'
                )
            }

            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    isRead: true
                }))
            )

        } catch (err) {

            console.error(
                'Mark all notifications error:',
                err
            )

        } finally {

            setMarkingAll(false)

        }
    }


    // =====================================================
    // ISSUE CLICK
    // =====================================================

    const handleNotificationClick = async (
        notification
    ) => {

        if (!notification.isRead) {

            await markAsRead(
                notification.id
            )

        }

        if (notification.referenceId) {

            navigate(
                `/my-issues/${notification.referenceId}`
            )
        }
    }


    // =====================================================
    // LOAD ON PAGE OPEN
    // =====================================================

    useEffect(() => {

        fetchNotifications()

    }, [])


    // =====================================================
    // HELPERS
    // =====================================================

    const getNotificationIcon = (type) => {

        switch (type) {

            case 'ISSUE_RESOLVED':
                return '✓'

            case 'ISSUE_STATUS_CHANGED':
                return '↻'

            case 'SLA_BREACHED':
                return '!'

            case 'SLA_WARNING':
                return '⚠'

            case 'ISSUE_REPORTED':
                return '+'

            case 'ISSUE_REOPENED':
                return '↗'

            default:
                return '🔔'
        }
    }


    const getNotificationClass = (type) => {

        switch (type) {

            case 'ISSUE_RESOLVED':
                return 'notification-success'

            case 'SLA_BREACHED':
                return 'notification-danger'

            case 'SLA_WARNING':
                return 'notification-warning'

            case 'ISSUE_REOPENED':
                return 'notification-warning'

            case 'ISSUE_STATUS_CHANGED':
                return 'notification-info'

            default:
                return 'notification-default'
        }
    }


    const formatTime = (createdAt) => {

        if (!createdAt) {
            return ''
        }

        const date = new Date(createdAt)

        if (Number.isNaN(date.getTime())) {
            return createdAt
        }

        return date.toLocaleString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        )
    }


    const unreadCount =
        notifications.filter(
            notification => !notification.isRead
        ).length


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="citizen-notifications-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="citizen-notifications-header">

                <div>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay updated about your reported civic issues.
                    </p>

                </div>


                {unreadCount > 0 && (

                    <button
                        type="button"
                        className="notifications-mark-all-button"
                        onClick={markAllAsRead}
                        disabled={markingAll}
                    >
                        {markingAll
                            ? 'Marking...'
                            : 'Mark all as read'
                        }
                    </button>

                )}

            </div>


            {/* =========================
                SUMMARY
            ========================= */}

            {!loading && !error && (

                <div className="notifications-summary">

                    <div className="notifications-summary-card">

                        <span className="summary-number">
                            {notifications.length}
                        </span>

                        <span className="summary-label">
                            Total Notifications
                        </span>

                    </div>


                    <div className="notifications-summary-card">

                        <span className="summary-number unread">
                            {unreadCount}
                        </span>

                        <span className="summary-label">
                            Unread
                        </span>

                    </div>

                </div>

            )}


            {/* =========================
                LOADING
            ========================= */}

            {loading && (

                <div className="notification-state">

                    <div className="notification-loader">
                        Loading notifications...
                    </div>

                </div>

            )}


            {/* =========================
                ERROR
            ========================= */}

            {!loading && error && (

                <div className="notification-state notification-error">

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchNotifications}
                        className="notification-retry-button"
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =========================
                EMPTY
            ========================= */}

            {!loading &&
                !error &&
                notifications.length === 0 && (

                    <div className="notification-empty">

                        <div className="notification-empty-icon">
                            🔔
                        </div>

                        <h2>
                            No notifications yet
                        </h2>

                        <p>
                            You will see updates about your
                            civic issues here.
                        </p>

                    </div>

                )}


            {/* =========================
                NOTIFICATION LIST
            ========================= */}

            {!loading &&
                !error &&
                notifications.length > 0 && (

                    <div className="notification-list">

                        {notifications.map(
                            notification => (

                                <div
                                    key={notification.id}
                                    className={`notification-card ${
                                        notification.isRead
                                            ? 'read'
                                            : 'unread'
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                >

                                    {/* ICON */}

                                    <div
                                        className={`notification-icon ${
                                            getNotificationClass(
                                                notification.type
                                            )
                                        }`}
                                    >
                                        {getNotificationIcon(
                                            notification.type
                                        )}
                                    </div>


                                    {/* CONTENT */}

                                    <div className="notification-content">

                                        <div className="notification-top-row">

                                            <h3>
                                                {notification.title}
                                            </h3>

                                            {!notification.isRead && (

                                                <span className="unread-dot">
                                                </span>

                                            )}

                                        </div>


                                        <p>
                                            {notification.message}
                                        </p>


                                        <div className="notification-meta">

                                            <span>
                                                {formatTime(
                                                    notification.createdAt
                                                )}
                                            </span>

                                            {!notification.isRead && (

                                                <span className="unread-label">
                                                    Unread
                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    {/* ARROW */}

                                    {notification.referenceId && (

                                        <div className="notification-arrow">
                                            →
                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}

        </div>
    )
}

export default NotificationsPage