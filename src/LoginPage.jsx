import React, { useState } from 'react';
import { LogIn, Shield, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a slight delay for better UX
    setTimeout(() => {
      const result = login(username, password);
      
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
      }
    }, 500);
  };

  // Quick login buttons for demo
  const quickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Shield className="text-indigo-600" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Vehicle Accounting
          </h1>
          <p className="text-indigo-100 text-lg">
            የተሽከርካሪ የሂሳብ ስርዓት
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              እንኳን በደህና መጡ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-semibold">Login Failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username / የተጠቃሚ ስም
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password / የይለፍ ቃል
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Login / ይግቡ</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Quick Login (Demo)
              </span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center mb-3">
              Click to auto-fill credentials:
            </p>
            
            <button
              type="button"
              onClick={() => quickLogin('admin', 'admin123')}
              className="w-full px-4 py-3 bg-green-50 border-2 border-green-200 text-green-800 rounded-lg hover:bg-green-100 transition-all font-semibold flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <Shield className="text-green-700" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Administrator</p>
                  <p className="text-xs text-green-600">Full Access</p>
                </div>
              </div>
              <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('kesyeshalem', 'kes123')}
              className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 text-blue-800 rounded-lg hover:bg-blue-100 transition-all font-semibold flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <User className="text-blue-700" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Kes Yeshalem</p>
                  <p className="text-xs text-blue-600">Shareholder (Read-Only)</p>
                </div>
              </div>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('smeneh', 'smeneh123')}
              className="w-full px-4 py-3 bg-purple-50 border-2 border-purple-200 text-purple-800 rounded-lg hover:bg-purple-100 transition-all font-semibold flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <User className="text-purple-700" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Smeneh</p>
                  <p className="text-xs text-purple-600">Shareholder (Read-Only)</p>
                </div>
              </div>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('amsalu', 'amsalu123')}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-200 text-orange-800 rounded-lg hover:bg-orange-100 transition-all font-semibold flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                  <User className="text-orange-700" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Amsalu</p>
                  <p className="text-xs text-orange-600">Shareholder (Read-Only)</p>
                </div>
              </div>
              <span className="text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-indigo-100 text-sm">
            © 2026 Vehicle Accounting Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
