import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export async function trackVisitor(pageName = "unknown") {
  try {
    let visitorId = localStorage.getItem("visitorId");

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitorId", visitorId);
    }

    await axios.post(`${API}/track-visit`, {
      visitor_id: visitorId,
      page: pageName,
      path: window.location.pathname,
      referrer: document.referrer || "",
      user_agent: navigator.userAgent,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    console.error("Visitor tracking failed:", error);
  }
}
