import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    createFieldWorker,
    getAllUsers,
    updateAccountStatus,
} from '../../api/userApi'

import '../../styles/adminCSS/adminWorkers.css'



const AdminWorkersPage = () => {

    const [workers, setWorkers] = useState([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    const [search, setSearch] = useState('')

    const [statusFilter, setStatusFilter] = useState('')

    const [showCreateForm, setShowCreateForm] =
        useState(false)

    const [creating, setCreating] = useState(false)

    const [createError, setCreateError] =
        useState('')


    const [createSuccess, setCreateSuccess] =
        useState('')

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
    })


    /* =========================
       LOAD WORKERS
    ========================= */

    const loadWorkers = async () => {

        try {

            setLoading(true)
            setError('')

            const response =
                await getAllUsers({
                    role: 'FIELD_WORKER',
                    status: statusFilter || undefined,
                })

            const users =
                response?.data ?? []

            setWorkers(users)

        } catch (err) {

            console.error(
                'Failed to load field workers:',
                err
            )

            setError(
                err?.response?.data?.message ||
                'Failed to load field workers.'
            )

        } finally {

            setLoading(false)
        }
    }


    useEffect(() => {

        loadWorkers()

    }, [statusFilter])


    /* =========================
       SEARCH
    ========================= */

    const filteredWorkers = useMemo(() => {

        const keyword =
            search.trim().toLowerCase()

        if (!keyword) {
            return workers
        }

        return workers.filter(worker => {

            return (
                worker.fullName
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                worker.email
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                worker.phoneNumber
                    ?.toLowerCase()
                    .includes(keyword)
            )
        })

    }, [workers, search])


    /* =========================
       FORM HANDLER
    ========================= */

    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target

        setFormData(previous => ({
            ...previous,
            [name]: value,
        }))
    }


    /* =========================
       CREATE WORKER
    ========================= */

    const handleCreateWorker = async (event) => {

        event.preventDefault()

        setCreateError('')
        setCreateSuccess('')

        if (
            !formData.fullName.trim() ||
            !formData.email.trim() ||
            !formData.phoneNumber.trim() ||
            !formData.password
        ) {

            setCreateError(
                'Please fill in all fields.'
            )

            return
        }

        try {

            setCreating(true)

            await createFieldWorker({
                fullName:
                    formData.fullName.trim(),

                email:
                    formData.email.trim(),

                phoneNumber:
                    formData.phoneNumber.trim(),

                password:
                formData.password,
            })

            setCreateSuccess(
                'Field worker created successfully.'
            )

            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                password: '',
            })

            await loadWorkers()

        } catch (err) {

            console.error(
                'Failed to create field worker:',
                err
            )

            setCreateError(
                err?.response?.data?.message ||
                'Failed to create field worker.'
            )

        } finally {

            setCreating(false)
        }
    }


    /* =========================
       ACCOUNT STATUS
    ========================= */

    const handleStatusChange = async (
        worker
    ) => {

        const newStatus =
            worker.accountStatus === 'ACTIVE'
                ? 'SUSPENDED'
                : 'ACTIVE'

        const confirmed =
            window.confirm(
                `Are you sure you want to ${
                    newStatus === 'SUSPENDED'
                        ? 'suspend'
                        : 'activate'
                } ${worker.fullName}?`
            )

        if (!confirmed) {
            return
        }

        try {

            await updateAccountStatus(
                worker.id,
                newStatus
            )

            setWorkers(previous =>
                previous.map(item =>
                    item.id === worker.id
                        ? {
                            ...item,
                            accountStatus:
                            newStatus,
                        }
                        : item
                )
            )

        } catch (err) {

            console.error(
                'Failed to update worker status:',
                err
            )

            setError(
                err?.response?.data?.message ||
                'Failed to update worker status.'
            )
        }
    }


    /* =========================
       FORMAT DATE
    ========================= */

    const formatDate = (date) => {

        if (!date) {
            return '-'
        }

        return new Date(date)
            .toLocaleDateString('en-GB')
    }


    return (
        <div className="admin-workers-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="admin-workers-header">

                <div>

                    <div className="admin-workers-eyebrow">
                        FIELD OPERATIONS
                    </div>

                    <h1>
                        Field Workers
                    </h1>

                    <p>
                        Manage active and suspended field
                        workers responsible for resolving
                        civic issues.
                    </p>

                </div>

                <button
                    type="button"
                    className="admin-workers-create-button"
                    onClick={() => {

                        setShowCreateForm(
                            previous => !previous
                        )

                        setCreateError('')
                        setCreateSuccess('')
                    }}
                >
                    {showCreateForm
                        ? 'Close Form'
                        : '+ Add Field Worker'}
                </button>

            </div>


            {/* =========================
                CREATE WORKER
            ========================= */}

            {showCreateForm && (

                <section className="admin-workers-create-card">

                    <div className="admin-workers-section-heading">

                        <h2>
                            Create Field Worker
                        </h2>

                        <p>
                            Create a new field worker account.
                        </p>

                    </div>


                    <form
                        className="admin-workers-form"
                        onSubmit={handleCreateWorker}
                    >

                        <div className="admin-workers-form-grid">

                            <div className="admin-workers-field">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Enter full name"
                                />

                            </div>


                            <div className="admin-workers-field">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Enter email"
                                />

                            </div>


                            <div className="admin-workers-field">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={
                                        formData.phoneNumber
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Enter phone number"
                                />

                            </div>


                            <div className="admin-workers-field">

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Create password"
                                />

                            </div>

                        </div>


                        {createError && (

                            <div className="admin-workers-form-error">
                                {createError}
                            </div>

                        )}


                        {createSuccess && (

                            <div className="admin-workers-form-success">
                                {createSuccess}
                            </div>

                        )}


                        <div className="admin-workers-form-actions">

                            <button
                                type="submit"
                                disabled={creating}
                                className="admin-workers-submit-button"
                            >
                                {creating
                                    ? 'Creating...'
                                    : 'Create Field Worker'}
                            </button>

                        </div>

                    </form>

                </section>

            )}


            {/* =========================
                FILTERS
            ========================= */}

            <section className="admin-workers-filter-card">

                <div className="admin-workers-search">

                    <input
                        type="text"
                        value={search}
                        onChange={event =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search by name, email or phone..."
                    />

                </div>


                <div className="admin-workers-status-filter">

                    <select
                        value={statusFilter}
                        onChange={event =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
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

            </section>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

                <div className="admin-workers-error">
                    {error}
                </div>

            )}


            {/* =========================
                SUMMARY
            ========================= */}

            {!loading && !error && (

                <div className="admin-workers-summary">

                    Showing{' '}
                    <strong>
                        {filteredWorkers.length}
                    </strong>{' '}
                    of{' '}
                    <strong>
                        {workers.length}
                    </strong>{' '}
                    field workers

                </div>

            )}


            {/* =========================
                TABLE
            ========================= */}

            <section className="admin-workers-table-card">

                {loading ? (

                    <div className="admin-workers-loading">
                        Loading field workers...
                    </div>

                ) : filteredWorkers.length === 0 ? (

                    <div className="admin-workers-empty">

                        <h3>
                            No field workers found
                        </h3>

                        <p>
                            Try changing the search or
                            status filter.
                        </p>

                    </div>

                ) : (

                    <div className="admin-workers-table-wrapper">

                        <table className="admin-workers-table">

                            <thead>

                            <tr>

                                <th>
                                    WORKER
                                </th>

                                <th>
                                    EMAIL
                                </th>

                                <th>
                                    PHONE
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    JOINED
                                </th>

                                <th>
                                    ACTION
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {filteredWorkers.map(
                                worker => (

                                    <tr
                                        key={worker.id}
                                    >

                                        <td>

                                            <div className="admin-worker-name">
                                                {worker.fullName}
                                            </div>

                                            <div className="admin-worker-id">
                                                #{worker.id.slice(
                                                0,
                                                8
                                            )}
                                            </div>

                                        </td>


                                        <td>
                                            {worker.email}
                                        </td>


                                        <td>
                                            {worker.phoneNumber}
                                        </td>


                                        <td>

                                                <span
                                                    className={
                                                        worker.accountStatus ===
                                                        'ACTIVE'
                                                            ? 'admin-worker-status active'
                                                            : 'admin-worker-status suspended'
                                                    }
                                                >
                                                    {
                                                        worker.accountStatus
                                                    }
                                                </span>

                                        </td>


                                        <td>
                                            {formatDate(
                                                worker.createdAt
                                            )}
                                        </td>


                                        <td>

                                            <button
                                                type="button"
                                                className={
                                                    worker.accountStatus ===
                                                    'ACTIVE'
                                                        ? 'admin-worker-action suspend'
                                                        : 'admin-worker-action activate'
                                                }
                                                onClick={() =>
                                                    handleStatusChange(
                                                        worker
                                                    )
                                                }
                                            >
                                                {
                                                    worker.accountStatus ===
                                                    'ACTIVE'
                                                        ? 'Suspend'
                                                        : 'Activate'
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

export default AdminWorkersPage