import {useEffect, useState} from 'react'

import { useNavigate } from 'react-router-dom'
import {getMyIssues} from '../api/issueApi'

function MyIssuesPage() {
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {

        async function fetchIssues() {
            try {
                setLoading(true)
                setError(null)

                const response = await getMyIssues()

                console.log('My issues response:', response)

                setIssues(response.content || [])

            } catch (err) {
                console.error('Failed to fetch issues:', err)

                setError('Failed to load your issues.')
            } finally {
                setLoading(false)
            }
        }

        fetchIssues()

    }, [])

    return (
        <>
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-breadcrumb">
                        CITIZEN PORTAL
                    </p>

                    <h1>My Issues</h1>
                </div>
            </header>

            <section className="dashboard-content">

                <div className="my-issues-page-header">
                    <div>
                        <p className="section-label">
                            ISSUE MANAGEMENT
                        </p>

                        <h2>My Reported Issues</h2>

                        <p>
                            View and track all civic issues you have reported.
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="issues-state">
                        Loading your issues...
                    </div>
                )}

                {error && (
                    <div className="issues-state issues-error">
                        {error}
                    </div>
                )}

                {!loading && !error && issues.length === 0 && (
                    <div className="empty-issues">
                        <div className="empty-issues-icon">
                            📋
                        </div>

                        <h3>No issues reported yet</h3>

                        <p>
                            You haven't reported any civic issues yet.
                        </p>
                    </div>
                )}

                {!loading && !error && issues.length > 0 && (
                    <div className="my-issues-list">

                        {issues.map((issue) => (
                            <div
                                className="my-issue-card"
                                key={issue.id}
                                onClick={() =>
                                    navigate(`/my-issues/${issue.id}`)
                                }
                            >

                                <div className="my-issue-card-main">

                                    <div className="my-issue-card-header">
                                        <h3>
                                            {issue.title}
                                        </h3>

                                        <span
                                            className={`issue-status ${issue.status
                                                .toLowerCase()
                                                .replaceAll('_', '-')}`}
                                        >
    {issue.status.replaceAll('_', ' ')}
</span>
                                    </div>

                                    <p className="my-issue-category">
                                        {issue.category}
                                    </p>

                                    <p className="my-issue-address">
                                        {issue.address}
                                    </p>

                                </div>

                                <div className="my-issue-date">
                                    Reported on{' '}
                                    {issue.createdAt
                                        ? new Date(
                                            issue.createdAt
                                        ).toLocaleDateString()
                                        : 'N/A'}
                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>
        </>
    )
}

export default MyIssuesPage