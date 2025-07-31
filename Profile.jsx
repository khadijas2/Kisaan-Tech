// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    city: '',
    phone: '',                    // <-- phone always string
    alertsEnabled: false,         // <-- checkbox always boolean
    alertTypes: {                 // <-- object always defined
      floods: false,
      weather: false,
      pests: false
    }
  });
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // ─── fetch + merge defaults ────────────────────────────────────────
  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(p => ({
          ...p,
          ...res.data.user,
          alertTypes: {
            floods: !!res.data.user.alertTypes?.floods,
            weather: !!res.data.user.alertTypes?.weather,
            pests: !!res.data.user.alertTypes?.pests
          }
        }));
      })
      .catch(() => setMsg('❌ Could not load profile.'));
  }, []);

  // ─── simple controlled change for text inputs ──────────────────────
  const onProfileChange = e => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
    setMsg('');
  };

  // ─── submit name, phone, city, alerts → backend ────────────────────
  const onProfileSubmit = async e => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        alertsEnabled: profile.alertsEnabled,
        alertTypes: profile.alertTypes
      });
      setMsg('✅ Profile updated!');
    } catch {
      setMsg('❌ Update failed.');
    }
  };

  // ─── password change handlers ─────────────────────────────────────
  const onPwdChange = e => {
    const { name, value } = e.target;
    setPwdForm(f => ({ ...f, [name]: value }));
    setPwdMsg('');
  };
  const onPwdSubmit = async e => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = pwdForm;
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      return setPwdMsg('❌ Check your passwords.');
    }
    try {
      await changePassword({ oldPassword: currentPassword, newPassword });
      setPwdMsg('✅ Password updated!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg(err.response?.data?.msg || '❌ Password update failed.');
    }
  };

  // ─── logout ────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full space-y-6">

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <button onClick={logout} className="text-red-500 hover:text-red-600">
            Logout
          </button>
        </div>

        {msg && (
          <p className={`text-center ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {msg}
          </p>
        )}

        <form onSubmit={onProfileSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-gray-600 mb-1">Full Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={onProfileChange}
              required
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={onProfileChange}
              placeholder="+92300XXXXXXX"
              required
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Alerts toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="alertsEnabled"
              checked={profile.alertsEnabled}
              onChange={e =>
                setProfile(p => ({ ...p, alertsEnabled: e.target.checked }))
              }
              id="alertsEnabled"
            />
            <label htmlFor="alertsEnabled" className="text-gray-700">
              Enable SMS & in-app alerts
            </label>
          </div>

          {/* Alert Types */}
          {profile.alertsEnabled && (
            <div className="space-x-4 mt-2">
              {['floods', 'weather', 'pests'].map(type => (
                <span key={type} className="inline-flex items-center space-x-1">
                  <input
                    type="checkbox"
                    name={type}
                    checked={profile.alertTypes[type]}
                    onChange={e =>
                      setProfile(p => ({
                        ...p,
                        alertTypes: {
                          ...p.alertTypes,
                          [type]: e.target.checked
                        }
                      }))
                    }
                    id={type}
                  />
                  <label htmlFor={type} className="capitalize text-gray-700">
                    {type}
                  </label>
                </span>
              ))}
            </div>
          )}

          {/* City */}
          <div>
            <label className="block text-gray-600 mb-1">City</label>
            <input
              name="city"
              value={profile.city}
              onChange={onProfileChange}
              required
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Save Profile
          </button>
        </form>

        {/* Password Section */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Change Password</h3>
          <form onSubmit={onPwdSubmit} className="space-y-4">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={pwdForm.currentPassword}
              onChange={onPwdChange}
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={pwdForm.newPassword}
              onChange={onPwdChange}
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={pwdForm.confirmPassword}
              onChange={onPwdChange}
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
            >
              Update Password
            </button>
            {pwdMsg && (
              <p className={`text-center mt-2 ${pwdMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {pwdMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
