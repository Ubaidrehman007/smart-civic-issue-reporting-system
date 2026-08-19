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
import IssueDetailsPage from './pages/IssueDetailsPage'

function App() {
    return (
        <Routes>

            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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



            </Route>

            <Route path="*" element={<NotFoundPage />} />



        </Routes>
    )
}

export default App