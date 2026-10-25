import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('both');
  const { login } = useAuth();

  const renderLabel = (en, am) => {
    if (language === 'english') return en;
    if (language === 'amharic') return am;
    return `${am} / ${en}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(renderLabel('Please enter username and password', 'እባክዎ የተጠቃሚ ስምና የይለፍ ቃል ያስገቡ'));
      return;
    }

    const result = login(username, password);
    if (!result.success) {
      setError(renderLabel('Invalid username or password', 'ልክ ያልሆነ የተጠቃሚ ስም ወይም የይለፍ ቃል'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'both' ? 'english' : language === 'english' ? 'amharic' : 'both')}
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium shadow-sm"
          >
            {language === 'both' ? 'አማ/Eng' : language === 'english' ? 'English' : 'አማርኛ'}
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {renderLabel('Vehicle Accounting', 'የተሽከርካሪ የሂሳብ')}
            </h1>
            <p className="text-gray-600">
              {renderLabel('Dashboard Login', 'ዳሽቦርድ መግቢያ')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {renderLabel('Username', 'የተጠቃሚ ስም')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={renderLabel('Enter username', 'የተጠቃሚ ስም ያስገቡ')}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {renderLabel('Password', 'የይለፍ ቃል')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={renderLabel('Enter password', 'የይለፍ ቃል ያስገቡ')}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {renderLabel('Sign In', 'ግባ')}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              {renderLabel('Demo Credentials:', 'የምስክር መረጃ:')}
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Kes Yeshalem:</strong> kesyeshalem / kes123</p>
              <p><strong>Smeneh:</strong> smeneh / smeneh123</p>
              <p><strong>Amsalu:</strong> amsalu / amsalu123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {renderLabel(
            'Secure Role-Based Access Control System',
            'ደህንነቱ የተጠበቀ የሚና-ተኮር የመዳረሻ መቆጣጠሪያ ስርዓት'
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
