import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Upload, X } from 'lucide-react'
import { createIssue } from '../api/issueApi'

function ReportIssuePage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        address: '',
        latitude: '',
        longitude: '',
    })

    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleImageChange = (event) => {
        const selectedFiles = Array.from(event.target.files)

        setImages(selectedFiles)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setLoading(true)
        setError('')

        try {
            const data = new FormData()

            data.append('title', formData.title)
            data.append('description', formData.description)
            data.append('category', formData.category)
            data.append('address', formData.address)

            data.append(
                'latitude',
                Number(formData.latitude)
            )

            data.append(
                'longitude',
                Number(formData.longitude)
            )

            images.forEach((image) => {
                data.append('images', image)
            })

            await createIssue(data)

            navigate('/dashboard')
        } catch (err) {
            console.error('Failed to create issue:', err)

            setError(
                err.response?.data?.message ||
                'Failed to report the issue. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="report-issue-page">

            <div className="report-issue-container">

                <div className="report-page-header">
                    <div>
                        <p className="section-label">
                            REPORT A CIVIC ISSUE
                        </p>

                        <h1>Report an Issue</h1>

                        <p>
                            Help improve your community by reporting
                            a civic issue in your area.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <form
                    className="report-issue-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-section">
                        <h2>Issue Details</h2>

                        <div className="form-group">
                            <label htmlFor="title">
                                Issue Title
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                placeholder="e.g. Large pothole on main road"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe the issue in detail..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">
                                Issue Category
                            </label>

                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select a category
                                </option>

                                <option value="ROAD_DAMAGE">
                                    Road Damage
                                </option>

                                <option value="GARBAGE">
                                    Garbage / Waste
                                </option>

                                <option value="WATER_SUPPLY">
                                    Water Supply
                                </option>

                                <option value="STREET_LIGHT">
                                    Street Light
                                </option>

                                <option value="DRAINAGE">
                                    Drainage
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Location</h2>

                        <div className="form-group">
                            <label htmlFor="address">
                                Address
                            </label>

                            <div className="input-with-icon">
                                <MapPin size={19} />

                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Enter issue location"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="location-grid">

                            <div className="form-group">
                                <label htmlFor="latitude">
                                    Latitude
                                </label>

                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g. 26.8467"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="longitude">
                                    Longitude
                                </label>

                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="e.g. 80.9462"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Add Photos</h2>

                        <p className="form-section-description">
                            Upload photos to help authorities better
                            understand the issue.
                        </p>

                        <label className="upload-area">

                            <Upload size={28} />

                            <strong>
                                Click to upload photos
                            </strong>

                            <span>
                                You can select multiple images
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                hidden
                            />
                        </label>

                        {images.length > 0 && (
                            <div className="selected-images">
                                {images.map((image, index) => (
                                    <div
                                        className="selected-image"
                                        key={`${image.name}-${index}`}
                                    >
                                        <span>
                                            {image.name}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImages((previous) =>
                                                    previous.filter(
                                                        (_, imageIndex) =>
                                                            imageIndex !== index
                                                    )
                                                )
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="report-error">
                            {error}
                        </div>
                    )}

                    <div className="report-form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-issue-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Submitting...'
                                : 'Submit Issue'
                            }
                        </button>

                    </div>

                </form>

            </div>

        </main>
    )
}

export default ReportIssuePage