import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import {getAllIssues} from '../../api/issueApi'
import '../../styles/adminCSS/adminAssignments.css'

function AdminAssignmentsPage() {

    const navigate = useNavigate()

    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [searchKeyword, setSearchKeyword] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')

    useEffect(() => {
        loadIssues()
    }, [])

    const loadIssues = async () => {

        try {

            setLoading(true)
            setError('')

            const response = await getAllIssues({
                page: 0,
                size: 50,
                sort: 'createdAt,desc',
            })

            console.log(
                'Admin assignments raw response:',
                response
            )

            const issuesData =
                response?.data?.content ||
                response?.content ||
                []

            console.log(
                'Admin assignments extracted issues:',
                issuesData
            )

            setIssues(issuesData)

        } catch (err) {

            console.error(
                'Failed to load assignment issues:',
                err
            )

            setError(
                'Failed to load assignment information.'
            )

        } finally {

            setLoading(false)
        }
    }

    const filteredIssues = useMemo(() => {

        return issues.filter((issue) => {

            const keyword =
                searchKeyword.trim().toLowerCase()

            const matchesSearch =
                !keyword ||
                issue.title?.toLowerCase().includes(keyword) ||
                issue.assignedToName
                    ?.toLowerCase()
                    .includes(keyword)

            const matchesStatus =
                !statusFilter ||
                issue.status === statusFilter

            const matchesCategory =
                !categoryFilter ||
                issue.category === categoryFilter

            const matchesPriority =
                !priorityFilter ||
                issue.priority === priorityFilter

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory &&
                matchesPriority
            )
        })

    }, [
        issues,
        searchKeyword,
        statusFilter,
        categoryFilter,
        priorityFilter
    ])

    const handleAssignmentAction = (issueId) => {

        navigate(
            `/admin/issues/${issueId}`
        )
    }

    const clearFilters = () => {

        setSearchKeyword('')
        setStatusFilter('')
        setCategoryFilter('')
        setPriorityFilter('')
    }

    return (
        <div className="admin-assignments-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="admin-assignments-header">

                <div>
                    <h1>Assignment Management</h1>

                    <p>
                        Manage issue assignments and field
                        worker allocation.
                    </p>
                </div>

            </div>


            {/* =========================
                FILTERS
            ========================= */}

            <section className="admin-assignments-filter-card">

                <div className="admin-assignment-search">

                    <label htmlFor="assignment-search">
                        Search issues
                    </label>

                    <input
                        id="assignment-search"
                        type="text"
                        placeholder="Search by issue title or worker..."
                        value={searchKeyword}
                        onChange={(event) =>
                            setSearchKeyword(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="admin-assignment-filter">

                    <label htmlFor="assignment-status">
                        Status
                    </label>

                    <select
                        id="assignment-status"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="REPORTED">
                            Reported
                        </option>

                        <option value="UNDER_REVIEW">
                            Under Review
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="RESOLVED">
                            Resolved
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>

                    </select>

                </div>


                <div className="admin-assignment-filter">

                    <label htmlFor="assignment-category">
                        Category
                    </label>

                    <select
                        id="assignment-category"
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Categories
                        </option>

                        <option value="POTHOLE">
                            Pothole
                        </option>

                        <option value="STREETLIGHT">
                            Streetlight
                        </option>

                        <option value="GARBAGE">
                            Garbage
                        </option>

                        <option value="WATER_SUPPLY">
                            Water Supply
                        </option>

                        <option value="DRAINAGE">
                            Drainage
                        </option>

                        <option value="ROAD_DAMAGE">
                            Road Damage
                        </option>

                    </select>

                </div>


                <div className="admin-assignment-filter">

                    <label htmlFor="assignment-priority">
                        Priority
                    </label>

                    <select
                        id="assignment-priority"
                        value={priorityFilter}
                        onChange={(event) =>
                            setPriorityFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Priorities
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                    </select>

                </div>


                <button
                    type="button"
                    className="admin-assignment-clear-button"
                    onClick={clearFilters}
                >
                    Clear
                </button>

            </section>


            {/* =========================
                CONTENT
            ========================= */}

            <section className="admin-assignments-table-card">

                {loading && (
                    <div className="admin-assignment-state">
                        Loading assignments...
                    </div>
                )}


                {!loading && error && (
                    <div className="admin-assignment-state error">
                        {error}
                    </div>
                )}


                {!loading &&
                    !error &&
                    filteredIssues.length === 0 && (

                        <div className="admin-assignment-state">
                            No issues found.
                        </div>

                    )}


                {!loading &&
                    !error &&
                    filteredIssues.length > 0 && (

                        <div className="admin-assignments-table-wrapper">

                            <table className="admin-assignments-table">

                                <thead>

                                <tr>
                                    <th>Issue</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Assigned Worker</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                                </thead>


                                <tbody>

                                {filteredIssues.map(
                                    (issue) => (

                                        <tr key={issue.id}>

                                            <td>

                                                <div className="admin-assignment-issue">

                                                    <strong>
                                                        {issue.title}
                                                    </strong>

                                                    <span>
                                                            #
                                                        {issue.id
                                                            ?.slice(
                                                                0,
                                                                8
                                                            )}
                                                        </span>

                                                </div>

                                            </td>


                                            <td>
                                                {issue.category}
                                            </td>


                                            <td>
                                                    <span
                                                        className={`assignment-priority assignment-priority-${issue.priority?.toLowerCase()}`}
                                                    >
                                                        {issue.priority}
                                                    </span>
                                            </td>


                                            <td>
                                                {issue.assignedToName ? (
                                                    <div className="assignment-worker">
                                                        <strong>
                                                            {issue.assignedToName}
                                                        </strong>

                                                        {issue.assignedToEmail && (
                                                            <small>
                                                                {issue.assignedToEmail}
                                                            </small>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="not-assigned">
                                                      Not Assigned
                                                    </span>
                                                )}
                                            </td>


                                            <td>

                                                    <span
                                                        className={`assignment-status assignment-status-${issue.status?.toLowerCase()}`}
                                                    >
                                                        {
                                                            issue.status
                                                        }
                                                    </span>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="admin-assignment-action-button"
                                                    onClick={() =>
                                                        handleAssignmentAction(
                                                            issue.id
                                                        )
                                                    }
                                                >
                                                    {
                                                        issue.assignedToId
                                                            ? 'Reassign'
                                                            : 'Assign'
                                                    }
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

export default AdminAssignmentsPage