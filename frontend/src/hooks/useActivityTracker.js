import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const useActivityTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.includes('admin')) {
      return;
    }

    const sessionId = localStorage.getItem('sessionId');
    
    if (!sessionId) return;

    const trackActivity = async () => {
      try {
        await axios.post(`${API}/api/track-activity`, {
          session_id: sessionId,
          page: location.pathname
        });
      } catch (error) {
        console.debug('Activity tracking failed:', error);
      }
    };

    const trackExit = async () => {
      try {
        await axios.post(`${API}/api/track-exit`, {
          session_id: sessionId
        });
      } catch (error) {
        console.debug('Exit tracking failed:', error);
      }
    };

    // Track immediately
    trackActivity();

    // Track every 10 seconds while on the page
    const interval = setInterval(trackActivity, 10000);

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      trackExit();
    };

    // Track when user switches tabs or minimizes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackExit();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);
};
