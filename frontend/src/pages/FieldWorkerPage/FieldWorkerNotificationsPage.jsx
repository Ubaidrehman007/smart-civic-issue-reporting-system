import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import apiClient from '../../api/apiClient'

import '../../styles/workerCSS/fieldWorkerNotifications.css'


function FieldWorkerNotificationsPage() {

    const navigate = useNavigate()


    // =====================================================
    // STATE
    // =====================================================

    const [notifications, setNotifications] =
        useState([])

    const [unreadCount, setUnreadCount] =
        useState(0)

    const [activeFilter, setActiveFilter] =
        useState('ALL')

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [markingId, setMarkingId] =
        useState(null)

    const [markingAll, setMarkingAll] =
        useState(false)


    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications = useCallback(
        async () => {

            try {

                setLoading(true)
                setError('')

                const response =
                    await apiClient.get(
                        '/notifications'
                    )

                const data =
                    response?.data

                const notificationData =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.data)
                            ? data.data
                            : []

                setNotifications(
                    notificationData
                )

            } catch (err) {

                console.error(
                    'Failed to load notifications:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Unable to load notifications.'
                )

            } finally {

                setLoading(false)

            }

        },
        []
    )


    // =====================================================
    // FETCH UNREAD COUNT
    // =====================================================

    const fetchUnreadCount =
        useCallback(
            async () => {

                try {

                    const response =
                        await apiClient.get(
                            '/notifications/unread-count'
                        )

                    const data =
                        response?.data

                    const count =
                        data?.unreadCount ??
                        data?.data?.unreadCount ??
                        0

                    setUnreadCount(
                        Number(count)
                    )

                } catch (err) {

                    console.error(
                        'Failed to load unread notification count:',
                        err
                    )

                }

            },
            []
        )


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchNotifications()
        fetchUnreadCount()

    }, [
        fetchNotifications,
        fetchUnreadCount,
    ])


    // =====================================================
    // REFRESH UNREAD COUNT
    // =====================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchUnreadCount()

            }, 30000)


        return () =>
            clearInterval(interval)

    }, [
        fetchUnreadCount,
    ])


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    const handleMarkAsRead =
        async (notification) => {

            if (!notification?.id) {
                return
            }


            /*
             * Already read:
             * just navigate if it references an issue.
             */

            if (notification.isRead) {

                handleNotificationNavigation(
                    notification
                )

                return
            }


            try {

                setMarkingId(
                    notification.id
                )


                await apiClient.put(
                    `/notifications/${notification.id}/read`
                )


                setNotifications(
                    previousNotifications =>
                        previousNotifications.map(
                            item =>
                                item.id ===
                                notification.id
                                    ? {
                                        ...item,
                                        isRead: true,
                                    }
                                    : item
                        )
                )


                setUnreadCount(
                    previousCount =>
                        Math.max(
                            0,
                            previousCount - 1
                        )
                )


                handleNotificationNavigation(
                    notification
                )

            } catch (err) {

                console.error(
                    'Failed to mark notification as read:',
                    err
                )

            } finally {

                setMarkingId(null)

            }

        }


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const handleMarkAllAsRead =
        async () => {

            if (unreadCount === 0) {
                return
            }


            try {

                setMarkingAll(true)


                await apiClient.put(
                    '/notifications/read-all'
                )


                setNotifications(
                    previousNotifications =>
                        previousNotifications.map(
                            notification => ({
                                ...notification,
                                isRead: true,
                            })
                        )
                )


                setUnreadCount(0)

            } catch (err) {

                console.error(
                    'Failed to mark all notifications as read:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Unable to mark all notifications as read.'
                )

            } finally {

                setMarkingAll(false)

            }

        }


    // =====================================================
    // NOTIFICATION NAVIGATION
    // =====================================================

    const handleNotificationNavigation =
        (notification) => {

            if (!notification?.referenceId) {
                return
            }


            const type =
                String(
                    notification.type || ''
                ).toUpperCase()


            /*
             * All issue / SLA notifications
             * should open the worker issue.
             */

            if (
                type.includes('ISSUE') ||
                type.includes('SLA')
            ) {

                navigate(
                    `/worker/issues/${notification.referenceId}`
                )

            }

        }


    // =====================================================
    // FILTER
    // =====================================================

    const filteredNotifications =
        useMemo(() => {

            if (activeFilter === 'ALL') {

                return notifications

            }


            if (activeFilter === 'UNREAD') {

                return notifications.filter(
                    notification =>
                        !notification.isRead
                )

            }


            if (activeFilter === 'READ') {

                return notifications.filter(
                    notification =>
                        notification.isRead
                )

            }


            return notifications

        }, [
            notifications,
            activeFilter,
        ])


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatNotificationTime =
        (value) => {

            if (!value) {
                return '—'
            }


            const date =
                new Date(value)


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return value

            }


            return date.toLocaleString(
                'en-IN',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }
            )

        }


    // =====================================================
    // NOTIFICATION TYPE CLASS
    // =====================================================

    const getNotificationClass =
        (type) => {

            const value =
                String(
                    type || ''
                ).toUpperCase()


            if (
                value.includes('SLA') ||
                value.includes('BREACH')
            ) {

                return 'danger'

            }


            if (
                value.includes('RESOLVED')
            ) {

                return 'success'

            }


            if (
                value.includes('ASSIGNED')
            ) {

                return 'assignment'

            }


            if (
                value.includes('STATUS')
            ) {

                return 'status'

            }


            return 'default'

        }


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon =
        (type) => {

            const notificationClass =
                getNotificationClass(
                    type
                )


            if (
                notificationClass ===
                'danger'
            ) {

                return '!'

            }


            if (
                notificationClass ===
                'success'
            ) {

                return '✓'

            }


            if (
                notificationClass ===
                'assignment'
            ) {

                return '↗'

            }


            if (
                notificationClass ===
                'status'
            ) {

                return '↻'

            }


            return '•'

        }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="worker-notifications-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="worker-notifications-header">

                <div>

                    <span className="worker-notifications-eyebrow">
                        FIELD WORKER
                    </span>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay updated with your assigned
                        civic issues and work activity.
                    </p>

                </div>


                <div className="worker-notifications-count">

                    <strong>
                        {unreadCount}
                    </strong>

                    <span>
                        Unread
                    </span>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="worker-notifications-toolbar">


                <div className="worker-notification-filters">

                    <button
                        type="button"
                        className={
                            activeFilter === 'ALL'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setActiveFilter('ALL')
                        }
                    >
                        All
                    </button>


                    <button
                        type="button"
                        className={
                            activeFilter === 'UNREAD'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setActiveFilter('UNREAD')
                        }
                    >
                        Unread
                    </button>


                    <button
                        type="button"
                        className={
                            activeFilter === 'READ'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setActiveFilter('READ')
                        }
                    >
                        Read
                    </button>

                </div>


                {unreadCount > 0 && (

                    <button
                        type="button"
                        className="worker-mark-all-button"
                        onClick={
                            handleMarkAllAsRead
                        }
                        disabled={markingAll}
                    >
                        {markingAll
                            ? 'Marking...'
                            : 'Mark all as read'}
                    </button>

                )}

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="worker-notification-error">
                    {error}
                </div>

            )}


            {/* =================================================
                NOTIFICATION LIST
            ================================================= */}

            <div className="worker-notification-list">


                {loading ? (

                    <div className="worker-notification-state">

                        <div className="worker-notification-loader" />

                        <p>
                            Loading notifications...
                        </p>

                    </div>

                ) : filteredNotifications.length === 0 ? (

                    <div className="worker-notification-empty">

                        <div className="worker-empty-icon">
                            ✓
                        </div>

                        <h2>
                            No notifications
                        </h2>

                        <p>
                            You're all caught up.
                        </p>

                    </div>

                ) : (

                    filteredNotifications.map(
                        notification => {

                            const notificationClass =
                                getNotificationClass(
                                    notification.type
                                )


                            return (

                                <button
                                    type="button"
                                    key={
                                        notification.id
                                    }
                                    className={`worker-notification-card ${
                                        !notification.isRead
                                            ? 'unread'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        handleMarkAsRead(
                                            notification
                                        )
                                    }
                                    disabled={
                                        markingId ===
                                        notification.id
                                    }
                                >

                                    <div
                                        className={`worker-notification-icon ${notificationClass}`}
                                    >
                                        {
                                            getNotificationIcon(
                                                notification.type
                                            )
                                        }
                                    </div>


                                    <div className="worker-notification-content">

                                        <div className="worker-notification-title-row">

                                            <h3>
                                                {
                                                    notification.title ||
                                                    'Notification'
                                                }
                                            </h3>


                                            {!notification.isRead && (

                                                <span className="worker-unread-dot" />

                                            )}

                                        </div>


                                        <p>
                                            {
                                                notification.message ||
                                                'No message available.'
                                            }
                                        </p>


                                        <div className="worker-notification-meta">

                                            <span>
                                                {
                                                    formatNotificationTime(
                                                        notification.createdAt
                                                    )
                                                }
                                            </span>


                                            {notification.referenceId && (

                                                <span>
                                                    View issue →
                                                </span>

                                            )}

                                        </div>

                                    </div>

                                </button>

                            )

                        }
                    )

                )}

            </div>

        </div>

    )

}


export default FieldWorkerNotificationsPage