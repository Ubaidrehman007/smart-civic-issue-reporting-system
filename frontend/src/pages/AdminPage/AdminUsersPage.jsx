import { useEffect, useMemo, useState } from 'react'
import {
    getAllUsers,
    searchUsers,
    updateAccountStatus,
} from '../../api/userApi.js'

import '../../styles/adminCSS/adminUsers.css'


function AdminUsersPage() {

    /* =========================
       USERS
    ========================= */

    const [users, setUsers] = useState([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')


    /* =========================
       SEARCH
    ========================= */

    const [searchInput, setSearchInput] = useState('')

    const [searchKeyword, setSearchKeyword] = useState('')


    /* =========================
       FILTERS
    ========================= */

    const [selectedRole, setSelectedRole] =
        useState('')

    const [selectedStatus, setSelectedStatus] =
        useState('')


    /* =========================
       ACTION STATE
    ========================= */

    const [updatingUserId, setUpdatingUserId] =
        useState(null)

    const [actionError, setActionError] =
        useState('')

    const [actionSuccess, setActionSuccess] =
        useState('')


    /* =========================
       PAGINATION
    ========================= */

    const [currentPage, setCurrentPage] =
        useState(0)

    const pageSize = 10


    /* =========================
       FETCH USERS
    ========================= */

    const fetchUsers = async () => {

        try {

            setLoading(true)
            setError('')

            let response

            /*
             * Search has priority.
             *
             * Backend search endpoint searches
             * fullName and email.
             */

            if (searchKeyword.trim()) {

                response =
                    await searchUsers(
                        searchKeyword.trim()
                    )

            } else {

                response =
                    await getAllUsers({
                        role:
                            selectedRole || undefined,

                        status:
                            selectedStatus || undefined,
                    })
            }


            console.log(
                'Admin users response:',
                response
            )


            setUsers(
                response?.data || []
            )

        } catch (err) {

            console.error(
                'Failed to fetch users:',
                err
            )

            setError(
                err.response?.data?.message ||
                'Failed to load users.'
            )

            setUsers([])

        } finally {

            setLoading(false)
        }
    }


    /* =========================
       SEARCH DEBOUNCE
    ========================= */

    useEffect(() => {

        const timer =
            setTimeout(() => {

                setSearchKeyword(
                    searchInput.trim()
                )

            }, 400)


        return () => {
            clearTimeout(timer)
        }

    }, [searchInput])


    /* =========================
       FETCH WHEN QUERY CHANGES
    ========================= */

    useEffect(() => {

        setCurrentPage(0)

        fetchUsers()

    }, [
        searchKeyword,
        selectedRole,
        selectedStatus,
    ])


    /* =========================
       FRONTEND PAGINATION
    ========================= */

    const totalPages =
        Math.ceil(
            users.length / pageSize
        )


    const paginatedUsers =
        useMemo(() => {

            const start =
                currentPage * pageSize

            const end =
                start + pageSize

            return users.slice(
                start,
                end
            )

        }, [
            users,
            currentPage,
        ])


    /* =========================
       CHANGE ACCOUNT STATUS
    ========================= */

    const handleAccountStatusChange = async (
        user
    ) => {

        const newStatus =
            user.accountStatus === 'ACTIVE'
                ? 'SUSPENDED'
                : 'ACTIVE'


        const action =
            newStatus === 'ACTIVE'
                ? 'activate'
                : 'suspend'


        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} ${user.fullName}?`
            )


        if (!confirmed) {
            return
        }


        try {

            setUpdatingUserId(user.id)

            setActionError('')
            setActionSuccess('')


            await updateAccountStatus(
                user.id,
                newStatus
            )


            /*
             * Update local state immediately.
             * No need for an extra API call.
             */

            setUsers(
                previousUsers =>
                    previousUsers.map(
                        existingUser =>
                            existingUser.id === user.id
                                ? {
                                    ...existingUser,
                                    accountStatus:
                                    newStatus,
                                }
                                : existingUser
                    )
            )


            setActionSuccess(
                `${user.fullName} is now ${newStatus.toLowerCase()}.`
            )

        } catch (err) {

            console.error(
                'Failed to update account status:',
                err
            )

            setActionError(
                err.response?.data?.message ||
                'Failed to update account status.'
            )

        } finally {

            setUpdatingUserId(null)
        }
    }


    /* =========================
       ROLE LABEL
    ========================= */

    const formatRole = (role) => {

        if (!role) {
            return 'N/A'
        }

        return role
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            )
    }


    /* =========================
       DATE FORMAT
    ========================= */

    const formatDate = (date) => {

        if (!date) {
            return 'N/A'
        }

        return new Date(date)
            .toLocaleDateString()
    }


    /* =========================
       PAGE BUTTONS
    ========================= */

    const goToPreviousPage = () => {

        setCurrentPage(
            previousPage =>
                Math.max(
                    previousPage - 1,
                    0
                )
        )
    }


    const goToNextPage = () => {

        setCurrentPage(
            previousPage =>
                Math.min(
                    previousPage + 1,
                    totalPages - 1
                )
        )
    }


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="admin-users-page">

                <div className="admin-users-state">

                    Loading users...

                </div>

            </div>
        )
    }


    return (

        <div className="admin-users-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-users-header">

                <div>

                    <p className="admin-users-eyebrow">
                        USER MANAGEMENT
                    </p>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage citizens, field workers,
                        and administrators.
                    </p>

                </div>

            </div>


            {/* =========================
                CONTROLS
            ========================= */}

            <div className="admin-users-controls">


                {/* SEARCH */}

                <div className="admin-users-search">

                    <input
                        type="text"
                        value={searchInput}
                        placeholder="Search by name or email..."
                        onChange={(event) => {

                            setSearchInput(
                                event.target.value
                            )

                        }}
                    />

                    {searchInput && (

                        <button
                            type="button"
                            className="admin-users-search-clear"
                            onClick={() =>
                                setSearchInput('')
                            }
                        >
                            ×
                        </button>

                    )}

                </div>


                {/* ROLE */}

                <select
                    value={selectedRole}
                    onChange={(event) => {

                        setSelectedRole(
                            event.target.value
                        )

                        setCurrentPage(0)

                    }}
                >

                    <option value="">
                        All Roles
                    </option>

                    <option value="CITIZEN">
                        Citizen
                    </option>

                    <option value="FIELD_WORKER">
                        Field Worker
                    </option>


                </select>


                {/* STATUS */}

                <select
                    value={selectedStatus}
                    onChange={(event) => {

                        setSelectedStatus(
                            event.target.value
                        )

                        setCurrentPage(0)

                    }}
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="ACTIVE">
                        Active
                    </option>

                    <option value="SUSPENDED">
                        Suspended
                    </option>

                </select>

            </div>


            {/* =========================
                ACTION MESSAGE
            ========================= */}

            {actionError && (

                <div className="admin-users-message error">

                    {actionError}

                </div>

            )}


            {actionSuccess && (

                <div className="admin-users-message success">

                    {actionSuccess}

                </div>

            )}


            {/* =========================
                FETCH ERROR
            ========================= */}

            {error && (

                <div className="admin-users-message error">

                    {error}

                </div>

            )}


            {/* =========================
                USER TABLE
            ========================= */}

            <div className="admin-users-table-wrapper">

                <table className="admin-users-table">

                    <thead>

                    <tr>

                        <th>
                            User
                        </th>

                        <th>
                            Email
                        </th>

                        <th>
                            Phone
                        </th>

                        <th>
                            Role
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Joined
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                    </thead>


                    <tbody>

                    {paginatedUsers.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                className="admin-users-empty"
                            >

                                No users found.

                            </td>

                        </tr>

                    ) : (

                        paginatedUsers.map(
                            user => (

                                <tr
                                    key={user.id}
                                >

                                    {/* USER */}

                                    <td>

                                        <div className="admin-user-name">

                                            <strong>
                                                {user.fullName}
                                            </strong>

                                            <span>
                                                #{user.id.slice(0, 8)}
                                            </span>

                                        </div>

                                    </td>


                                    {/* EMAIL */}

                                    <td>

                                        <span className="admin-user-email">

                                            {user.email}

                                        </span>

                                    </td>


                                    {/* PHONE */}

                                    <td>

                                        {user.phoneNumber ||
                                            'N/A'
                                        }

                                    </td>


                                    {/* ROLE */}

                                    <td>

                                        <span
                                            className={`admin-user-role ${user.role?.toLowerCase()}`}
                                        >

                                            {formatRole(
                                                user.role
                                            )}

                                        </span>

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={`admin-user-status ${user.accountStatus?.toLowerCase()}`}
                                        >

                                            {user.accountStatus}

                                        </span>

                                    </td>


                                    {/* JOINED */}

                                    <td>

                                        {formatDate(
                                            user.createdAt
                                        )}

                                    </td>


                                    {/* ACTION */}

                                    <td>

                                        {user.role === 'ADMIN' ? (

                                            <span className="admin-user-protected">

                                                Protected

                                            </span>

                                        ) : (

                                            <button
                                                type="button"
                                                className={`admin-user-status-button ${
                                                    user.accountStatus === 'ACTIVE'
                                                        ? 'suspend'
                                                        : 'activate'
                                                }`}
                                                disabled={
                                                    updatingUserId ===
                                                    user.id
                                                }
                                                onClick={() =>
                                                    handleAccountStatusChange(
                                                        user
                                                    )
                                                }
                                            >

                                                {updatingUserId ===
                                                user.id

                                                    ? 'Updating...'

                                                    : user.accountStatus ===
                                                    'ACTIVE'

                                                        ? 'Suspend'

                                                        : 'Activate'
                                                }

                                            </button>

                                        )}

                                    </td>

                                </tr>

                            )
                        )

                    )}

                    </tbody>

                </table>

            </div>


            {/* =========================
                PAGINATION
            ========================= */}

            {users.length > 0 && (

                <div className="admin-users-pagination">

                    <span>

                        Showing{' '}

                        {currentPage * pageSize + 1}

                        {' – '}

                        {Math.min(
                            (currentPage + 1) *
                            pageSize,
                            users.length
                        )}

                        {' of '}

                        {users.length}

                    </span>


                    <div>

                        <button
                            type="button"
                            onClick={
                                goToPreviousPage
                            }
                            disabled={
                                currentPage === 0
                            }
                        >
                            Previous
                        </button>


                        <span>

                            Page{' '}

                            {currentPage + 1}

                            {' of '}

                            {Math.max(
                                totalPages,
                                1
                            )}

                        </span>


                        <button
                            type="button"
                            onClick={
                                goToNextPage
                            }
                            disabled={
                                currentPage >=
                                totalPages - 1
                            }
                        >
                            Next
                        </button>

                    </div>

                </div>

            )}

        </div>
    )
}


export default AdminUsersPage