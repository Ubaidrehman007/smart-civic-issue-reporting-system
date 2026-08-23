import { useEffect, useState } from 'react'
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_LOCATION = [26.8467, 80.9462]

/* =========================
   FIX LEAFLET MARKER ICON
========================= */

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


/* =========================
   MAP CENTER CONTROLLER
========================= */

function MapController({ position }) {

    const map = useMap()

    useEffect(() => {

        if (!position) {
            return
        }

        map.setView(position, 15)

    }, [map, position])

    return null
}


/* =========================
   MAP CLICK HANDLER
========================= */

function LocationMarker({ position, setPosition }) {

    useMapEvents({

        click(event) {

            const { lat, lng } = event.latlng

            setPosition([lat, lng])
        },

    })

    return position ? (
        <Marker position={position} />
    ) : null
}


/* =========================
   COMPONENT
========================= */

function IssueLocationPicker({
                                 latitude,
                                 longitude,
                                 onLocationChange,
                             }) {

    const initialPosition =
        latitude != null && longitude != null
            ? [latitude, longitude]
            : DEFAULT_LOCATION

    const [position, setPosition] = useState(initialPosition)


    /* =========================
       SYNC EXTERNAL COORDINATES
    ========================= */

    useEffect(() => {

        if (latitude == null || longitude == null) {
            return
        }

        setPosition([latitude, longitude])

    }, [latitude, longitude])


    /* =========================
       HANDLE LOCATION CHANGE
    ========================= */

    const handlePositionChange = (newPosition) => {

        setPosition(newPosition)

        const [lat, lng] = newPosition

        onLocationChange({
            latitude: lat,
            longitude: lng,
        })
    }


    return (
        <div className="issue-location-picker">

            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={true}
                style={{
                    width: '100%',
                    height: '400px',
                }}
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                    position={position}
                />

                <LocationMarker
                    position={position}
                    setPosition={handlePositionChange}
                />

            </MapContainer>

            <div className="location-coordinates">

                <span>
                    Latitude: {position[0].toFixed(6)}
                </span>

                <span>
                    Longitude: {position[1].toFixed(6)}
                </span>

            </div>

        </div>
    )
}

export default IssueLocationPicker