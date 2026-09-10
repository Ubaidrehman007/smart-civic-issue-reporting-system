import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import CitizenLayout from './components/CitizenLayout'
import AdminLayout from './components/AdminLayout'
import FieldWorkerLayout from './components/FieldWorkerLayout'
import AiAssistant from './components/AiAssistant'

// =====================================================
// PUBLIC PAGES
// =====================================================

const HomePage = lazy(
    () => import('./pages/HomePage')
)

const LoginPage = lazy(
    () => import('./pages/LoginPage')
)

const RegisterPage = lazy(
    () => import('./pages/RegisterPage')
)

const NotFoundPage = lazy(
    () => import('./pages/NotFoundPage')
)

const ForgotPasswordPage = lazy(
    () => import('./pages/ForgotPasswordPage')
)

const ResetPasswordPage = lazy(
    () => import('./pages/ResetPasswordPage')
)

const VerifyRegistrationOtpPage = lazy(
    () => import('./pages/VerifyRegistrationOtpPage')
)

const UnauthorizedPage = lazy(
    () => import('./pages/UnauthorizedPage')
)

// =====================================================
// CITIZEN PAGES
// =====================================================

const DashboardPage = lazy(
    () => import('./pages/DashboardPage')
)

const ReportIssuePage = lazy(
    () => import('./pages/ReportIssuePage')
)

const MyIssuesPage = lazy(
    () => import('./pages/MyIssuesPage')
)

const ProfilePage = lazy(
    () => import('./pages/ProfilePage')
)

const SettingsPage = lazy(
    () => import('./pages/SettingsPage')
)

const IssueDetailsPage = lazy(
    () => import('./pages/IssueDetailsPage')
)

const NotificationsPage = lazy(
    () => import('./pages/NotificationsPage')
)

// =====================================================
// ADMIN PAGES
// =====================================================

const AdminDashboardPage = lazy(
    () => import('./pages/AdminPage/AdminDashboardPage')
)

const AdminIssuesPage = lazy(
    () => import('./pages/AdminPage/AdminIssuesPage')
)

const AdminIssueDetailsPage = lazy(
    () => import('./pages/AdminPage/AdminIssueDetailsPage')
)

const AdminUsersPage = lazy(
    () => import('./pages/AdminPage/AdminUsersPage')
)

const AdminWorkersPage = lazy(
    () => import('./pages/AdminPage/AdminWorkersPage')
)

const AdminAssignmentsPage = lazy(
    () => import('./pages/AdminPage/AdminAssignmentsPage')
)

const AdminSlaPage = lazy(
    () => import('./pages/AdminPage/AdminSlaPage')
)

const AdminAnalyticsPage = lazy(
    () => import('./pages/AdminPage/AdminAnalyticsPage')
)

const AdminNotificationsPage = lazy(
    () => import('./pages/AdminPage/AdminNotificationsPage')
)

const AdminAuditLogsPage = lazy(
    () => import('./pages/AdminPage/AdminAuditLogsPage')
)

const AdminSettingsPage = lazy(
    () => import('./pages/AdminPage/AdminSettingsPage')
)

// =====================================================
// FIELD WORKER PAGES
// =====================================================

const FieldWorkerDashboardPage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerDashboardPage')
)

const FieldWorkerIssueDetailsPage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerIssueDetailsPage')
)

const FieldWorkerAssignmentsPage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerAssignmentsPage')
)

const FieldWorkerActiveIssuesPage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerActiveIssuesPage')
)

const FieldWorkerCompletedIssuesPage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerCompletedIssuesPage')
)

const FieldWorkerNotificationsPage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerNotificationsPage')
)

const FieldWorkerProfilePage = lazy(
    () => import('./pages/FieldWorkerPage/FieldWorkerProfilePage')
)

// =====================================================
// LOADING FALLBACK
// =====================================================

function PageLoadingFallback() {
    return (
        <div
            style={{
                minHeight: '40vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}
        >
            Loading...
        </div>
    )
}

// =====================================================
// APP
// =====================================================

function App() {
    return (
        <>

            <Suspense fallback={<PageLoadingFallback />}>

                {/* =================================================
                    APPLICATION ROUTES
                ================================================= */}

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

                            <Route
                                path="/worker/profile"
                                element={<FieldWorkerProfilePage />}
                            />

                        </Route>

                    </Route>


                    {/* =================================================
                        404
                    ================================================= */}

                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />

                </Routes>

            </Suspense>

            <AiAssistant />

        </>
    )
}

export default App