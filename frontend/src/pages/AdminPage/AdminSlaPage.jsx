import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getSlaStatistics,
    getSlaBreachedIssues,
} from '../../api/adminApi'
import '../../styles/adminCSS/adminSla.css'

function AdminSlaPage() {

    const navigate = useNavigate()

    const [statistics, setStatistics] = useState(null)
    const [breachedIssues, setBreachedIssues] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadSlaData = async () => {

        try {

            setLoading(true)
            setError('')

            const [
                statisticsResponse,
                breachedResponse,
            ] = await Promise.all([
                getSlaStatistics(),
                getSlaBreachedIssues({
                    page: 0,
                    size: 50,
                    sort: 'createdAt,desc',
                }),
            ])

            console.log(
                'SLA statistics:',
                statisticsResponse
            )

            console.log(
                'SLA breached issues:',
                breachedResponse
            )

            setStatistics(
                statisticsResponse?.data ||
                statisticsResponse ||
                null
            )

            setBreachedIssues(
                breachedResponse?.data?.content ||
                breachedResponse?.content ||
                []
            )

        } catch (err) {

            console.error(
                'Failed to load SLA data:',
                err
            )

            setError(
                'Failed to load SLA information.'
            )

        } finally {

            setLoading(false)
        }
    }


    useEffect(() => {
        loadSlaData()
    }, [])


    const handleViewIssue = (issueId) => {

        navigate(
            `/admin/issues/${issueId}`
        )
    }


    if (loading) {

        return (
            <div className="admin-sla-page">

                <div className="admin-sla-state">
                    Loading SLA information...
                </div>

            </div>
        )
    }


    if (error) {

        return (
            <div className="admin-sla-page">

                <div className="admin-sla-state error">
                    {error}
                </div>

            </div>
        )
    }


    return (
        <div className="admin-sla-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-sla-header">

                <div>
                    <h1>SLA Management</h1>

                    <p>
                        Monitor service-level deadlines
                        and breached issues.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-sla-refresh-button"
                    onClick={loadSlaData}
                >
                    Refresh
                </button>

            </div>


            {/* =========================
                STATISTICS
            ========================= */}

            <div className="admin-sla-statistics">

                <div className="admin-sla-stat-card">

                    <span className="admin-sla-stat-label">
                        Total Issues
                    </span>

                    <strong>
                        {statistics?.totalIssues ?? 0}
                    </strong>

                </div>


                <div className="admin-sla-stat-card breached">

                    <span className="admin-sla-stat-label">
                        SLA Breached
                    </span>

                    <strong>
                        {statistics?.breachedIssues ?? 0}
                    </strong>

                </div>


                <div className="admin-sla-stat-card within">

                    <span className="admin-sla-stat-label">
                        Within SLA
                    </span>

                    <strong>
                        {statistics?.withinSlaIssues ?? 0}
                    </strong>

                </div>


                <div className="admin-sla-stat-card resolved">

                    <span className="admin-sla-stat-label">
                        Resolved
                    </span>

                    <strong>
                        {statistics?.resolvedIssues ?? 0}
                    </strong>

                </div>

            </div>


            {/* =========================
                BREACHED ISSUES
            ========================= */}

            <section className="admin-sla-table-card">

                <div className="admin-sla-table-header">

                    <div>
                        <h2>
                            SLA Breached Issues
                        </h2>

                        <p>
                            Issues that have exceeded
                            their SLA deadline.
                        </p>
                    </div>

                    <span className="admin-sla-count">
                        {breachedIssues.length}
                    </span>

                </div>


                {breachedIssues.length === 0 ? (

                    <div className="admin-sla-state">

                        No SLA breached issues found.

                    </div>

                ) : (

                    <div className="admin-sla-table-wrapper">

                        <table className="admin-sla-table">

                            <thead>

                            <tr>

                                <th>
                                    Issue
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Priority
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Assigned Worker
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {breachedIssues.map(
                                (issue) => (

                                    <tr
                                        key={issue.id}
                                    >

                                        <td>

                                            <div className="admin-sla-issue">

                                                <strong>
                                                    {issue.title}
                                                </strong>

                                                <span>
                                                        {issue.address}
                                                    </span>

                                            </div>

                                        </td>


                                        <td>
                                                <span className="admin-sla-category">
                                                    {issue.category}
                                                </span>
                                        </td>


                                        <td>

                                                <span
                                                    className={`admin-sla-priority priority-${String(
                                                        issue.priority
                                                    ).toLowerCase()}`}
                                                >
                                                    {issue.priority}
                                                </span>

                                        </td>


                                        <td>

                                                <span
                                                    className={`admin-sla-status status-${String(
                                                        issue.status
                                                    ).toLowerCase()}`}
                                                >
                                                    {String(
                                                        issue.status
                                                    ).replaceAll(
                                                        '_',
                                                        ' '
                                                    )}
                                                </span>

                                        </td>


                                        <td>

                                            {issue.assignedToName ? (

                                                <div className="admin-sla-worker">

                                                    <strong>
                                                        {issue.assignedToName}
                                                    </strong>

                                                    {issue.assignedToEmail && (
                                                        <span>
                                                                {issue.assignedToEmail}
                                                            </span>
                                                    )}

                                                </div>

                                            ) : (

                                                <span className="admin-sla-unassigned">
                                                        Not Assigned
                                                    </span>

                                            )}

                                        </td>


                                        <td>

                                            <button
                                                type="button"
                                                className="admin-sla-view-button"
                                                onClick={() =>
                                                    handleViewIssue(
                                                        issue.id
                                                    )
                                                }
                                            >
                                                View Issue
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    )
}

export default AdminSlaPage