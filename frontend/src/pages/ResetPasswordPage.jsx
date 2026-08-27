import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from 'lucide-react'
import { resetPassword } from '../api/authApi'
import '../styles/auth.css'

function ResetPasswordPage() {

    const navigate = useNavigate()
    const location = useLocation()

    const emailFromState =
        location.state?.email || ''

    const [email, setEmail] =
        useState(emailFromState)

    const [otp, setOtp] =
        useState('')

    const [newPassword, setNewPassword] =
        useState('')

    const [showPassword, setShowPassword] =
        useState(false)

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')


    const handleOtpChange = (event) => {

        const value =
            event.target.value
                .replace(/\D/g, '')
                .slice(0, 6)

        setOtp(value)
    }


    const handleSubmit = async (event) => {

        event.preventDefault()

        setLoading(true)
        setError('')
        setSuccess('')


        try {

            const response =
                await resetPassword({
                    email,
                    otp,
                    newPassword,
                })


            setSuccess(
                response.data.message ||
                'Password reset successfully.'
            )


            setTimeout(() => {
                navigate('/login')
            }, 1500)


        } catch (error) {

            setError(
                error.response?.data?.message ||
                'Unable to reset password. Please try again.'
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
                    ← Back to Sign in
                </Link>


                <div className="auth-header">

                    <div className="auth-logo">
                        SC
                    </div>

                    <h1>
                        Reset your password
                    </h1>

                    <p>
                        Enter the verification code sent to
                        your email and create a new password.
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


                    <div className="form-group">

                        <label htmlFor="otp">
                            Verification code
                        </label>

                        <div className="input-wrapper">

                            <ShieldCheck size={19} />

                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={handleOtpChange}
                                maxLength={6}
                                required
                            />

                        </div>

                    </div>


                    <div className="form-group">

                        <label htmlFor="newPassword">
                            New password
                        </label>

                        <div className="input-wrapper">

                            <LockKeyhole size={19} />

                            <input
                                id="newPassword"
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(
                                        event.target.value
                                    )
                                }
                                minLength={8}
                                maxLength={72}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label="Toggle password visibility"
                            >

                                {showPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}

                            </button>

                        </div>

                    </div>


                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                    >
                        {loading
                            ? 'Resetting password...'
                            : 'Reset password'
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

export default ResetPasswordPage