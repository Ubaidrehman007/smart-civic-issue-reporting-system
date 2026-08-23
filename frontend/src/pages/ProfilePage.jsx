import { useEffect, useState } from 'react'
import {getCurrentUser, updateProfile} from '../api/userApi'
import '../styles/citizenCSS/profile.css'

function ProfilePage() {

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

            </section>
        </>
    )
}

export default ProfilePage