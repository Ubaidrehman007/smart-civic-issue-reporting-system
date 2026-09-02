import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getAssignedIssues } from '../../api/issueApi'

import '../../styles/workerCSS/fieldWorkerActiveIssues.css'


function FieldWorkerActiveIssuesPage() {

    const navigate = useNavigate()

    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    // =====================================================
    // LOAD ASSIGNED ISSUES
    // =====================================================

    useEffect(() => {

        const loadActiveIssues = async () => {

            try {

                setLoading(true)
                setError('')

                const response = await getAssignedIssues({
                    page: 0,
                    size: 50,
                    sort: 'createdAt,desc',
                })


                const assignmentList =
                    Array.isArray(response)
                        ? response
                        : response?.content || []


                setIssues(assignmentList)

            } catch (err) {

                console.error(
                    'Failed to load active issues:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Failed to load active issues.'
                )

            } finally {

                setLoading(false)

            }

        }


        loadActiveIssues()

    }, [])


    // =====================================================
    // ACTIVE ISSUES
    // =====================================================

    const activeIssues = useMemo(() => {

        return issues.filter(issue =>
            issue.status === 'UNDER_REVIEW' ||
            issue.status === 'IN_PROGRESS'
        )

    }, [issues])


    // =====================================================
    // HELPERS
    // =====================================================

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


    // =====================================================
    // OPEN ISSUE
    // =====================================================

    const handleOpenIssue = (issueId) => {

        navigate(
            `/worker/issues/${issueId}`
        )

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="worker-active-issues-page">

                <div className="worker-active-page-header">

                    <div>

                        <h1>
                            Active Issues
                        </h1>

                        <p>
                            Issues currently requiring your attention.
                        </p>

                    </div>

                </div>


                <div className="worker-active-state">

                    <div className="worker-active-spinner"></div>

                    <p>
                        Loading active issues...
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

            <div className="worker-active-issues-page">

                <div className="worker-active-page-header">

                    <div>

                        <h1>
                            Active Issues
                        </h1>

                        <p>
                            Issues currently requiring your attention.
                        </p>

                    </div>

                </div>


                <div className="worker-active-state worker-active-error">

                    <h3>
                        Unable to load active issues
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

        <div className="worker-active-issues-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="worker-active-page-header">

                <div>

                    <h1>
                        Active Issues
                    </h1>

                    <p>
                        Issues currently requiring your attention.
                    </p>

                </div>


                <div className="worker-active-count">

                    <strong>
                        {activeIssues.length}
                    </strong>

                    <span>
                        Active Issues
                    </span>

                </div>

            </div>


            {/* =================================================
                ACTIVE ISSUE LIST
            ================================================= */}

            {activeIssues.length === 0 ? (

                <div className="worker-active-state">

                    <div className="worker-active-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No active issues
                    </h3>

                    <p>
                        You currently have no issues requiring active work.
                    </p>

                </div>

            ) : (

                <div className="worker-active-issue-list">

                    {activeIssues.map(issue => (

                        <article
                            key={issue.id}
                            className="worker-active-issue-card"
                        >

                            {/* ---------------------------------
                                CARD HEADER
                            --------------------------------- */}

                            <div className="worker-active-card-header">

                                <div>

                                    <span className="worker-active-issue-id">

                                        #{String(issue.id).slice(0, 8)}

                                    </span>


                                    <h2>
                                        {issue.title || 'Untitled Issue'}
                                    </h2>

                                </div>


                                <span
                                    className={
                                        `worker-active-status ` +
                                        `active-status-${issue.status?.toLowerCase()}`
                                    }
                                >
                                    {formatStatus(issue.status)}
                                </span>

                            </div>


                            {/* ---------------------------------
                                DESCRIPTION
                            --------------------------------- */}

                            <p className="worker-active-description">

                                {issue.description ||
                                    'No description available.'}

                            </p>


                            {/* ---------------------------------
                                ISSUE INFORMATION
                            --------------------------------- */}

                            <div className="worker-active-info-grid">

                                <div className="worker-active-info-item">

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {issue.category || '—'}
                                    </strong>

                                </div>


                                <div className="worker-active-info-item">

                                    <span>
                                        Priority
                                    </span>

                                    <strong
                                        className={
                                            `worker-active-priority ` +
                                            `active-priority-${issue.priority?.toLowerCase()}`
                                        }
                                    >
                                        {formatPriority(issue.priority)}
                                    </strong>

                                </div>


                                <div className="worker-active-info-item">

                                    <span>
                                        Reported
                                    </span>

                                    <strong>
                                        {formatDate(
                                            issue.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* ---------------------------------
                                ACTION
                            --------------------------------- */}

                            <div className="worker-active-card-footer">

                                <button
                                    type="button"
                                    className="worker-active-open-btn"
                                    onClick={() =>
                                        handleOpenIssue(
                                            issue.id
                                        )
                                    }
                                >

                                    {issue.status === 'IN_PROGRESS'
                                        ? 'Continue Work'
                                        : 'Open Issue'}

                                </button>

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </div>

    )

}


export default FieldWorkerActiveIssuesPage