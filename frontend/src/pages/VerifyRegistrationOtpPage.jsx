import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import {
    verifyRegistrationOtp,
    resendRegistrationOtp,
} from '../api/authApi'
import '../styles/auth.css'

function VerifyRegistrationOtpPage() {

    const navigate = useNavigate()
    const location = useLocation()

    const emailFromState =
        location.state?.email || ''

    const [email, setEmail] =
        useState(emailFromState)

    const [otp, setOtp] =
        useState('')

    const [loading, setLoading] =
        useState(false)

    const [resendLoading, setResendLoading] =
        useState(false)

    const [resendCooldown, setResendCooldown] =
        useState(60)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')


    /*
     * Countdown timer
     */
    useEffect(() => {

        if (resendCooldown <= 0) {
            return
        }

        const timer =
            setInterval(() => {

                setResendCooldown(
                    (previous) =>
                        previous > 0
                            ? previous - 1
                            : 0
                )

            }, 1000)

        return () => clearInterval(timer)

    }, [resendCooldown])


    /*
     * Verify registration OTP
     */
    const handleSubmit = async (event) => {

        event.preventDefault()

        setLoading(true)
        setError('')
        setSuccess('')


        try {

            const response =
                await verifyRegistrationOtp({
                    email,
                    otp,
                })


            setSuccess(
                response.data.message ||
                'Email verified successfully.'
            )


            setTimeout(() => {
                navigate('/login')
            }, 1200)


        } catch (error) {

            setError(
                error.response?.data?.message ||
                'Invalid or expired OTP.'
            )

        } finally {

            setLoading(false)
        }
    }


    /*
     * Only allow numeric OTP
     */
    const handleOtpChange = (event) => {

        const value =
            event.target.value
                .replace(/\D/g, '')
                .slice(0, 6)

        setOtp(value)
    }


    /*
     * Resend registration OTP
     */
    const handleResendOtp = async () => {

        if (resendCooldown > 0 || resendLoading) {
            return
        }

        if (!email.trim()) {

            setError(
                'Please enter your email address.'
            )

            return
        }


        setResendLoading(true)
        setError('')
        setSuccess('')


        try {

            const response =
                await resendRegistrationOtp(
                    email.trim()
                )


            setSuccess(
                response.data.message ||
                'A new OTP has been sent to your email.'
            )

            /*
             * Restart 60-second cooldown
             */
            setResendCooldown(60)

            /*
             * Clear old OTP
             */
            setOtp('')


        } catch (error) {

            const message =
                error.response?.data?.message ||
                'Unable to resend OTP. Please try again.'

            setError(message)


            /*
             * If backend tells us how many seconds
             * remain, synchronize frontend countdown.
             */
            const match =
                message.match(/(\d+)\s*seconds?/i)

            if (match) {

                const remainingSeconds =
                    Number(match[1])

                if (
                    Number.isFinite(
                        remainingSeconds
                    ) &&
                    remainingSeconds > 0
                ) {

                    setResendCooldown(
                        remainingSeconds
                    )
                }
            }

        } finally {

            setResendLoading(false)
        }
    }


    return (
        <main className="auth-page">

            <section className="auth-card">

                <Link
                    to="/register"
                    className="auth-home-button"
                >
                    ← Back to registration
                </Link>


                <div className="auth-header">

                    <div className="auth-logo">
                        SC
                    </div>

                    <h1>
                        Verify your email
                    </h1>

                    <p>
                        Enter the 6-digit verification code
                        sent to your email address.
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
                                    setEmail(
                                        event.target.value
                                    )
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


                    <div className="otp-resend-section">

                        <span>
                            Didn't receive the code?
                        </span>

                        <button
                            type="button"
                            className="otp-resend-button"
                            onClick={handleResendOtp}
                            disabled={
                                resendCooldown > 0 ||
                                resendLoading
                            }
                        >

                            {resendLoading
                                ? 'Sending...'
                                : resendCooldown > 0
                                    ? `Resend code in ${resendCooldown}s`
                                    : 'Resend code'
                            }

                        </button>

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
                            ? 'Verifying...'
                            : 'Verify email'
                        }

                    </button>

                </form>


                <p className="auth-footer">

                    Already verified?{' '}

                    <Link to="/login">
                        Sign in
                    </Link>

                </p>

            </section>

        </main>
    )
}

export default VerifyRegistrationOtpPage