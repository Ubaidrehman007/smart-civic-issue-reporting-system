import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'

import DashboardPage from './pages/DashboardPage'
import ReportIssuePage from './pages/ReportIssuePage'
import CitizenLayout from './components/CitizenLayout'
import MyIssuesPage from './pages/MyIssuesPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import IssueDetailsPage from './pages/IssueDetailsPage'

import ProtectedRoute from './components/ProtectedRoute'
import UnauthorizedPage from './pages/UnauthorizedPage'

import VerifyRegistrationOtpPage
    from './pages/VerifyRegistrationOtpPage'

import ResetPasswordPage
    from './pages/ResetPasswordPage'

import NotificationsPage
    from './pages/NotificationsPage'


// =====================================================
// ADMIN IMPORTS
// =====================================================

import AdminLayout from './components/AdminLayout'

import AdminDashboardPage
    from './pages/AdminPage/AdminDashboardPage'

import AdminIssuesPage
    from './pages/AdminPage/AdminIssuesPage'

import AdminIssueDetailsPage
    from './pages/AdminPage/AdminIssueDetailsPage'

import AdminUsersPage
    from './pages/AdminPage/AdminUsersPage'

import AdminWorkersPage
    from './pages/AdminPage/AdminWorkersPage'

import AdminAssignmentsPage
    from './pages/AdminPage/AdminAssignmentsPage'

import AdminSlaPage
    from './pages/AdminPage/AdminSlaPage'

import AdminAnalyticsPage
    from './pages/AdminPage/AdminAnalyticsPage'

import ForgotPasswordPage
    from './pages/ForgotPasswordPage'

import AdminNotificationsPage
    from './pages/AdminPage/AdminNotificationsPage'

import AdminAuditLogsPage
    from './pages/AdminPage/AdminAuditLogsPage'

import AdminSettingsPage
    from './pages/AdminPage/AdminSettingsPage'


// =====================================================
// FIELD WORKER IMPORTS
// =====================================================

import FieldWorkerLayout
    from './components/FieldWorkerLayout'

import FieldWorkerDashboardPage
    from './pages/FieldWorkerPage/FieldWorkerDashboardPage'
import FieldWorkerIssueDetailsPage
    from './pages/FieldWorkerPage/FieldWorkerIssueDetailsPage'
import FieldWorkerAssignmentsPage
    from './pages/FieldWorkerPage/FieldWorkerAssignmentsPage'
import FieldWorkerActiveIssuesPage
    from './pages/FieldWorkerPage/FieldWorkerActiveIssuesPage'
import FieldWorkerCompletedIssuesPage
    from './pages/FieldWorkerPage/FieldWorkerCompletedIssuesPage'
import FieldWorkerNotificationsPage
    from './pages/FieldWorkerPage/FieldWorkerNotificationsPage'

function App() {

    return (

        <Routes>

            {/* =================================================
                PUBLIC ROUTES
            ================================================= */}

            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
            />

            <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
            />

            <Route
                path="/verify-registration"
                element={<VerifyRegistrationOtpPage />}
            />

            <Route
                path="/unauthorized"
                element={<UnauthorizedPage />}
            />


            {/* =================================================
                CITIZEN ROUTES
            ================================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={['CITIZEN']}
                    />
                }
            >

                <Route element={<CitizenLayout />}>

                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />


                    <Route
                        path="/profile"
                        element={<ProfilePage />}
                    />


                    <Route
                        path="/settings"
                        element={<SettingsPage />}
                    />


                    <Route
                        path="/my-issues"
                        element={<MyIssuesPage />}
                    />


                    <Route
                        path="/my-issues/:issueId"
                        element={<IssueDetailsPage />}
                    />


                    <Route
                        path="/report-issue"
                        element={<ReportIssuePage />}
                    />


                    <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                    />

                </Route>

            </Route>


            {/* =================================================
                ADMIN ROUTES
            ================================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={['ADMIN']}
                    />
                }
            >

                <Route element={<AdminLayout />}>

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboardPage />}
                    />

                    <Route
                        path="/admin/issues"
                        element={<AdminIssuesPage />}
                    />

                    <Route
                        path="/admin/issues/:issueId"
                        element={<AdminIssueDetailsPage />}
                    />

                    <Route
                        path="/admin/users"
                        element={<AdminUsersPage />}
                    />

                    <Route
                        path="/admin/workers"
                        element={<AdminWorkersPage />}
                    />

                    <Route
                        path="/admin/assignments"
                        element={<AdminAssignmentsPage />}
                    />

                    <Route
                        path="/admin/sla"
                        element={<AdminSlaPage />}
                    />

                    <Route
                        path="/admin/analytics"
                        element={<AdminAnalyticsPage />}
                    />

                    <Route
                        path="/admin/notifications"
                        element={<AdminNotificationsPage />}
                    />

                    <Route
                        path="/admin/audit-logs"
                        element={<AdminAuditLogsPage />}
                    />

                    <Route
                        path="/admin/settings"
                        element={<AdminSettingsPage />}
                    />

                </Route>

            </Route>


            {/* =================================================
    FIELD WORKER ROUTES
================================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={['FIELD_WORKER']}
                    />
                }
            >

                <Route element={<FieldWorkerLayout />}>

                    <Route
                        path="/worker/dashboard"
                        element={<FieldWorkerDashboardPage />}
                    />
                    <Route
                        path="/worker/issues/:issueId"
                        element={<FieldWorkerIssueDetailsPage />}
                    />
                    <Route
                        path="/worker/assignments"
                        element={<FieldWorkerAssignmentsPage />}
                    />
                    <Route
                        path="/worker/active-issues"
                        element={<FieldWorkerActiveIssuesPage />}
                    />
                    <Route
                        path="/worker/completed-issues"
                        element={<FieldWorkerCompletedIssuesPage />}
                    />
                    <Route
                        path="/worker/notifications"
                        element={<FieldWorkerNotificationsPage />}
                    />

                </Route>

            </Route>

            {/*
                404
            */}

            <Route
                path="*"
                element={<NotFoundPage />}
            />

        </Routes>
    )
}

export default App