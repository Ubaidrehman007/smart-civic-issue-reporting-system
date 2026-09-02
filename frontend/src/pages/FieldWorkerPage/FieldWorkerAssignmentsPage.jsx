import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getAssignedIssues } from '../../api/issueApi'

import '../../styles/workerCSS/fieldWorkerAssignments.css'


function FieldWorkerAssignmentsPage() {

    const navigate = useNavigate()

    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [activeFilter, setActiveFilter] = useState('ALL')
    const [searchTerm, setSearchTerm] = useState('')


    // =====================================================
    // LOAD ASSIGNED ISSUES
    // =====================================================

    useEffect(() => {

        const loadAssignments = async () => {

            try {

                setLoading(true)
                setError('')

                const response = await getAssignedIssues({
                    page: 0,
                    size: 50,
                    sort: 'createdAt,desc',
                })

                /*
                 * Backend response may be paginated.
                 * Support both:
                 *
                 * response.content
                 * response
                 */

                const assignmentList =
                    Array.isArray(response)
                        ? response
                        : response?.content || []

                setIssues(assignmentList)

            } catch (err) {

                console.error(
                    'Failed to load assigned issues:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Failed to load assigned issues.'
                )

            } finally {

                setLoading(false)

            }
        }


        loadAssignments()

    }, [])


    // =====================================================
    // STATUS FILTER
    // =====================================================

    const filteredIssues = useMemo(() => {

        let result = [...issues]


        // -------------------------------------------------
        // STATUS FILTER
        // -------------------------------------------------

        if (activeFilter === 'PENDING') {

            result = result.filter(
                issue =>
                    issue.status === 'REPORTED'
            )

        }

        if (activeFilter === 'IN_PROGRESS') {

            result = result.filter(
                issue =>
                    issue.status === 'IN_PROGRESS' ||
                    issue.status === 'UNDER_REVIEW'
            )

        }

        if (activeFilter === 'COMPLETED') {

            result = result.filter(
                issue =>
                    issue.status === 'RESOLVED'
            )

        }


        // -------------------------------------------------
        // SEARCH
        // -------------------------------------------------

        const keyword =
            searchTerm.trim().toLowerCase()


        if (keyword) {

            result = result.filter(issue => {

                const title =
                    issue.title?.toLowerCase() || ''

                const category =
                    issue.category?.toLowerCase() || ''

                const description =
                    issue.description?.toLowerCase() || ''

                const issueId =
                    issue.id?.toString().toLowerCase() || ''


                return (
                    title.includes(keyword) ||
                    category.includes(keyword) ||
                    description.includes(keyword) ||
                    issueId.includes(keyword)
                )

            })

        }


        return result

    }, [
        issues,
        activeFilter,
        searchTerm,
    ])


    // =====================================================
    // HELPERS
    // =====================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return '—'
        }

        const date = new Date(dateValue)

        if (Number.isNaN(date.getTime())) {
            return '—'
        }

        return date.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }
        )
    }


    const formatStatus = (status) => {

        if (!status) {
            return 'Unknown'
        }

        return status
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            )
    }


    const formatPriority = (priority) => {

        if (!priority) {
            return '—'
        }

        return priority
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            )
    }


    // =====================================================
    // OPEN ISSUE
    // =====================================================

    const handleViewIssue = (issueId) => {

        navigate(
            `/worker/issues/${issueId}`
        )

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="worker-assignments-page">

                <div className="worker-page-header">

                    <div>

                        <h1>
                            My Assignments
                        </h1>

                        <p>
                            Manage and track your assigned civic issues.
                        </p>

                    </div>

                </div>


                <div className="worker-assignment-state">

                    <div className="worker-loading-spinner"></div>

                    <p>
                        Loading assignments...
                    </p>

                </div>

            </div>

        )

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="worker-assignments-page">

                <div className="worker-page-header">

                    <div>

                        <h1>
                            My Assignments
                        </h1>

                        <p>
                            Manage and track your assigned civic issues.
                        </p>

                    </div>

                </div>


                <div className="worker-assignment-state error">

                    <h3>
                        Unable to load assignments
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>

        )

    }


    return (

        <div className="worker-assignments-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="worker-page-header">

                <div>

                    <h1>
                        My Assignments
                    </h1>

                    <p>
                        View and manage the civic issues assigned to you.
                    </p>

                </div>


                <div className="worker-assignment-count">

                    <strong>
                        {issues.length}
                    </strong>

                    <span>
                        Total Assignments
                    </span>

                </div>

            </div>


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div className="worker-assignment-toolbar">

                <div className="worker-assignment-filters">

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
                            activeFilter === 'PENDING'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setActiveFilter('PENDING')
                        }
                    >
                        Pending
                    </button>


                    <button
                        type="button"
                        className={
                            activeFilter === 'IN_PROGRESS'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setActiveFilter('IN_PROGRESS')
                        }
                    >
                        In Progress
                    </button>


                    <button
                        type="button"
                        className={
                            activeFilter === 'COMPLETED'
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setActiveFilter('COMPLETED')
                        }
                    >
                        Completed
                    </button>

                </div>


                <div className="worker-assignment-search">

                    <input
                        type="text"
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                RESULTS
            ================================================= */}

            {filteredIssues.length === 0 ? (

                <div className="worker-assignment-state">

                    <div className="worker-empty-icon">
                        📋
                    </div>

                    <h3>
                        No assignments found
                    </h3>

                    <p>
                        No issues match the selected filter or search.
                    </p>

                </div>

            ) : (

                <div className="worker-assignment-list">

                    {filteredIssues.map(issue => (

                        <article
                            key={issue.id}
                            className="worker-assignment-card"
                        >

                            {/* ---------------------------------
                                CARD TOP
                            --------------------------------- */}

                            <div className="worker-assignment-card-top">

                                <div>

                                    <span className="worker-issue-id">

                                        #{String(issue.id).slice(0, 8)}

                                    </span>


                                    <h2>
                                        {issue.title || 'Untitled Issue'}
                                    </h2>

                                </div>


                                <span
                                    className={
                                        `worker-status-badge ` +
                                        `status-${issue.status?.toLowerCase()}`
                                    }
                                >
                                    {formatStatus(issue.status)}
                                </span>

                            </div>


                            {/* ---------------------------------
                                DESCRIPTION
                            --------------------------------- */}

                            <p className="worker-assignment-description">

                                {issue.description ||
                                    'No description available.'}

                            </p>


                            {/* ---------------------------------
                                META
                            --------------------------------- */}

                            <div className="worker-assignment-meta">

                                <div>

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {issue.category || '—'}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Priority
                                    </span>

                                    <strong
                                        className={
                                            `worker-priority ` +
                                            `priority-${issue.priority?.toLowerCase()}`
                                        }
                                    >
                                        {formatPriority(issue.priority)}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Assigned Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            issue.assignedAt ||
                                            issue.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* ---------------------------------
                                CARD ACTION
                            --------------------------------- */}

                            <div className="worker-assignment-card-footer">

                                <button
                                    type="button"
                                    className="worker-view-issue-btn"
                                    onClick={() =>
                                        handleViewIssue(
                                            issue.id
                                        )
                                    }
                                >
                                    View Issue
                                </button>

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </div>

    )

}


export default FieldWorkerAssignmentsPage