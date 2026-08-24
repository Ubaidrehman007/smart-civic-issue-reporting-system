import { useEffect, useState } from 'react'
import {
    getAllIssues,
    getIssuesByStatus,
    getIssuesByCategory,
    getIssuesByPriority,
    searchIssues,
} from '../../api/issueApi'
import '../../styles/adminCSS/adminIssues.css'
import { useNavigate } from 'react-router-dom'

function AdminIssuesPage() {

    const [issues, setIssues] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const [statusFilter, setStatusFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const navigate = useNavigate()

    /*
     * searchInput
     *
     * This contains whatever the admin is currently typing.
     * It DOES NOT trigger the API request.
     */
    const [searchInput, setSearchInput] = useState('')

    /*
     * searchKeyword
     *
     * This contains the keyword that has actually been submitted.
     * API request is triggered only when this changes.
     */
    const [searchKeyword, setSearchKeyword] = useState('')


    /* =========================
       FETCH ISSUES
    ========================= */

    useEffect(() => {

        const fetchIssues = async () => {

            try {

                setLoading(true)
                setError('')

                const requestParams = {
                    page,
                    size: 10,
                    sort: 'createdAt,desc',
                }

                const keyword = searchKeyword.trim()

                let response


                /*
                 * SEARCH
                 */

                if (keyword) {

                    response = await searchIssues({
                        keyword,
                        ...requestParams,
                    })

                }


                /*
                 * STATUS FILTER
                 */

                else if (statusFilter) {

                    response = await getIssuesByStatus({
                        status: statusFilter,
                        ...requestParams,
                    })

                }


                /*
                 * CATEGORY FILTER
                 */

                else if (categoryFilter) {

                    response = await getIssuesByCategory({
                        category: categoryFilter,
                        ...requestParams,
                    })

                }


                /*
                 * PRIORITY FILTER
                 */

                else if (priorityFilter) {

                    response = await getIssuesByPriority({
                        priority: priorityFilter,
                        ...requestParams,
                    })

                }


                /*
                 * ALL ISSUES
                 */

                else {

                    response = await getAllIssues(
                        requestParams
                    )

                }


                console.log(
                    'Admin issues response:',
                    response
                )


                setIssues(
                    response.content || []
                )

                setTotalPages(
                    response.totalPages || 0
                )

                setTotalElements(
                    response.totalElements || 0
                )

            } catch (err) {

                console.error(
                    'Failed to fetch admin issues:',
                    err
                )

                setError(
                    err.response?.data?.message ||
                    'Failed to load issues.'
                )

                setIssues([])

                setTotalPages(0)

                setTotalElements(0)

            } finally {

                setLoading(false)
            }
        }

        fetchIssues()

    }, [
        page,
        statusFilter,
        categoryFilter,
        priorityFilter,
        searchKeyword,
    ])


    /* =========================
       SEARCH HANDLER
    ========================= */

    const handleSearchChange = (event) => {

        /*
         * Only update what the user is typing.
         *
         * IMPORTANT:
         * This does NOT trigger the API request.
         */
        setSearchInput(event.target.value)
    }


    const handleSearch = () => {

        const keyword = searchInput.trim()

        /*
         * Search starts from page 1.
         */
        setPage(0)

        /*
         * This triggers useEffect.
         */
        setSearchKeyword(keyword)
    }


    const handleSearchKeyDown = (event) => {

        if (event.key === 'Enter') {

            event.preventDefault()

            handleSearch()
        }
    }


    /* =========================
       STATUS FILTER
    ========================= */

    const handleStatusChange = (event) => {

        const value = event.target.value

        setStatusFilter(value)

        if (value) {

            setCategoryFilter('')
            setPriorityFilter('')

            /*
             * Clear active search when another
             * filter is selected.
             */
            setSearchInput('')
            setSearchKeyword('')
        }

        setPage(0)
    }


    /* =========================
       CATEGORY FILTER
    ========================= */

    const handleCategoryChange = (event) => {

        const value = event.target.value

        setCategoryFilter(value)

        if (value) {

            setStatusFilter('')
            setPriorityFilter('')

            /*
             * Clear active search when another
             * filter is selected.
             */
            setSearchInput('')
            setSearchKeyword('')
        }

        setPage(0)
    }


    /* =========================
       PRIORITY FILTER
    ========================= */

    const handlePriorityChange = (event) => {

        const value = event.target.value

        setPriorityFilter(value)

        if (value) {

            setStatusFilter('')
            setCategoryFilter('')

            /*
             * Clear active search when another
             * filter is selected.
             */
            setSearchInput('')
            setSearchKeyword('')
        }

        setPage(0)
    }


    /* =========================
       CLEAR FILTERS
    ========================= */

    const handleClearFilters = () => {

        /*
         * Clear BOTH search states.
         */
        setSearchInput('')
        setSearchKeyword('')

        setStatusFilter('')
        setCategoryFilter('')
        setPriorityFilter('')

        setPage(0)
    }


    /* =========================
       PAGINATION
    ========================= */

    const handlePreviousPage = () => {

        if (page > 0) {

            setPage(
                (currentPage) => currentPage - 1
            )
        }
    }


    const handleNextPage = () => {

        if (page < totalPages - 1) {

            setPage(
                (currentPage) => currentPage + 1
            )
        }
    }


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="admin-issues-page">

                <div className="admin-issues-state">
                    Loading issues...
                </div>

            </div>
        )
    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (
            <div className="admin-issues-page">

                <div className="admin-issues-error">
                    {error}
                </div>

            </div>
        )
    }


    return (
        <div className="admin-issues-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-issues-header">

                <div>

                    <p className="admin-issues-eyebrow">
                        ISSUE MANAGEMENT
                    </p>

                    <h1>
                        Issues
                    </h1>

                    <p>
                        Manage and monitor all reported
                        civic issues.
                    </p>

                </div>


                {/* =========================
                    SEARCH
                ========================= */}

                <div className="admin-issues-search">

                    <label
                        htmlFor="issue-search"
                        className="admin-issues-search-label"
                    >
                        Search
                    </label>

                    <div className="admin-issues-search-control">

                        <input
                            id="issue-search"
                            type="text"
                            value={searchInput}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search by title or address..."
                        />

                        <button
                            type="button"
                            className="admin-issues-search-button"
                            onClick={handleSearch}
                        >
                            Search
                        </button>

                    </div>

                </div>

            </div>


            {/* =========================
                FILTER BAR
            ========================= */}

            <div className="admin-issues-filter-bar">


                {/* STATUS */}

                <div className="admin-issues-filter-group">

                    <label htmlFor="status-filter">
                        Status
                    </label>

                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={handleStatusChange}
                    >

                        <option value="">
                            All Statuses
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

                    </select>

                </div>


                {/* CATEGORY */}

                <div className="admin-issues-filter-group">

                    <label htmlFor="category-filter">
                        Category
                    </label>

                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={handleCategoryChange}
                    >

                        <option value="">
                            All Categories
                        </option>

                        <option value="ROAD_DAMAGE">
                            Road Damage
                        </option>

                        <option value="STREETLIGHT">
                            Streetlight
                        </option>

                        <option value="GARBAGE">
                            Garbage
                        </option>

                        <option value="WATER_LEAKAGE">
                            Water Leakage
                        </option>

                        <option value="TRAFFIC_SIGNAL">
                            Traffic Signal
                        </option>

                        <option value="OTHER">
                            Other
                        </option>

                    </select>

                </div>


                {/* PRIORITY */}

                <div className="admin-issues-filter-group">

                    <label htmlFor="priority-filter">
                        Priority
                    </label>

                    <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={handlePriorityChange}
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

                    </select>

                </div>


                {/* CLEAR */}

                <button
                    type="button"
                    className="admin-issues-clear-button"
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </button>

            </div>


            {/* =========================
                RESULT SUMMARY
            ========================= */}

            <div className="admin-issues-result-summary">

                <span>
                    Showing {issues.length} of {totalElements} issues
                </span>


                {(searchKeyword ||
                    statusFilter ||
                    categoryFilter ||
                    priorityFilter) && (

                    <span className="admin-issues-active-filter">
                        Filter active
                    </span>

                )}

            </div>


            {/* =========================
                ISSUE TABLE
            ========================= */}

            <div className="admin-issues-table-wrapper">

                <table className="admin-issues-table">

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
                            Address
                        </th>

                        <th>
                            Created
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                    </thead>


                    <tbody>

                    {issues.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                className="admin-issues-empty"
                            >
                                No issues found.
                            </td>

                        </tr>

                    ) : (

                        issues.map((issue) => (

                            <tr key={issue.id}>


                                {/* ISSUE */}

                                <td>

                                    <div className="admin-issue-title">

                                        <strong>
                                            {issue.title}
                                        </strong>

                                        <span>
                                            #{issue.id.slice(0, 8)}
                                        </span>

                                    </div>

                                </td>


                                {/* CATEGORY */}

                                <td>

                                    <span className="admin-issue-category">
                                        {issue.category}
                                    </span>

                                </td>


                                {/* PRIORITY */}

                                <td>

                                    <span
                                        className={`admin-issue-priority ${issue.priority?.toLowerCase()}`}
                                    >
                                        {issue.priority}
                                    </span>

                                </td>


                                {/* STATUS */}

                                <td>

                                    <span
                                        className={`admin-issue-status ${issue.status?.toLowerCase()}`}
                                    >
                                        {issue.status}
                                    </span>

                                </td>


                                {/* ADDRESS */}

                                <td>

                                    <span className="admin-issue-address">
                                        {issue.address || 'N/A'}
                                    </span>

                                </td>


                                {/* CREATED */}

                                <td>

                                    <span className="admin-issue-date">

                                        {issue.createdAt
                                            ? new Date(
                                                issue.createdAt
                                            ).toLocaleDateString()
                                            : 'N/A'
                                        }

                                    </span>

                                </td>


                                {/* ACTION */}

                                <td>

                                    <button
                                        type="button"
                                        className="admin-issue-view-button"
                                        onClick={() =>
                                            navigate(`/admin/issues/${issue.id}`)
                                        }
                                    >
                                        View
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                    </tbody>

                </table>

            </div>


            {/* =========================
                PAGINATION
            ========================= */}

            {totalPages > 0 && (

                <div className="admin-issues-pagination">


                    <button
                        type="button"
                        onClick={handlePreviousPage}
                        disabled={page === 0}
                        className="admin-pagination-button"
                    >
                        ← Previous
                    </button>


                    <div className="admin-pagination-pages">

                        {Array.from(
                            { length: totalPages },
                            (_, index) => (

                                <button
                                    key={index}
                                    type="button"
                                    className={`admin-pagination-page ${
                                        page === index
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setPage(index)
                                    }
                                >
                                    {index + 1}
                                </button>

                            )
                        )}

                    </div>


                    <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={
                            page >= totalPages - 1
                        }
                        className="admin-pagination-button"
                    >
                        Next →
                    </button>

                </div>

            )}

        </div>
    )
}

export default AdminIssuesPage