import { useState } from 'react'
import { Link } from 'react-router-dom'
import {Eye, EyeOff, LockKeyhole, Mail, Phone, User,} from 'lucide-react'
import { registerUser } from '../api/authApi'
import "../styles/auth.css";

function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
    })

    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await registerUser(formData)

            setSuccess(
                response.data.message || 'Account created successfully'
            )

            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                password: '',
            })
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
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

                    <h1>Create account</h1>

                    <p>
                        Join Smart Civic and help improve your city.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Full name</label>

                        <div className="input-wrapper">
                            <User size={19} />

                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email address</label>

                        <div className="input-wrapper">
                            <Mail size={19} />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone number</label>

                        <div className="input-wrapper">
                            <Phone size={19} />

                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
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
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
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
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    )
}

export default RegisterPage