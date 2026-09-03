import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    getIssueById,
    getIssueStatusHistory,
    updateIssueStatus,
    assignIssue,
} from '../../api/issueApi.js'

import {
    getActiveFieldWorkers,
} from '../../api/userApi.js'

import '../../styles/adminCSS/adminIssueDetails.css'


function AdminIssueDetailsPage() {

    const { issueId } = useParams()
    const navigate = useNavigate()


    /* =========================
       ISSUE STATE
    ========================= */

    const [issue, setIssue] = useState(null)
    const [statusHistory, setStatusHistory] = useState([])


    /* =========================
       STATUS STATE
    ========================= */

    const [selectedStatus, setSelectedStatus] = useState('')

    const [evidencePhoto, setEvidencePhoto] = useState(null)

    const [updatingStatus, setUpdatingStatus] = useState(false)

    const [statusError, setStatusError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')


    /* =========================
       PAGE STATE
    ========================= */

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    /* =========================
       FIELD WORKER STATE
    ========================= */

    const [fieldWorkers, setFieldWorkers] = useState([])

    const [selectedWorkerId, setSelectedWorkerId] =
        useState('')

    const [loadingWorkers, setLoadingWorkers] =
        useState(true)

    const [assigningIssue, setAssigningIssue] =
        useState(false)

    const [assignmentError, setAssignmentError] =
        useState('')

    const [assignmentSuccess, setAssignmentSuccess] =
        useState('')


    /* =========================
       IMAGE URL HELPER
    ========================= */

    const getImageUrl = (imageUrl) => {

        if (!imageUrl) {
            return null
        }

        /*
         * Backend returns the stored image path/name.
         *
         * Keep the same image endpoint already
         * used by the project.
         */

        return `http://localhost:8080/api/images/${encodeURIComponent(
            imageUrl
        )}`
    }


    /* =========================
       FETCH ISSUE DETAILS
    ========================= */

    const fetchIssueDetails = async () => {

        try {

            setLoading(true)
            setError('')

            const [
                issueResponse,
                historyResponse,
            ] = await Promise.all([

                getIssueById(issueId),

                getIssueStatusHistory(issueId),

            ])


            console.log(
                'Admin issue details:',
                issueResponse
            )

            console.log(
                'Admin issue status history:',
                historyResponse
            )


            setIssue(issueResponse)


            setSelectedStatus(
                issueResponse?.status || ''
            )


            setStatusHistory(
                historyResponse || []
            )


            setSelectedWorkerId(
                issueResponse?.assignedToId || ''
            )

        } catch (err) {

            console.error(
                'Failed to fetch issue details:',
                err
            )

            setError(
                err.response?.data?.message ||
                'Failed to load issue details.'
            )

        } finally {

            setLoading(false)
        }
    }


    /* =========================
       FETCH ACTIVE FIELD WORKERS
    ========================= */

    const fetchFieldWorkers = async () => {

        try {

            setLoadingWorkers(true)

            setAssignmentError('')

            const response =
                await getActiveFieldWorkers()


            console.log(
                'Active field workers:',
                response
            )


            setFieldWorkers(
                response?.data || []
            )

        } catch (err) {

            console.error(
                'Failed to fetch active field workers:',
                err
            )

            setAssignmentError(
                err.response?.data?.message ||
                'Failed to load field workers.'
            )

        } finally {

            setLoadingWorkers(false)
        }
    }


    /* =========================
       INITIAL LOAD
    ========================= */

    useEffect(() => {

        if (!issueId) {
            return
        }

        fetchIssueDetails()

        fetchFieldWorkers()

    }, [issueId])


    /* =========================
       ALLOWED STATUS TRANSITIONS
    ========================= */

    const getAllowedNextStatuses = (currentStatus) => {

        switch (currentStatus) {

            case 'REPORTED':

                return [
                    'UNDER_REVIEW',
                ]


            case 'UNDER_REVIEW':

                return [
                    'IN_PROGRESS',
                    'REJECTED',
                ]


            case 'IN_PROGRESS':

                return [
                    'RESOLVED',
                ]


            case 'RESOLVED':
            case 'REJECTED':
            default:

                return []
        }
    }


    const allowedNextStatuses =
        getAllowedNextStatuses(issue?.status)


    /* =========================
       PHOTO REQUIRED CHECK
    ========================= */

    const isEvidencePhotoRequired = (
        status
    ) => {

        return (
            status === 'IN_PROGRESS' ||
            status === 'RESOLVED'
        )
    }


    /* =========================
       STATUS SELECTION
    ========================= */

    const handleStatusSelection = (event) => {

        const nextStatus =
            event.target.value

        setSelectedStatus(nextStatus)

        setStatusError('')
        setSuccessMessage('')

        /*
         * Whenever status changes,
         * clear previously selected file.
         *
         * This prevents accidentally sending
         * the wrong evidence photo.
         */

        setEvidencePhoto(null)

    }


    /* =========================
       EVIDENCE PHOTO SELECTION
    ========================= */

    const handleEvidencePhotoChange = (
        event
    ) => {

        const file =
            event.target.files?.[0] || null

        setEvidencePhoto(file)

        setStatusError('')
        setSuccessMessage('')
    }


    /* =========================
       UPDATE STATUS
    ========================= */

    const handleStatusUpdate = async () => {

        if (!issue) {
            return
        }


        if (!selectedStatus) {

            setStatusError(
                'Please select a status.'
            )

            return
        }


        if (selectedStatus === issue.status) {

            setStatusError(
                'Please select a different status.'
            )

            return
        }


        if (
            !allowedNextStatuses.includes(
                selectedStatus
            )
        ) {

            setStatusError(
                'Invalid status transition.'
            )

            return
        }


        /*
         * Evidence photo is mandatory for:
         *
         * UNDER_REVIEW → IN_PROGRESS
         * IN_PROGRESS → RESOLVED
         */

        if (
            isEvidencePhotoRequired(
                selectedStatus
            ) &&
            !evidencePhoto
        ) {

            setStatusError(
                selectedStatus === 'RESOLVED'
                    ? 'Resolution photo is required before resolving the issue.'
                    : 'Evidence photo is required before starting the work.'
            )

            return
        }


        try {

            setUpdatingStatus(true)

            setStatusError('')
            setSuccessMessage('')


            await updateIssueStatus({

                issueId,

                status: selectedStatus,

                evidencePhoto,

            })


            setSuccessMessage(
                selectedStatus === 'RESOLVED'
                    ? 'Issue resolved successfully with resolution evidence.'
                    : 'Issue status updated successfully.'
            )


            /*
             * Clear selected photo after
             * successful upload.
             */

            setEvidencePhoto(null)


            /*
             * Reset file input manually.
             */

            const fileInput =
                document.getElementById(
                    'admin-evidence-photo'
                )

            if (fileInput) {
                fileInput.value = ''
            }


            /*
             * Fetch fresh issue details
             * and status history.
             */

            const [
                updatedIssue,
                updatedHistory,
            ] = await Promise.all([

                getIssueById(issueId),

                getIssueStatusHistory(issueId),

            ])


            setIssue(updatedIssue)

            setSelectedStatus(
                updatedIssue?.status || ''
            )

            setStatusHistory(
                updatedHistory || []
            )


            setSelectedWorkerId(
                updatedIssue?.assignedToId || ''
            )

        } catch (err) {

            console.error(
                'Failed to update issue status:',
                err
            )


            setStatusError(
                err.response?.data?.message ||
                'Failed to update issue status.'
            )

        } finally {

            setUpdatingStatus(false)
        }
    }


    /* =========================
       ASSIGN ISSUE
    ========================= */

    const handleAssignIssue = async () => {

        if (!issue) {
            return
        }


        if (!selectedWorkerId) {

            setAssignmentError(
                'Please select a field worker.'
            )

            setAssignmentSuccess('')

            return
        }


        if (
            issue.assignedToId &&
            issue.assignedToId === selectedWorkerId
        ) {

            setAssignmentError('')

            setAssignmentSuccess(
                `Issue is already assigned to ${
                    issue.assignedToName ||
                    'this field worker'
                }.`
            )

            return
        }


        try {

            setAssigningIssue(true)

            setAssignmentError('')
            setAssignmentSuccess('')


            await assignIssue({

                issueId,

                fieldWorkerId:
                selectedWorkerId,

            })


            const updatedIssue =
                await getIssueById(issueId)


            console.log(
                'Updated issue after assignment:',
                updatedIssue
            )


            setIssue(updatedIssue)


            setSelectedWorkerId(
                updatedIssue?.assignedToId || ''
            )


            setAssignmentSuccess(
                updatedIssue?.assignedToName
                    ? `Issue assigned successfully to ${updatedIssue.assignedToName}.`
                    : 'Issue assigned successfully.'
            )

        } catch (err) {

            console.error(
                'Failed to assign issue:',
                err
            )


            setAssignmentError(
                err.response?.data?.message ||
                'Failed to assign issue.'
            )

        } finally {

            setAssigningIssue(false)
        }
    }


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="admin-issue-details-page">

                <div className="admin-issue-details-state">

                    Loading issue details...

                </div>

            </div>
        )
    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (
            <div className="admin-issue-details-page">

                <div className="admin-issue-details-error">

                    <h2>
                        Unable to load issue
                    </h2>

                    <p>
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/issues')
                        }
                        className="admin-issue-back-button"
                    >
                        ← Back to Issues
                    </button>

                </div>

            </div>
        )
    }


    /* =========================
       ISSUE NOT FOUND
    ========================= */

    if (!issue) {

        return (
            <div className="admin-issue-details-page">

                <div className="admin-issue-details-error">

                    <h2>
                        Issue not found
                    </h2>


                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/issues')
                        }
                        className="admin-issue-back-button"
                    >
                        ← Back to Issues
                    </button>

                </div>

            </div>
        )
    }


    return (

        <div className="admin-issue-details-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-issue-details-header">

                <div>

                    <p className="admin-issue-details-eyebrow">
                        ISSUE MANAGEMENT
                    </p>

                    <h1>
                        Issue Details
                    </h1>

                    <p>
                        Review and manage this civic issue.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-issue-back-button"
                    onClick={() =>
                        navigate('/admin/issues')
                    }
                >
                    ← Back to Issues
                </button>

            </div>


            {/* =========================
                ISSUE HEADER CARD
            ========================= */}

            <div className="admin-issue-main-card">

                <div className="admin-issue-main-header">

                    <div>

                        <h2>
                            {issue.title}
                        </h2>

                        <p className="admin-issue-id">
                            #{issue.id}
                        </p>

                    </div>


                    <div className="admin-issue-badges">

                        <span
                            className={`admin-detail-status ${
                                issue.status?.toLowerCase()
                            }`}
                        >
                            {issue.status}
                        </span>


                        <span
                            className={`admin-detail-priority ${
                                issue.priority?.toLowerCase()
                            }`}
                        >
                            {issue.priority}
                        </span>

                    </div>

                </div>


                {/* =========================
                    BASIC INFORMATION
                ========================= */}

                <div className="admin-issue-information-grid">

                    <div className="admin-detail-field">

                        <span>
                            Category
                        </span>

                        <strong>
                            {issue.category || 'N/A'}
                        </strong>

                    </div>


                    <div className="admin-detail-field">

                        <span>
                            Reported By
                        </span>

                        <strong>
                            {issue.reportedBy || 'N/A'}
                        </strong>

                    </div>


                    <div className="admin-detail-field">

                        <span>
                            Created At
                        </span>

                        <strong>
                            {issue.createdAt
                                ? new Date(
                                    issue.createdAt
                                ).toLocaleString()
                                : 'N/A'
                            }
                        </strong>

                    </div>


                    <div className="admin-detail-field">

                        <span>
                            Updated At
                        </span>

                        <strong>
                            {issue.updatedAt
                                ? new Date(
                                    issue.updatedAt
                                ).toLocaleString()
                                : 'N/A'
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================
                STATUS MANAGEMENT
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <div>

                        <h2>
                            Status Management
                        </h2>

                        <p>
                            Update the current workflow status of this issue.
                        </p>

                    </div>

                </div>


                <div className="admin-status-management">

                    {/* =========================
                        CURRENT STATUS
                    ========================= */}

                    <div className="admin-status-current">

                        <span>
                            Current Status
                        </span>

                        <strong
                            className={`admin-detail-status ${
                                issue.status?.toLowerCase()
                            }`}
                        >
                            {issue.status}
                        </strong>

                    </div>


                    {/* =========================
                        STATUS CONTROLS
                    ========================= */}

                    <div className="admin-status-update-controls">

                        <label htmlFor="issue-status">

                            Change Status

                        </label>


                        <select
                            id="issue-status"
                            value={
                                allowedNextStatuses.includes(
                                    selectedStatus
                                )
                                    ? selectedStatus
                                    : ''
                            }
                            onChange={
                                handleStatusSelection
                            }
                            disabled={
                                updatingStatus ||
                                allowedNextStatuses.length === 0
                            }
                        >

                            <option value="">
                                Select next status
                            </option>


                            {allowedNextStatuses.map(
                                (status) => (

                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>

                                )
                            )}

                        </select>


                        {/* =========================
                            EVIDENCE PHOTO UPLOAD
                        ========================= */}

                        {isEvidencePhotoRequired(
                            selectedStatus
                        ) && (

                            <div className="admin-evidence-upload">

                                <label
                                    htmlFor="admin-evidence-photo"
                                >

                                    {selectedStatus === 'RESOLVED'
                                        ? 'Resolution Evidence Photo'
                                        : 'Work Evidence Photo'
                                    }

                                </label>


                                <input
                                    id="admin-evidence-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleEvidencePhotoChange
                                    }
                                    disabled={
                                        updatingStatus
                                    }
                                />


                                <small>

                                    {selectedStatus === 'RESOLVED'
                                        ? 'Upload a photo showing that the civic issue has been resolved.'
                                        : 'Upload a photo showing the work started on the issue.'
                                    }

                                </small>


                                {evidencePhoto && (

                                    <div className="admin-selected-photo">

                                        Selected:

                                        {' '}

                                        <strong>
                                            {evidencePhoto.name}
                                        </strong>

                                    </div>

                                )}

                            </div>

                        )}


                        <button
                            type="button"
                            className="admin-status-update-button"
                            onClick={
                                handleStatusUpdate
                            }
                            disabled={
                                updatingStatus ||
                                !selectedStatus ||
                                !allowedNextStatuses.includes(
                                    selectedStatus
                                )
                            }
                        >

                            {updatingStatus
                                ? 'Updating...'
                                : 'Update Status'
                            }

                        </button>

                    </div>

                </div>


                {/* =========================
                    STATUS ERROR
                ========================= */}

                {statusError && (

                    <div className="admin-status-message admin-status-error">

                        {statusError}

                    </div>

                )}


                {/* =========================
                    STATUS SUCCESS
                ========================= */}

                {successMessage && (

                    <div className="admin-status-message admin-status-success">

                        {successMessage}

                    </div>

                )}

            </div>


            {/* =========================
                ISSUE ASSIGNMENT
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <div>

                        <h2>
                            Issue Assignment
                        </h2>

                        <p>
                            Assign this issue to an active field worker.
                        </p>

                    </div>

                </div>


                <div className="admin-status-management">

                    {/* =========================
                        CURRENT ASSIGNMENT
                    ========================= */}

                    <div className="admin-status-current">

                        <span>
                            Assignment
                        </span>


                        {issue.assignedToName ? (

                            <>

                                <strong>
                                    {issue.assignedToName}
                                </strong>


                                {issue.assignedToEmail && (

                                    <small
                                        style={{
                                            display: 'block',
                                            marginTop: '6px',
                                            opacity: 0.7,
                                        }}
                                    >
                                        {issue.assignedToEmail}
                                    </small>

                                )}

                            </>

                        ) : (

                            <strong>
                                Not assigned
                            </strong>

                        )}

                    </div>


                    {/* =========================
                        ASSIGNMENT CONTROLS
                    ========================= */}

                    <div className="admin-status-update-controls">

                        <label htmlFor="field-worker">

                            Field Worker

                        </label>


                        <select
                            id="field-worker"
                            value={selectedWorkerId}
                            onChange={(event) => {

                                setSelectedWorkerId(
                                    event.target.value
                                )

                                setAssignmentError('')
                                setAssignmentSuccess('')

                            }}
                            disabled={
                                loadingWorkers ||
                                assigningIssue
                            }
                        >

                            <option value="">

                                {loadingWorkers
                                    ? 'Loading field workers...'
                                    : 'Select field worker'
                                }

                            </option>


                            {fieldWorkers.map(
                                (worker) => (

                                    <option
                                        key={worker.id}
                                        value={worker.id}
                                    >

                                        {worker.fullName}

                                        {' — '}

                                        {worker.email}

                                    </option>

                                )
                            )}

                        </select>


                        <button
                            type="button"
                            className="admin-status-update-button"
                            onClick={
                                handleAssignIssue
                            }
                            disabled={
                                assigningIssue ||
                                loadingWorkers ||
                                !selectedWorkerId
                            }
                        >

                            {assigningIssue
                                ? 'Assigning...'
                                : 'Assign Issue'
                            }

                        </button>

                    </div>

                </div>


                {/* =========================
                    ASSIGNMENT ERROR
                ========================= */}

                {assignmentError && (

                    <div className="admin-status-message admin-status-error">

                        {assignmentError}

                    </div>

                )}


                {/* =========================
                    ASSIGNMENT SUCCESS
                ========================= */}

                {assignmentSuccess && (

                    <div className="admin-status-message admin-status-success">

                        {assignmentSuccess}

                    </div>

                )}

            </div>


            {/* =========================
                DESCRIPTION
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <h2>
                        Description
                    </h2>

                </div>


                <div className="admin-detail-content">

                    <p>
                        {issue.description ||
                            'No description provided.'
                        }
                    </p>

                </div>

            </div>


            {/* =========================
                LOCATION
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <h2>
                        Location
                    </h2>

                </div>


                <div className="admin-detail-content">

                    <div className="admin-detail-location">

                        <div>

                            <span>
                                Address
                            </span>

                            <strong>
                                {issue.address || 'N/A'}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Latitude
                            </span>

                            <strong>
                                {issue.latitude ?? 'N/A'}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Longitude
                            </span>

                            <strong>
                                {issue.longitude ?? 'N/A'}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                ISSUE IMAGE
            ========================= */}

            {issue.imageUrl && (

                <div className="admin-detail-section">

                    <div className="admin-detail-section-header">

                        <h2>
                            Issue Image
                        </h2>

                        <p>
                            Original photo submitted with the civic issue.
                        </p>

                    </div>


                    <div className="admin-issue-image-container">

                        <img
                            src={getImageUrl(
                                issue.imageUrl
                            )}
                            alt={issue.title}
                            className="admin-issue-image"
                        />

                    </div>

                </div>

            )}


            {/* =========================
                STATUS HISTORY
            ========================= */}

            <div className="admin-detail-section">

                <div className="admin-detail-section-header">

                    <div>

                        <h2>
                            Status History
                        </h2>

                        <p>
                            Complete workflow history of this issue.
                        </p>

                    </div>

                </div>


                {statusHistory.length === 0 ? (

                    <div className="admin-detail-empty">

                        No status history available.

                    </div>

                ) : (

                    <div className="admin-status-timeline">

                        {statusHistory.map(
                            (history, index) => (

                                <div
                                    className="admin-status-history-item"
                                    key={
                                        history.id ||
                                        `${history.changedAt}-${index}`
                                    }
                                >

                                    <div className="admin-status-timeline-dot" />


                                    <div className="admin-status-history-content">

                                        {/* =========================
                                            STATUS TRANSITION
                                        ========================= */}

                                        <div className="admin-status-history-header">

                                            <strong>
                                                {history.fromStatus ||
                                                    'Initial'
                                                }
                                            </strong>

                                            <span>
                                                →
                                            </span>

                                            <strong>
                                                {history.toStatus}
                                            </strong>

                                        </div>


                                        {/* =========================
                                            CHANGED BY
                                        ========================= */}

                                        <p>

                                            Changed by:{' '}

                                            {history.changedByName
                                                ? history.changedByName
                                                : history.changedByEmail ||
                                                'Unknown user'
                                            }

                                        </p>


                                        {history.changedByName &&
                                            history.changedByEmail && (

                                                <p>

                                                    {history.changedByEmail}

                                                </p>

                                            )}


                                        {/* =========================
                                            DATE
                                        ========================= */}

                                        <span className="admin-status-history-date">

                                            {history.changedAt
                                                ? new Date(
                                                    history.changedAt
                                                ).toLocaleString()
                                                : 'N/A'
                                            }

                                        </span>


                                        {/* =========================
                                            REMARK
                                        ========================= */}

                                        {history.remark && (

                                            <p className="admin-status-history-remark">

                                                {history.remark}

                                            </p>

                                        )}


                                        {/* =========================
                                            EVIDENCE PHOTO
                                        ========================= */}

                                        {history.evidencePhotoUrl && (

                                            <div className="admin-status-history-evidence">

                                                <h4>

                                                    {history.toStatus === 'RESOLVED'
                                                        ? 'RESOLUTION EVIDENCE'
                                                        : 'EVIDENCE PHOTO'
                                                    }

                                                </h4>


                                                <img
                                                    src={getImageUrl(
                                                        history.evidencePhotoUrl
                                                    )}
                                                    alt={
                                                        history.toStatus === 'RESOLVED'
                                                            ? 'Resolution evidence'
                                                            : 'Status evidence'
                                                    }
                                                    className="admin-status-history-evidence-image"
                                                />

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    )
}

export default AdminIssueDetailsPage