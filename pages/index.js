import { useState } from 'react';
import PRDCreator from '../components/prdcreator';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-white/50 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">PRD Creator Access</h1>
            <p className="text-gray-600">Enter password to access the company PRD creator</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                disabled={loading}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access PRD Creator'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 z-50 px-3 py-1 text-sm bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-md border border-gray-200 transition-all"
      >
        Logout
      </button>
      <PRDCreator />
    </div>
  );
}
