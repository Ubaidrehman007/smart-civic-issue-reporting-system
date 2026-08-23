import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Upload, X } from 'lucide-react'
import { createIssue } from '../api/issueApi'
import '../styles/citizenCSS/reportIssue.css'
import IssueLocationPicker from '../components/issue/IssueLocationPicker'

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
    const [locationSuggestions, setLocationSuggestions] = useState([])
    const [searchingLocation, setSearchingLocation] = useState(false)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleLocationChange = ({ latitude, longitude }) => {
        setFormData((previous) => ({
            ...previous,
            latitude,
            longitude,
        }))
    }

    const handleAddressSearch = async () => {

        const address = formData.address.trim()

        if (!address) {
            setError('Please enter an address first.')
            setLocationSuggestions([])
            return
        }

        try {

            setError('')
            setSearchingLocation(true)
            setLocationSuggestions([])

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(address)}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to search location.')
            }

            const results = await response.json()

            if (!results.length) {

                setError(
                    'Location not found. Please enter a more specific address.'
                )

                return
            }

            setLocationSuggestions(results)

        } catch (err) {

            console.error('Address search failed:', err)

            setError(
                'Unable to find this location. Please try again.'
            )

        } finally {

            setSearchingLocation(false)

        }
    }
    const handleLocationSelect = (location) => {

        const latitude = Number(location.lat)
        const longitude = Number(location.lon)

        setFormData((previous) => ({
            ...previous,
            latitude,
            longitude,
            address: location.display_name,
        }))

        setLocationSuggestions([])
        setError('')
    }
    const handleUseCurrentLocation = () => {

        if (!navigator.geolocation) {
            setError(
                'Geolocation is not supported by your browser.'
            )
            return
        }

        setError('')
        setGettingCurrentLocation(true)

        navigator.geolocation.getCurrentPosition(
            async (position) => {

                const latitude = position.coords.latitude
                const longitude = position.coords.longitude

                try {

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                        {
                            headers: {
                                Accept: 'application/json',
                            },
                        }
                    )

                    let address = formData.address

                    if (response.ok) {

                        const result = await response.json()

                        address =
                            result.display_name ||
                            formData.address
                    }

                    setFormData((previous) => ({
                        ...previous,
                        latitude,
                        longitude,
                        address,
                    }))

                    setLocationSuggestions([])

                } catch (error) {

                    console.error(
                        'Reverse geocoding failed:',
                        error
                    )

                    /*
                     * Coordinates are still valid even if
                     * address lookup fails.
                     */

                    setFormData((previous) => ({
                        ...previous,
                        latitude,
                        longitude,
                    }))

                } finally {

                    setGettingCurrentLocation(false)

                }
            },

            (error) => {

                console.error(
                    'Geolocation error:',
                    error
                )

                let message =
                    'Unable to get your current location.'

                if (error.code === error.PERMISSION_DENIED) {

                    message =
                        'Location permission was denied. Please allow location access in your browser.'

                } else if (
                    error.code === error.POSITION_UNAVAILABLE
                ) {

                    message =
                        'Your current location is unavailable.'

                } else if (
                    error.code === error.TIMEOUT
                ) {

                    message =
                        'Location request timed out. Please try again.'
                }

                setError(message)
                setGettingCurrentLocation(false)
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        )
    }


    const handleImageChange = (event) => {
        const selectedFiles = Array.from(event.target.files)

        setImages(selectedFiles)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setLoading(true)
        setError('')
        setSuccess('')

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
                data.append('image', image)
            })

            for (const [key, value] of data.entries()) {
                console.log('FormData:', key, value)
            }
            await createIssue(data)

            setSuccess('Issue reported successfully! Redirecting to dashboard...')

            setTimeout(() => {
                navigate('/dashboard')
            }, 1500)
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

                                <option value="WATER_LEAKAGE">
                                    Water Leakage
                                </option>

                                <option value="SEWER">
                                    Sewer
                                </option>

                                <option value="STREETLIGHT">
                                    Street Light
                                </option>

                                <option value="DRAINAGE">
                                    Drainage
                                </option>

                                <option value="FALLEN_TREE">
                                    Fallen Tree
                                </option>

                                <option value="TRAFFIC_SIGNAL">
                                    Traffic Signal
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
                            <button
                                type="button"
                                className="location-search-button"
                                onClick={handleAddressSearch}
                            >
                                Search Location
                            </button>

                            {searchingLocation && (
                                <div className="location-search-status">
                                    Searching locations...
                                </div>
                            )}
                            <button
                                type="button"
                                className="current-location-button"
                                onClick={handleUseCurrentLocation}
                                disabled={gettingCurrentLocation}
                            >
                                <MapPin size={17} />

                                {gettingCurrentLocation
                                    ? 'Getting your location...'
                                    : 'Use My Current Location'}
                            </button>

                            {locationSuggestions.length > 0 && (
                                <div className="location-suggestions">

                                    {locationSuggestions.map((location) => (
                                        <button
                                            key={`${location.place_id}-${location.lat}-${location.lon}`}
                                            type="button"
                                            className="location-suggestion"
                                            onClick={() => handleLocationSelect(location)}
                                        >

                                            <MapPin size={17} />

                                            <span>
                    {location.display_name}
                </span>

                                        </button>
                                    ))}

                                </div>
                            )}

                        </div>

                        <div className="location-picker-section">

                            <label className="location-picker-label">
                                Select Issue Location
                            </label>

                            <p className="location-picker-description">
                                Click on the map to select the exact location of the issue.
                            </p>

                            <IssueLocationPicker
                                latitude={
                                    formData.latitude
                                        ? Number(formData.latitude)
                                        : null
                                }
                                longitude={
                                    formData.longitude
                                        ? Number(formData.longitude)
                                        : null
                                }
                                onLocationChange={handleLocationChange}
                            />

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

                    {success && (
                        <div className="report-success">
                            <div className="report-success-icon">
                                ✓
                            </div>

                            <div>
                                <strong>Issue Reported Successfully!</strong>

                                <p>
                                    Your civic issue has been submitted. Redirecting to your dashboard...
                                </p>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className="report-success">
                            {success}
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