import { useEffect, useState } from 'react'
import { getAdminDashboardStatistics } from '../../api/adminApi'
import '../../styles/adminCSS/adminDashboard.css'

function AdminDashboardPage() {

    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {

        const fetchStatistics = async () => {

            try {

                setLoading(true)
                setError('')

                const response =
                    await getAdminDashboardStatistics()

                console.log(
                    'Admin dashboard statistics:',
                    response
                )

                setStats(response.data)

            } catch (err) {

                console.error(
                    'Failed to fetch admin dashboard statistics:',
                    err
                )

                setError(
                    err.response?.data?.message ||
                    'Failed to load dashboard statistics.'
                )

            } finally {

                setLoading(false)
            }
        }

        fetchStatistics()

    }, [])


    if (loading) {

        return (
            <div className="admin-dashboard-page">

                <div className="admin-dashboard-header">

                    <div>
                        <p className="admin-dashboard-eyebrow">
                            ADMIN CONTROL CENTER
                        </p>

                        <h1>Admin Dashboard</h1>

                        <p>
                            Monitor civic issues and platform users.
                        </p>
                    </div>

                </div>

                <div className="admin-dashboard-loading">
                    Loading dashboard statistics...
                </div>

            </div>
        )
    }


    if (error) {

        return (
            <div className="admin-dashboard-page">

                <div className="admin-dashboard-header">

                    <div>
                        <p className="admin-dashboard-eyebrow">
                            ADMIN CONTROL CENTER
                        </p>

                        <h1>Admin Dashboard</h1>

                        <p>
                            Monitor civic issues and platform users.
                        </p>
                    </div>

                </div>

                <div className="admin-dashboard-error">
                    {error}
                </div>

            </div>
        )
    }


    return (
        <div className="admin-dashboard-page">

            {/* =========================
                HEADER
            ========================= */}

            <section className="admin-dashboard-header">

                <div>

                    <p className="admin-dashboard-eyebrow">
                        ADMIN CONTROL CENTER
                    </p>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Overview of civic issues and platform users.
                    </p>

                </div>

            </section>


            {/* =========================
                ISSUE OVERVIEW
            ========================= */}

            <section className="admin-dashboard-section">

                <div className="admin-section-heading">

                    <div>
                        <h2>Issue Overview</h2>

                        <p>
                            Current status of reported civic issues.
                        </p>
                    </div>

                </div>


                <div className="admin-stat-grid">

                    <div className="admin-stat-card">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                I
                            </span>

                            <span className="admin-stat-label">
                                Total Issues
                            </span>
                        </div>

                        <strong>
                            {stats.totalIssues}
                        </strong>

                        <span className="admin-stat-description">
                            All reported issues
                        </span>

                    </div>


                    <div className="admin-stat-card reported">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                R
                            </span>

                            <span className="admin-stat-label">
                                Reported
                            </span>
                        </div>

                        <strong>
                            {stats.reportedIssues}
                        </strong>

                        <span className="admin-stat-description">
                            Awaiting review
                        </span>

                    </div>


                    <div className="admin-stat-card review">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                U
                            </span>

                            <span className="admin-stat-label">
                                Under Review
                            </span>
                        </div>

                        <strong>
                            {stats.underReviewIssues}
                        </strong>

                        <span className="admin-stat-description">
                            Currently being reviewed
                        </span>

                    </div>


                    <div className="admin-stat-card progress">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                P
                            </span>

                            <span className="admin-stat-label">
                                In Progress
                            </span>
                        </div>

                        <strong>
                            {stats.inProgressIssues}
                        </strong>

                        <span className="admin-stat-description">
                            Work currently underway
                        </span>

                    </div>


                    <div className="admin-stat-card resolved">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                ✓
                            </span>

                            <span className="admin-stat-label">
                                Resolved
                            </span>
                        </div>

                        <strong>
                            {stats.resolvedIssues}
                        </strong>

                        <span className="admin-stat-description">
                            Successfully resolved
                        </span>

                    </div>

                </div>

            </section>


            {/* =========================
                USER OVERVIEW
            ========================= */}

            <section className="admin-dashboard-section">

                <div className="admin-section-heading">

                    <div>
                        <h2>User Overview</h2>

                        <p>
                            Current platform user statistics.
                        </p>
                    </div>

                </div>


                <div className="admin-stat-grid">

                    <div className="admin-stat-card">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                U
                            </span>

                            <span className="admin-stat-label">
                                Total Users
                            </span>
                        </div>

                        <strong>
                            {stats.totalUsers}
                        </strong>

                        <span className="admin-stat-description">
                            Registered platform users
                        </span>

                    </div>


                    <div className="admin-stat-card citizen">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                C
                            </span>

                            <span className="admin-stat-label">
                                Citizens
                            </span>
                        </div>

                        <strong>
                            {stats.totalCitizens}
                        </strong>

                        <span className="admin-stat-description">
                            Registered citizens
                        </span>

                    </div>


                    <div className="admin-stat-card worker">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                W
                            </span>

                            <span className="admin-stat-label">
                                Field Workers
                            </span>
                        </div>

                        <strong>
                            {stats.totalFieldWorkers}
                        </strong>

                        <span className="admin-stat-description">
                            Active field workforce
                        </span>

                    </div>


                    <div className="admin-stat-card active">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                A
                            </span>

                            <span className="admin-stat-label">
                                Active Users
                            </span>
                        </div>

                        <strong>
                            {stats.activeUsers}
                        </strong>

                        <span className="admin-stat-description">
                            Currently active accounts
                        </span>

                    </div>


                    <div className="admin-stat-card suspended">

                        <div className="admin-stat-card-top">
                            <span className="admin-stat-icon">
                                S
                            </span>

                            <span className="admin-stat-label">
                                Suspended Users
                            </span>
                        </div>

                        <strong>
                            {stats.suspendedUsers}
                        </strong>

                        <span className="admin-stat-description">
                            Suspended accounts
                        </span>

                    </div>

                </div>

            </section>


            {/* =========================
                STATUS SUMMARY
            ========================= */}

            <section className="admin-dashboard-section">

                <div className="admin-section-heading">

                    <div>
                        <h2>Issue Status Summary</h2>

                        <p>
                            Distribution of issues across the workflow.
                        </p>
                    </div>

                </div>


                <div className="admin-summary-panel">

                    <div className="admin-summary-row">

                        <div className="admin-summary-info">
                            <span>Reported</span>
                            <strong>
                                {stats.reportedIssues}
                            </strong>
                        </div>

                        <div className="admin-summary-track">
                            <div
                                className="admin-summary-fill reported-fill"
                                style={{
                                    width: `${
                                        stats.totalIssues
                                            ? (stats.reportedIssues /
                                            stats.totalIssues) * 100
                                            : 0
                                    }%`
                                }}
                            />
                        </div>

                    </div>


                    <div className="admin-summary-row">

                        <div className="admin-summary-info">
                            <span>Under Review</span>
                            <strong>
                                {stats.underReviewIssues}
                            </strong>
                        </div>

                        <div className="admin-summary-track">
                            <div
                                className="admin-summary-fill review-fill"
                                style={{
                                    width: `${
                                        stats.totalIssues
                                            ? (stats.underReviewIssues /
                                            stats.totalIssues) * 100
                                            : 0
                                    }%`
                                }}
                            />
                        </div>

                    </div>


                    <div className="admin-summary-row">

                        <div className="admin-summary-info">
                            <span>In Progress</span>
                            <strong>
                                {stats.inProgressIssues}
                            </strong>
                        </div>

                        <div className="admin-summary-track">
                            <div
                                className="admin-summary-fill progress-fill"
                                style={{
                                    width: `${
                                        stats.totalIssues
                                            ? (stats.inProgressIssues /
                                            stats.totalIssues) * 100
                                            : 0
                                    }%`
                                }}
                            />
                        </div>

                    </div>


                    <div className="admin-summary-row">

                        <div className="admin-summary-info">
                            <span>Resolved</span>
                            <strong>
                                {stats.resolvedIssues}
                            </strong>
                        </div>

                        <div className="admin-summary-track">
                            <div
                                className="admin-summary-fill resolved-fill"
                                style={{
                                    width: `${
                                        stats.totalIssues
                                            ? (stats.resolvedIssues /
                                            stats.totalIssues) * 100
                                            : 0
                                    }%`
                                }}
                            />
                        </div>

                    </div>

                </div>

            </section>

        </div>
    )
}

export default AdminDashboardPage