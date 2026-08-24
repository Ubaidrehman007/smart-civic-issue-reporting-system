import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    getIssueById,
    getIssueStatusHistory,
} from '../../api/issueApi.js'
import '../../styles/adminCSS/adminIssueDetails.css'

const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return null
    }

    return `${import.meta.env.VITE_API_BASE_URL}/api/images/${imageUrl}`
}

function AdminIssueDetailsPage() {

    const { issueId } = useParams()
    const navigate = useNavigate()

    const [issue, setIssue] = useState(null)
    const [statusHistory, setStatusHistory] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    /* =========================
       FETCH ISSUE DETAILS
    ========================= */

    useEffect(() => {

        const fetchIssueDetails = async () => {

            try {

                setLoading(true)
                setError('')

                const [issueResponse, historyResponse] =
                    await Promise.all([
                        getIssueById(issueId),
                        getIssueStatusHistory(issueId),
                    ])

                console.log(
                    'Admin issue details:',
                    issueResponse
                )

                console.log(
                    'Admin issue status history:',
                    historyResponse
                )

                setIssue(issueResponse)

                setStatusHistory(
                    historyResponse || []
                )

            } catch (err) {

                console.error(
                    'Failed to fetch issue details:',
                    err
                )

                setError(
                    err.response?.data?.message ||
                    'Failed to load issue details.'
                )

            } finally {

                setLoading(false)
            }
        }

        if (issueId) {
            fetchIssueDetails()
        }

    }, [issueId])


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="admin-issue-details-page">

                <div className="admin-issue-details-state">
                    Loading issue details...
                </div>

            </div>
        )
    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (
            <div className="admin-issue-details-page">

                <div className="admin-issue-details-error">

                    <h2>
                        Unable to load issue
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/issues')
                        }
                        className="admin-issue-back-button"
                    >
                        ← Back to Issues
                    </button>

                </div>

            </div>
        )
    }


    if (!issue) {

        return (
            <div className="admin-issue-details-page">

                <div className="admin-issue-details-error">

                    <h2>
                        Issue not found
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/issues')
                        }
                        className="admin-issue-back-button"
                    >
                        ← Back to Issues
                    </button>

                </div>

            </div>
        )
    }


    return (
        <div className="admin-issue-details-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-issue-details-header">

                <div>

                    <p className="admin-issue-details-eyebrow">
                        ISSUE MANAGEMENT
                    </p>

                    <h1>
                        Issue Details
                    </h1>

                    <p>
                        Review complete information about
                        this civic issue.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-issue-back-button"
                    onClick={() =>
                        navigate('/admin/issues')
                    }
                >
                    ← Back to Issues
                </button>

            </div>


            {/* =========================
                ISSUE HEADER CARD
            ========================= */}

            <div className="admin-issue-main-card">

                <div className="admin-issue-main-header">

                    <div>

                        <h2>
                            {issue.title}
                        </h2>

                        <p className="admin-issue-id">
                            #{issue.id}
                        </p>

                    </div>


                    <div className="admin-issue-badges">

                        <span
                            className={`admin-detail-status ${
                                issue.status?.toLowerCase()
                            }`}
                        >
                            {issue.status}
                        </span>

                        <span
                            className={`admin-detail-priority ${
                                issue.priority?.toLowerCase()
                            }`}
                        >
                            {issue.priority}
                        </span>

                    </div>

                </div>


                {/* =========================
                    BASIC INFORMATION
                ========================= */}

                <div className="admin-issue-information-grid">

                    <div className="admin-detail-field">

                        <span>
                            Category
                        </span>

                        <strong>
                            {issue.category || 'N/A'}
                        </strong>

                    </div>


                    <div className="admin-detail-field">

                        <span>
                            Reported By
                        </span>

                        <strong>
                            {issue.reportedBy || 'N/A'}
                        </strong>

                    </div>


                    <div className="admin-detail-field">

                        <span>
                            Created At
                        </span>

                        <strong>
                            {issue.createdAt
                                ? new Date(
                                    issue.createdAt
                                ).toLocaleString()
                                : 'N/A'
                            }
                        </strong>

                    </div>


                    <div className="admin-detail-field">

                        <span>
                            Updated At
                        </span>

                        <strong>
                            {issue.updatedAt
                                ? new Date(
                                    issue.updatedAt
                                ).toLocaleString()
                                : 'N/A'
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================
                DESCRIPTION
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <h2>
                        Description
                    </h2>

                </div>

                <div className="admin-detail-content">

                    <p>
                        {issue.description ||
                            'No description provided.'
                        }
                    </p>

                </div>

            </div>


            {/* =========================
                LOCATION
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <h2>
                        Location
                    </h2>

                </div>

                <div className="admin-detail-content">

                    <div className="admin-detail-location">

                        <div>

                            <span>
                                Address
                            </span>

                            <strong>
                                {issue.address || 'N/A'}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Latitude
                            </span>

                            <strong>
                                {issue.latitude ?? 'N/A'}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Longitude
                            </span>

                            <strong>
                                {issue.longitude ?? 'N/A'}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                ISSUE IMAGE
            ========================= */}

            {issue.imageUrl && (

                <div className="admin-detail-section">

                    <div className="admin-detail-section-header">

                        <h2>
                            Issue Image
                        </h2>

                    </div>

                    <div className="admin-issue-image-container">

                        <img
                            src={`http://localhost:8080/api/images/${encodeURIComponent(issue.imageUrl)}`}
                            alt={issue.title}
                            className="admin-issue-image"
                        />

                    </div>

                </div>

            )}


            {/* =========================
                STATUS HISTORY
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <div>

                        <h2>
                            Status History
                        </h2>

                        <p>
                            Complete workflow history of this issue.
                        </p>

                    </div>

                </div>


                {statusHistory.length === 0 ? (

                    <div className="admin-detail-empty">

                        No status history available.

                    </div>

                ) : (

                    <div className="admin-status-timeline">

                        {statusHistory.map(
                            (history, index) => (

                                <div
                                    className="admin-status-history-item"
                                    key={
                                        history.id ||
                                        `${history.changedAt}-${index}`
                                    }
                                >

                                    <div className="admin-status-timeline-dot" />


                                    <div className="admin-status-history-content">

                                        <div className="admin-status-history-header">

                                            <strong>
                                                {history.fromStatus ||
                                                    'Initial'
                                                }
                                            </strong>

                                            <span>
                                                →
                                            </span>

                                            <strong>
                                                {history.toStatus}
                                            </strong>

                                        </div>


                                        <p>

                                            Changed by:{' '}

                                            {history.changedByEmail ||
                                                'Unknown user'
                                            }

                                        </p>


                                        <span className="admin-status-history-date">

                                            {history.changedAt
                                                ? new Date(
                                                    history.changedAt
                                                ).toLocaleString()
                                                : 'N/A'
                                            }

                                        </span>


                                        {history.remark && (

                                            <p className="admin-status-history-remark">

                                                {history.remark}

                                            </p>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    )
}

export default AdminIssueDetailsPage