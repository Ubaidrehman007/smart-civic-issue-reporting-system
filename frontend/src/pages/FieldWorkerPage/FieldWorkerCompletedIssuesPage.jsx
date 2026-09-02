import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getAssignedIssues } from '../../api/issueApi'

import '../../styles/workerCSS/fieldWorkerCompletedIssues.css'


function FieldWorkerCompletedIssuesPage() {

    const navigate = useNavigate()

    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    // =====================================================
    // LOAD ASSIGNED ISSUES
    // =====================================================

    useEffect(() => {

        const loadCompletedIssues = async () => {

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
                    'Failed to load completed issues:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Failed to load completed issues.'
                )

            } finally {

                setLoading(false)

            }

        }

        loadCompletedIssues()

    }, [])


    // =====================================================
    // COMPLETED ISSUES
    // =====================================================

    const completedIssues = useMemo(() => {

        return issues.filter(
            issue => issue.status === 'RESOLVED'
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
            .replace(/\b\w/g, char => char.toUpperCase())

    }


    const formatPriority = (priority) => {

        if (!priority) {
            return '—'
        }

        return priority
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase())

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


    const getSlaResult = (issue) => {

        if (issue.slaBreached === true) {
            return {
                label: 'SLA Breached',
                className: 'completed-sla-breached',
            }
        }

        if (issue.slaDueAt) {
            return {
                label: 'Completed Within SLA',
                className: 'completed-sla-success',
            }
        }

        return {
            label: 'No SLA',
            className: 'completed-sla-neutral',
        }

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

            <div className="worker-completed-issues-page">

                <div className="worker-completed-page-header">

                    <div>

                        <h1>
                            Completed Issues
                        </h1>

                        <p>
                            Issues that you have successfully resolved.
                        </p>

                    </div>

                </div>


                <div className="worker-completed-state">

                    <div className="worker-completed-spinner"></div>

                    <p>
                        Loading completed issues...
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

            <div className="worker-completed-issues-page">

                <div className="worker-completed-page-header">

                    <div>

                        <h1>
                            Completed Issues
                        </h1>

                        <p>
                            Issues that you have successfully resolved.
                        </p>

                    </div>

                </div>


                <div className="worker-completed-state worker-completed-error">

                    <h3>
                        Unable to load completed issues
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

        <div className="worker-completed-issues-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="worker-completed-page-header">

                <div>

                    <h1>
                        Completed Issues
                    </h1>

                    <p>
                        Issues that you have successfully resolved.
                    </p>

                </div>


                <div className="worker-completed-count">

                    <strong>
                        {completedIssues.length}
                    </strong>

                    <span>
                        Completed
                    </span>

                </div>

            </div>


            {/* =================================================
                COMPLETED ISSUE LIST
            ================================================= */}

            {completedIssues.length === 0 ? (

                <div className="worker-completed-state">

                    <div className="worker-completed-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No completed issues
                    </h3>

                    <p>
                        You have not completed any assigned issues yet.
                    </p>

                </div>

            ) : (

                <div className="worker-completed-issue-list">

                    {completedIssues.map(issue => {

                        const slaResult =
                            getSlaResult(issue)

                        return (

                            <article
                                key={issue.id}
                                className="worker-completed-issue-card"
                            >

                                {/* =================================
                                    CARD HEADER
                                ================================= */}

                                <div className="worker-completed-card-header">

                                    <div>

                                        <span className="worker-completed-issue-id">

                                            #{String(issue.id).slice(0, 8)}

                                        </span>


                                        <h2>
                                            {issue.title || 'Untitled Issue'}
                                        </h2>

                                    </div>


                                    <span className="worker-completed-status">

                                        {formatStatus(issue.status)}

                                    </span>

                                </div>


                                {/* =================================
                                    DESCRIPTION
                                ================================= */}

                                <div className="completed-issue-description">

                                    {issue.description?.trim()
                                        ? issue.description
                                        : 'No description available.'
                                    }

                                </div>


                                {/* =================================
                                    INFORMATION
                                ================================= */}

                                <div className="worker-completed-info-grid">

                                    <div className="worker-completed-info-item">

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {issue.category || '—'}
                                        </strong>

                                    </div>


                                    <div className="worker-completed-info-item">

                                        <span>
                                            Priority
                                        </span>

                                        <strong
                                            className={
                                                `completed-priority ` +
                                                `completed-priority-${issue.priority?.toLowerCase()}`
                                            }
                                        >
                                            {formatPriority(issue.priority)}
                                        </strong>

                                    </div>


                                    <div className="worker-completed-info-item">

                               <span>
                                    Completed
                                  </span>

                                        <strong>
                                            {formatDate(issue.resolvedAt)}
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================
                                    SLA RESULT
                                ================================= */}

                                <div className="worker-completed-sla">

                                    <span>
                                        SLA Result
                                    </span>

                                    <strong
                                        className={slaResult.className}
                                    >
                                        {slaResult.label}
                                    </strong>

                                </div>


                                {/* =================================
                                    FOOTER
                                ================================= */}

                                <div className="worker-completed-card-footer">

                                    <button
                                        type="button"
                                        className="worker-completed-view-btn"
                                        onClick={() =>
                                            handleOpenIssue(
                                                issue.id
                                            )
                                        }
                                    >
                                        View Issue
                                    </button>

                                </div>

                            </article>

                        )

                    })}

                </div>

            )}

        </div>

    )

}


export default FieldWorkerCompletedIssuesPage