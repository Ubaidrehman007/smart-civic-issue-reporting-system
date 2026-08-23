import { useEffect, useState } from 'react'
import { getMyIssues } from '../api/issueApi'
import { useNavigate } from 'react-router-dom'
import '../styles/citizenCSS/dashboard.css'

function DashboardPage() {
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const storedUser = localStorage.getItem('user')

    const user = storedUser
        ? JSON.parse(storedUser)
        : null

    const fullName = user?.fullName || 'Citizen'

    const firstName = fullName.split(' ')[0]

    const userInitial = fullName.charAt(0).toUpperCase()

    const navigate = useNavigate()

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true)

                const response = await getMyIssues()

                console.log('Dashboard issues response:', response)

                setIssues(response.content || [])
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)

                setError('Failed to load your dashboard data.')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const totalIssues = issues.length

    const reportedIssues = issues.filter(
        (issue) => issue.status === 'REPORTED'
    ).length

    const inProgressIssues = issues.filter(
        (issue) =>
            issue.status === 'IN_PROGRESS' ||
            issue.status === 'UNDER_REVIEW'
    ).length

    const resolvedIssues = issues.filter(
        (issue) => issue.status === 'RESOLVED'
    ).length

    const formatStatus = (status) => {
        if (!status) return ''

        return status
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }
    return (
        <div >
            <header className="dashboard-header">
                    <div>
                        <p className="dashboard-breadcrumb">
                            CITIZEN PORTAL
                        </p>

                        <h1>Dashboard</h1>
                    </div>

                    <div className="dashboard-user">
                        <div className="dashboard-user-avatar">
                            {userInitial}
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">

                    <div className="dashboard-welcome">
                        <div>
                            <p className="welcome-label">
                                SMART CIVIC REPORTING SYSTEM
                            </p>

                            <h2>
                                Welcome back, {firstName}.
                            </h2>

                            <p>
                                Here's an overview of your civic issue reports
                                and their current progress.
                            </p>
                        </div>
                        <button
                            className="report-issue-button"
                            onClick={() => navigate('/report-issue')}
                        >
                            + Report New Issue
                        </button>
                    </div>

                    <section className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-blue">
                                📋
                            </div>

                            <div>
                                <p>Total Issues</p>
                                <h3>{totalIssues}</h3>
                                <span>All issues reported by you</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-orange">
                                ⏳
                            </div>

                            <div>
                                <p>Reported</p>
                                <h3>{reportedIssues}</h3>
                                <span>Waiting for action</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-purple">
                                🔄
                            </div>

                            <div>
                                <p>In Progress</p>
                                <h3>{inProgressIssues}</h3>
                                <span>Currently being handled</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-green">
                                ✓
                            </div>

                            <div>
                                <p>Resolved</p>
                                <h3>{resolvedIssues}</h3>
                                <span>Successfully completed</span>
                            </div>
                        </div>
                    </section>

                    <section className="recent-issues-section">
                        <div className="section-header">
                            <div>
                                <p className="section-label">
                                    YOUR ACTIVITY
                                </p>

                                <h2>Recent Issues</h2>
                            </div>

                            <button
                                className="view-all-button"
                                onClick={() => navigate('/my-issues')}
                            >
                                View All
                            </button>
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
                                    Start by reporting an issue in your area.
                                </p>

                                <button
                                    className="report-issue-button"
                                    onClick={() => navigate('/report-issue')}
                                >
                                    + Report Your First Issue
                                </button>
                            </div>
                        )}

                        {!loading && !error && issues.length > 0 && (
                            <div className="issues-list">
                                {issues.slice(0, 5).map((issue) => (
                                    <div
                                        className="issue-row"
                                        key={issue.id}
                                        onClick={() => navigate(`/my-issues/${issue.id}`)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="issue-row-main">
                                            <h3>{issue.title}</h3>

                                            <p>
                                                {issue.category} • {issue.address}
                                            </p>
                                        </div>

                                        <div className="issue-row-meta">
                       <span className="issue-status">
    {formatStatus(issue.status)}
</span>

                                            <span className="issue-date">
                            {issue.createdAt
                                ? new Date(issue.createdAt).toLocaleDateString()
                                : ''}
                        </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                </section>



        </div>
    )
}

export default DashboardPage