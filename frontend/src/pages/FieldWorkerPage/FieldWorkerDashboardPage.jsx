import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
    getAssignedIssues,
    getIssueStatusHistory,
} from '../../api/issueApi'

import '../../styles/workerCSS/fieldWorkerDashboard.css'


function FieldWorkerDashboardPage() {

    const navigate = useNavigate()

    const [issues, setIssues] = useState([])
    const [activities, setActivities] = useState([])

    const [loading, setLoading] = useState(true)
    const [activityLoading, setActivityLoading] = useState(false)

    const [error, setError] = useState('')


    /* =========================================================
       LOAD ASSIGNED ISSUES
    ========================================================= */

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true)
                setError('')

                const response = await getAssignedIssues({
                    page: 0,
                    size: 50,
                    sort: 'createdAt,desc',
                })

                const assignedIssues =
                    response?.content || []

                setIssues(assignedIssues)

                /*
                 * Load status history after assignments
                 * have been successfully loaded.
                 */
                await loadRecentActivity(assignedIssues)

            } catch (err) {

                console.error(
                    'Failed to load field worker dashboard:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Failed to load field worker dashboard.'
                )

            } finally {

                setLoading(false)

            }
        }


        loadDashboard()

    }, [])


    /* =========================================================
       LOAD RECENT ACTIVITY
    ========================================================= */

    const loadRecentActivity = async (assignedIssues) => {

        if (!assignedIssues || assignedIssues.length === 0) {

            setActivities([])
            return

        }

        try {

            setActivityLoading(true)

            /*
             * We don't need status history for 50 issues.
             * Fetch the latest activity for the first 10
             * recently assigned issues.
             */
            const issuesForActivity =
                assignedIssues.slice(0, 10)


            const historyResponses =
                await Promise.allSettled(

                    issuesForActivity.map(
                        issue =>
                            getIssueStatusHistory(issue.id)
                    )

                )


            const activityList = []


            historyResponses.forEach(
                (result, index) => {

                    if (result.status !== 'fulfilled') {
                        return
                    }


                    const history =
                        result.value || []

                    const issue =
                        issuesForActivity[index]


                    history.forEach(entry => {

                        activityList.push({

                            ...entry,

                            issueId: issue.id,

                            issueTitle:
                                issue.title ||
                                'Untitled Issue',

                            issueCategory:
                            issue.category,

                        })

                    })

                }
            )


            /*
             * Latest activities first.
             */
            activityList.sort(
                (a, b) =>
                    new Date(b.changedAt) -
                    new Date(a.changedAt)
            )


            /*
             * Keep dashboard compact.
             */
            setActivities(
                activityList.slice(0, 8)
            )

        } catch (err) {

            console.error(
                'Failed to load recent activity:',
                err
            )

            /*
             * Activity failure should NOT break
             * the complete dashboard.
             */
            setActivities([])

        } finally {

            setActivityLoading(false)

        }
    }


    /* =========================================================
       STATISTICS
    ========================================================= */

    const stats = useMemo(() => {

        const assigned =
            issues.length


        const pending =
            issues.filter(
                issue =>
                    issue.status === 'REPORTED' ||
                    issue.status === 'UNDER_REVIEW'
            ).length


        const inProgress =
            issues.filter(
                issue =>
                    issue.status === 'IN_PROGRESS'
            ).length


        const completed =
            issues.filter(
                issue =>
                    issue.status === 'RESOLVED'
            ).length


        const overdue =
            issues.filter(
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


    /* =========================================================
       TODAY'S WORK
    ========================================================= */

    const todayStats = useMemo(() => {

        const today =
            new Date()

        const todayDate =
            today.toLocaleDateString('en-CA')


        const createdToday =
            issues.filter(issue => {

                if (!issue.createdAt) {
                    return false
                }

                return (
                    new Date(issue.createdAt)
                        .toLocaleDateString('en-CA')
                    === todayDate
                )

            }).length


        const dueToday =
            issues.filter(issue => {

                if (!issue.slaDueAt) {
                    return false
                }

                return (
                    new Date(issue.slaDueAt)
                        .toLocaleDateString('en-CA')
                    === todayDate
                )

            }).length


        return {
            createdToday,
            dueToday,
            active: stats.pending + stats.inProgress,
            completed: stats.completed,
        }

    }, [issues, stats])


    /* =========================================================
       HELPERS
    ========================================================= */

    const formatStatus =
        status => {

            if (!status) {
                return 'Unknown'
            }

            return status
                .replaceAll('_', ' ')
                .replace(/\b\w/g, char =>
                    char.toUpperCase()
                )

        }


    const formatDateTime =
        value => {

            if (!value) {
                return '—'
            }

            return new Date(value)
                .toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })

        }


    const formatSla =
        issue => {

            if (issue.slaBreached) {
                return 'Breached'
            }

            if (!issue.slaDueAt) {
                return '—'
            }

            return new Date(issue.slaDueAt)
                .toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                })

        }


    const getActivityStatusClass =
        status => {

            if (!status) {
                return ''
            }

            return `status-${status.toLowerCase()}`

        }


    /* =========================================================
       LOADING STATE
    ========================================================= */

    if (loading) {

        return (

            <div className="worker-dashboard">

                <div className="worker-dashboard-header">

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

                </div>


                <div className="worker-dashboard-state">

                    <div className="worker-spinner"></div>

                    <p>
                        Loading your assignments...
                    </p>

                </div>

            </div>

        )

    }


    /* =========================================================
       ERROR STATE
    ========================================================= */

    if (error) {

        return (

            <div className="worker-dashboard">

                <div className="worker-dashboard-header">

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

                </div>


                <div className="worker-dashboard-error">

                    <div className="worker-error-icon">
                        !
                    </div>

                    <div>

                        <h3>
                            Unable to load dashboard
                        </h3>

                        <p>
                            {error}
                        </p>

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

                    <span>
                        Today
                    </span>

                    <strong>

                        {new Date().toLocaleDateString(
                            'en-IN',
                            {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            }
                        )}

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
                SLA ALERT
            ================================================= */}

            {stats.overdue > 0 && (

                <section className="worker-section">

                    <div className="worker-section-header">

                        <div>

                            <h2>
                                SLA Alerts
                            </h2>

                            <p>
                                Issues requiring immediate attention.
                            </p>

                        </div>

                        <span className="worker-count-badge worker-danger-badge">

                            {stats.overdue}
                            {' '}
                            {stats.overdue === 1
                                ? 'issue'
                                : 'issues'}

                        </span>

                    </div>


                    <div className="worker-sla-alert">

                        <div className="worker-sla-alert-icon">
                            !
                        </div>

                        <div className="worker-sla-alert-content">

                            <strong>
                                {stats.overdue} issue
                                {stats.overdue !== 1 ? 's' : ''}
                                {' '}breached the SLA
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

                        <h2>
                            Today's Work
                        </h2>

                        <p>
                            Your current workload overview.
                        </p>

                    </div>

                </div>


                <div className="worker-work-grid">


                    <div className="worker-work-item">

                        <span>
                            Active Work
                        </span>

                        <strong>
                            {todayStats.active}
                        </strong>

                    </div>


                    <div className="worker-work-item">

                        <span>
                            Created Today
                        </span>

                        <strong>
                            {todayStats.createdToday}
                        </strong>

                    </div>


                    <div className="worker-work-item">

                        <span>
                            Due Today
                        </span>

                        <strong>
                            {todayStats.dueToday}
                        </strong>

                    </div>


                    <div className="worker-work-item">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {todayStats.completed}
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

                        <h2>
                            Current Assignments
                        </h2>

                        <p>
                            Issues currently assigned to you.
                        </p>

                    </div>


                    <span className="worker-count-badge">

                        {issues.length}
                        {' '}
                        {issues.length === 1
                            ? 'issue'
                            : 'issues'}

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
                                            className={`worker-status-badge ${getActivityStatusClass(issue.status)}`}
                                        >
                                            {formatStatus(issue.status)}
                                        </span>

                                    </div>


                                    <span className="worker-issue-id">

                                        ID: {issue.id}

                                    </span>


                                    <p className="worker-assignment-address">

                                        {issue.address ||
                                            'Location unavailable'}

                                    </p>

                                </div>


                                <div className="worker-assignment-meta">


                                    <div>

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {formatStatus(issue.category) || '—'}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Priority
                                        </span>

                                        <strong>
                                            {formatStatus(issue.priority) || '—'}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            SLA
                                        </span>

                                        <strong
                                            className={
                                                issue.slaBreached
                                                    ? 'worker-sla-breached'
                                                    : ''
                                            }
                                        >
                                            {formatSla(issue)}
                                        </strong>

                                    </div>


                                </div>


                                <button
                                    type="button"
                                    className="worker-view-issue-btn"
                                    onClick={() =>
                                        navigate(
                                            `/worker/issues/${issue.id}`
                                        )
                                    }
                                >

                                    View Issue

                                    <span>
                                        →
                                    </span>

                                </button>


                            </article>

                        ))}

                    </div>

                )}


                {issues.length > 5 && (

                    <button
                        type="button"
                        className="worker-view-all-btn"
                        onClick={() =>
                            navigate('/worker/assignments')
                        }
                    >
                        View All Assignments →
                    </button>

                )}

            </section>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <section className="worker-section">

                <div className="worker-section-header">

                    <div>

                        <h2>
                            Recent Activity
                        </h2>

                        <p>
                            Latest status updates from your assigned issues.
                        </p>

                    </div>


                    <span className="worker-count-badge">

                        {activities.length}
                        {' '}
                        recent

                    </span>

                </div>


                {activityLoading ? (

                    <div className="worker-activity-loading">

                        <div className="worker-spinner"></div>

                        <span>
                            Loading recent activity...
                        </span>

                    </div>

                ) : activities.length === 0 ? (

                    <div className="worker-activity-empty">

                        <div className="worker-activity-icon">
                            i
                        </div>

                        <div>

                            <strong>
                                No recent activity
                            </strong>

                            <p>
                                Status updates for your assigned
                                issues will appear here.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="worker-activity-list">

                        {activities.map(
                            (activity, index) => (

                                <article
                                    key={
                                        activity.id ||
                                        `${activity.issueId}-${index}`
                                    }
                                    className="worker-activity-item"
                                >


                                    <div className="worker-activity-timeline">

                                        <div className="worker-activity-dot">
                                        </div>

                                        {index <
                                            activities.length - 1 && (
                                                <div className="worker-activity-line">
                                                </div>
                                            )}

                                    </div>


                                    <div className="worker-activity-content">


                                        <div className="worker-activity-top">

                                            <div>

                                                <h3>
                                                    {activity.issueTitle}
                                                </h3>

                                                <span>
                                                    {activity.issueCategory
                                                        ? formatStatus(
                                                            activity.issueCategory
                                                        )
                                                        : 'Civic Issue'}
                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                className="worker-activity-view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/worker/issues/${activity.issueId}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>


                                        <div className="worker-activity-transition">

                                            <span
                                                className={`worker-activity-status ${getActivityStatusClass(activity.fromStatus)}`}
                                            >
                                                {formatStatus(
                                                    activity.fromStatus
                                                )}
                                            </span>


                                            <span className="worker-activity-arrow">
                                                →
                                            </span>


                                            <span
                                                className={`worker-activity-status ${getActivityStatusClass(activity.toStatus)}`}
                                            >
                                                {formatStatus(
                                                    activity.toStatus
                                                )}
                                            </span>

                                        </div>


                                        <div className="worker-activity-meta">

                                            <span>
                                                {formatDateTime(
                                                    activity.changedAt
                                                )}
                                            </span>


                                            <span>
                                                Changed by:{' '}
                                                <strong>
                                                    {activity.changedByName ||
                                                        'Unknown'}
                                                </strong>
                                            </span>

                                        </div>


                                        {activity.remark && (

                                            <p className="worker-activity-remark">

                                                {activity.remark}

                                            </p>

                                        )}


                                        {activity.evidencePhotoUrl && (

                                            <div className="worker-evidence-badge">

                                                <span>
                                                    ✓
                                                </span>

                                                Resolution evidence uploaded

                                            </div>

                                        )}


                                    </div>


                                </article>

                            )
                        )}

                    </div>

                )}

            </section>


        </div>
    )
}


export default FieldWorkerDashboardPage