import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { forgotPassword } from '../api/authApi'
import '../styles/auth.css'

function ForgotPasswordPage() {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (event) => {

        event.preventDefault()

        setLoading(true)
        setError('')

        try {

            await forgotPassword({
                email,
            })

            navigate(
                '/reset-password',
                {
                    state: {
                        email,
                    },
                }
            )

        } catch (error) {

            setError(
                error.response?.data?.message ||
                'Unable to send password reset OTP. Please try again.'
            )

        } finally {

            setLoading(false)
        }
    }

    return (
        <main className="auth-page">

            <section className="auth-card">

                <Link
                    to="/login"
                    className="auth-home-button"
                >
                    <ArrowLeft size={16} />
                    Back to Sign in
                </Link>


                <div className="auth-header">

                    <div className="auth-logo">
                        SC
                    </div>

                    <h1>
                        Forgot your password?
                    </h1>

                    <p>
                        Enter your registered email address
                        and we'll send you a verification code.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            Email address
                        </label>

                        <div className="input-wrapper">

                            <Mail size={19} />

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />

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
                        {loading
                            ? 'Sending code...'
                            : 'Send verification code'
                        }
                    </button>

                </form>


                <p className="auth-footer">

                    Remember your password?{' '}

                    <Link to="/login">
                        Sign in
                    </Link>

                </p>

            </section>

        </main>
    )
}

export default ForgotPasswordPage