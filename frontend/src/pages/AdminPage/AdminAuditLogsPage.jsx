import { useEffect, useMemo, useState } from 'react'
import '../../styles/adminCSS/adminAuditLogs.css'

function AdminAuditLogsPage() {

    // =====================================================
    // CONSTANTS
    // =====================================================

    const PAGE_SIZE = 20

    const API_URL =
        'http://localhost:8080/api/v1/audit-logs'


    // =====================================================
    // STATE
    // =====================================================

    const [auditLogs, setAuditLogs] = useState([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    const [page, setPage] = useState(0)

    const [totalPages, setTotalPages] = useState(0)

    const [totalElements, setTotalElements] = useState(0)

    const [keyword, setKeyword] = useState('')

    const [action, setAction] = useState('')

    const [entityType, setEntityType] = useState('')

    const [selectedLog, setSelectedLog] = useState(null)


    // =====================================================
    // ACTION OPTIONS
    // =====================================================

    const actionOptions = [
        {
            value: 'LOGIN',
            label: 'Login'
        },
        {
            value: 'LOGOUT',
            label: 'Logout'
        },
        {
            value: 'PASSWORD_CHANGED',
            label: 'Password Changed'
        },
        {
            value: 'USER_CREATED',
            label: 'User Created'
        },
        {
            value: 'USER_UPDATED',
            label: 'User Updated'
        },
        {
            value: 'USER_STATUS_CHANGED',
            label: 'User Status Changed'
        },
        {
            value: 'USER_DELETED',
            label: 'User Deleted'
        },
        {
            value: 'ISSUE_CREATED',
            label: 'Issue Created'
        },
        {
            value: 'ISSUE_UPDATED',
            label: 'Issue Updated'
        },
        {
            value: 'ISSUE_STATUS_CHANGED',
            label: 'Issue Status Changed'
        },
        {
            value: 'ISSUE_ASSIGNED',
            label: 'Issue Assigned'
        },
        {
            value: 'ISSUE_DELETED',
            label: 'Issue Deleted'
        }
    ]


    // =====================================================
    // ENTITY OPTIONS
    // =====================================================

    const entityOptions = [
        {
            value: 'USER',
            label: 'User'
        },
        {
            value: 'ISSUE',
            label: 'Issue'
        }
    ]


    // =====================================================
    // ACTION LABEL MAP
    // =====================================================

    const actionLabelMap = useMemo(() => {

        return actionOptions.reduce(
            (map, item) => {

                map[item.value] = item.label

                return map

            },
            {}
        )

    }, [])


    // =====================================================
    // FETCH AUDIT LOGS
    // =====================================================

    const fetchAuditLogs = async () => {

        try {

            setLoading(true)

            setError('')


            const token =
                localStorage.getItem('token')


            if (!token) {

                throw new Error(
                    'Authentication token not found. Please login again.'
                )
            }


            const params =
                new URLSearchParams()


            params.append(
                'page',
                String(page)
            )


            params.append(
                'size',
                String(PAGE_SIZE)
            )


            if (keyword.trim()) {

                params.append(
                    'keyword',
                    keyword.trim()
                )
            }


            if (action) {

                params.append(
                    'action',
                    action
                )
            }


            if (entityType) {

                params.append(
                    'entityType',
                    entityType
                )
            }


            const response =
                await fetch(
                    `${API_URL}/filter?${params.toString()}`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                )


            if (!response.ok) {

                if (response.status === 401) {

                    throw new Error(
                        'Your session has expired. Please login again.'
                    )
                }


                if (response.status === 403) {

                    throw new Error(
                        'You are not authorized to view audit logs.'
                    )
                }


                let message =
                    'Failed to fetch audit logs.'

                try {

                    const body =
                        await response.json()

                    if (body?.message) {

                        message =
                            body.message
                    }

                } catch {

                    // Ignore invalid JSON response
                }


                throw new Error(message)
            }


            const data =
                await response.json()


            setAuditLogs(
                Array.isArray(data?.content)
                    ? data.content
                    : []
            )


            setTotalPages(
                Number.isFinite(data?.totalPages)
                    ? data.totalPages
                    : 0
            )


            setTotalElements(
                Number.isFinite(data?.totalElements)
                    ? data.totalElements
                    : 0
            )

        } catch (err) {

            console.error(
                'Error fetching audit logs:',
                err
            )


            setError(
                err?.message ||
                'Unable to load audit logs.'
            )


            setAuditLogs([])

            setTotalPages(0)

            setTotalElements(0)

        } finally {

            setLoading(false)
        }
    }


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        fetchAuditLogs()

    }, [
        page,
        keyword,
        action,
        entityType
    ])


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearchChange = (event) => {

        setKeyword(
            event.target.value
        )

        setPage(0)
    }


    // =====================================================
    // ACTION FILTER
    // =====================================================

    const handleActionChange = (event) => {

        setAction(
            event.target.value
        )

        setPage(0)
    }


    // =====================================================
    // ENTITY FILTER
    // =====================================================

    const handleEntityTypeChange = (event) => {

        setEntityType(
            event.target.value
        )

        setPage(0)
    }


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const handleClearFilters = () => {

        setKeyword('')

        setAction('')

        setEntityType('')

        setPage(0)
    }


    // =====================================================
    // PREVIOUS PAGE
    // =====================================================

    const handlePrevious = () => {

        if (
            page > 0 &&
            !loading
        ) {

            setPage(
                previousPage =>
                    previousPage - 1
            )
        }
    }


    // =====================================================
    // NEXT PAGE
    // =====================================================

    const handleNext = () => {

        if (
            !loading &&
            totalPages > 0 &&
            page < totalPages - 1
        ) {

            setPage(
                previousPage =>
                    previousPage + 1
            )
        }
    }


    // =====================================================
    // OPEN DETAILS
    // =====================================================

    const handleOpenDetails = (log) => {

        setSelectedLog(log)

    }


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const handleCloseDetails = () => {

        setSelectedLog(null)

    }


    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {

        if (!selectedLog) {

            return undefined
        }


        const handleKeyDown = (event) => {

            if (event.key === 'Escape') {

                setSelectedLog(null)
            }
        }


        document.addEventListener(
            'keydown',
            handleKeyDown
        )


        document.body.style.overflow =
            'hidden'


        return () => {

            document.removeEventListener(
                'keydown',
                handleKeyDown
            )

            document.body.style.overflow =
                ''
        }

    }, [
        selectedLog
    ])


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDateTime = (dateTime) => {

        if (!dateTime) {

            return '—'
        }


        const date =
            new Date(dateTime)


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return '—'
        }


        return date.toLocaleString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }
        )
    }


    // =====================================================
    // FORMAT ACTION
    // =====================================================

    const formatAction = (value) => {

        if (!value) {

            return 'Unknown Action'
        }


        return (
            actionLabelMap[value] ||
            value
                .replaceAll('_', ' ')
                .toLowerCase()
                .replace(
                    /\b\w/g,
                    char =>
                        char.toUpperCase()
                )
        )
    }


    // =====================================================
    // FORMAT ENTITY
    // =====================================================

    const formatEntity = (value) => {

        if (!value) {

            return '—'
        }


        return value
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(
                /\b\w/g,
                char =>
                    char.toUpperCase()
            )
    }


    // =====================================================
    // ACTION CATEGORY
    // =====================================================

    const getActionCategory = (value) => {

        if (!value) {

            return 'default'
        }


        if (
            value === 'LOGIN' ||
            value === 'LOGOUT' ||
            value === 'PASSWORD_CHANGED'
        ) {

            return 'security'
        }


        if (
            value === 'USER_CREATED' ||
            value === 'ISSUE_CREATED'
        ) {

            return 'create'
        }


        if (
            value === 'USER_UPDATED' ||
            value === 'ISSUE_UPDATED'
        ) {

            return 'update'
        }


        if (
            value === 'USER_DELETED' ||
            value === 'ISSUE_DELETED'
        ) {

            return 'delete'
        }


        if (
            value === 'USER_STATUS_CHANGED' ||
            value === 'ISSUE_STATUS_CHANGED'
        ) {

            return 'status'
        }


        if (
            value === 'ISSUE_ASSIGNED'
        ) {

            return 'assignment'
        }


        return 'default'
    }


    // =====================================================
    // COPY TO CLIPBOARD
    // =====================================================

    const handleCopy = async (value) => {

        if (!value) {

            return
        }


        try {

            await navigator.clipboard.writeText(
                String(value)
            )

        } catch (err) {

            console.error(
                'Unable to copy value:',
                err
            )
        }
    }


    // =====================================================
    // ACTIVE FILTERS
    // =====================================================

    const hasActiveFilters =
        keyword.trim() !== '' ||
        action !== '' ||
        entityType !== ''


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-audit-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="admin-audit-header">

                <div>

                    <p className="admin-audit-eyebrow">
                        SYSTEM ACTIVITY
                    </p>


                    <h1>
                        Audit Logs
                    </h1>


                    <p>
                        Track important actions and changes
                        performed across the Smart Civic system.
                    </p>

                </div>

            </section>


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <section className="admin-audit-toolbar">


                {/* SEARCH */}

                <div className="admin-audit-search">

                    <input
                        type="text"
                        value={keyword}
                        onChange={
                            handleSearchChange
                        }
                        placeholder="Search audit logs..."
                        aria-label="Search audit logs"
                    />

                </div>


                {/* ACTION */}

                <div className="admin-audit-filter">

                    <select
                        value={action}
                        onChange={
                            handleActionChange
                        }
                        aria-label="Filter by action"
                    >

                        <option value="">
                            All Actions
                        </option>


                        {actionOptions.map(
                            option => (

                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {
                                        option.label
                                    }
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* ENTITY */}

                <div className="admin-audit-filter">

                    <select
                        value={entityType}
                        onChange={
                            handleEntityTypeChange
                        }
                        aria-label="Filter by entity type"
                    >

                        <option value="">
                            All Entity Types
                        </option>


                        {entityOptions.map(
                            option => (

                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {
                                        option.label
                                    }
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* CLEAR */}

                {hasActiveFilters && (

                    <button
                        type="button"
                        className="admin-audit-clear-button"
                        onClick={
                            handleClearFilters
                        }
                    >
                        Clear Filters
                    </button>

                )}

            </section>


            {/* =================================================
                TABLE CARD
            ================================================= */}

            <section className="admin-audit-table-card">


                {/* TABLE HEADER */}

                <div className="admin-audit-table-header">

                    <div>

                        <h2>
                            Activity History
                        </h2>


                        <p>
                            Recent actions recorded by the system.
                        </p>

                    </div>


                    <div className="admin-audit-total">

                        {totalElements}{' '}
                        {totalElements === 1
                            ? 'event'
                            : 'events'
                        }

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="admin-audit-loading">

                        <div className="admin-audit-spinner" />

                        <span>
                            Loading audit logs...
                        </span>

                    </div>

                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (

                    <div className="admin-audit-error">

                        <strong>
                            Unable to load audit logs
                        </strong>


                        <p>
                            {error}
                        </p>


                        <button
                            type="button"
                            onClick={
                                fetchAuditLogs
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    auditLogs.length === 0 && (

                        <div className="admin-audit-empty-state">

                            <div className="admin-audit-empty-icon">
                                i
                            </div>


                            <h3>
                                No audit logs found
                            </h3>


                            <p>

                                {hasActiveFilters
                                    ? 'No audit events match the selected filters.'
                                    : 'There are no audit events available yet.'
                                }

                            </p>


                            {hasActiveFilters && (

                                <button
                                    type="button"
                                    onClick={
                                        handleClearFilters
                                    }
                                >
                                    Clear Filters
                                </button>

                            )}

                        </div>

                    )}


                {/* =================================================
                    DESKTOP TABLE
                ================================================= */}

                {!loading &&
                    !error &&
                    auditLogs.length > 0 && (

                        <div className="admin-audit-table-wrapper">

                            <table className="admin-audit-table">

                                <thead>

                                <tr>

                                    <th>
                                        Date & Time
                                    </th>


                                    <th>
                                        Actor
                                    </th>


                                    <th>
                                        Action
                                    </th>


                                    <th>
                                        Entity
                                    </th>


                                    <th>
                                        Description
                                    </th>


                                    <th>
                                        Changes
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {auditLogs.map(
                                    log => (

                                        <tr
                                            key={
                                                log.id
                                            }
                                            className="admin-audit-row"
                                            onClick={() =>
                                                handleOpenDetails(
                                                    log
                                                )
                                            }
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={event => {

                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {

                                                    event.preventDefault()

                                                    handleOpenDetails(
                                                        log
                                                    )
                                                }

                                            }}
                                        >

                                            {/* DATE */}

                                            <td>

                                                <div className="admin-audit-date">

                                                    <strong>
                                                        {
                                                            formatDateTime(
                                                                log.createdAt
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </td>


                                            {/* ACTOR */}

                                            <td>

                                                <div className="admin-audit-actor">

                                                    <strong>
                                                        {
                                                            log.actorName ||
                                                            'System'
                                                        }
                                                    </strong>


                                                    {log.actorEmail && (

                                                        <small>
                                                            {
                                                                log.actorEmail
                                                            }
                                                        </small>

                                                    )}


                                                    {log.actorRole && (

                                                        <span className="admin-audit-role">

                                                            {
                                                                formatEntity(
                                                                    log.actorRole
                                                                )
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <span
                                                    className={
                                                        `admin-audit-action-badge ${getActionCategory(
                                                            log.action
                                                        )}`
                                                    }
                                                >

                                                    {
                                                        formatAction(
                                                            log.action
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* ENTITY */}

                                            <td>

                                                <div className="admin-audit-entity">

                                                    <strong>
                                                        {
                                                            formatEntity(
                                                                log.entityType
                                                            )
                                                        }
                                                    </strong>


                                                    {log.entityId && (

                                                        <small
                                                            title={
                                                                log.entityId
                                                            }
                                                        >
                                                            {
                                                                log.entityId
                                                            }
                                                        </small>

                                                    )}

                                                </div>

                                            </td>


                                            {/* DESCRIPTION */}

                                            <td>

                                                <div className="admin-audit-description">

                                                    {
                                                        log.description ||
                                                        '—'
                                                    }

                                                </div>

                                            </td>


                                            {/* CHANGES */}

                                            <td>

                                                <div className="admin-audit-changes">

                                                    {log.oldValue && (

                                                        <small>

                                                            <span>
                                                                From
                                                            </span>

                                                            {
                                                                log.oldValue
                                                            }

                                                        </small>

                                                    )}


                                                    {log.newValue && (

                                                        <small>

                                                            <span>
                                                                To
                                                            </span>

                                                            {
                                                                log.newValue
                                                            }

                                                        </small>

                                                    )}


                                                    {!log.oldValue &&
                                                        !log.newValue && (

                                                            <span>
                                                                —
                                                            </span>

                                                        )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </section>


            {/* =================================================
                MOBILE ACTIVITY LIST
            ================================================= */}

            {!loading &&
                !error &&
                auditLogs.length > 0 && (

                    <section className="admin-audit-mobile-list">

                        {auditLogs.map(
                            log => (

                                <button
                                    key={
                                        `mobile-${log.id}`
                                    }
                                    type="button"
                                    className="admin-audit-mobile-card"
                                    onClick={() =>
                                        handleOpenDetails(
                                            log
                                        )
                                    }
                                >

                                    <div className="admin-audit-mobile-top">

                                        <span
                                            className={
                                                `admin-audit-action-badge ${getActionCategory(
                                                    log.action
                                                )}`
                                            }
                                        >
                                            {
                                                formatAction(
                                                    log.action
                                                )
                                            }
                                        </span>


                                        <span>
                                            →
                                        </span>

                                    </div>


                                    <strong>

                                        {
                                            log.actorName ||
                                            'System'
                                        }

                                    </strong>


                                    <span>

                                        {
                                            formatEntity(
                                                log.entityType
                                            )
                                        }

                                        {' • '}

                                        {
                                            log.entityId
                                                ? log.entityId
                                                : 'No entity ID'
                                        }

                                    </span>


                                    <small>

                                        {
                                            formatDateTime(
                                                log.createdAt
                                            )
                                        }

                                    </small>

                                </button>

                            )
                        )}

                    </section>

                )}


            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading &&
                !error &&
                totalElements > 0 && (

                    <section className="admin-audit-pagination">

                        <span>

                            Showing{' '}

                            <strong>
                                {
                                    auditLogs.length
                                }
                            </strong>

                            {' '}of{' '}

                            <strong>
                                {
                                    totalElements
                                }
                            </strong>

                            {' '}audit logs

                        </span>


                        <div>

                            <button
                                type="button"
                                onClick={
                                    handlePrevious
                                }
                                disabled={
                                    page === 0 ||
                                    loading
                                }
                            >
                                Previous
                            </button>


                            <span className="admin-audit-page-number">

                                {totalPages === 0
                                    ? 0
                                    : page + 1
                                }

                                {' / '}

                                {
                                    totalPages
                                }

                            </span>


                            <button
                                type="button"
                                onClick={
                                    handleNext
                                }
                                disabled={
                                    loading ||
                                    totalPages === 0 ||
                                    page >= totalPages - 1
                                }
                            >
                                Next
                            </button>

                        </div>

                    </section>

                )}


            {/* =================================================
                DETAILS DRAWER
            ================================================= */}

            {selectedLog && (

                <div
                    className="admin-audit-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            handleCloseDetails()
                        }

                    }}
                >

                    <aside
                        className="admin-audit-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Audit event details"
                    >

                        {/* DRAWER HEADER */}

                        <div className="admin-audit-drawer-header">

                            <div>

                                <p>
                                    AUDIT EVENT
                                </p>


                                <h2>
                                    Event Details
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="admin-audit-close"
                                onClick={
                                    handleCloseDetails
                                }
                                aria-label="Close audit event details"
                            >
                                ×
                            </button>

                        </div>


                        {/* DRAWER CONTENT */}

                        <div className="admin-audit-drawer-content">


                            {/* ACTION */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Action
                                </span>


                                <div>

                                    <span
                                        className={
                                            `admin-audit-action-badge large ${getActionCategory(
                                                selectedLog.action
                                            )}`
                                        }
                                    >
                                        {
                                            formatAction(
                                                selectedLog.action
                                            )
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* ACTOR */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Performed By
                                </span>


                                <div className="admin-audit-detail-main">

                                    <strong>
                                        {
                                            selectedLog.actorName ||
                                            'System'
                                        }
                                    </strong>


                                    {selectedLog.actorRole && (

                                        <small>
                                            Role:{' '}
                                            {
                                                formatEntity(
                                                    selectedLog.actorRole
                                                )
                                            }
                                        </small>

                                    )}


                                    {selectedLog.actorEmail && (

                                        <small>
                                            {
                                                selectedLog.actorEmail
                                            }
                                        </small>

                                    )}

                                </div>

                            </div>


                            {/* ENTITY */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Resource
                                </span>


                                <div className="admin-audit-detail-main">

                                    <strong>
                                        {
                                            formatEntity(
                                                selectedLog.entityType
                                            )
                                        }
                                    </strong>


                                    {selectedLog.entityId && (

                                        <div className="admin-audit-copy-row">

                                            <code>
                                                {
                                                    selectedLog.entityId
                                                }
                                            </code>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        selectedLog.entityId
                                                    )
                                                }
                                            >
                                                Copy
                                            </button>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Description
                                </span>


                                <p className="admin-audit-detail-text">

                                    {
                                        selectedLog.description ||
                                        '—'
                                    }

                                </p>

                            </div>


                            {/* OLD VALUE */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Previous Value
                                </span>


                                <div className="admin-audit-value-box">

                                    {
                                        selectedLog.oldValue ||
                                        'No previous value recorded'
                                    }

                                </div>

                            </div>


                            {/* NEW VALUE */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    New Value
                                </span>


                                <div className="admin-audit-value-box">

                                    {
                                        selectedLog.newValue ||
                                        'No new value recorded'
                                    }

                                </div>

                            </div>


                            {/* IP */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    IP Address
                                </span>


                                <p className="admin-audit-detail-text">

                                    {
                                        selectedLog.ipAddress ||
                                        'Not recorded'
                                    }

                                </p>

                            </div>


                            {/* TIMESTAMP */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Timestamp
                                </span>


                                <p className="admin-audit-detail-text">

                                    {
                                        formatDateTime(
                                            selectedLog.createdAt
                                        )
                                    }

                                </p>

                            </div>


                            {/* AUDIT ID */}

                            <div className="admin-audit-detail-section">

                                <span>
                                    Audit Event ID
                                </span>


                                <div className="admin-audit-copy-row">

                                    <code>
                                        {
                                            selectedLog.id ||
                                            '—'
                                        }
                                    </code>


                                    {selectedLog.id && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCopy(
                                                    selectedLog.id
                                                )
                                            }
                                        >
                                            Copy
                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* DRAWER FOOTER */}

                        <div className="admin-audit-drawer-footer">

                            <button
                                type="button"
                                onClick={
                                    handleCloseDetails
                                }
                            >
                                Close
                            </button>

                        </div>

                    </aside>

                </div>

            )}

        </div>
    )
}

export default AdminAuditLogsPage