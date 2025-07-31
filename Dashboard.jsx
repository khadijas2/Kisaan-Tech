// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import citiesCSV from '../data/pakistan_cities.csv?raw'
import { getProfile } from '../api/auth'
import { getWeather, getMandiRates, getForecast } from '../api/info'
import { useAlerts } from '../hooks/useAlerts'

export default function Dashboard() {
    // ← pull in real-time alerts
    const alerts = useAlerts()

    // ─── State ─────────────────────────────────────────────────────────
    const [profile, setProfile] = useState(null)
    const [selectedCity, setSelectedCity] = useState('')
    const [allCities, setAllCities] = useState([])
    const [filtered, setFiltered] = useState([])
    const [showList, setShowList] = useState(false)

    const [weather, setWeather] = useState(null)
    const [forecast, setForecast] = useState(null)
    const [rates, setRates] = useState([])
    const [loading, setLoading] = useState({ w: false, r: false, p: true })
    const [error, setError] = useState('')

    const typingTimeout = useRef(null)
    const wrapperRef = useRef(null)

    // ─── 1) load Pakistan cities ─────────────────────────────────────────
    useEffect(() => {
        Papa.parse(citiesCSV, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data }) => {
                const list = data
                    .filter(r => r.country.trim().toLowerCase() === 'pakistan')
                    .map(r => r.city.trim())
                    .sort()
                setAllCities(list)
            }
        })
    }, [])

    // ─── 2) fetch profile & seed city ───────────────────────────────────
    useEffect(() => {
        getProfile()
            .then(res => {
                const city = res.data.user.city || ''
                setProfile(res.data.user)
                setSelectedCity(city)
            })
            .catch(() => setError('Failed to load profile'))
            .finally(() => setLoading(l => ({ ...l, p: false })))
    }, [])

    // ─── 3) whenever city changes, refetch all APIs ─────────────────────
    useEffect(() => {
        if (!selectedCity) return

        setLoading(l => ({ ...l, w: true }))
        getWeather(selectedCity)
            .then(r => { setWeather(r.data.current); setError('') })
            .catch(() => setError('Weather load failed'))
            .finally(() => setLoading(l => ({ ...l, w: false })))

        setLoading(l => ({ ...l, r: true }))
        getMandiRates(selectedCity)
            .then(r => { setRates(r.data.data); setError('') })
            .catch(() => setError('Mandi rates load failed'))
            .finally(() => setLoading(l => ({ ...l, r: false })))

        getForecast(selectedCity)
            .then(r => { setForecast(r.data); setError('') })
            .catch(() => setError('Forecast load failed'))
    }, [selectedCity])

    // ─── 4) city search + debounce ───────────────────────────────────────
    const handleCityType = e => {
        const v = e.target.value
        setError('')
        if (!v) {
            setFiltered([])
            setShowList(false)
        } else {
            setFiltered(
                allCities
                    .filter(c => c.toLowerCase().includes(v.toLowerCase()))
                    .slice(0, 10)
            )
            setShowList(true)
        }
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => {
            setSelectedCity(v.trim())
            setShowList(false)
        }, 1000)
    }
    const selectCity = c => {
        clearTimeout(typingTimeout.current)
        setSelectedCity(c)
        setShowList(false)
    }

    // ─── 5) click outside to close list ─────────────────────────────────
    useEffect(() => {
        const handleClickOutside = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowList(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="p-6">
            {error && (
                <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            {/* City selector */}
            <div ref={wrapperRef} className="max-w-md mx-auto mb-6 relative">
                <label className="block text-gray-600 mb-1">Select City</label>
                <input
                    type="text"
                    defaultValue={selectedCity}
                    onChange={handleCityType}
                    placeholder="Type to search..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
                />
                {showList && filtered.length > 0 && (
                    <ul className="absolute bg-white border rounded mt-1 w-full max-h-44 overflow-y-auto shadow-lg z-20">
                        {filtered.map((c, i) => (
                            <li
                                key={i}
                                onClick={() => selectCity(c)}
                                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                            >
                                {c}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Main panels */}
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                {/* ─── Weather + All Alerts ────────────────────────────────────────── */}
                <div className="bg-white shadow rounded-lg p-6 w-full md:w-1/3 space-y-6">
                    <h3 className="text-xl font-semibold">Weather in {selectedCity}</h3>

                    {loading.w ? (
                        <p>Loading weather…</p>
                    ) : weather ? (
                        <div className="flex items-center space-x-4">
                            <img
                                src={weather.condition.icon}
                                alt={weather.condition.text}
                                className="w-16 h-16"
                            />
                            <div>
                                <p className="text-4xl font-bold">{weather.temp_c}°C</p>
                                <p className="text-gray-600">{weather.condition.text}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No weather data</p>
                    )}

                    {/* Static Forecast-API alerts */}
                    {forecast?.alerts?.alert?.length > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded space-y-2">
                            <h4 className="font-semibold text-yellow-800">Weather Alerts</h4>
                            {forecast.alerts.alert.map((a, i) => (
                                <div key={i} className="text-sm text-yellow-700">
                                    <p className="font-medium">{a.headline}</p>
                                    <p>{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 7-Day Forecast */}
                    {forecast?.forecast?.forecastday && (
                        <div>
                            <h4 className="font-semibold mb-2">7-Day Forecast</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {forecast.forecast.forecastday.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center bg-indigo-50 rounded-lg p-2"
                                    >
                                        <p className="text-xs font-medium mb-1">
                                            {new Date(d.date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                        <img
                                            src={d.day.condition.icon}
                                            alt={d.day.condition.text}
                                            className="w-10 h-10 mb-1"
                                        />
                                        <p className="text-sm font-semibold text-indigo-700">
                                            {d.day.maxtemp_c.toFixed(0)}° /{' '}
                                            {d.day.mintemp_c.toFixed(0)}°
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Real-time Live Alerts */}
                    <div>
                        <h4 className="text-lg font-semibold">Live Weather Alerts</h4>
                        {alerts.length > 0 ? (
                            alerts.map((a, i) => (
                                <div
                                    key={i}
                                    className="bg-red-50 border-l-4 border-red-400 p-3 rounded mb-2"
                                >
                                    <p className="font-medium text-red-700">{a.event}</p>
                                    <p className="text-sm text-gray-700">{a.headline}</p>
                                    <p className="text-xs text-gray-500">
                                        Expires: {a.expires}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No alerts</p>
                        )}
                    </div>
                </div>

                {/* ─── Mandi Rates ────────────────────────────────────────────────── */}
                <div className="flex-1 bg-white shadow rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 text-center">
                        Mandi Rates in {selectedCity}
                    </h3>
                    {loading.r ? (
                        <p className="text-center">Loading rates…</p>
                    ) : rates.length ? (
                        <div className="overflow-y-auto max-h-[600px]">
                            <table className="min-w-full text-sm divide-y divide-gray-200">
                                <thead className="bg-indigo-50 sticky top-0">
                                    <tr>
                                        {['Item', 'Min Price', 'Max Price', 'Retail Price', 'Unit'].map(h => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left font-medium text-indigo-700 uppercase tracking-wider"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rates.map((r, i) => (
                                        <tr key={i} className="hover:bg-indigo-50 transition-colors">
                                            <td className="px-4 py-2">{r.item}</td>
                                            <td className="px-4 py-2">{r.min_price}</td>
                                            <td className="px-4 py-2">{r.max_price}</td>
                                            <td className="px-4 py-2">{r.retail_price}</td>
                                            <td className="px-4 py-2">{r.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center">No mandi rates found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
