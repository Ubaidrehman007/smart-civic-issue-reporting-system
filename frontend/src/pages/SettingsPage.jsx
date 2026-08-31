import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteMyAccount
} from '../api/userApi'

import '../styles/citizenCSS/settings.css'


function SettingsPage() {

    const navigate = useNavigate()


    // =====================================================
    // USER
    // =====================================================

    const [user, setUser] = useState(null)

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    const [success, setSuccess] = useState('')


    // =====================================================
    // EDIT PROFILE
    // =====================================================

    const [editMode, setEditMode] = useState(false)

    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phoneNumber: ''
    })

    const [savingProfile, setSavingProfile] =
        useState(false)


    // =====================================================
    // PASSWORD MODAL
    // =====================================================

    const [passwordModalOpen, setPasswordModalOpen] =
        useState(false)

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [changingPassword, setChangingPassword] =
        useState(false)

    const [passwordError, setPasswordError] =
        useState('')


    // =====================================================
    // DELETE ACCOUNT MODAL
    // =====================================================

    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false)

    const [deleteConfirmation, setDeleteConfirmation] =
        useState('')

    const [deletingAccount, setDeletingAccount] =
        useState(false)

    const [deleteError, setDeleteError] =
        useState('')


    // =====================================================
    // LOAD CURRENT USER
    // =====================================================

    useEffect(() => {

        loadUser()

    }, [])


    const loadUser = async () => {

        try {

            setLoading(true)

            setError('')

            const response =
                await getCurrentUser()

            const currentUser =
                response?.data || response

            setUser(currentUser)

            setProfileForm({
                fullName:
                    currentUser?.fullName || '',

                phoneNumber:
                    currentUser?.phoneNumber || ''
            })

        } catch (err) {

            setError(
                err.message ||
                'Unable to load your profile.'
            )

        } finally {

            setLoading(false)
        }
    }


    // =====================================================
    // PROFILE INPUT
    // =====================================================

    const handleProfileChange = (event) => {

        const {
            name,
            value
        } = event.target

        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }))
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleProfileSave = async () => {

        if (!user?.id) {

            setError(
                'User information is unavailable.'
            )

            return
        }


        try {

            setSavingProfile(true)

            setError('')
            setSuccess('')


            const response =
                await updateProfile(
                    user.id,
                    profileForm
                )


            const updatedUser =
                response?.data || response


            setUser(updatedUser)


            localStorage.setItem(
                'user',
                JSON.stringify(updatedUser)
            )


            setEditMode(false)

            setSuccess(
                'Profile updated successfully.'
            )

        } catch (err) {

            setError(
                err.message ||
                'Unable to update profile.'
            )

        } finally {

            setSavingProfile(false)
        }
    }


    // =====================================================
    // PASSWORD INPUT
    // =====================================================

    const handlePasswordChange = (event) => {

        const {
            name,
            value
        } = event.target

        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }))
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async (event) => {

        event.preventDefault()

        setPasswordError('')


        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {

            setPasswordError(
                'Please fill in all password fields.'
            )

            return
        }


        if (passwordForm.newPassword.length < 8) {

            setPasswordError(
                'New password must contain at least 8 characters.'
            )

            return
        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            setPasswordError(
                'New password and confirmation password do not match.'
            )

            return
        }


        try {

            setChangingPassword(true)

            await changePassword({
                currentPassword:
                passwordForm.currentPassword,

                newPassword:
                passwordForm.newPassword
            })


            setPasswordModalOpen(false)

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            setSuccess(
                'Password changed successfully.'
            )

        } catch (err) {

            setPasswordError(
                err.message ||
                'Unable to change password.'
            )

        } finally {

            setChangingPassword(false)
        }
    }


    // =====================================================
    // DELETE ACCOUNT
    // =====================================================

    const handleDeleteAccount = async () => {

        setDeleteError('')


        if (
            deleteConfirmation.trim().toUpperCase()
            !== 'DELETE'
        ) {

            setDeleteError(
                'Please type DELETE to confirm account deletion.'
            )

            return
        }


        try {

            setDeletingAccount(true)


            await deleteMyAccount()


            // Clear authentication
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('userRole')


            // Redirect to login
            navigate('/login', {
                replace: true
            })

        } catch (err) {

            setDeleteError(
                err.message ||
                'Unable to delete your account.'
            )

        } finally {

            setDeletingAccount(false)
        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="citizen-settings-page">

                <div className="settings-loading">

                    Loading your settings...

                </div>

            </div>
        )
    }


    return (
        <div className="citizen-settings-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="settings-page-header">

                <div>

                    <span className="settings-eyebrow">
                        ACCOUNT
                    </span>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your profile, security and account preferences.
                    </p>

                </div>

            </section>


            {/* =================================================
                GLOBAL MESSAGES
            ================================================= */}

            {error && (

                <div className="settings-message settings-error">
                    {error}
                </div>

            )}


            {success && (

                <div className="settings-message settings-success">
                    {success}
                </div>

            )}


            {/* =================================================
                PROFILE
            ================================================= */}

            <section className="settings-card">

                <div className="settings-card-heading">

                    <div>

                        <span className="settings-section-label">
                            ACCOUNT
                        </span>

                        <h2>
                            Profile & Account
                        </h2>

                        <p>
                            View and manage your personal account information.
                        </p>

                    </div>


                    {!editMode && (

                        <button
                            type="button"
                            className="settings-primary-button"
                            onClick={() => {
                                setError('')
                                setSuccess('')
                                setEditMode(true)
                            }}
                        >
                            Edit Profile
                        </button>

                    )}

                </div>


                {/* =========================
                    PROFILE IDENTITY
                ========================= */}

                <div className="settings-profile-identity">

                    <div className="settings-avatar">
                        {user?.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || 'U'}
                    </div>


                    <div>

                        <h3>
                            {user?.fullName || 'Citizen'}
                        </h3>

                        <p>
                            {user?.email || '—'}
                        </p>

                        <span className="settings-role-badge">
                            {user?.role || 'CITIZEN'}
                        </span>

                    </div>

                </div>


                {/* =========================
                    VIEW MODE
                ========================= */}

                {!editMode && (

                    <div className="settings-info-grid">

                        <div className="settings-info-box">

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {user?.fullName || '—'}
                            </strong>

                        </div>


                        <div className="settings-info-box">

                            <span>
                                Email Address
                            </span>

                            <strong>
                                {user?.email || '—'}
                            </strong>

                        </div>


                        <div className="settings-info-box">

                            <span>
                                Phone Number
                            </span>

                            <strong>
                                {user?.phoneNumber || '—'}
                            </strong>

                        </div>


                        <div className="settings-info-box">

                            <span>
                                Account Status
                            </span>

                            <strong className="settings-active">
                                {user?.accountStatus || 'ACTIVE'}
                            </strong>

                        </div>

                    </div>

                )}


                {/* =========================
                    EDIT MODE
                ========================= */}

                {editMode && (

                    <div className="settings-edit-form">

                        <div className="settings-form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={profileForm.fullName}
                                onChange={handleProfileChange}
                                placeholder="Enter your full name"
                            />

                        </div>


                        <div className="settings-form-group">

                            <label>
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phoneNumber"
                                value={profileForm.phoneNumber}
                                onChange={handleProfileChange}
                                placeholder="Enter your phone number"
                            />

                        </div>


                        <div className="settings-form-actions">

                            <button
                                type="button"
                                className="settings-secondary-button"
                                onClick={() => {
                                    setEditMode(false)

                                    setProfileForm({
                                        fullName:
                                            user?.fullName || '',

                                        phoneNumber:
                                            user?.phoneNumber || ''
                                    })
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="settings-primary-button"
                                onClick={handleProfileSave}
                                disabled={savingProfile}
                            >
                                {savingProfile
                                    ? 'Saving...'
                                    : 'Save Changes'}
                            </button>

                        </div>

                    </div>

                )}

            </section>


            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="settings-card">

                <div className="settings-card-heading">

                    <div>

                        <span className="settings-section-label">
                            SECURITY
                        </span>

                        <h2>
                            Security
                        </h2>

                        <p>
                            Protect your account and manage your password.
                        </p>

                    </div>

                </div>


                <div className="settings-security-row">

                    <div>

                        <h3>
                            Password
                        </h3>

                        <p>
                            Change your account password regularly to keep your account secure.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="settings-secondary-button"
                        onClick={() => {
                            setPasswordError('')

                            setPasswordForm({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                            })

                            setPasswordModalOpen(true)
                        }}
                    >
                        Change Password
                    </button>

                </div>

            </section>


            {/* =================================================
                DELETE ACCOUNT
            ================================================= */}

            <section className="settings-card settings-danger-card">

                <div className="settings-card-heading">

                    <div>

                        <span className="settings-section-label settings-danger-label">
                            DANGER ZONE
                        </span>

                        <h2>
                            Delete Account
                        </h2>

                        <p>
                            Permanently delete your Smart Civic account and associated account data.
                        </p>

                    </div>

                </div>


                <div className="settings-danger-row">

                    <div>

                        <h3>
                            Permanently delete your account
                        </h3>

                        <p>
                            This action cannot be undone.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="settings-delete-button"
                        onClick={() => {
                            setDeleteError('')
                            setDeleteConfirmation('')
                            setDeleteModalOpen(true)
                        }}
                    >
                        Delete Account
                    </button>

                </div>

            </section>


            {/* =================================================
                CHANGE PASSWORD MODAL
            ================================================= */}

            {passwordModalOpen && (

                <div className="settings-modal-overlay">

                    <div
                        className="settings-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="settings-modal-header">

                            <div>

                                <span className="settings-section-label">
                                    SECURITY
                                </span>

                                <h2>
                                    Change Password
                                </h2>

                                <p>
                                    Update your account password.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="settings-modal-close"
                                onClick={() =>
                                    setPasswordModalOpen(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleChangePassword}
                            className="settings-modal-form"
                        >

                            {passwordError && (

                                <div className="settings-message settings-error">
                                    {passwordError}
                                </div>

                            )}


                            <div className="settings-form-group">

                                <label>
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={
                                        passwordForm.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                />

                            </div>


                            <div className="settings-form-group">

                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={
                                        passwordForm.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Minimum 8 characters"
                                />

                            </div>


                            <div className="settings-form-group">

                                <label>
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        passwordForm.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Re-enter new password"
                                />

                            </div>


                            <div className="settings-modal-actions">

                                <button
                                    type="button"
                                    className="settings-secondary-button"
                                    onClick={() =>
                                        setPasswordModalOpen(false)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="settings-primary-button"
                                    disabled={
                                        changingPassword
                                    }
                                >
                                    {changingPassword
                                        ? 'Changing...'
                                        : 'Change Password'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                DELETE ACCOUNT MODAL
            ================================================= */}

            {deleteModalOpen && (

                <div className="settings-modal-overlay">

                    <div
                        className="settings-modal settings-delete-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="settings-modal-header">

                            <div>

                                <span className="settings-section-label settings-danger-label">
                                    DANGER ZONE
                                </span>

                                <h2>
                                    Delete Account
                                </h2>

                                <p>
                                    This action is permanent and cannot be undone.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="settings-modal-close"
                                onClick={() =>
                                    setDeleteModalOpen(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="settings-delete-warning">

                            <strong>
                                Are you absolutely sure?
                            </strong>

                            <p>
                                Your account will be permanently deleted.
                                You will be logged out immediately.
                            </p>

                        </div>


                        {deleteError && (

                            <div className="settings-message settings-error">
                                {deleteError}
                            </div>

                        )}


                        <div className="settings-form-group">

                            <label>
                                Type DELETE to confirm
                            </label>

                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(event) =>
                                    setDeleteConfirmation(
                                        event.target.value
                                    )
                                }
                                placeholder="DELETE"
                                autoComplete="off"
                            />

                        </div>


                        <div className="settings-modal-actions">

                            <button
                                type="button"
                                className="settings-secondary-button"
                                onClick={() =>
                                    setDeleteModalOpen(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="settings-delete-button"
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount}
                            >
                                {deletingAccount
                                    ? 'Deleting...'
                                    : 'Delete My Account'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}

export default SettingsPage