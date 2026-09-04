import { useEffect, useState } from 'react'
import {
    Eye,
    EyeOff,
    LockKeyhole,
    UserRound,
    Mail,
    Phone,
    ShieldCheck,
    Pencil,
    X,
    Save,
} from 'lucide-react'

import {
    getCurrentUser,
    updateProfile,
    changePassword,
} from '../../api/userApi'

import '../../styles/workerCSS/fieldWorkerProfile.css'


function FieldWorkerProfilePage() {

    /* =====================================================
       USER STATE
    ===================================================== */

    const [user, setUser] = useState(null)

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')


    /* =====================================================
       PROFILE EDIT STATE
    ===================================================== */

    const [isEditing, setIsEditing] = useState(false)

    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phoneNumber: '',
    })

    const [updatingProfile, setUpdatingProfile] =
        useState(false)

    const [profileError, setProfileError] =
        useState('')

    const [profileSuccess, setProfileSuccess] =
        useState('')


    /* =====================================================
       PASSWORD STATE
    ===================================================== */

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false)

    const [showNewPassword, setShowNewPassword] =
        useState(false)

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false)

    const [changingPassword, setChangingPassword] =
        useState(false)

    const [passwordError, setPasswordError] =
        useState('')

    const [passwordSuccess, setPasswordSuccess] =
        useState('')


    /* =====================================================
       FETCH PROFILE
    ===================================================== */

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                setLoading(true)
                setError('')

                const response =
                    await getCurrentUser()

                console.log(
                    'Field worker profile:',
                    response
                )

                const currentUser =
                    response?.data

                if (!currentUser) {

                    throw new Error(
                        'User profile was not returned.'
                    )
                }

                setUser(currentUser)

                setProfileForm({
                    fullName:
                        currentUser.fullName || '',

                    phoneNumber:
                        currentUser.phoneNumber || '',
                })

                /*
                 * Keep local storage user information
                 * synchronized with backend.
                 */

                localStorage.setItem(
                    'user',
                    JSON.stringify(currentUser)
                )

            } catch (err) {

                console.error(
                    'Failed to fetch field worker profile:',
                    err
                )

                setError(
                    err?.response?.data?.message ||
                    'Failed to load your profile.'
                )

            } finally {

                setLoading(false)

            }
        }


        fetchProfile()

    }, [])


    /* =====================================================
       INITIAL
    ===================================================== */

    const getInitial = () => {

        if (!user?.fullName) {
            return 'U'
        }

        return user.fullName
            .charAt(0)
            .toUpperCase()
    }


    /* =====================================================
       PROFILE INPUT
    ===================================================== */

    const handleProfileChange = (event) => {

        const {
            name,
            value,
        } = event.target

        setProfileForm(
            previous => ({
                ...previous,
                [name]: value,
            })
        )

        setProfileError('')
        setProfileSuccess('')
    }


    /* =====================================================
       START EDITING
    ===================================================== */

    const handleStartEditing = () => {

        setProfileForm({
            fullName:
                user?.fullName || '',

            phoneNumber:
                user?.phoneNumber || '',
        })

        setProfileError('')
        setProfileSuccess('')

        setIsEditing(true)
    }


    /* =====================================================
       CANCEL EDITING
    ===================================================== */

    const handleCancelEditing = () => {

        setProfileForm({
            fullName:
                user?.fullName || '',

            phoneNumber:
                user?.phoneNumber || '',
        })

        setProfileError('')
        setProfileSuccess('')

        setIsEditing(false)
    }


    /* =====================================================
       UPDATE PROFILE
    ===================================================== */

    const handleUpdateProfile = async (event) => {

        event.preventDefault()

        setProfileError('')
        setProfileSuccess('')


        const fullName =
            profileForm.fullName.trim()

        const phoneNumber =
            profileForm.phoneNumber.trim()


        if (!fullName) {

            setProfileError(
                'Full name is required.'
            )

            return
        }


        if (
            phoneNumber &&
            !/^[0-9]{10}$/.test(phoneNumber)
        ) {

            setProfileError(
                'Phone number must be exactly 10 digits.'
            )

            return
        }


        try {

            setUpdatingProfile(true)

            await updateProfile(
                user.id,
                {
                    fullName,
                    phoneNumber,
                }
            )


            /*
             * Fetch fresh user data after update.
             */

            const response =
                await getCurrentUser()

            const updatedUser =
                response?.data


            setUser(updatedUser)

            setProfileForm({
                fullName:
                    updatedUser?.fullName || '',

                phoneNumber:
                    updatedUser?.phoneNumber || '',
            })


            localStorage.setItem(
                'user',
                JSON.stringify(updatedUser)
            )


            setProfileSuccess(
                'Profile updated successfully.'
            )

            setIsEditing(false)

        } catch (err) {

            console.error(
                'Failed to update profile:',
                err
            )

            setProfileError(
                err?.response?.data?.message ||
                'Failed to update profile.'
            )

        } finally {

            setUpdatingProfile(false)

        }
    }


    /* =====================================================
       PASSWORD INPUT
    ===================================================== */

    const handlePasswordChange = (event) => {

        const {
            name,
            value,
        } = event.target

        setPasswordForm(
            previous => ({
                ...previous,
                [name]: value,
            })
        )

        setPasswordError('')
        setPasswordSuccess('')
    }


    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    const handleChangePassword = async (event) => {

        event.preventDefault()

        setPasswordError('')
        setPasswordSuccess('')


        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordForm


        if (!currentPassword) {

            setPasswordError(
                'Current password is required.'
            )

            return
        }


        if (!newPassword) {

            setPasswordError(
                'New password is required.'
            )

            return
        }


        if (newPassword.length < 8) {

            setPasswordError(
                'New password must be at least 8 characters.'
            )

            return
        }


        if (newPassword !== confirmPassword) {

            setPasswordError(
                'New password and confirmation password do not match.'
            )

            return
        }


        try {

            setChangingPassword(true)

            await changePassword({
                currentPassword,
                newPassword,
            })

            localStorage.removeItem('token')
            localStorage.removeItem('user')

// Redirect to login
            window.location.href = '/login'
            setPasswordSuccess(
                'Password changed successfully.'
            )


            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })


            setShowCurrentPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)

        } catch (err) {

            console.error(
                'Failed to change password:',
                err
            )

            setPasswordError(
                err?.response?.data?.message ||
                'Failed to change password.'
            )

        } finally {

            setChangingPassword(false)

        }
    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="worker-profile-page">

                <header className="worker-profile-header">

                    <div>

                        <span className="worker-profile-eyebrow">
                            FIELD WORKER PORTAL
                        </span>

                        <h1>
                            Profile
                        </h1>

                        <p>
                            Manage your personal information and account security.
                        </p>

                    </div>

                </header>


                <div className="worker-profile-state">

                    <div className="worker-profile-spinner"></div>

                    <p>
                        Loading your profile...
                    </p>

                </div>

            </div>
        )
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="worker-profile-page">

                <header className="worker-profile-header">

                    <div>

                        <span className="worker-profile-eyebrow">
                            FIELD WORKER PORTAL
                        </span>

                        <h1>
                            Profile
                        </h1>

                    </div>

                </header>


                <div className="worker-profile-error">

                    <div className="worker-profile-error-icon">
                        !
                    </div>

                    <div>

                        <h3>
                            Unable to load profile
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

        <div className="worker-profile-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <header className="worker-profile-header">

                <div>

                    <span className="worker-profile-eyebrow">
                        FIELD WORKER PORTAL
                    </span>

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Manage your personal information and account security.
                    </p>

                </div>

            </header>


            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <section className="worker-profile-card worker-profile-hero">

                <div className="worker-profile-avatar">
                    {getInitial()}
                </div>


                <div className="worker-profile-identity">

                    <h2>
                        {user?.fullName || 'Field Worker'}
                    </h2>

                    <p>
                        {user?.email || 'No email available'}
                    </p>

                    <span className="worker-profile-role">
                        FIELD WORKER
                    </span>

                </div>


                <div className="worker-profile-account-status">

                    <span className="worker-profile-status-dot"></span>

                    <div>

                        <strong>
                            {user?.accountStatus || 'ACTIVE'}
                        </strong>

                        <small>
                            Account status
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                PROFILE SUCCESS
            ================================================= */}

            {profileSuccess && (

                <div className="worker-profile-message worker-profile-success">

                    <ShieldCheck size={18} />

                    <span>
                        {profileSuccess}
                    </span>

                </div>

            )}


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="worker-profile-card">

                <div className="worker-profile-section-header">

                    <div>

                        <span className="worker-profile-section-eyebrow">
                            PERSONAL INFORMATION
                        </span>

                        <h2>
                            Profile Details
                        </h2>

                        <p>
                            Keep your contact information up to date.
                        </p>

                    </div>


                    {!isEditing && (

                        <button
                            type="button"
                            className="worker-profile-edit-button"
                            onClick={handleStartEditing}
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </button>

                    )}

                </div>


                {isEditing ? (

                    <form
                        className="worker-profile-form"
                        onSubmit={handleUpdateProfile}
                    >

                        <div className="worker-profile-form-grid">

                            <div className="worker-profile-field">

                                <label htmlFor="fullName">
                                    Full Name
                                </label>

                                <div className="worker-profile-input-wrapper">

                                    <UserRound size={18} />

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={profileForm.fullName}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your full name"
                                        disabled={updatingProfile}
                                    />

                                </div>

                            </div>


                            <div className="worker-profile-field">

                                <label htmlFor="phoneNumber">
                                    Phone Number
                                </label>

                                <div className="worker-profile-input-wrapper">

                                    <Phone size={18} />

                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={profileForm.phoneNumber}
                                        onChange={handleProfileChange}
                                        placeholder="Enter 10 digit phone number"
                                        maxLength="10"
                                        disabled={updatingProfile}
                                    />

                                </div>

                            </div>


                            <div className="worker-profile-field worker-profile-field-full">

                                <label>
                                    Email Address
                                </label>

                                <div className="worker-profile-readonly-field">

                                    <Mail size={18} />

                                    <span>
                                        {user?.email || 'N/A'}
                                    </span>

                                </div>

                                <small>
                                    Email address cannot be changed from this page.
                                </small>

                            </div>

                        </div>


                        {profileError && (

                            <div className="worker-profile-message worker-profile-error-message">

                                <span>
                                    {profileError}
                                </span>

                            </div>

                        )}


                        <div className="worker-profile-form-actions">

                            <button
                                type="button"
                                className="worker-profile-cancel-button"
                                onClick={handleCancelEditing}
                                disabled={updatingProfile}
                            >
                                <X size={16} />
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="worker-profile-save-button"
                                disabled={updatingProfile}
                            >

                                <Save size={16} />

                                {updatingProfile
                                    ? 'Saving...'
                                    : 'Save Changes'
                                }

                            </button>

                        </div>

                    </form>

                ) : (

                    <div className="worker-profile-details-grid">

                        <div className="worker-profile-detail-item">

                            <div className="worker-profile-detail-icon">
                                <UserRound size={18} />
                            </div>

                            <div>

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    {user?.fullName || 'Not provided'}
                                </strong>

                            </div>

                        </div>


                        <div className="worker-profile-detail-item">

                            <div className="worker-profile-detail-icon">
                                <Phone size={18} />
                            </div>

                            <div>

                                <span>
                                    Phone Number
                                </span>

                                <strong>
                                    {user?.phoneNumber || 'Not provided'}
                                </strong>

                            </div>

                        </div>


                        <div className="worker-profile-detail-item">

                            <div className="worker-profile-detail-icon">
                                <Mail size={18} />
                            </div>

                            <div>

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {user?.email || 'Not provided'}
                                </strong>

                            </div>

                        </div>


                        <div className="worker-profile-detail-item">

                            <div className="worker-profile-detail-icon">
                                <ShieldCheck size={18} />
                            </div>

                            <div>

                                <span>
                                    Account Role
                                </span>

                                <strong>
                                    {user?.role || 'FIELD_WORKER'}
                                </strong>

                            </div>

                        </div>

                    </div>

                )}

            </section>


            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="worker-profile-card">

                <div className="worker-profile-section-header">

                    <div>

                        <span className="worker-profile-section-eyebrow">
                            ACCOUNT SECURITY
                        </span>

                        <h2>
                            Change Password
                        </h2>

                        <p>
                            Use a strong password to keep your account secure.
                        </p>

                    </div>

                    <div className="worker-profile-security-icon">

                        <LockKeyhole size={20} />

                    </div>

                </div>


                <form
                    className="worker-password-form"
                    onSubmit={handleChangePassword}
                >

                    <div className="worker-profile-field">

                        <label htmlFor="currentPassword">
                            Current Password
                        </label>

                        <div className="worker-profile-input-wrapper">

                            <LockKeyhole size={18} />

                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type={
                                    showCurrentPassword
                                        ? 'text'
                                        : 'password'
                                }
                                value={
                                    passwordForm.currentPassword
                                }
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                disabled={changingPassword}
                            />

                            <button
                                type="button"
                                className="worker-password-toggle"
                                onClick={() =>
                                    setShowCurrentPassword(
                                        previous => !previous
                                    )
                                }
                                aria-label={
                                    showCurrentPassword
                                        ? 'Hide current password'
                                        : 'Show current password'
                                }
                            >
                                {showCurrentPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }
                            </button>

                        </div>

                    </div>


                    <div className="worker-password-grid">

                        <div className="worker-profile-field">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <div className="worker-profile-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={
                                        showNewPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        passwordForm.newPassword
                                    }
                                    onChange={handlePasswordChange}
                                    placeholder="Minimum 8 characters"
                                    disabled={changingPassword}
                                />

                                <button
                                    type="button"
                                    className="worker-password-toggle"
                                    onClick={() =>
                                        setShowNewPassword(
                                            previous => !previous
                                        )
                                    }
                                    aria-label={
                                        showNewPassword
                                            ? 'Hide new password'
                                            : 'Show new password'
                                    }
                                >
                                    {showNewPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>


                        <div className="worker-profile-field">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <div className="worker-profile-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        passwordForm.confirmPassword
                                    }
                                    onChange={handlePasswordChange}
                                    placeholder="Re-enter new password"
                                    disabled={changingPassword}
                                />

                                <button
                                    type="button"
                                    className="worker-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            previous => !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Hide confirmation password'
                                            : 'Show confirmation password'
                                    }
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>

                    </div>


                    {passwordError && (

                        <div className="worker-profile-message worker-profile-error-message">

                            <span>
                                {passwordError}
                            </span>

                        </div>

                    )}


                    {passwordSuccess && (

                        <div className="worker-profile-message worker-profile-success">

                            <ShieldCheck size={18} />

                            <span>
                                {passwordSuccess}
                            </span>

                        </div>

                    )}


                    <div className="worker-password-actions">

                        <button
                            type="submit"
                            className="worker-profile-save-button"
                            disabled={changingPassword}
                        >

                            <LockKeyhole size={16} />

                            {changingPassword
                                ? 'Changing Password...'
                                : 'Change Password'
                            }

                        </button>

                    </div>

                </form>

            </section>

        </div>
    )
}

export default FieldWorkerProfilePage