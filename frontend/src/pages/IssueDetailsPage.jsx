import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {getIssueById, getIssueStatusHistory} from '../api/issueApi'
import '../styles/citizenCSS/issueDetails.css'

function IssueDetailsPage() {

    const {issueId} = useParams()
    const navigate = useNavigate()

    const [issue, setIssue] = useState(null)
    const [statusHistory, setStatusHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    useEffect(() => {

        async function fetchIssue() {

            try {
                setLoading(true)
                setError(null)

                const issueResponse =
                    await getIssueById(issueId)

                const historyResponse =
                    await getIssueStatusHistory(issueId)

                console.log(
                    'Issue details response:',
                    issueResponse
                )

                console.log(
                    'Issue status history:',
                    historyResponse
                )

                setIssue(issueResponse)

                setStatusHistory(historyResponse || [])

            } catch (err) {

                console.error('Failed to fetch issue details:', err)

                setError('Failed to load issue details.')

            } finally {
                setLoading(false)
            }
        }

        fetchIssue()

    }, [issueId])


    if (loading) {


        return (<>
                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-breadcrumb">
                            CITIZEN PORTAL
                        </p>

                        <h1>Issue Details</h1>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="issues-state">
                        Loading issue details...
                    </div>
                </section>
            </>)
    }


    if (error) {
        return (<>
                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-breadcrumb">
                            CITIZEN PORTAL
                        </p>

                        <h1>Issue Details</h1>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="issues-state issues-error">
                        {error}
                    </div>
                </section>
            </>)
    }

    const getStatusClass = (status) => {

        if (!status) {
            return ''
        }

        return status
            .toLowerCase()
            .replace(/_/g, '-')
    }


    const formatStatus = (status) => {

        if (!status) {
            return 'Unknown'
        }

        const getChangedBy = (history) => {

            if (history.changedByName) {
                return history.changedByName
            }

            if (history.changedByEmail) {
                return history.changedByEmail
            }

            return 'System'
        }

        return status
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    return (<>
            <header className="dashboard-header">

                <div>
                    <p className="dashboard-breadcrumb">
                        CITIZEN PORTAL
                    </p>

                    <h1>Issue Details</h1>
                </div>

            </header>


            <section className="dashboard-content">

                <button
                    className="back-to-issues-button"
                    onClick={() => navigate('/my-issues')}
                >
                    ← Back to My Issues
                </button>


                <div className="issue-details-card">

                    <div className="issue-details-header">

                        <div>

                            <p className="section-label">
                                ISSUE DETAILS
                            </p>

                            <h2>
                                {issue?.title}
                            </h2>

                        </div>

                        <span
                            className={`issue-status ${getStatusClass(issue?.status)}`}
                        >
    {formatStatus(issue?.status)}
</span>

                    </div>


                    <div className="issue-details-grid">

                        <div className="issue-detail-item">

                            <span>
                                Category
                            </span>

                            <p>
                                {issue?.category}
                            </p>

                        </div>


                        <div className="issue-detail-item">

                            <span>
                                Priority
                            </span>

                            <p>
                                {issue?.priority}
                            </p>

                        </div>


                        <div className="issue-detail-item">

                            <span>
                                Address
                            </span>

                            <p>
                                {issue?.address}
                            </p>

                        </div>


                        <div className="issue-detail-item">

                            <span>
                                Reported On
                            </span>

                            <p>
                                {issue?.createdAt ? new Date(issue.createdAt).toLocaleString() : 'N/A'}
                            </p>

                        </div>

                    </div>


                    <div className="issue-description-section">

                        <span>
                            Description
                        </span>

                        <p>
                            {issue?.description}
                        </p>

                    </div>

                    {issue?.imageUrl && (
                        <div className="issue-image-section">

        <span>
            Attached Photo
        </span>

                            <div className="issue-image-wrapper">
                                <img
                                    src={`http://localhost:8080/api/images/${encodeURIComponent(issue.imageUrl)}`}
                                    alt={issue.title}
                                    className="issue-image"
                                />
                            </div>

                        </div>
                    )}

                </div>


                {statusHistory.length > 0 && (

                    <div className="status-history-card">

                        <div className="status-history-header">

                            <div>

                                <p className="section-label">
                                    STATUS HISTORY
                                </p>

                                <h2>
                                    Issue Progress
                                </h2>

                                <p>
                                    Track the progress and status changes of your issue.
                                </p>

                            </div>

                        </div>


                        <div className="status-timeline">

                            <div className="status-timeline-item">

                                <div className="status-timeline-marker">

                                    <div className="status-timeline-dot initial">
                                    </div>

                                </div>


                                <div className="status-timeline-content">

                                    <div className="status-timeline-statuses">

            <span className="timeline-to-status reported">
                Issue Reported
            </span>

                                    </div>


                                    <p className="status-timeline-date">

                                        {issue?.createdAt
                                            ? new Date(
                                                issue.createdAt
                                            ).toLocaleString()
                                            : 'N/A'}

                                    </p>


                                    <p className="status-timeline-user">
                                        Reported by: You
                                    </p>

                                </div>

                            </div>

                            {statusHistory.map((history) => (

                                <div
                                    className="status-timeline-item"
                                    key={history.id}
                                >

                                    <div className="status-timeline-marker">

                                        <div className="status-timeline-dot">
                                        </div>

                                    </div>


                                    <div className="status-timeline-content">

                                        <div className="status-timeline-statuses">

                            <span className="timeline-from-status">
                                {formatStatus(
                                    history.fromStatus
                                )}
                            </span>

                                            <span className="timeline-arrow">
                                →
                            </span>

                                            <span
                                                className={`timeline-to-status ${getStatusClass(
                                                    history.toStatus
                                                )}`}
                                            >
                                {formatStatus(
                                    history.toStatus
                                )}
                            </span>

                                        </div>


                                        <p className="status-timeline-date">

                                            {history.changedAt
                                                ? new Date(
                                                    history.changedAt
                                                ).toLocaleString()
                                                : 'N/A'}

                                        </p>


                                        {history.changedByName && (

                                            <p className="status-timeline-user">

                                                Updated by:{' '}

                                                {history.changedByName}

                                            </p>

                                        )}


                                        {!history.changedByName &&
                                            history.changedByEmail && (

                                                <p className="status-timeline-user">

                                                    Updated by:{' '}

                                                    {history.changedByEmail}

                                                </p>

                                            )}


                                        {history.remark && (

                                            <div className="status-timeline-remark">

                                <span>
                                    Remark
                                </span>

                                                <p>
                                                    {history.remark}
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}
            </section>
        </>)
}

export default IssueDetailsPage