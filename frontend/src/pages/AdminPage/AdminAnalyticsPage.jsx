import { useEffect, useState } from 'react'
import { getAdminAnalytics } from '../../api/adminApi'
import '../../styles/adminCSS/adminAnalytics.css'

function AdminAnalyticsPage() {

    const [analytics, setAnalytics] = useState(null)

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')


    /* =========================
       LOAD ANALYTICS
    ========================= */

    const loadAnalytics = async () => {

        try {

            setLoading(true)
            setError('')

            const response =
                await getAdminAnalytics()

            console.log(
                'Admin analytics:',
                response
            )

            setAnalytics(
                response?.data ||
                response ||
                null
            )

        } catch (err) {

            console.error(
                'Failed to load admin analytics:',
                err
            )

            setError(
                'Failed to load analytics data.'
            )

        } finally {

            setLoading(false)
        }
    }


    /* =========================
       INITIAL LOAD
    ========================= */

    useEffect(() => {

        loadAnalytics()

    }, [])


    /* =========================
       HELPERS
    ========================= */

    const getTotal = (items = []) => {

        return items.reduce(
            (total, item) =>
                total + Number(item.count || 0),
            0
        )
    }


    const formatLabel = (label) => {

        if (!label) {
            return '—'
        }

        return String(label)
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            )
    }


    const getPercentage = (
        count,
        total
    ) => {

        if (!total) {
            return 0
        }

        return Math.round(
            (Number(count) / total) * 100
        )
    }


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="admin-analytics-page">

                <div className="admin-analytics-state">

                    Loading analytics...

                </div>

            </div>
        )
    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (
            <div className="admin-analytics-page">

                <div className="admin-analytics-state error">

                    {error}

                    <button
                        type="button"
                        onClick={loadAnalytics}
                    >
                        Retry
                    </button>

                </div>

            </div>
        )
    }


    /* =========================
       SAFE DATA
    ========================= */

    const issuesByStatus =
        analytics?.issuesByStatus || []

    const issuesByCategory =
        analytics?.issuesByCategory || []

    const issuesByPriority =
        analytics?.issuesByPriority || []


    const totalIssues = Math.max(
        getTotal(issuesByStatus),
        getTotal(issuesByCategory),
        getTotal(issuesByPriority)
    )


    const resolvedIssues =
        issuesByStatus.find(
            item =>
                item.label === 'RESOLVED'
        )?.count || 0


    const rejectedIssues =
        issuesByStatus.find(
            item =>
                item.label === 'REJECTED'
        )?.count || 0


    const activeIssues =
        Math.max(
            totalIssues -
            Number(resolvedIssues) -
            Number(rejectedIssues),
            0
        )


    const resolutionRate =
        totalIssues > 0
            ? Math.round(
                (Number(resolvedIssues) /
                    totalIssues) *
                100
            )
            : 0


    return (
        <div className="admin-analytics-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-analytics-header">

                <div>

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Understand issue trends,
                        distribution and resolution
                        performance.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-analytics-refresh"
                    onClick={loadAnalytics}
                >
                    Refresh
                </button>

            </div>


            {/* =========================
                OVERVIEW
            ========================= */}

            <section className="admin-analytics-overview">


                <div className="admin-analytics-stat-card">

                    <span>
                        Total Issues
                    </span>

                    <strong>
                        {totalIssues}
                    </strong>

                </div>


                <div className="admin-analytics-stat-card">

                    <span>
                        Resolved Issues
                    </span>

                    <strong>
                        {resolvedIssues}
                    </strong>

                </div>


                <div className="admin-analytics-stat-card">

                    <span>
                        Active Issues
                    </span>

                    <strong>
                        {activeIssues}
                    </strong>

                </div>


                <div className="admin-analytics-stat-card">

                    <span>
                        Resolution Rate
                    </span>

                    <strong>
                        {resolutionRate}%
                    </strong>

                </div>

            </section>


            {/* =========================
                STATUS ANALYTICS
            ========================= */}

            <section className="admin-analytics-card">

                <div className="admin-analytics-card-header">

                    <div>

                        <h2>
                            Issues by Status
                        </h2>

                        <p>
                            Current distribution of
                            reported issues.
                        </p>

                    </div>

                    <span>
                        {totalIssues} Issues
                    </span>

                </div>


                {issuesByStatus.length === 0 ? (

                    <div className="admin-analytics-empty">

                        No status data available.

                    </div>

                ) : (

                    <div className="admin-analytics-bars">

                        {issuesByStatus.map(
                            (item) => {

                                const percentage =
                                    getPercentage(
                                        item.count,
                                        totalIssues
                                    )

                                return (

                                    <div
                                        className="admin-analytics-bar-row"
                                        key={item.label}
                                    >

                                        <div className="admin-analytics-bar-info">

                                            <span>
                                                {formatLabel(
                                                    item.label
                                                )}
                                            </span>

                                            <strong>
                                                {item.count}
                                            </strong>

                                        </div>


                                        <div className="admin-analytics-bar-track">

                                            <div
                                                className="admin-analytics-bar-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>


                                        <span className="admin-analytics-percentage">

                                            {percentage}%

                                        </span>

                                    </div>
                                )
                            }
                        )}

                    </div>
                )}

            </section>


            {/* =========================
                CATEGORY ANALYTICS
            ========================= */}

            <section className="admin-analytics-card">

                <div className="admin-analytics-card-header">

                    <div>

                        <h2>
                            Issues by Category
                        </h2>

                        <p>
                            Categories generating the
                            most civic issues.
                        </p>

                    </div>

                    <span>
                        {issuesByCategory.length} Categories
                    </span>

                </div>


                {issuesByCategory.length === 0 ? (

                    <div className="admin-analytics-empty">

                        No category data available.

                    </div>

                ) : (

                    <div className="admin-analytics-category-grid">

                        {issuesByCategory.map(
                            (item) => {

                                const percentage =
                                    getPercentage(
                                        item.count,
                                        totalIssues
                                    )

                                return (

                                    <div
                                        className="admin-analytics-category-item"
                                        key={item.label}
                                    >

                                        <div>

                                            <span>
                                                {formatLabel(
                                                    item.label
                                                )}
                                            </span>

                                            <strong>
                                                {item.count}
                                            </strong>

                                        </div>


                                        <div className="admin-analytics-category-track">

                                            <div
                                                className="admin-analytics-category-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>


                                        <small>
                                            {percentage}% of issues
                                        </small>

                                    </div>
                                )
                            }
                        )}

                    </div>
                )}

            </section>


            {/* =========================
                PRIORITY ANALYTICS
            ========================= */}

            <section className="admin-analytics-card">

                <div className="admin-analytics-card-header">

                    <div>

                        <h2>
                            Issues by Priority
                        </h2>

                        <p>
                            Distribution based on
                            automatically evaluated
                            issue priority.
                        </p>

                    </div>

                    <span>
                        {issuesByPriority.length} Priorities
                    </span>

                </div>


                {issuesByPriority.length === 0 ? (

                    <div className="admin-analytics-empty">

                        No priority data available.

                    </div>

                ) : (

                    <div className="admin-analytics-priority-grid">

                        {issuesByPriority.map(
                            (item) => {

                                const percentage =
                                    getPercentage(
                                        item.count,
                                        totalIssues
                                    )

                                return (

                                    <div
                                        className="admin-analytics-priority-card"
                                        key={item.label}
                                    >

                                        <span>
                                            {formatLabel(
                                                item.label
                                            )}
                                        </span>

                                        <strong>
                                            {item.count}
                                        </strong>

                                        <small>
                                            {percentage}%
                                        </small>

                                    </div>
                                )
                            }
                        )}

                    </div>
                )}

            </section>

        </div>
    )
}

export default AdminAnalyticsPage