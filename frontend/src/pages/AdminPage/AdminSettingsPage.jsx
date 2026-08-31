import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getCurrentUser,
    updateProfile,
    changePassword
} from '../../api/userApi'
import {
    getAdminSettings,
    updateNotificationPreferences,
    updateIssueConfiguration,
    updateSystemConfiguration,
    resetAdminSettings,

} from '../../api/adminSettingsApi'
import '../../styles/adminCSS/adminSettings.css'


function AdminSettingsPage() {

    const navigate = useNavigate()


    // =====================================================
    // USER STATE
    // =====================================================

    const [user, setUser] = useState(null)

    const [loadingUser, setLoadingUser] =
        useState(true)

    const [userError, setUserError] =
        useState('')


    // =====================================================
    // PROFILE EDIT STATE
    // =====================================================

    const [profileModalOpen, setProfileModalOpen] =
        useState(false)

    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phoneNumber: ''
    })

    const [updatingProfile, setUpdatingProfile] =
        useState(false)

    const [profileError, setProfileError] =
        useState('')

    const [profileSuccess, setProfileSuccess] =
        useState('')


    // =====================================================
    // PASSWORD STATE
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

    const [passwordSuccess, setPasswordSuccess] =
        useState('')


    // =====================================================
    // PASSWORD VISIBILITY
    // =====================================================

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false)

    const [showNewPassword, setShowNewPassword] =
        useState(false)

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false)


    // =====================================================
    // NOTIFICATION PREFERENCES
    // =====================================================

    const defaultNotificationPreferences = {
        newIssues: true,
        issueAssignments: true,
        statusChanges: true,
        issueResolved: true,
        slaWarnings: true,
        slaBreaches: true,
        newCitizenRegistrations: true,
        accountStatusChanges: true
    }


    const [notificationPreferences, setNotificationPreferences] =
        useState(defaultNotificationPreferences)


    // =====================================================
    // SYSTEM SETTINGS
    // =====================================================

    const defaultSystemSettings = {
        maintenanceMode: false,
        newRegistrations: true,
        issueReporting: true,
        emailNotifications: true
    }


    const [systemSettings, setSystemSettings] =
        useState(defaultSystemSettings)


    // =====================================================
    // ISSUE DEFAULTS
    // =====================================================

    const defaultIssueSettings = {
        defaultPriority: 'MEDIUM',
        defaultStatus: 'REPORTED',
        assignmentMode: 'MANUAL'
    }


    const [issueSettings, setIssueSettings] =
        useState(defaultIssueSettings)


    // =====================================================
    // GENERAL MESSAGE
    // =====================================================

    const [settingsMessage, setSettingsMessage] =
        useState('')


    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {

        const fetchCurrentUser = async () => {

            try {

                setLoadingUser(true)
                setUserError('')

                const response =
                    await getCurrentUser()

                const currentUser =
                    response?.data

                setUser(currentUser)

                setProfileForm({
                    fullName:
                        currentUser?.fullName || '',

                    phoneNumber:
                        currentUser?.phoneNumber || ''
                })


                // Keep localStorage synchronized

                localStorage.setItem(
                    'user',
                    JSON.stringify(currentUser)
                )

            } catch (error) {

                console.error(
                    'Failed to load admin profile:',
                    error
                )

                setUserError(
                    error.response?.data?.message ||
                    'Unable to load administrator profile.'
                )

            } finally {

                setLoadingUser(false)
            }
        }


        fetchCurrentUser()

    }, [])


    // =====================================================
    // LOAD SAVED SETTINGS
    // =====================================================

    useEffect(() => {

        const loadSettings = async () => {

            try {

                const response =
                    await getAdminSettings()

                const settings =
                    response?.data

                setNotificationPreferences({

                    newIssues:
                    settings.notifyNewIssues,

                    issueAssignments:
                    settings.notifyIssueAssignments,

                    statusChanges:
                    settings.notifyStatusChanges,

                    issueResolved:
                    settings.notifyIssueResolved,

                    slaWarnings:
                    settings.notifySlaWarnings,

                    slaBreaches:
                    settings.notifySlaBreaches,

                    newCitizenRegistrations:
                    settings.notifyNewCitizenRegistrations,

                    accountStatusChanges:
                    settings.notifyAccountStatusChanges
                })

                setSystemSettings({

                    maintenanceMode:
                    settings.maintenanceMode,

                    newRegistrations:
                    settings.allowNewRegistrations,

                    issueReporting:
                    settings.allowIssueReporting,

                    emailNotifications:
                    settings.emailNotifications
                })

                setIssueSettings({

                    defaultPriority:
                    settings.defaultIssuePriority,

                    defaultStatus:
                    settings.defaultIssueStatus,

                    assignmentMode:
                    settings.assignmentStrategy
                })

            } catch (error) {

                console.error(
                    'Failed to load admin settings:',
                    error
                )

                setSettingsMessage(
                    error.response?.data?.message ||
                    'Failed to load administrator settings.'
                )
            }

        }

        loadSettings()

    }, [])

    // =====================================================
    // PROFILE MODAL
    // =====================================================

    const openProfileModal = () => {

        setProfileError('')
        setProfileSuccess('')

        setProfileForm({
            fullName: user?.fullName || '',
            phoneNumber: user?.phoneNumber || ''
        })

        setProfileModalOpen(true)
    }


    const closeProfileModal = () => {

        if (updatingProfile) {
            return
        }

        setProfileModalOpen(false)
        setProfileError('')
        setProfileSuccess('')
    }


    // =====================================================
    // PROFILE FORM CHANGE
    // =====================================================

    const handleProfileChange = (event) => {

        const {
            name,
            value
        } = event.target

        setProfileForm(
            previous => ({
                ...previous,
                [name]: value
            })
        )
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

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


        if (!/^[0-9]{10}$/.test(phoneNumber)) {

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
                    phoneNumber
                }
            )


            // Refresh user from backend

            const response =
                await getCurrentUser()

            const updatedUser =
                response?.data


            setUser(updatedUser)


            setProfileForm({
                fullName:
                    updatedUser?.fullName || '',

                phoneNumber:
                    updatedUser?.phoneNumber || ''
            })


            localStorage.setItem(
                'user',
                JSON.stringify(updatedUser)
            )


            setProfileSuccess(
                'Profile updated successfully.'
            )


            setSettingsMessage(
                'Your profile has been updated successfully.'
            )


            setTimeout(() => {

                setProfileModalOpen(false)

                setProfileSuccess('')

            }, 1000)

        } catch (error) {

            console.error(
                'Failed to update profile:',
                error
            )

            setProfileError(
                error.response?.data?.message ||
                'Failed to update profile.'
            )

        } finally {

            setUpdatingProfile(false)
        }
    }


    // =====================================================
    // PASSWORD MODAL
    // =====================================================

    const openPasswordModal = () => {

        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        setPasswordError('')
        setPasswordSuccess('')

        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)

        setPasswordModalOpen(true)
    }


    const closePasswordModal = () => {

        if (changingPassword) {
            return
        }

        setPasswordModalOpen(false)

        setPasswordError('')
        setPasswordSuccess('')

        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
    }


    // =====================================================
    // PASSWORD FORM CHANGE
    // =====================================================

    const handlePasswordChange = (event) => {

        const {
            name,
            value
        } = event.target

        setPasswordForm(
            previous => ({
                ...previous,
                [name]: value
            })
        )
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async (event) => {

        event.preventDefault()

        setPasswordError('')
        setPasswordSuccess('')


        const {
            currentPassword,
            newPassword,
            confirmPassword
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


        if (newPassword.length > 72) {

            setPasswordError(
                'New password cannot exceed 72 characters.'
            )

            return
        }


        if (newPassword !== confirmPassword) {

            setPasswordError(
                'New passwords do not match.'
            )

            return
        }


        if (currentPassword === newPassword) {

            setPasswordError(
                'New password must be different from your current password.'
            )

            return
        }


        try {

            setChangingPassword(true)

            await changePassword({
                currentPassword,
                newPassword
            })


            setPasswordSuccess(
                'Password changed successfully. You will be redirected to login.'
            )


            setTimeout(() => {

                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('userRole')

                navigate('/login')

            }, 1500)

        } catch (error) {

            console.error(
                'Failed to change password:',
                error
            )

            setPasswordError(
                error.response?.data?.message ||
                'Unable to change password. Please check your current password.'
            )

        } finally {

            setChangingPassword(false)
        }
    }


    // =====================================================
    // NOTIFICATION TOGGLE
    // =====================================================

    const handleNotificationChange = async (key) => {

        const updated = {
            ...notificationPreferences,
            [key]: !notificationPreferences[key]
        }

        try {

            setNotificationPreferences(updated)

            await updateNotificationPreferences({
                notifyNewIssues: updated.newIssues,
                notifyIssueAssignments: updated.issueAssignments,
                notifyStatusChanges: updated.statusChanges,
                notifyIssueResolved: updated.issueResolved,
                notifySlaWarnings: updated.slaWarnings,
                notifySlaBreaches: updated.slaBreaches,
                notifyNewCitizenRegistrations:
                updated.newCitizenRegistrations,
                notifyAccountStatusChanges:
                updated.accountStatusChanges
            })

            setSettingsMessage(
                'Notification preference saved.'
            )

        } catch (error) {

            setNotificationPreferences(
                notificationPreferences
            )

            setSettingsMessage(
                error.response?.data?.message ||
                'Failed to save notification preference.'
            )
        }
    }
    // =====================================================
    // SYSTEM SETTING TOGGLE
    // =====================================================

    const handleSystemSettingChange = async (key) => {

        const updated = {
            ...systemSettings,
            [key]: !systemSettings[key]
        }

        try {

            setSystemSettings(updated)

            await updateSystemConfiguration({

                maintenanceMode:
                updated.maintenanceMode,

                allowNewRegistrations:
                updated.newRegistrations,

                allowIssueReporting:
                updated.issueReporting,

                emailNotifications:
                updated.emailNotifications
            })

            setSettingsMessage(
                'System setting saved.'
            )

        } catch (error) {

            setSystemSettings(
                systemSettings
            )

            setSettingsMessage(
                error.response?.data?.message ||
                'Failed to save system setting.'
            )
        }
    }

    // =====================================================
    // ISSUE SETTING CHANGE
    // =====================================================

    const handleIssueSettingChange = async (
        key,
        value
    ) => {

        const updated = {
            ...issueSettings,
            [key]: value
        }

        try {

            setIssueSettings(updated)

            await updateIssueConfiguration({

                defaultIssuePriority:
                updated.defaultPriority,

                defaultIssueStatus:
                updated.defaultStatus,

                assignmentStrategy:
                updated.assignmentMode
            })

            setSettingsMessage(
                'Issue configuration saved.'
            )

        } catch (error) {

            setIssueSettings(
                issueSettings
            )

            setSettingsMessage(
                error.response?.data?.message ||
                'Failed to save issue configuration.'
            )
        }
    }


    // =====================================================
    // RESET LOCAL SETTINGS
    // =====================================================

    const handleResetSettings = async () => {

        const confirmed =
            window.confirm(
                'Reset all administrator preferences to their default values?'
            )

        if (!confirmed) {
            return
        }

        try {

            const response =
                await resetAdminSettings()

            const settings =
                response?.data

            setNotificationPreferences({

                newIssues:
                settings.notifyNewIssues,

                issueAssignments:
                settings.notifyIssueAssignments,

                statusChanges:
                settings.notifyStatusChanges,

                issueResolved:
                settings.notifyIssueResolved,

                slaWarnings:
                settings.notifySlaWarnings,

                slaBreaches:
                settings.notifySlaBreaches,

                newCitizenRegistrations:
                settings.notifyNewCitizenRegistrations,

                accountStatusChanges:
                settings.notifyAccountStatusChanges
            })


            setSystemSettings({

                maintenanceMode:
                settings.maintenanceMode,

                newRegistrations:
                settings.allowNewRegistrations,

                issueReporting:
                settings.allowIssueReporting,

                emailNotifications:
                settings.emailNotifications
            })


            setIssueSettings({

                defaultPriority:
                settings.defaultIssuePriority,

                defaultStatus:
                settings.defaultIssueStatus,

                assignmentMode:
                settings.assignmentStrategy
            })


            setSettingsMessage(
                'Administrator preferences have been reset.'
            )

        } catch (error) {

            setSettingsMessage(
                error.response?.data?.message ||
                'Failed to reset administrator settings.'
            )
        }
    }

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        const confirmed =
            window.confirm(
                'Are you sure you want to logout?'
            )

        if (!confirmed) {
            return
        }


        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')

        navigate('/login')
    }


    // =====================================================
    // SLA NAVIGATION
    // =====================================================

    const handleManageSla = () => {

        navigate('/admin/sla')
    }


    // =====================================================
    // USER INITIAL
    // =====================================================

    const getInitial = () => {

        if (!user?.fullName) {
            return 'A'
        }

        return user.fullName
            .charAt(0)
            .toUpperCase()
    }


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loadingUser) {

        return (

            <div className="admin-settings-page">

                <section className="admin-settings-header">

                    <div>

                        <p className="admin-settings-eyebrow">
                            ADMINISTRATION
                        </p>

                        <h1>
                            Settings
                        </h1>

                        <p>
                            Loading administrator settings...
                        </p>

                    </div>

                </section>


                <div className="admin-settings-card">

                    <div className="admin-settings-loading">
                        Loading your account information...
                    </div>

                </div>

            </div>
        )
    }


    // =====================================================
    // ERROR STATE
    // =====================================================

    if (userError) {

        return (

            <div className="admin-settings-page">

                <section className="admin-settings-header">

                    <div>

                        <p className="admin-settings-eyebrow">
                            ADMINISTRATION
                        </p>

                        <h1>
                            Settings
                        </h1>

                    </div>

                </section>


                <div className="admin-settings-card">

                    <div className="admin-settings-error">

                        {userError}

                    </div>


                    <button
                        type="button"
                        className="admin-settings-primary-button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        )
    }


    return (

        <div className="admin-settings-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="admin-settings-header">

                <div>

                    <p className="admin-settings-eyebrow">
                        ADMINISTRATION
                    </p>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your administrator account,
                        security and system preferences.
                    </p>

                </div>

            </section>


            {/* =================================================
                GLOBAL MESSAGE
            ================================================= */}

            {settingsMessage && (

                <div className="admin-settings-success-message">

                    {settingsMessage}

                    <button
                        type="button"
                        onClick={() =>
                            setSettingsMessage('')
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            <div className="admin-settings-content">


                {/* =================================================
                    PROFILE
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                ACCOUNT
                            </p>

                            <h2>
                                Profile & Account
                            </h2>

                            <p>
                                Manage your administrator identity
                                and account information.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-profile">

                        <div className="admin-settings-avatar">

                            {getInitial()}

                        </div>


                        <div className="admin-settings-profile-info">

                            <h3>
                                {user?.fullName}
                            </h3>

                            <p>
                                {user?.email}
                            </p>

                            <span className="admin-settings-role">
                                {user?.role || 'ADMIN'}
                            </span>

                        </div>

                    </div>


                    <div className="admin-settings-info-grid">

                        <div className="admin-settings-info-item">

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {user?.fullName || 'Not provided'}
                            </strong>

                        </div>


                        <div className="admin-settings-info-item">

                            <span>
                                Email Address
                            </span>

                            <strong>
                                {user?.email || 'Not provided'}
                            </strong>

                        </div>


                        <div className="admin-settings-info-item">

                            <span>
                                Phone Number
                            </span>

                            <strong>
                                {user?.phoneNumber || 'Not provided'}
                            </strong>

                        </div>


                        <div className="admin-settings-info-item">

                            <span>
                                Account Status
                            </span>

                            <strong className="admin-settings-status-active">

                                {user?.accountStatus || 'ACTIVE'}

                            </strong>

                        </div>

                    </div>


                    <div className="admin-settings-actions">

                        <button
                            type="button"
                            className="admin-settings-primary-button"
                            onClick={openProfileModal}
                        >
                            Edit Profile
                        </button>

                    </div>

                </section>


                {/* =================================================
                    SECURITY
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                SECURITY
                            </p>

                            <h2>
                                Security
                            </h2>

                            <p>
                                Protect your administrator account.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-security-list">


                        <div className="admin-settings-security-item">

                            <div>

                                <h3>
                                    Password
                                </h3>

                                <p>
                                    Change your administrator
                                    account password.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-settings-secondary-button"
                                onClick={openPasswordModal}
                            >
                                Change Password
                            </button>

                        </div>


                        <div className="admin-settings-security-item">

                            <div>

                                <h3>
                                    Current Session
                                </h3>

                                <p>
                                    Sign out from this administrator
                                    session.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-settings-danger-outline-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                NOTIFICATIONS
                            </p>

                            <h2>
                                Notification Preferences
                            </h2>

                            <p>
                                Choose which system events should
                                be shown in your administrator preferences.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-toggle-list">


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    New Issues
                                </h3>

                                <p>
                                    Notify when a new civic issue is reported.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.newIssues
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'newIssues'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Issue Assignments
                                </h3>

                                <p>
                                    Notify when an issue is assigned
                                    to a field worker.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.issueAssignments
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'issueAssignments'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Status Changes
                                </h3>

                                <p>
                                    Notify when an issue status changes.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.statusChanges
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'statusChanges'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Issue Resolved
                                </h3>

                                <p>
                                    Notify when an issue is resolved.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.issueResolved
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'issueResolved'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    SLA Warnings
                                </h3>

                                <p>
                                    Notify about approaching SLA deadlines.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.slaWarnings
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'slaWarnings'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    SLA Breaches
                                </h3>

                                <p>
                                    Notify when an issue breaches its SLA.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.slaBreaches
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'slaBreaches'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    New Citizen Registrations
                                </h3>

                                <p>
                                    Notify when a new citizen registers.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.newCitizenRegistrations
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'newCitizenRegistrations'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Account Status Changes
                                </h3>

                                <p>
                                    Notify about account status changes.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    notificationPreferences.accountStatusChanges
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleNotificationChange(
                                        'accountStatusChanges'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ISSUE DEFAULTS
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                ISSUE MANAGEMENT
                            </p>

                            <h2>
                                Issue Defaults
                            </h2>

                            <p>
                                Configure default values used by
                                the administrator interface.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-form-grid">


                        <div className="admin-settings-form-group">

                            <label>
                                Default Priority
                            </label>

                            <select
                                value={
                                    issueSettings.defaultPriority
                                }
                                onChange={(event) =>
                                    handleIssueSettingChange(
                                        'defaultPriority',
                                        event.target.value
                                    )
                                }
                            >

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


                        <div className="admin-settings-form-group">

                            <label>
                                Default Status
                            </label>

                            <select
                                value={
                                    issueSettings.defaultStatus
                                }
                                onChange={(event) =>
                                    handleIssueSettingChange(
                                        'defaultStatus',
                                        event.target.value
                                    )
                                }
                            >

                                <option value="REPORTED">
                                    Reported
                                </option>

                                <option value="UNDER_REVIEW">
                                    Under Review
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                            </select>

                        </div>


                        <div className="admin-settings-form-group">

                            <label>
                                Assignment Mode
                            </label>

                            <select
                                value={
                                    issueSettings.assignmentMode
                                }
                                onChange={(event) =>
                                    handleIssueSettingChange(
                                        'assignmentMode',
                                        event.target.value
                                    )
                                }
                            >

                                <option value="MANUAL">
                                    Manual Assignment
                                </option>

                                <option value="AUTOMATIC">
                                    Automatic Assignment
                                </option>

                            </select>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SLA
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                SERVICE LEVEL
                            </p>

                            <h2>
                                SLA Configuration
                            </h2>

                            <p>
                                Manage service-level rules from
                                the dedicated SLA management page.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-linked-section">

                        <div>

                            <h3>
                                SLA Management
                            </h3>

                            <p>
                                Configure category, priority and
                                SLA duration rules.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="admin-settings-secondary-button"
                            onClick={handleManageSla}
                        >
                            Manage SLA
                        </button>

                    </div>

                </section>


                {/* =================================================
                    SYSTEM CONTROLS
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                SYSTEM
                            </p>

                            <h2>
                                System Controls
                            </h2>

                            <p>
                                Manage administrator-side operational
                                preferences.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-toggle-list">


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Maintenance Mode
                                </h3>

                                <p>
                                    Enable maintenance mode preference.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    systemSettings.maintenanceMode
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleSystemSettingChange(
                                        'maintenanceMode'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    New Citizen Registrations
                                </h3>

                                <p>
                                    Enable or disable new registration preference.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    systemSettings.newRegistrations
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleSystemSettingChange(
                                        'newRegistrations'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Issue Reporting
                                </h3>

                                <p>
                                    Enable or disable issue reporting preference.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    systemSettings.issueReporting
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleSystemSettingChange(
                                        'issueReporting'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>


                        <div className="admin-settings-toggle-item">

                            <div>

                                <h3>
                                    Email Notifications
                                </h3>

                                <p>
                                    Enable email notification preference.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={`admin-settings-switch ${
                                    systemSettings.emailNotifications
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleSystemSettingChange(
                                        'emailNotifications'
                                    )
                                }
                            >
                                <span />
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESET
                ================================================= */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-header">

                        <div>

                            <p className="admin-settings-card-eyebrow">
                                PREFERENCES
                            </p>

                            <h2>
                                Reset Preferences
                            </h2>

                            <p>
                                Restore administrator-side preferences
                                to their default values.
                            </p>

                        </div>

                    </div>


                    <div className="admin-settings-linked-section">

                        <div>

                            <h3>
                                Restore Defaults
                            </h3>

                            <p>
                                This will reset notification,
                                system and issue preferences.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="admin-settings-danger-outline-button"
                            onClick={handleResetSettings}
                        >
                            Reset Preferences
                        </button>

                    </div>

                </section>


            </div>


            {/* =====================================================
                PROFILE MODAL
            ===================================================== */}

            {profileModalOpen && (

                <div
                    className="admin-settings-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeProfileModal()
                        }

                    }}
                >

                    <div className="admin-settings-modal">

                        <div className="admin-settings-modal-header">

                            <div>

                                <p className="admin-settings-card-eyebrow">
                                    ACCOUNT
                                </p>

                                <h2>
                                    Edit Profile
                                </h2>

                                <p>
                                    Update your administrator
                                    account information.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-settings-modal-close"
                                onClick={closeProfileModal}
                                disabled={updatingProfile}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleUpdateProfile}
                            className="admin-settings-modal-form"
                        >

                            <div className="admin-settings-form-group">

                                <label htmlFor="admin-full-name">
                                    Full Name
                                </label>

                                <input
                                    id="admin-full-name"
                                    name="fullName"
                                    type="text"
                                    value={
                                        profileForm.fullName
                                    }
                                    onChange={
                                        handleProfileChange
                                    }
                                    placeholder="Enter full name"
                                    disabled={updatingProfile}
                                />

                            </div>


                            <div className="admin-settings-form-group">

                                <label htmlFor="admin-phone-number">
                                    Phone Number
                                </label>

                                <input
                                    id="admin-phone-number"
                                    name="phoneNumber"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength="10"
                                    value={
                                        profileForm.phoneNumber
                                    }
                                    onChange={(event) => {

                                        const value =
                                            event.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10)

                                        setProfileForm(
                                            previous => ({
                                                ...previous,
                                                phoneNumber: value
                                            })
                                        )

                                    }}
                                    placeholder="10 digit phone number"
                                    disabled={updatingProfile}
                                />

                            </div>


                            {profileError && (

                                <div className="admin-settings-form-error">

                                    {profileError}

                                </div>

                            )}


                            {profileSuccess && (

                                <div className="admin-settings-form-success">

                                    {profileSuccess}

                                </div>

                            )}


                            <div className="admin-settings-modal-actions">

                                <button
                                    type="button"
                                    className="admin-settings-secondary-button"
                                    onClick={closeProfileModal}
                                    disabled={updatingProfile}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-settings-primary-button"
                                    disabled={updatingProfile}
                                >
                                    {updatingProfile
                                        ? 'Saving...'
                                        : 'Save Changes'
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                PASSWORD MODAL
            ===================================================== */}

            {passwordModalOpen && (

                <div
                    className="admin-settings-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closePasswordModal()
                        }

                    }}
                >

                    <div className="admin-settings-modal">

                        <div className="admin-settings-modal-header">

                            <div>

                                <p className="admin-settings-card-eyebrow">
                                    SECURITY
                                </p>

                                <h2>
                                    Change Password
                                </h2>

                                <p>
                                    Update your administrator
                                    account password.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-settings-modal-close"
                                onClick={closePasswordModal}
                                disabled={changingPassword}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleChangePassword}
                            className="admin-settings-modal-form"
                        >


                            <div className="admin-settings-form-group">

                                <label htmlFor="current-password">
                                    Current Password
                                </label>

                                <div className="admin-settings-password-wrapper">

                                    <input
                                        id="current-password"
                                        name="currentPassword"
                                        type={
                                            showCurrentPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={
                                            passwordForm.currentPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter current password"
                                        disabled={changingPassword}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                previous =>
                                                    !previous
                                            )
                                        }
                                        disabled={changingPassword}
                                    >
                                        {showCurrentPassword
                                            ? 'Hide'
                                            : 'Show'
                                        }
                                    </button>

                                </div>

                            </div>


                            <div className="admin-settings-form-group">

                                <label htmlFor="new-password">
                                    New Password
                                </label>

                                <div className="admin-settings-password-wrapper">

                                    <input
                                        id="new-password"
                                        name="newPassword"
                                        type={
                                            showNewPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={
                                            passwordForm.newPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Minimum 8 characters"
                                        disabled={changingPassword}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(
                                                previous =>
                                                    !previous
                                            )
                                        }
                                        disabled={changingPassword}
                                    >
                                        {showNewPassword
                                            ? 'Hide'
                                            : 'Show'
                                        }
                                    </button>

                                </div>

                            </div>


                            <div className="admin-settings-form-group">

                                <label htmlFor="confirm-password">
                                    Confirm New Password
                                </label>

                                <div className="admin-settings-password-wrapper">

                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={
                                            passwordForm.confirmPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Re-enter new password"
                                        disabled={changingPassword}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                previous =>
                                                    !previous
                                            )
                                        }
                                        disabled={changingPassword}
                                    >
                                        {showConfirmPassword
                                            ? 'Hide'
                                            : 'Show'
                                        }
                                    </button>

                                </div>

                            </div>


                            {passwordError && (

                                <div className="admin-settings-form-error">

                                    {passwordError}

                                </div>

                            )}


                            {passwordSuccess && (

                                <div className="admin-settings-form-success">

                                    {passwordSuccess}

                                </div>

                            )}


                            <div className="admin-settings-modal-actions">

                                <button
                                    type="button"
                                    className="admin-settings-secondary-button"
                                    onClick={closePasswordModal}
                                    disabled={changingPassword}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-settings-primary-button"
                                    disabled={changingPassword}
                                >
                                    {changingPassword
                                        ? 'Changing...'
                                        : 'Change Password'
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default AdminSettingsPage