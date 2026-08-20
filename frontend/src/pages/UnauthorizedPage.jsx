import { useNavigate } from 'react-router-dom'

function UnauthorizedPage() {

    const navigate = useNavigate()

    return (
        <main className="auth-page">

            <section className="auth-card">

                <div className="auth-header">

                    <div className="auth-logo">
                        403
                    </div>

                    <h1>Access Denied</h1>

                    <p>
                        You do not have permission to access this page.
                    </p>

                    <button
                        className="auth-submit"
                        onClick={() => navigate('/')}
                    >
                        Go to Home
                    </button>

                </div>

            </section>

        </main>
    )
}

export default UnauthorizedPage