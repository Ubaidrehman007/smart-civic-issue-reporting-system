import { useEffect, useMemo, useState } from 'react'
import {
    useNavigate,
    useParams,
} from 'react-router-dom'

import {
    getIssueById,
    getIssueStatusHistory,
    updateIssueStatus,
} from '../../api/issueApi'

import '../../styles/workerCSS/fieldWorkerIssueDetails.css'


function FieldWorkerIssueDetailsPage() {

    const { issueId } = useParams()
    const navigate = useNavigate()

    const [issue, setIssue] = useState(null)
    const [statusHistory, setStatusHistory] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [statusError, setStatusError] = useState('')


    // =====================================================
    // LOAD ISSUE DETAILS + STATUS HISTORY
    // =====================================================

    useEffect(() => {

        const loadIssueDetails = async () => {

            try {

                setLoading(true)
                setError('')

                const [
                    issueResponse,
                    historyResponse,
                ] = await Promise.all([
                    getIssueById(issueId),
                    getIssueStatusHistory(issueId),
                ])

                setIssue(issueResponse)

                setStatusHistory(
                    Array.isArray(historyResponse)
                        ? historyResponse
                        : historyResponse?.content || []
                )

            } catch (err) {

                console.error(
                    'Failed to load field worker issue details:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Failed to load issue details.'
                )

            } finally {

                setLoading(false)

            }
        }


        if (issueId) {
            loadIssueDetails()
        }

    }, [issueId])


    // =====================================================
    // SLA INFORMATION
    // =====================================================

    const slaInfo = useMemo(() => {

        if (!issue?.slaDueAt) {

            return {
                label: 'No SLA deadline',
                type: 'neutral',
                remaining: null,
            }

        }


        const deadline = new Date(issue.slaDueAt)
        const now = new Date()

        const difference =
            deadline.getTime() - now.getTime()


        if (
            issue.slaBreached === true ||
            difference <= 0
        ) {

            return {
                label: 'SLA Breached',
                type: 'danger',
                remaining: null,
            }

        }


        const totalMinutes =
            Math.floor(difference / (1000 * 60))

        const days =
            Math.floor(totalMinutes / (60 * 24))

        const hours =
            Math.floor(
                (totalMinutes % (60 * 24)) / 60
            )

        const minutes =
            totalMinutes % 60


        if (days > 0) {

            return {
                label: 'On Track',
                type: 'safe',
                remaining:
                    `${days}d ${hours}h remaining`,
            }

        }


        if (hours > 0) {

            return {
                label: 'Due Soon',
                type: 'warning',
                remaining:
                    `${hours}h ${minutes}m remaining`,
            }

        }


        return {
            label: 'Due Soon',
            type: 'warning',
            remaining:
                `${minutes}m remaining`,
        }

    }, [issue])


    // =====================================================
    // DATE FORMATTER
    // =====================================================

    const formatDateTime = (value) => {

        if (!value) {
            return '—'
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
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
            }
        )
    }


    // =====================================================
    // STATUS FORMATTER
    // =====================================================

    const formatStatus = (status) => {

        if (!status) {
            return '—'
        }

        return status
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(
                /\b\w/g,
                char => char.toUpperCase()
            )
    }


    // =====================================================
    // UPDATE ISSUE STATUS
    // =====================================================

    const handleStatusUpdate = async (newStatus) => {

        if (!issue?.id || updatingStatus) {
            return
        }


        /*
         * Frontend transition guard.
         *
         * Backend validation is still the final authority.
         */

        const allowedTransitions = {

            REPORTED: 'UNDER_REVIEW',

            UNDER_REVIEW: 'IN_PROGRESS',

            IN_PROGRESS: 'RESOLVED',

        }


        if (
            allowedTransitions[issue.status] !== newStatus
        ) {

            setStatusError(
                `Invalid status transition: ${formatStatus(issue.status)} → ${formatStatus(newStatus)}`
            )

            return
        }


        const confirmationMessage =
            newStatus === 'IN_PROGRESS'
                ? 'Are you sure you want to start working on this issue?'
                : 'Are you sure you want to mark this issue as resolved?'


        const confirmed =
            window.confirm(confirmationMessage)


        if (!confirmed) {
            return
        }


        try {

            setUpdatingStatus(true)

            setStatusMessage('')
            setStatusError('')


            const response =
                await updateIssueStatus({
                    issueId: issue.id,
                    status: newStatus,
                })


            /*
             * Depending on ApiResponse structure,
             * updated issue may be inside response.data.
             */

            const updatedIssue =
                response?.data?.status
                    ? response.data
                    : response?.status
                        ? response
                        : null


            /*
             * Update current issue immediately.
             *
             * If backend response does not contain
             * the complete issue object, preserve
             * existing issue information.
             */

            setIssue(
                updatedIssue
                    ? {
                        ...issue,
                        ...updatedIssue,
                    }
                    : {
                        ...issue,
                        status: newStatus,
                    }
            )


            /*
             * Refresh status history so the newly
             * created transition appears immediately.
             */

            const historyResponse =
                await getIssueStatusHistory(issue.id)


            setStatusHistory(
                Array.isArray(historyResponse)
                    ? historyResponse
                    : historyResponse?.content || []
            )


            setStatusMessage(
                `Issue status updated to ${formatStatus(newStatus)}.`
            )

        } catch (err) {

            console.error(
                'Failed to update issue status:',
                err
            )


            setStatusError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Unable to update issue status.'
            )

        } finally {

            setUpdatingStatus(false)

        }

    }


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {

        return (
            <div className="worker-issue-details">

                <div className="worker-issue-loading">

                    <div className="worker-issue-spinner"></div>

                    <p>
                        Loading issue details...
                    </p>

                </div>

            </div>
        )
    }


    // =====================================================
    // ERROR STATE
    // =====================================================

    if (error || !issue) {

        return (
            <div className="worker-issue-details">

                <button
                    type="button"
                    className="worker-back-btn"
                    onClick={() =>
                        navigate('/worker/dashboard')
                    }
                >
                    ← Back to Dashboard
                </button>


                <div className="worker-issue-error">

                    <div className="worker-error-icon">
                        !
                    </div>

                    <div>

                        <h2>
                            Unable to load issue
                        </h2>

                        <p>
                            {error || 'Issue not found.'}
                        </p>

                    </div>

                </div>

            </div>
        )
    }


    return (

        <div className="worker-issue-details">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="worker-issue-header">

                <div>

                    <button
                        type="button"
                        className="worker-back-btn"
                        onClick={() =>
                            navigate('/worker/dashboard')
                        }
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="worker-issue-heading">

                        <div>

                            <span className="worker-issue-eyebrow">
                                FIELD ASSIGNMENT
                            </span>

                            <h1>
                                {issue.title}
                            </h1>

                            <span className="worker-issue-id">
                                Issue ID: {issue.id}
                            </span>

                        </div>


                        <span
                            className={`worker-detail-status status-${issue.status?.toLowerCase()}`}
                        >
                            {formatStatus(issue.status)}
                        </span>

                    </div>

                </div>

            </header>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="worker-issue-grid">


                {/* =================================================
                    ISSUE INFORMATION
                ================================================= */}

                <section className="worker-detail-card worker-detail-main">

                    <div className="worker-detail-card-header">

                        <div>
                            <h2>Issue Information</h2>
                            <p>Reported civic issue details.</p>
                        </div>

                    </div>


                    {issue.imageUrl && (

                        <div className="worker-issue-image-wrapper">

                            <img
                                src={`http://localhost:8080/api/images/${encodeURIComponent(issue.imageUrl)}`}
                                alt={issue.title}
                                className="worker-issue-image"
                            />

                        </div>

                    )}


                    <div className="worker-detail-description">

                        <span>Description</span>

                        <p>
                            {issue.description ||
                                'No description provided.'}
                        </p>

                    </div>


                    <div className="worker-detail-fields">

                        <div className="worker-detail-field">

                            <span>Category</span>

                            <strong>
                                {formatStatus(issue.category)}
                            </strong>

                        </div>


                        <div className="worker-detail-field">

                            <span>Priority</span>

                            <strong
                                className={`priority-${issue.priority?.toLowerCase()}`}
                            >
                                {formatStatus(issue.priority)}
                            </strong>

                        </div>


                        <div className="worker-detail-field">

                            <span>Reported</span>

                            <strong>
                                {formatDateTime(issue.createdAt)}
                            </strong>

                        </div>


                        <div className="worker-detail-field">

                            <span>Last Updated</span>

                            <strong>
                                {formatDateTime(issue.updatedAt)}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SLA
                ================================================= */}

                <section className="worker-detail-card">

                    <div className="worker-detail-card-header">

                        <div>
                            <h2>SLA</h2>
                            <p>Service level information.</p>
                        </div>

                    </div>


                    <div
                        className={`worker-sla-panel sla-${slaInfo.type}`}
                    >

                        <div className="worker-sla-status">

                            <span>
                                SLA Status
                            </span>

                            <strong>
                                {slaInfo.label}
                            </strong>

                        </div>


                        {slaInfo.remaining && (

                            <div className="worker-sla-remaining">

                                <span>
                                    Time Remaining
                                </span>

                                <strong>
                                    {slaInfo.remaining}
                                </strong>

                            </div>

                        )}

                    </div>


                    <div className="worker-detail-fields worker-detail-fields-single">

                        <div className="worker-detail-field">

                            <span>
                                Deadline
                            </span>

                            <strong>
                                {formatDateTime(
                                    issue.slaDueAt
                                )}
                            </strong>

                        </div>


                        {issue.slaBreachedAt && (

                            <div className="worker-detail-field">

                                <span>
                                    Breached At
                                </span>

                                <strong>
                                    {formatDateTime(
                                        issue.slaBreachedAt
                                    )}
                                </strong>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    LOCATION
                ================================================= */}

                <section className="worker-detail-card">

                    <div className="worker-detail-card-header">

                        <div>
                            <h2>Location</h2>
                            <p>Reported issue location.</p>
                        </div>

                    </div>


                    <div className="worker-location-address">

                        <span>
                            Address
                        </span>

                        <strong>
                            {issue.address ||
                                'Address unavailable'}
                        </strong>

                    </div>


                    <div className="worker-coordinate-grid">

                        <div>

                            <span>
                                Latitude
                            </span>

                            <strong>
                                {issue.latitude ?? '—'}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Longitude
                            </span>

                            <strong>
                                {issue.longitude ?? '—'}
                            </strong>

                        </div>

                    </div>


                    {issue.latitude != null &&
                        issue.longitude != null && (

                            <a
                                href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="worker-map-btn"
                            >
                                Open Location in Maps
                                <span>↗</span>
                            </a>

                        )}

                </section>


                {/* =================================================
                    ASSIGNMENT
                ================================================= */}

                <section className="worker-detail-card">

                    <div className="worker-detail-card-header">

                        <div>
                            <h2>Assignment</h2>
                            <p>Current assignment information.</p>
                        </div>

                    </div>


                    <div className="worker-assignee">

                        <div className="worker-assignee-avatar">
                            {issue.assignedToName
                                ?.charAt(0)
                                ?.toUpperCase() || 'W'}
                        </div>


                        <div>

                            <strong>
                                {issue.assignedToName ||
                                    'Assigned Worker'}
                            </strong>

                            <span>
                                {issue.assignedToEmail ||
                                    'Email unavailable'}
                            </span>

                        </div>

                    </div>


                    <div className="worker-detail-field">

                        <span>
                            Assigned Worker ID
                        </span>

                        <strong className="worker-id-value">
                            {issue.assignedToId || '—'}
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    WORK ACTION
                ================================================= */}

                <section className="worker-detail-card worker-work-action-card">

                    <div className="worker-detail-card-header">

                        <div>

                            <h2>
                                Work Action
                            </h2>

                            <p>
                                Update the issue status as you complete the work.
                            </p>

                        </div>

                    </div>


                    {/* SUCCESS MESSAGE */}

                    {statusMessage && (

                        <div className="worker-status-success">

                            <span>
                                ✓
                            </span>

                            {statusMessage}

                        </div>

                    )}


                    {/* ERROR MESSAGE */}

                    {statusError && (

                        <div className="worker-status-error">

                            <span>
                                !
                            </span>

                            {statusError}

                        </div>

                    )}

                    {/* =================================================
    ASSIGNED ISSUE → UNDER REVIEW
================================================= */}

                    {issue.status === 'REPORTED' &&
                        issue.assignedToId && (

                            <div className="worker-action-content">

                                <div>

                                    <strong>
                                        New Assignment
                                    </strong>

                                    <p>
                                        Review this assigned issue before
                                        starting the work.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="worker-action-btn worker-review-btn"
                                    disabled={updatingStatus}
                                    onClick={() =>
                                        handleStatusUpdate(
                                            'UNDER_REVIEW'
                                        )
                                    }
                                >

                                    {updatingStatus
                                        ? 'Updating...'
                                        : 'Review Issue'}

                                </button>

                            </div>

                        )}

                    {/* =================================================
                        UNDER REVIEW → IN PROGRESS
                    ================================================= */}

                    {issue.status === 'UNDER_REVIEW' && (

                        <div className="worker-action-content">

                            <div>

                                <strong>
                                    Ready to start work
                                </strong>

                                <p>
                                    Start working on this assigned issue
                                    to move it into progress.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="worker-action-btn worker-start-btn"
                                disabled={updatingStatus}
                                onClick={() =>
                                    handleStatusUpdate(
                                        'IN_PROGRESS'
                                    )
                                }
                            >

                                {updatingStatus
                                    ? 'Updating...'
                                    : 'Start Work'}

                            </button>

                        </div>

                    )}


                    {/* =================================================
                        IN PROGRESS → RESOLVED
                    ================================================= */}

                    {issue.status === 'IN_PROGRESS' && (

                        <div className="worker-action-content">

                            <div>

                                <strong>
                                    Work in progress
                                </strong>

                                <p>
                                    Once the civic issue has been fixed,
                                    mark the issue as resolved.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="worker-action-btn worker-resolve-btn"
                                disabled={updatingStatus}
                                onClick={() =>
                                    handleStatusUpdate(
                                        'RESOLVED'
                                    )
                                }
                            >

                                {updatingStatus
                                    ? 'Updating...'
                                    : 'Mark as Resolved'}

                            </button>

                        </div>

                    )}


                    {/* =================================================
                        RESOLVED
                    ================================================= */}

                    {issue.status === 'RESOLVED' && (

                        <div className="worker-completed-action">

                            <div className="worker-completed-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Issue Resolved
                                </strong>

                                <p>
                                    This issue has already been marked
                                    as resolved. No further action is required.
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        OTHER STATUS
                    ================================================= */}

                    {!(
                        (
                            issue.status === 'REPORTED' &&
                            issue.assignedToId
                        ) ||
                        issue.status === 'UNDER_REVIEW' ||
                        issue.status === 'IN_PROGRESS' ||
                        issue.status === 'RESOLVED'
                    ) && (

                        <div className="worker-no-action">

                            <strong>
                                No worker action available
                            </strong>

                            <p>
                                The current issue status does not
                                allow a field worker action.
                            </p>

                        </div>

                    )}

                </section>


                {/* =================================================
                    STATUS HISTORY
                ================================================= */}

                <section className="worker-detail-card worker-status-history-card">

                    <div className="worker-detail-card-header">

                        <div>
                            <h2>Status History</h2>
                            <p>Issue status transition timeline.</p>
                        </div>

                    </div>


                    {statusHistory.length === 0 ? (

                        <div className="worker-history-empty">

                            <span>
                                No status history available.
                            </span>

                        </div>

                    ) : (

                        <div className="worker-history">

                            {statusHistory.map(
                                (history, index) => (

                                    <div
                                        key={
                                            history.id ||
                                            index
                                        }
                                        className="worker-history-item"
                                    >

                                        <div className="worker-history-line">

                                            <div className="worker-history-dot"></div>

                                            {index <
                                                statusHistory.length - 1 && (
                                                    <div className="worker-history-connector"></div>
                                                )}

                                        </div>


                                        <div className="worker-history-content">

                                            <div className="worker-history-title">

                                                <strong>
                                                    {history.fromStatus
                                                        ? formatStatus(
                                                            history.fromStatus
                                                        )
                                                        : 'Issue Created'}
                                                </strong>

                                                <span>
                                                    →
                                                </span>

                                                <strong>
                                                    {formatStatus(
                                                        history.toStatus
                                                    )}
                                                </strong>

                                            </div>


                                            <span className="worker-history-date">
                                                {formatDateTime(
                                                    history.changedAt
                                                )}
                                            </span>


                                            {history.remark && (

                                                <p>
                                                    {history.remark}
                                                </p>

                                            )}


                                            {history.changedByName && (

                                                <span className="worker-history-user">
                                                    Changed by{' '}
                                                    {history.changedByName}
                                                </span>

                                            )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    )}

                </section>

            </div>

        </div>
    )
}


export default FieldWorkerIssueDetailsPage