import { useEffect, useState } from 'react'
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


    // =====================================================
    // FETCH AUDIT LOGS
    // =====================================================

    const fetchAuditLogs = async () => {

        try {

            setLoading(true)

            setError('')


            const token =
                localStorage.getItem('token')


            const params =
                new URLSearchParams()


            params.append(
                'page',
                page
            )

            params.append(
                'size',
                PAGE_SIZE
            )


            // Search
            if (keyword.trim()) {

                params.append(
                    'keyword',
                    keyword.trim()
                )
            }


            // Action filter
            if (action) {

                params.append(
                    'action',
                    action
                )
            }


            // Entity filter
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
                            'Authorization':
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


                throw new Error(
                    'Failed to fetch audit logs.'
                )
            }


            const data =
                await response.json()


            setAuditLogs(
                data.content || []
            )


            setTotalPages(
                data.totalPages || 0
            )


            setTotalElements(
                data.totalElements || 0
            )

        } catch (err) {

            console.error(
                'Error fetching audit logs:',
                err
            )


            setError(
                err.message ||
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
    // LOAD AUDIT LOGS
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
    // SEARCH CHANGE
    // =====================================================

    const handleSearchChange = (event) => {

        setKeyword(
            event.target.value
        )

        setPage(0)
    }


    // =====================================================
    // ACTION CHANGE
    // =====================================================

    const handleActionChange = (event) => {

        setAction(
            event.target.value
        )

        setPage(0)
    }


    // =====================================================
    // ENTITY TYPE CHANGE
    // =====================================================

    const handleEntityTypeChange = (event) => {

        setEntityType(
            event.target.value
        )

        setPage(0)
    }


    // =====================================================
    // PREVIOUS PAGE
    // =====================================================

    const handlePrevious = () => {

        if (page > 0 && !loading) {

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
    // FORMAT DATE & TIME
    // =====================================================

    const formatDateTime = (
        dateTime
    ) => {

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
                minute: '2-digit'
            }
        )
    }


    // =====================================================
    // FORMAT ACTION
    // =====================================================

    const formatAction = (
        value
    ) => {

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
    // FORMAT ENTITY
    // =====================================================

    const formatEntity = (
        value
    ) => {

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
    // CLEAR FILTERS
    // =====================================================

    const handleClearFilters = () => {

        setKeyword('')

        setAction('')

        setEntityType('')

        setPage(0)
    }


    // =====================================================
    // CHECK ACTIVE FILTERS
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


            {/* =========================================
                HEADER
            ========================================= */}

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


            {/* =========================================
                FILTER BAR
            ========================================= */}

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


                        <option value="LOGIN">
                            Login
                        </option>


                        <option value="LOGOUT">
                            Logout
                        </option>


                        <option value="PASSWORD_CHANGED">
                            Password Changed
                        </option>


                        <option value="USER_CREATED">
                            User Created
                        </option>


                        <option value="USER_UPDATED">
                            User Updated
                        </option>


                        <option value="USER_STATUS_CHANGED">
                            User Status Changed
                        </option>


                        <option value="USER_DELETED">
                            User Deleted
                        </option>


                        <option value="ISSUE_CREATED">
                            Issue Created
                        </option>


                        <option value="ISSUE_UPDATED">
                            Issue Updated
                        </option>


                        <option value="ISSUE_STATUS_CHANGED">
                            Issue Status Changed
                        </option>


                        <option value="ISSUE_ASSIGNED">
                            Issue Assigned
                        </option>


                        <option value="ISSUE_DELETED">
                            Issue Deleted
                        </option>

                    </select>

                </div>


                {/* ENTITY TYPE */}

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


                        <option value="USER">
                            User
                        </option>


                        <option value="ISSUE">
                            Issue
                        </option>

                    </select>

                </div>


                {/* CLEAR */}

                {hasActiveFilters && (

                    <button
                        type="button"
                        onClick={
                            handleClearFilters
                        }
                    >
                        Clear
                    </button>

                )}

            </section>


            {/* =========================================
                TABLE CARD
            ========================================= */}

            <section className="admin-audit-table-card">


                <div className="admin-audit-table-header">

                    <div>

                        <h2>
                            Activity History
                        </h2>


                        <p>
                            Recent actions recorded by the system.
                        </p>

                    </div>

                </div>


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading && (

                    <div className="admin-audit-loading">

                        Loading audit logs...

                    </div>

                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {!loading && error && (

                    <div className="admin-audit-empty">

                        {error}

                    </div>

                )}


                {/* =====================================
                    TABLE
                ===================================== */}

                {!loading && !error && (

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

                            {auditLogs.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="admin-audit-empty"
                                    >

                                        {hasActiveFilters
                                            ? 'No audit logs match your filters.'
                                            : 'No audit logs found.'
                                        }

                                    </td>

                                </tr>

                            ) : (

                                auditLogs.map(
                                    log => (

                                        <tr
                                            key={log.id}
                                        >


                                            {/* DATE */}

                                            <td>

                                                {formatDateTime(
                                                    log.createdAt
                                                )}

                                            </td>


                                            {/* ACTOR */}

                                            <td>

                                                <div>

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

                                                </div>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                {formatAction(
                                                    log.action
                                                )}

                                            </td>


                                            {/* ENTITY */}

                                            <td>

                                                <div>

                                                    <strong>
                                                        {formatEntity(
                                                            log.entityType
                                                        )}
                                                    </strong>


                                                    {log.entityId && (

                                                        <small>
                                                            {
                                                                log.entityId
                                                            }
                                                        </small>

                                                    )}

                                                </div>

                                            </td>


                                            {/* DESCRIPTION */}

                                            <td>

                                                {
                                                    log.description ||
                                                    '—'
                                                }

                                            </td>


                                            {/* CHANGES */}

                                            <td>

                                                {(
                                                    log.oldValue ||
                                                    log.newValue
                                                ) ? (

                                                    <div>

                                                        {log.oldValue && (

                                                            <small>
                                                                From:{' '}
                                                                {
                                                                    log.oldValue
                                                                }
                                                            </small>

                                                        )}


                                                        {log.newValue && (

                                                            <small>
                                                                To:{' '}
                                                                {
                                                                    log.newValue
                                                                }
                                                            </small>

                                                        )}

                                                    </div>

                                                ) : (

                                                    '—'

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =========================================
                PAGINATION
            ========================================= */}

            <section className="admin-audit-pagination">


                <span>

                    Showing{' '}
                    {auditLogs.length}{' '}
                    of{' '}
                    {totalElements}{' '}
                    audit logs

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

        </div>
    )
}

export default AdminAuditLogsPage