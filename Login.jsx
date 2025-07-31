import { useState } from 'react';
import { login } from '../api/auth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting login form:', form);

    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch {
      setMessage('❌ Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Kisaan<span style={{ color: '#27ae60' }}>Tech</span></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        {message && <p className="text-red-600 text-sm mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
