import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

const PYTHON_API_BASE = 'http://127.0.0.1:8000';

export default function Logout() {
  const { handleLogout, setUser } = useAuth() || {};
  const navigate = useNavigate();
  const hasCalledLogout = useRef(false);

  const [signedOutUser] = useState(
    () => localStorage.getItem('username') || 'Citizen'
  );
  const [statusMessage, setStatusMessage] = useState('Revoking session token...');

  useEffect(() => {
    // Prevent duplicate calls in React 19 StrictMode
    if (hasCalledLogout.current) return;
    hasCalledLogout.current = true;

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || '';

    (async () => {
      try {
        if (token) {
          const res = await fetch(`${PYTHON_API_BASE}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'X-Username': username,
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const data = await res.json();
            setStatusMessage(data.message || 'Logged out successfully');
          } else {
            setStatusMessage('Session closed locally.');
          }
        } else {
          setStatusMessage('No active token found. Session closed.');
        }
      } catch {
        setStatusMessage('Logged out locally.');
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        if (typeof handleLogout === 'function') {
          handleLogout();
        } else if (typeof setUser === 'function') {
          setUser(null);
        }
      }
    })();
  }, [handleLogout, setUser]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* Official Jurisdiction Top Masthead Ribbon */}
      <aside aria-label="Official government portal notice" className="bg-[#EFEEEA] border-b border-slate-200/80 py-1.5 px-4 sm:px-6 lg:px-12 text-slate-600 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-medium tracking-wide">
              An Official National Education Portal • Secure Session Terminated
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Standard 256-Bit SSL
            </span>
          </div>
        </div>
      </aside>

      {/* Main Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-xs">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <circle cx="50" cy="50" r="46" stroke="#0F172A" strokeWidth="2.5" fill="#F8FAFC" />
                <circle cx="50" cy="50" r="41" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M50 20 L78 33 L50 46 L22 33 Z" fill="#0F172A" />
                <path d="M30 40 V56 C30 65 50 74 50 74 C50 74 70 65 70 56 V40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M50 46 V74" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="50" cy="33" r="3.2" fill="#0D9488" />
                <path d="M38 52 C44 56 56 56 62 52" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Edu-Nexis Navigator
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                Department of National Education Services
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="text-sm text-slate-900 font-semibold hover:text-teal-700 underline underline-offset-4 transition-colors"
          >
            Sign In Again
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold tracking-wide mb-3">
              {statusMessage}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              You Have Been Signed Out
            </h1>

            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              Thank you, <span className="font-semibold text-slate-700">{signedOutUser}</span>. Your JWT access token has been invalidated on the server and cleared from this browser.
            </p>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Sign In Again
              </button>

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-300 transition-all cursor-pointer"
              >
                Create Another Account
              </button>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 text-xs text-slate-400">
              For shared devices, close all browser tabs to ensure complete session isolation.
            </div>
          </div>
        </div>
      </main>

      {/* Official Agency Footer */}
      <footer className="bg-[#F5F4F0] border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-12 text-slate-500 text-xs mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="font-semibold text-slate-800">Edu-Nexis Navigator</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>© {new Date().getFullYear()} Department of National Education Services.</span>
          </div>
          <div className="flex gap-5">
            <a href="#privacy" className="hover:text-slate-800 hover:underline">Privacy Policy</a>
            <a href="#security" className="hover:text-slate-800 hover:underline">Security Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}