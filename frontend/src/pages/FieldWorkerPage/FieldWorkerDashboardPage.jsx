import { useEffect, useMemo, useState } from 'react'
import { getAssignedIssues } from '../../api/issueApi'
import '../../styles/workerCSS/fieldWorkerDashboard.css'

function FieldWorkerDashboardPage() {

    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {

        const loadAssignedIssues = async () => {

            try {

                setLoading(true)
                setError('')

                const response = await getAssignedIssues()

                setIssues(response?.content || [])

            } catch (err) {

                console.error(
                    'Failed to load field worker assignments:',
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

        loadAssignedIssues()

    }, [])


    const stats = useMemo(() => {

        const assigned = issues.length

        const pending = issues.filter(
            issue =>
                issue.status === 'REPORTED' ||
                issue.status === 'UNDER_REVIEW'
        ).length

        const inProgress = issues.filter(
            issue =>
                issue.status === 'IN_PROGRESS'
        ).length

        const completed = issues.filter(
            issue =>
                issue.status === 'RESOLVED'
        ).length

        const overdue = issues.filter(
            issue =>
                issue.slaBreached === true
        ).length

        return {
            assigned,
            pending,
            inProgress,
            completed,
            overdue,
        }

    }, [issues])


    if (loading) {

        return (
            <div className="worker-dashboard">

                <div className="worker-dashboard-header">
                    <div>
                        <h1>Field Worker Dashboard</h1>
                        <p>Overview of your assigned civic issues.</p>
                    </div>
                </div>

                <div className="worker-dashboard-state">
                    <div className="worker-spinner"></div>
                    <p>Loading your assignments...</p>
                </div>

            </div>
        )
    }


    if (error) {

        return (
            <div className="worker-dashboard">

                <div className="worker-dashboard-header">
                    <div>
                        <h1>Field Worker Dashboard</h1>
                        <p>Overview of your assigned civic issues.</p>
                    </div>
                </div>

                <div className="worker-dashboard-error">
                    <div className="worker-error-icon">!</div>

                    <div>
                        <h3>Unable to load assignments</h3>
                        <p>{error}</p>
                    </div>
                </div>

            </div>
        )
    }


    return (

        <div className="worker-dashboard">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <header className="worker-dashboard-header">

                <div>

                    <span className="worker-dashboard-eyebrow">
                        FIELD OPERATIONS
                    </span>

                    <h1>
                        Field Worker Dashboard
                    </h1>

                    <p>
                        Overview of your assigned civic issues and work.
                    </p>

                </div>

                <div className="worker-dashboard-date">
                    <span>Today</span>
                    <strong>
                        {new Date().toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </strong>
                </div>

            </header>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="worker-kpi-grid">

                <div className="worker-kpi-card">

                    <div className="worker-kpi-icon assigned">
                        A
                    </div>

                    <div className="worker-kpi-content">

                        <span>
                            Assigned Issues
                        </span>

                        <strong>
                            {stats.assigned}
                        </strong>

                    </div>

                </div>


                <div className="worker-kpi-card">

                    <div className="worker-kpi-icon pending">
                        P
                    </div>

                    <div className="worker-kpi-content">

                        <span>
                            Pending Assignments
                        </span>

                        <strong>
                            {stats.pending}
                        </strong>

                    </div>

                </div>


                <div className="worker-kpi-card">

                    <div className="worker-kpi-icon progress">
                        ↻
                    </div>

                    <div className="worker-kpi-content">

                        <span>
                            In Progress
                        </span>

                        <strong>
                            {stats.inProgress}
                        </strong>

                    </div>

                </div>


                <div className="worker-kpi-card">

                    <div className="worker-kpi-icon completed">
                        ✓
                    </div>

                    <div className="worker-kpi-content">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {stats.completed}
                        </strong>

                    </div>

                </div>


                <div className="worker-kpi-card worker-kpi-danger">

                    <div className="worker-kpi-icon overdue">
                        !
                    </div>

                    <div className="worker-kpi-content">

                        <span>
                            SLA Breached
                        </span>

                        <strong>
                            {stats.overdue}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                SLA ALERTS
            ================================================= */}

            {stats.overdue > 0 && (

                <section className="worker-section">

                    <div className="worker-section-header">

                        <div>
                            <h2>SLA Alerts</h2>
                            <p>Issues requiring immediate attention.</p>
                        </div>

                    </div>

                    <div className="worker-sla-alert">

                        <div className="worker-sla-alert-icon">
                            !
                        </div>

                        <div className="worker-sla-alert-content">

                            <strong>
                                {stats.overdue} issue
                                {stats.overdue !== 1 ? 's' : ''} breached
                                the SLA
                            </strong>

                            <span>
                                Please prioritize these assignments.
                            </span>

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
                TODAY'S WORK
            ================================================= */}

            <section className="worker-section">

                <div className="worker-section-header">

                    <div>
                        <h2>Today's Work</h2>
                        <p>Your current workload overview.</p>
                    </div>

                </div>


                <div className="worker-work-grid">

                    <div className="worker-work-item">

                        <span>Total Assigned</span>

                        <strong>
                            {stats.assigned}
                        </strong>

                    </div>


                    <div className="worker-work-item">

                        <span>Pending</span>

                        <strong>
                            {stats.pending}
                        </strong>

                    </div>


                    <div className="worker-work-item">

                        <span>In Progress</span>

                        <strong>
                            {stats.inProgress}
                        </strong>

                    </div>


                    <div className="worker-work-item">

                        <span>Completed</span>

                        <strong>
                            {stats.completed}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                CURRENT ASSIGNMENTS
            ================================================= */}

            <section className="worker-section">

                <div className="worker-section-header">

                    <div>
                        <h2>Current Assignments</h2>
                        <p>Recently assigned civic issues.</p>
                    </div>

                    <span className="worker-count-badge">
                        {issues.length} total
                    </span>

                </div>


                {issues.length === 0 ? (

                    <div className="worker-empty-state">

                        <div className="worker-empty-icon">
                            ✓
                        </div>

                        <h3>
                            No assignments
                        </h3>

                        <p>
                            You currently have no issues assigned to you.
                        </p>

                    </div>

                ) : (

                    <div className="worker-assignment-list">

                        {issues.slice(0, 5).map(issue => (

                            <article
                                key={issue.id}
                                className="worker-assignment-card"
                            >

                                <div className="worker-assignment-main">

                                    <div className="worker-assignment-title-row">

                                        <h3>
                                            {issue.title}
                                        </h3>

                                        <span
                                            className={`worker-status-badge status-${issue.status?.toLowerCase()}`}
                                        >
                                            {issue.status?.replace(
                                                '_',
                                                ' '
                                            )}
                                        </span>

                                    </div>

                                    <span className="worker-issue-id">
                                        ID: {issue.id}
                                    </span>

                                    <p className="worker-assignment-address">
                                        {issue.address || 'Location unavailable'}
                                    </p>

                                </div>


                                <div className="worker-assignment-meta">

                                    <div>
                                        <span>Category</span>
                                        <strong>
                                            {issue.category || '—'}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Priority</span>
                                        <strong>
                                            {issue.priority || '—'}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>SLA</span>

                                        <strong
                                            className={
                                                issue.slaBreached
                                                    ? 'worker-sla-breached'
                                                    : ''
                                            }
                                        >
                                            {issue.slaBreached
                                                ? 'Breached'
                                                : issue.slaDueAt
                                                    ? new Date(
                                                        issue.slaDueAt
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                        }
                                                    )
                                                    : '—'}
                                        </strong>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <section className="worker-section">

                <div className="worker-section-header">

                    <div>
                        <h2>Recent Activity</h2>
                        <p>
                            Recent activity will appear here.
                        </p>
                    </div>

                </div>

                <div className="worker-activity-empty">

                    <div className="worker-activity-icon">
                        i
                    </div>

                    <div>
                        <strong>
                            Activity tracking coming soon
                        </strong>

                        <p>
                            Worker activity history will be connected
                            when the activity feed API is available.
                        </p>
                    </div>

                </div>

            </section>

        </div>
    )
}

export default FieldWorkerDashboardPage