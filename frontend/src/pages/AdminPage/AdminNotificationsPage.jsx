import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from "../../api/apiClient";
import '../../styles/adminCSS/adminNotifications.css'


function Notification() {

    const navigate = useNavigate()

    const [notifications, setNotifications] = useState([])

    const [unreadCount, setUnreadCount] = useState(0)

    const [activeFilter, setActiveFilter] = useState('ALL')

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    const [markingId, setMarkingId] = useState(null)

    const [markingAll, setMarkingAll] = useState(false)


    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications = useCallback(async () => {

        try {

            setLoading(true)
            setError('')

            const response =
                await apiClient.get('/notifications')

            const data = response?.data

            /*
             * Handles both:
             *
             * [
             *   ...
             * ]
             *
             * and
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             */

            const notificationData =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : []

            setNotifications(notificationData)

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

    }, [])


    // =====================================================
    // FETCH UNREAD COUNT
    // =====================================================

    const fetchUnreadCount = useCallback(async () => {

        try {

            const response =
                await apiClient.get(
                    '/notifications/unread-count'
                )

            const data = response?.data

            const count =
                data?.unreadCount ??
                data?.data?.unreadCount ??
                0

            setUnreadCount(Number(count))

        } catch (err) {

            console.error(
                'Failed to load unread notification count:',
                err
            )

        }

    }, [])


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchNotifications()
        fetchUnreadCount()

    }, [
        fetchNotifications,
        fetchUnreadCount
    ])


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    const handleMarkAsRead = async (notification) => {

        if (!notification?.id) {
            return
        }

        if (notification.isRead) {

            /*
             * If notification already read,
             * still allow opening the referenced issue.
             */

            handleNotificationNavigation(notification)

            return
        }

        try {

            setMarkingId(notification.id)

            await apiClient.put(
                `/notifications/${notification.id}/read`
            )

            setNotifications(previousNotifications =>
                previousNotifications.map(item =>
                    item.id === notification.id
                        ? {
                            ...item,
                            isRead: true
                        }
                        : item
                )
            )

            setUnreadCount(previousCount =>
                Math.max(0, previousCount - 1)
            )

            handleNotificationNavigation(notification)

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

    const handleMarkAllAsRead = async () => {

        if (unreadCount === 0) {
            return
        }

        try {

            setMarkingAll(true)

            await apiClient.put(
                '/notifications/read-all'
            )

            setNotifications(previousNotifications =>
                previousNotifications.map(notification => ({
                    ...notification,
                    isRead: true
                }))
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

    const handleNotificationNavigation = notification => {

        if (!notification?.referenceId) {
            return
        }

        const type =
            String(notification.type || '')
                .toUpperCase()

        /*
         * Issue related notifications
         */

        if (
            type.includes('ISSUE') ||
            type.includes('SLA')
        ) {

            navigate(
                `/admin/issues/${notification.referenceId}`
            )

            return
        }

        /*
         * Citizen registration notification
         */

        if (
            type.includes('CITIZEN') ||
            type.includes('USER')
        ) {

            navigate('/admin/users')

        }

    }


    // =====================================================
    // FILTER NOTIFICATIONS
    // =====================================================

    const filteredNotifications = useMemo(() => {

        if (activeFilter === 'ALL') {

            return notifications

        }

        return notifications.filter(notification => {

            const type =
                String(notification.type || '')
                    .toUpperCase()

            if (activeFilter === 'ISSUES') {

                return (
                    type.includes('ISSUE')
                )

            }

            if (activeFilter === 'SLA') {

                return (
                    type.includes('SLA')
                )

            }

            if (activeFilter === 'USERS') {

                return (
                    type.includes('USER') ||
                    type.includes('CITIZEN')
                )

            }

            return true

        })

    }, [
        notifications,
        activeFilter
    ])


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = createdAt => {

        if (!createdAt) {
            return ''
        }

        const date =
            new Date(createdAt)

        if (Number.isNaN(date.getTime())) {
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

    const getRelativeTime = createdAt => {

        if (!createdAt) {
            return ''
        }

        const date =
            new Date(createdAt)

        if (Number.isNaN(date.getTime())) {
            return ''
        }

        const difference =
            Date.now() - date.getTime()

        const seconds =
            Math.floor(
                difference / 1000
            )

        if (seconds < 60) {

            return 'Just now'

        }

        const minutes =
            Math.floor(seconds / 60)

        if (minutes < 60) {

            return `${minutes} ${
                minutes === 1
                    ? 'minute'
                    : 'minutes'
            } ago`

        }

        const hours =
            Math.floor(minutes / 60)

        if (hours < 24) {

            return `${hours} ${
                hours === 1
                    ? 'hour'
                    : 'hours'
            } ago`

        }

        const days =
            Math.floor(hours / 24)

        if (days < 7) {

            return `${days} ${
                days === 1
                    ? 'day'
                    : 'days'
            } ago`

        }

        return formatDate(createdAt)

    }


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon = type => {

        const notificationType =
            String(type || '')
                .toUpperCase()

        if (
            notificationType.includes('SLA')
        ) {

            return '⏱'

        }

        if (
            notificationType ===
            'ISSUE_RESOLVED'
        ) {

            return '✓'

        }

        if (
            notificationType.includes(
                'CITIZEN'
            ) ||
            notificationType.includes(
                'USER'
            )
        ) {

            return '👤'

        }

        if (
            notificationType.includes(
                'ASSIGNED'
            )
        ) {

            return '📌'

        }

        if (
            notificationType.includes(
                'STATUS'
            )
        ) {

            return '↻'

        }

        if (
            notificationType.includes(
                'ISSUE'
            )
        ) {

            return '⚠'

        }

        return '🔔'

    }


    // =====================================================
    // NOTIFICATION COLOR
    // =====================================================

    const getNotificationClass = type => {

        const notificationType =
            String(type || '')
                .toUpperCase()

        if (
            notificationType.includes('SLA')
        ) {

            return 'notification-icon-sla'

        }

        if (
            notificationType ===
            'ISSUE_RESOLVED'
        ) {

            return 'notification-icon-resolved'

        }

        if (
            notificationType.includes(
                'CITIZEN'
            ) ||
            notificationType.includes(
                'USER'
            )
        ) {

            return 'notification-icon-user'

        }

        if (
            notificationType.includes(
                'STATUS'
            )
        ) {

            return 'notification-icon-status'

        }

        return 'notification-icon-default'

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="notification-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="notification-page-header">

                <div className="notification-heading">

                    <div className="notification-eyebrow">
                        ADMIN PANEL
                    </div>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay updated with important
                        civic system activities.
                    </p>

                </div>


                <div className="notification-header-actions">

                    <div className="notification-unread-badge">

                        <span>
                            Unread
                        </span>

                        <strong>
                            {unreadCount}
                        </strong>

                    </div>


                    <button
                        type="button"
                        className="notification-mark-all-button"
                        disabled={
                            unreadCount === 0 ||
                            markingAll
                        }
                        onClick={
                            handleMarkAllAsRead
                        }
                    >

                        {markingAll
                            ? 'Marking...'
                            : 'Mark all as read'
                        }

                    </button>

                </div>

            </section>


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <section className="notification-filter-bar">

                <button
                    type="button"
                    className={
                        `notification-filter-button ${
                            activeFilter === 'ALL'
                                ? 'active'
                                : ''
                        }`
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
                        `notification-filter-button ${
                            activeFilter === 'ISSUES'
                                ? 'active'
                                : ''
                        }`
                    }
                    onClick={() =>
                        setActiveFilter('ISSUES')
                    }
                >
                    Issues
                </button>


                <button
                    type="button"
                    className={
                        `notification-filter-button ${
                            activeFilter === 'SLA'
                                ? 'active'
                                : ''
                        }`
                    }
                    onClick={() =>
                        setActiveFilter('SLA')
                    }
                >
                    SLA
                </button>


                <button
                    type="button"
                    className={
                        `notification-filter-button ${
                            activeFilter === 'USERS'
                                ? 'active'
                                : ''
                        }`
                    }
                    onClick={() =>
                        setActiveFilter('USERS')
                    }
                >
                    Users
                </button>

            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="notification-error">

                    <div>

                        <strong>
                            Something went wrong
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() => {

                            setError('')

                            fetchNotifications()
                            fetchUnreadCount()

                        }}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <section className="notification-list">

                    {[1, 2, 3].map(item => (

                        <div
                            className="notification-skeleton-card"
                            key={item}
                        >

                            <div className="notification-skeleton-icon" />

                            <div className="notification-skeleton-content">

                                <div className="notification-skeleton-line short" />

                                <div className="notification-skeleton-line medium" />

                                <div className="notification-skeleton-line long" />

                            </div>

                        </div>

                    ))}

                </section>

            ) : filteredNotifications.length === 0 ? (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <section className="notification-empty-state">

                    <div className="notification-empty-icon">
                        🔔
                    </div>

                    <h2>
                        No notifications
                    </h2>

                    <p>
                        {notifications.length === 0
                            ? 'You are all caught up. New notifications will appear here.'
                            : 'No notifications match the selected filter.'
                        }
                    </p>

                </section>

            ) : (

                /* =================================================
                   NOTIFICATION LIST
                ================================================= */

                <section className="notification-list">

                    {filteredNotifications.map(
                        notification => {

                            const isUnread =
                                !notification.isRead

                            const notificationType =
                                notification.type ||
                                'NOTIFICATION'

                            return (

                                <article
                                    key={
                                        notification.id
                                    }
                                    className={
                                        `notification-card ${
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

                                    {/* =================================
                                        UNREAD INDICATOR
                                    ================================= */}

                                    {isUnread && (

                                        <span
                                            className="notification-unread-dot"
                                            aria-label="Unread notification"
                                        />

                                    )}


                                    {/* =================================
                                        ICON
                                    ================================= */}

                                    <div
                                        className={
                                            `notification-icon ${
                                                getNotificationClass(
                                                    notificationType
                                                )
                                            }`
                                        }
                                    >

                                        {getNotificationIcon(
                                            notificationType
                                        )}

                                    </div>


                                    {/* =================================
                                        CONTENT
                                    ================================= */}

                                    <div className="notification-content">

                                        <div className="notification-top-row">

                                            <span className="notification-type">

                                                {notificationType
                                                    .replaceAll(
                                                        '_',
                                                        ' '
                                                    )}

                                            </span>

                                            {isUnread && (

                                                <span className="notification-new-badge">
                                                    NEW
                                                </span>

                                            )}

                                        </div>


                                        <h2>
                                            {
                                                notification.title ||
                                                'Notification'
                                            }
                                        </h2>


                                        <p className="notification-message">

                                            {
                                                notification.message ||
                                                'You have a new notification.'
                                            }

                                        </p>


                                        <div className="notification-meta">

                                            <span>
                                                {formatDate(
                                                    notification.createdAt
                                                )}
                                            </span>

                                            <span className="notification-meta-dot">
                                                •
                                            </span>

                                            <span>
                                                {getRelativeTime(
                                                    notification.createdAt
                                                )}
                                            </span>

                                            {notification.referenceId && (

                                                <>
                                                    <span className="notification-meta-dot">
                                                        •
                                                    </span>

                                                    <span className="notification-reference">

                                                        Reference:
                                                        {' '}
                                                        {
                                                            notification.referenceId
                                                        }

                                                    </span>
                                                </>

                                            )}

                                        </div>

                                    </div>


                                    {/* =================================
                                        ACTION
                                    ================================= */}

                                    <div className="notification-action">

                                        {markingId ===
                                        notification.id ? (

                                            <span className="notification-loading-small">
                                                ...
                                            </span>

                                        ) : isUnread ? (

                                            <span className="notification-unread-label">
                                                Unread
                                            </span>

                                        ) : (

                                            <span className="notification-read-label">
                                                Read
                                            </span>

                                        )}

                                    </div>

                                </article>

                            )

                        }
                    )}

                </section>

            )}

        </div>

    )

}

export default Notification