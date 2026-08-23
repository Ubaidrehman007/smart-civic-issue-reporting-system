import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { loginUser } from '../api/authApi'
import { getCurrentUser } from '../api/userApi'
import "../styles/auth.css";

function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()

        setLoading(true)
        setError('')

        try {
            const response = await loginUser({
                email,
                password,
            })

            const token = response.data.data.token

            localStorage.setItem('token', token)

            const userResponse = await getCurrentUser()

            console.log(
                'Current user after login:',
                userResponse
            )

            const user = userResponse.data

            localStorage.setItem(
                'user',
                JSON.stringify(user)
            )

            navigate('/dashboard')

        } catch (error) {

            setError(
                error.response?.data?.message ||
                'Login failed. Please try again.'
            )

        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="auth-home-button">
                    ← Back to Home
                </Link>
                <div className="auth-header">
                    <div className="auth-logo">
                        SC
                    </div>

                    <h1>Welcome back</h1>

                    <p>
                        Sign in to manage and track civic issues.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>

                        <div className="input-wrapper">
                            <Mail size={19} />

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>

                        <div className="input-wrapper">
                            <LockKeyhole size={19} />

                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create account</Link>
                </p>
            </section>
        </main>
    )
}

export default LoginPage