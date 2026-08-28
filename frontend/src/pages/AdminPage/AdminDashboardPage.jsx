import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react'

import {
    getAdminDashboardStatistics
} from '../../api/adminApi'

import apiClient from '../../api/apiClient'

import '../../styles/adminCSS/adminDashboard.css'


function AdminDashboardPage() {

    // =====================================================
    // DASHBOARD STATE
    // =====================================================

    const [stats, setStats] = useState(null)

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')


    // =====================================================
    // NOTIFICATION STATE
    // =====================================================

    const [notifications, setNotifications] =
        useState([])

    const [unreadCount, setUnreadCount] =
        useState(0)

    const [notificationOpen, setNotificationOpen] =
        useState(false)

    const [notificationLoading, setNotificationLoading] =
        useState(false)

    const [markingId, setMarkingId] =
        useState(null)

    const [markingAll, setMarkingAll] =
        useState(false)


    // =====================================================
    // NOTIFICATION REF
    // =====================================================

    const notificationRef =
        useRef(null)


    // =====================================================
    // LOAD DASHBOARD STATISTICS
    // =====================================================

    const fetchDashboardStatistics = async () => {

        try {

            setLoading(true)

            setError('')


            const response =
                await getAdminDashboardStatistics()


            console.log(
                'Admin dashboard statistics:',
                response
            )


            /*
             * Depending on backend response,
             * support both:
             *
             * {
             *   totalIssues: 12
             * }
             *
             * OR
             *
             * {
             *   data: {
             *      totalIssues: 12
             *   }
             * }
             */

            const dashboardData =
                response?.data &&
                typeof response.data === 'object'
                    ? response.data
                    : response


            setStats(
                dashboardData
            )


        } catch (err) {

            console.error(
                'Failed to fetch admin dashboard statistics:',
                err
            )


            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Failed to load dashboard statistics.'
            )


        } finally {

            setLoading(false)

        }

    }


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const fetchNotifications = useCallback(
        async () => {

            try {

                setNotificationLoading(true)


                const response =
                    await apiClient.get(
                        '/notifications'
                    )


                console.log(
                    'Admin notifications:',
                    response
                )


                const data =
                    response?.data


                /*
                 * Support common backend response shapes.
                 */

                const notificationData =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.data)
                            ? data.data
                            : Array.isArray(data?.content)
                                ? data.content
                                : []


                setNotifications(
                    notificationData
                )


            } catch (err) {

                console.error(
                    'Failed to load notifications:',
                    err
                )

                /*
                 * Notification failure must NOT
                 * break dashboard statistics.
                 */

            } finally {

                setNotificationLoading(false)

            }

        },
        []
    )


    // =====================================================
    // LOAD UNREAD COUNT
    // =====================================================

    const fetchUnreadCount = useCallback(
        async () => {

            try {

                const response =
                    await apiClient.get(
                        '/notifications/unread-count'
                    )


                console.log(
                    'Unread notification response:',
                    response
                )


                const data =
                    response?.data


                const count =
                    data?.unreadCount ??
                    data?.data?.unreadCount ??
                    data?.count ??
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

        fetchDashboardStatistics()

        fetchNotifications()

        fetchUnreadCount()

    }, [
        fetchNotifications,
        fetchUnreadCount
    ])


    // =====================================================
    // CLOSE NOTIFICATION DROPDOWN
    // WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setNotificationOpen(false)

            }

        }


        document.addEventListener(
            'mousedown',
            handleClickOutside
        )


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            )

        }

    }, [])


    // =====================================================
    // TOGGLE NOTIFICATIONS
    // =====================================================

    const handleNotificationToggle = () => {

        setNotificationOpen(
            previous => !previous
        )

    }


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    const handleMarkAsRead = async (
        notification
    ) => {

        if (!notification?.id) {

            return

        }


        /*
         * Already read notification:
         * just navigate if reference exists.
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
                            item.id === notification.id
                                ? {
                                    ...item,
                                    isRead: true
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
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    const handleMarkAllAsRead = async () => {

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
                            isRead: true
                        })
                    )
            )


            setUnreadCount(0)


        } catch (err) {

            console.error(
                'Failed to mark all notifications as read:',
                err
            )

        } finally {

            setMarkingAll(false)

        }

    }


    // =====================================================
    // NOTIFICATION NAVIGATION
    // =====================================================

    const handleNotificationNavigation = (
        notification
    ) => {

        if (!notification?.referenceId) {

            return

        }


        const type =
            String(
                notification.type || ''
            ).toUpperCase()


        /*
         * Issue / SLA notifications
         */

        if (
            type.includes('ISSUE') ||
            type.includes('SLA')
        ) {

            window.location.href =
                `/admin/issues/${notification.referenceId}`

            return

        }


        /*
         * User / citizen notifications
         */

        if (
            type.includes('USER') ||
            type.includes('CITIZEN')
        ) {

            window.location.href =
                '/admin/users'

        }

    }


    // =====================================================
    // NOTIFICATION TYPE
    // =====================================================

    const getNotificationType = (
        notification
    ) => {

        if (!notification?.type) {

            return 'NOTIFICATION'

        }


        return String(
            notification.type
        )
            .replaceAll('_', ' ')
            .toUpperCase()

    }


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon = (
        notification
    ) => {

        const type =
            String(
                notification?.type || ''
            ).toUpperCase()


        if (
            type.includes('SLA') ||
            type.includes('BREACHED')
        ) {

            return '⚠'

        }


        if (
            type.includes('RESOLVED')
        ) {

            return '✓'

        }


        if (
            type.includes('STATUS')
        ) {

            return '↻'

        }


        if (
            type.includes('PRIORITY')
        ) {

            return '!'

        }


        if (
            type.includes('USER') ||
            type.includes('CITIZEN')
        ) {

            return 'U'

        }


        return '🔔'

    }


    // =====================================================
    // NOTIFICATION CSS CLASS
    // =====================================================

    const getNotificationClass = (
        notification
    ) => {

        const type =
            String(
                notification?.type || ''
            ).toLowerCase()


        if (
            type.includes('sla') ||
            type.includes('breached')
        ) {

            return 'danger'

        }


        if (
            type.includes('resolved')
        ) {

            return 'success'

        }


        if (
            type.includes('status')
        ) {

            return 'status'

        }


        if (
            type.includes('priority')
        ) {

            return 'priority'

        }


        if (
            type.includes('citizen') ||
            type.includes('user')
        ) {

            return 'user'

        }


        return 'default'

    }


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatNotificationDate = (
        createdAt
    ) => {

        if (!createdAt) {

            return ''

        }


        const date =
            new Date(createdAt)


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return ''

        }


        return new Intl.DateTimeFormat(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }
        ).format(date)

    }


    // =====================================================
    // RELATIVE TIME
    // =====================================================

    const getRelativeTime = (
        createdAt
    ) => {

        if (!createdAt) {

            return ''

        }


        const date =
            new Date(createdAt)


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return ''

        }


        const difference =
            Date.now() -
            date.getTime()


        const seconds =
            Math.floor(
                difference / 1000
            )


        if (seconds < 60) {

            return 'Just now'

        }


        const minutes =
            Math.floor(
                seconds / 60
            )


        if (minutes < 60) {

            return `${minutes} min ago`

        }


        const hours =
            Math.floor(
                minutes / 60
            )


        if (hours < 24) {

            return `${hours} hour ago`

        }


        if (hours < 48) {

            return 'Yesterday'

        }


        return date.toLocaleDateString(
            'en-IN',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }
        )

    }


    // =====================================================
    // RECENT NOTIFICATIONS
    // =====================================================

    const recentNotifications =
        notifications.slice(
            0,
            5
        )


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-dashboard-page">

                <section className="admin-dashboard-header">

                    <div>

                        <p className="admin-dashboard-eyebrow">
                            ADMIN CONTROL CENTER
                        </p>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Overview of civic issues and platform users.
                        </p>

                    </div>

                </section>


                <div className="admin-dashboard-loading">

                    Loading dashboard statistics...

                </div>

            </div>

        )

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="admin-dashboard-page">

                <section className="admin-dashboard-header">

                    <div>

                        <p className="admin-dashboard-eyebrow">
                            ADMIN CONTROL CENTER
                        </p>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Overview of civic issues and platform users.
                        </p>

                    </div>

                </section>


                <div className="admin-dashboard-error">

                    {error}

                </div>

            </div>

        )

    }


    // =====================================================
    // SAFE STAT VALUES
    // =====================================================

    const totalIssues =
        Number(
            stats?.totalIssues ?? 0
        )

    const reportedIssues =
        Number(
            stats?.reportedIssues ?? 0
        )

    const underReviewIssues =
        Number(
            stats?.underReviewIssues ?? 0
        )

    const inProgressIssues =
        Number(
            stats?.inProgressIssues ?? 0
        )

    const resolvedIssues =
        Number(
            stats?.resolvedIssues ?? 0
        )

    const totalUsers =
        Number(
            stats?.totalUsers ?? 0
        )

    const totalCitizens =
        Number(
            stats?.totalCitizens ?? 0
        )

    const totalFieldWorkers =
        Number(
            stats?.totalFieldWorkers ?? 0
        )

    const activeUsers =
        Number(
            stats?.activeUsers ?? 0
        )

    const suspendedUsers =
        Number(
            stats?.suspendedUsers ?? 0
        )


    // =====================================================
    // PERCENTAGES
    // =====================================================

    const reportedPercentage =
        totalIssues > 0
            ? (
            reportedIssues /
            totalIssues
        ) * 100
            : 0


    const reviewPercentage =
        totalIssues > 0
            ? (
            underReviewIssues /
            totalIssues
        ) * 100
            : 0


    const progressPercentage =
        totalIssues > 0
            ? (
            inProgressIssues /
            totalIssues
        ) * 100
            : 0


    const resolvedPercentage =
        totalIssues > 0
            ? (
            resolvedIssues /
            totalIssues
        ) * 100
            : 0


    // =====================================================
    // MAIN DASHBOARD
    // =====================================================

    return (

        <div className="admin-dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="admin-dashboard-header">

                <div className="admin-dashboard-header-content">

                    <div>

                        <p className="admin-dashboard-eyebrow">
                            ADMIN CONTROL CENTER
                        </p>


                        <h1>
                            Admin Dashboard
                        </h1>


                        <p>
                            Overview of civic issues and platform users.
                        </p>

                    </div>


                    {/* =================================================
                        NOTIFICATION CENTER
                    ================================================= */}

                    <div
                        className="admin-notification-wrapper"
                        ref={notificationRef}
                    >

                        <button
                            type="button"
                            className={
                                `admin-notification-button ${
                                    notificationOpen
                                        ? 'active'
                                        : ''
                                }`
                            }
                            onClick={
                                handleNotificationToggle
                            }
                            aria-label="Open notifications"
                        >

                            <span className="admin-notification-bell">
                                🔔
                            </span>


                            {unreadCount > 0 && (

                                <span className="admin-notification-badge">

                                    {unreadCount > 99
                                        ? '99+'
                                        : unreadCount}

                                </span>

                            )}

                        </button>


                        {/* =================================================
                            NOTIFICATION DROPDOWN
                        ================================================= */}

                        {notificationOpen && (

                            <div className="admin-notification-dropdown">


                                {/* DROPDOWN HEADER */}

                                <div className="admin-notification-dropdown-header">

                                    <div>

                                        <h3>
                                            Notifications
                                        </h3>


                                        <span>

                                            {unreadCount > 0
                                                ? `${unreadCount} unread`
                                                : 'All caught up'}

                                        </span>

                                    </div>


                                    {unreadCount > 0 && (

                                        <button
                                            type="button"
                                            className="admin-notification-mark-all"
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


                                {/* NOTIFICATION LIST */}

                                <div className="admin-notification-list">


                                    {notificationLoading ? (

                                        <div className="admin-notification-state">

                                            Loading notifications...

                                        </div>

                                    ) : recentNotifications.length === 0 ? (

                                        <div className="admin-notification-empty">

                                            <div className="admin-notification-empty-icon">
                                                ✓
                                            </div>


                                            <strong>
                                                No notifications
                                            </strong>


                                            <span>
                                                You're all caught up.
                                            </span>

                                        </div>

                                    ) : (

                                        recentNotifications.map(
                                            notification => {

                                                const isUnread =
                                                    !notification.isRead


                                                const type =
                                                    getNotificationType(
                                                        notification
                                                    )


                                                return (

                                                    <article
                                                        key={
                                                            notification.id
                                                        }
                                                        className={
                                                            `admin-notification-item ${
                                                                isUnread
                                                                    ? 'unread'
                                                                    : 'read'
                                                            }`
                                                        }
                                                        onClick={() =>
                                                            handleMarkAsRead(
                                                                notification
                                                            )
                                                        }
                                                    >


                                                        {/* ICON */}

                                                        <div
                                                            className={
                                                                `admin-notification-icon ${
                                                                    getNotificationClass(
                                                                        notification
                                                                    )
                                                                }`
                                                            }
                                                        >

                                                            {getNotificationIcon(
                                                                notification
                                                            )}

                                                        </div>


                                                        {/* CONTENT */}

                                                        <div className="admin-notification-content">


                                                            <div className="admin-notification-top-row">

                                                                <span className="admin-notification-type">
                                                                    {type}
                                                                </span>


                                                                {isUnread && (

                                                                    <span className="admin-notification-new">
                                                                        NEW
                                                                    </span>

                                                                )}

                                                            </div>


                                                            <h4>

                                                                {notification.title ||
                                                                    'Notification'}

                                                            </h4>


                                                            <p>

                                                                {notification.message ||
                                                                    'You have a new notification.'}

                                                            </p>


                                                            <div className="admin-notification-meta">

                                                                <span>
                                                                    {
                                                                        formatNotificationDate(
                                                                            notification.createdAt
                                                                        )
                                                                    }
                                                                </span>


                                                                <span>
                                                                    •
                                                                </span>


                                                                <span>
                                                                    {
                                                                        getRelativeTime(
                                                                            notification.createdAt
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>


                                                        {/* UNREAD DOT */}

                                                        {isUnread && (

                                                            <span className="admin-notification-unread-dot" />

                                                        )}

                                                    </article>

                                                )

                                            }
                                        )

                                    )}

                                </div>


                                {/* VIEW ALL */}

                                {notifications.length > 5 && (

                                    <div className="admin-notification-footer">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                window.location.href =
                                                    '/admin/notifications'
                                            }
                                        >
                                            View all notifications
                                        </button>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* =================================================
                ISSUE OVERVIEW
            ================================================= */}

            <section className="admin-dashboard-section">


                <div className="admin-section-heading">

                    <div>

                        <h2>
                            Issue Overview
                        </h2>


                        <p>
                            Current status of reported civic issues.
                        </p>

                    </div>

                </div>


                <div className="admin-stat-grid">


                    {/* TOTAL ISSUES */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                I
                            </span>


                            <span className="admin-stat-label">
                                Total Issues
                            </span>

                        </div>


                        <strong>
                            {totalIssues}
                        </strong>


                        <span className="admin-stat-description">
                            All reported issues
                        </span>

                    </div>


                    {/* REPORTED */}

                    <div className="admin-stat-card reported">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                R
                            </span>


                            <span className="admin-stat-label">
                                Reported
                            </span>

                        </div>


                        <strong>
                            {reportedIssues}
                        </strong>


                        <span className="admin-stat-description">
                            Awaiting review
                        </span>

                    </div>


                    {/* UNDER REVIEW */}

                    <div className="admin-stat-card review">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                U
                            </span>


                            <span className="admin-stat-label">
                                Under Review
                            </span>

                        </div>


                        <strong>
                            {underReviewIssues}
                        </strong>


                        <span className="admin-stat-description">
                            Currently being reviewed
                        </span>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="admin-stat-card progress">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                P
                            </span>


                            <span className="admin-stat-label">
                                In Progress
                            </span>

                        </div>


                        <strong>
                            {inProgressIssues}
                        </strong>


                        <span className="admin-stat-description">
                            Work currently underway
                        </span>

                    </div>


                    {/* RESOLVED */}

                    <div className="admin-stat-card resolved">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                ✓
                            </span>


                            <span className="admin-stat-label">
                                Resolved
                            </span>

                        </div>


                        <strong>
                            {resolvedIssues}
                        </strong>


                        <span className="admin-stat-description">
                            Successfully resolved
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                USER OVERVIEW
            ================================================= */}

            <section className="admin-dashboard-section">


                <div className="admin-section-heading">

                    <div>

                        <h2>
                            User Overview
                        </h2>


                        <p>
                            Current platform user statistics.
                        </p>

                    </div>

                </div>


                <div className="admin-stat-grid">


                    {/* TOTAL USERS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                U
                            </span>


                            <span className="admin-stat-label">
                                Total Users
                            </span>

                        </div>


                        <strong>
                            {totalUsers}
                        </strong>


                        <span className="admin-stat-description">
                            Registered platform users
                        </span>

                    </div>


                    {/* CITIZENS */}

                    <div className="admin-stat-card citizen">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                C
                            </span>


                            <span className="admin-stat-label">
                                Citizens
                            </span>

                        </div>


                        <strong>
                            {totalCitizens}
                        </strong>


                        <span className="admin-stat-description">
                            Registered citizens
                        </span>

                    </div>


                    {/* FIELD WORKERS */}

                    <div className="admin-stat-card worker">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                W
                            </span>


                            <span className="admin-stat-label">
                                Field Workers
                            </span>

                        </div>


                        <strong>
                            {totalFieldWorkers}
                        </strong>


                        <span className="admin-stat-description">
                            Active field workforce
                        </span>

                    </div>


                    {/* ACTIVE USERS */}

                    <div className="admin-stat-card active">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                A
                            </span>


                            <span className="admin-stat-label">
                                Active Users
                            </span>

                        </div>


                        <strong>
                            {activeUsers}
                        </strong>


                        <span className="admin-stat-description">
                            Currently active accounts
                        </span>

                    </div>


                    {/* SUSPENDED USERS */}

                    <div className="admin-stat-card suspended">

                        <div className="admin-stat-card-top">

                            <span className="admin-stat-icon">
                                S
                            </span>


                            <span className="admin-stat-label">
                                Suspended Users
                            </span>

                        </div>


                        <strong>
                            {suspendedUsers}
                        </strong>


                        <span className="admin-stat-description">
                            Suspended accounts
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                ISSUE STATUS SUMMARY
            ================================================= */}

            <section className="admin-dashboard-section">


                <div className="admin-section-heading">

                    <div>

                        <h2>
                            Issue Status Summary
                        </h2>


                        <p>
                            Distribution of issues across the workflow.
                        </p>

                    </div>

                </div>


                <div className="admin-summary-panel">


                    {/* REPORTED */}

                    <div className="admin-summary-row">

                        <div className="admin-summary-info">

                            <span>
                                Reported
                            </span>


                            <strong>
                                {reportedIssues}
                            </strong>

                        </div>


                        <div className="admin-summary-track">

                            <div
                                className="admin-summary-fill reported-fill"
                                style={{
                                    width: `${reportedPercentage}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* UNDER REVIEW */}

                    <div className="admin-summary-row">

                        <div className="admin-summary-info">

                            <span>
                                Under Review
                            </span>


                            <strong>
                                {underReviewIssues}
                            </strong>

                        </div>


                        <div className="admin-summary-track">

                            <div
                                className="admin-summary-fill review-fill"
                                style={{
                                    width: `${reviewPercentage}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="admin-summary-row">

                        <div className="admin-summary-info">

                            <span>
                                In Progress
                            </span>


                            <strong>
                                {inProgressIssues}
                            </strong>

                        </div>


                        <div className="admin-summary-track">

                            <div
                                className="admin-summary-fill progress-fill"
                                style={{
                                    width: `${progressPercentage}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* RESOLVED */}

                    <div className="admin-summary-row">

                        <div className="admin-summary-info">

                            <span>
                                Resolved
                            </span>


                            <strong>
                                {resolvedIssues}
                            </strong>

                        </div>


                        <div className="admin-summary-track">

                            <div
                                className="admin-summary-fill resolved-fill"
                                style={{
                                    width: `${resolvedPercentage}%`
                                }}
                            />

                        </div>

                    </div>

                </div>

            </section>

        </div>

    )

}

export default AdminDashboardPage