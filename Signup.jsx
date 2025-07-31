// src/pages/Signup.jsx
import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import citiesCSV from '../data/pakistan_cities.csv?raw';
import { signup } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: '', 
    phone: ''
  });
  const [allCities, setAllCities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // 1) Parse CSV once
  useEffect(() => {
    Papa.parse(citiesCSV, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // assume your CSV has a "city" column
        const list = results.data
          .map(row => row.city.trim())
          .sort();
        setAllCities(list);
      }
    });
  }, []);

  // 2) Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 3) Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setMessage('');

    if (name === 'city') {
      if (value) {
        const matches = allCities
          .filter(c => c.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 10);
        setFiltered(matches);
        setShowList(true);
      } else {
        setFiltered([]);
        setShowList(false);
      }
    }
  };

  // 4) When user picks a city from list
  const selectCity = (city) => {
    setForm(f => ({ ...f, city }));
    setShowList(false);
  };

  // 5) Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.city) {
      return setMessage('❌ Please select your city.');
    }
    try {
      await signup(form);
      setMessage('✅ Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.msg || '❌ Signup failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-blue-50 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full relative" ref={wrapperRef}>
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" name="name" placeholder="Full Name"
            value={form.name} onChange={handleChange}
            className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="email" name="email" placeholder="Email Address"
            value={form.email} onChange={handleChange}
            className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="tel" name="phone" placeholder="92300XXXXXXX"
            value={form.phone} onChange={handleChange}
            className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          {/* Searchable City Input */}
          <div className="relative">
            <input
              type="text" name="city" placeholder="Start typing your city..."
              value={form.city} onChange={handleChange}
              className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              autoComplete="off"
            />
            {showList && filtered.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md max-h-48 overflow-y-auto mt-1">
                {filtered.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => selectCity(c)}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}