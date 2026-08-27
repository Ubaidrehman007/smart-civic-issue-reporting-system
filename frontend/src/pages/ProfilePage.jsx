import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import {
    getCurrentUser,
    updateProfile,
    changePassword
} from '../api/userApi'
import { useNavigate } from 'react-router-dom'
import '../styles/citizenCSS/profile.css'

function ProfilePage() {

    const navigate = useNavigate()

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [changingPassword, setChangingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [isEditing, setIsEditing] = useState(false)

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: ''
    })

    const [updating, setUpdating] = useState(false)
    const [updateError, setUpdateError] = useState(null)
    const [updateSuccess, setUpdateSuccess] = useState(null)

    useEffect(() => {

        async function fetchProfile() {

            try {
                setLoading(true)
                setError(null)

                const response = await getCurrentUser()

                console.log('Current user response:', response)

                setUser(response.data)

                setFormData({
                    fullName: response.data.fullName || '',
                    phoneNumber: response.data.phoneNumber || ''
                })

            } catch (err) {

                console.error(
                    'Failed to fetch profile:',
                    err
                )

                setError(
                    'Failed to load your profile information.'
                )

            } finally {
                setLoading(false)
            }
        }

        fetchProfile()

    }, [])

    const getInitial = () => {

        if (!user?.fullName) {
            return 'U'
        }

        return user.fullName
            .charAt(0)
            .toUpperCase()
    }

    const handleUpdateProfile = async (e) => {

        e.preventDefault()

        try {

            setUpdating(true)
            setUpdateError(null)
            setUpdateSuccess(null)

            await updateProfile(
                user.id,
                formData
            )

            setUser({
                ...user,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber
            })



            setUpdateSuccess(
                'Profile updated successfully.'
            )

            setIsEditing(false)

        } catch (err) {

            console.error(
                'Failed to update profile:',
                err
            )

            setUpdateError(
                err.response?.data?.message ||
                'Failed to update profile.'
            )

        } finally {

            setUpdating(false)

        }
    }

    const handleChangePassword = async (e) => {

        e.preventDefault()

        setPasswordError('')
        setPasswordSuccess('')

        if (!passwordData.currentPassword) {
            setPasswordError(
                'Please enter your current password.'
            )
            return
        }

        if (!passwordData.newPassword) {
            setPasswordError(
                'Please enter a new password.'
            )
            return
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError(
                'New password must be at least 8 characters.'
            )
            return
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            setPasswordError(
                'New passwords do not match.'
            )
            return
        }

        if (
            passwordData.currentPassword ===
            passwordData.newPassword
        ) {
            setPasswordError(
                'New password must be different from your current password.'
            )
            return
        }

        try {

            setChangingPassword(true)

            await changePassword({
                currentPassword:
                passwordData.currentPassword,

                newPassword:
                passwordData.newPassword
            })

            setPasswordSuccess(
                'Password changed successfully. Redirecting to login...'
            )

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            /*
             * Give the user a moment to see
             * the success message.
             */
            setTimeout(() => {

                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('userRole')

                navigate('/login')

            }, 1500)

        } catch (err) {

            console.error(
                'Failed to change password:',
                err
            )

            setPasswordError(
                err.response?.data?.message ||
                'Unable to change password. Please try again.'
            )

        } finally {

            setChangingPassword(false)
        }
    }


    if (loading) {
        return (
            <>
                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-breadcrumb">
                            CITIZEN PORTAL
                        </p>

                        <h1>Profile</h1>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="issues-state">
                        Loading your profile...
                    </div>
                </section>
            </>
        )
    }

    if (error) {
        return (
            <>
                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-breadcrumb">
                            CITIZEN PORTAL
                        </p>

                        <h1>Profile</h1>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="issues-state issues-error">
                        {error}
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <header className="dashboard-header">

                <div>
                    <p className="dashboard-breadcrumb">
                        CITIZEN PORTAL
                    </p>

                    <h1>Profile</h1>
                </div>

            </header>

            <section className="dashboard-content">

                <div className="profile-page-header">

                    <div>
                        <p className="section-label">
                            ACCOUNT SETTINGS
                        </p>

                        <h2>My Profile</h2>

                        <p>
                            View and manage your account information.
                        </p>
                    </div>

                    {!isEditing && (
                        <button
                            className="edit-profile-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}

                </div>


                <div className="profile-card">

                    {updateSuccess && (
                        <p className="profile-update-success">
                            {updateSuccess}
                        </p>
                    )}

                    <div className="profile-avatar-section">

                        <div className="profile-avatar">
                            {getInitial()}
                        </div>

                        <div>

                            <h3>
                                {user?.fullName}
                            </h3>

                            <p>
                                Manage your personal information and account.
                            </p>

                        </div>

                    </div>


                    <div className="profile-details">

                        {!isEditing ? (

                            <>
                                <div className="profile-detail">
                <span className="profile-detail-label">
                    Full Name
                </span>

                                    <p>
                                        {user?.fullName}
                                    </p>
                                </div>

                                <div className="profile-detail">
                <span className="profile-detail-label">
                    Email Address
                </span>

                                    <p>
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="profile-detail">
                <span className="profile-detail-label">
                    Phone Number
                </span>

                                    <p>
                                        {user?.phoneNumber || 'Not provided'}
                                    </p>
                                </div>

                                <div className="profile-detail">
                <span className="profile-detail-label">
                    Role
                </span>

                                    <p className="profile-role">
                                        {user?.role}
                                    </p>
                                </div>

                                <div className="profile-detail">
                <span className="profile-detail-label">
                    Account Status
                </span>

                                    <p className="profile-status">
                                        {user?.accountStatus}
                                    </p>
                                </div>
                            </>

                        ) : (

                            <form
                                className="profile-edit-form"
                                onSubmit={handleUpdateProfile}
                            >

                                <div className="profile-form-group">
                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>Email Address</label>

                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                    />

                                    <small>
                                        Email cannot be changed at the moment.
                                    </small>
                                </div>

                                <div className="profile-form-group">
                                    <label>Phone Number</label>

                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phoneNumber: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                {updateError && (
                                    <p className="profile-update-error">
                                        {updateError}
                                    </p>
                                )}



                                <div className="profile-edit-actions">

                                    <button
                                        type="button"
                                        className="cancel-profile-button"
                                        onClick={() => {
                                            setIsEditing(false)

                                            setFormData({
                                                fullName: user.fullName || '',
                                                phoneNumber: user.phoneNumber || ''
                                            })

                                            setUpdateError(null)
                                            setUpdateSuccess(null)
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-profile-button"
                                        disabled={updating}
                                    >
                                        {updating
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>



                <div className="security-card">

                    <div className="security-card-header">

                        <div className="security-icon">
                            <LockKeyhole size={22} />
                        </div>

                        <div>
                            <p className="section-label">
                                SECURITY
                            </p>

                            <h2>Change Password</h2>

                            <p>
                                Update your password to keep your account secure.
                            </p>
                        </div>

                    </div>


                    <form
                        className="change-password-form"
                        onSubmit={handleChangePassword}
                    >

                        {/* CURRENT PASSWORD */}

                        <div className="profile-form-group">

                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <div className="password-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="currentPassword"
                                    type={
                                        showCurrentPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Enter your current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value
                                        })
                                    }
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-visibility-button"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword
                                        )
                                    }
                                    aria-label="Toggle current password visibility"
                                >
                                    {showCurrentPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="profile-form-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <div className="password-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="newPassword"
                                    type={
                                        showNewPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Enter your new password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })
                                    }
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-visibility-button"
                                    onClick={() =>
                                        setShowNewPassword(
                                            !showNewPassword
                                        )
                                    }
                                    aria-label="Toggle new password visibility"
                                >
                                    {showNewPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                            <small>
                                Password must be between 8 and 72 characters.
                            </small>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="profile-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <div className="password-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Confirm your new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value
                                        })
                                    }
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    className="password-visibility-button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>


                        {passwordError && (
                            <div className="password-change-error">
                                {passwordError}
                            </div>
                        )}


                        {passwordSuccess && (
                            <div className="password-change-success">
                                {passwordSuccess}
                            </div>
                        )}


                        <div className="password-change-actions">

                            <button
                                type="button"
                                className="cancel-password-button"
                                onClick={() => {

                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    })

                                    setPasswordError('')
                                    setPasswordSuccess('')

                                }}
                                disabled={changingPassword}
                            >
                                Clear
                            </button>


                            <button
                                type="submit"
                                className="change-password-button"
                                disabled={changingPassword}
                            >
                                {changingPassword
                                    ? 'Changing Password...'
                                    : 'Change Password'
                                }
                            </button>

                        </div>

                    </form>

                </div>


            </section>
        </>
    )
}

export default ProfilePage