import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-white/20 mb-4">404</div>
        <h1 className="text-4xl font-bold text-white mb-4">Sayfa Bulunamadı</h1>
        <p className="text-white/70 mb-8">Aradığınız sayfa mevcut değil.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-lg border border-white/20 transition-all duration-300"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
