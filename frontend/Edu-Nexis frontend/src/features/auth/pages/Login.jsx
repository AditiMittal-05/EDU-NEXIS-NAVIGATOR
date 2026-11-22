import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PYTHON_API_BASE = import.meta.env.VITE_PYTHON_API_BASE || "http://127.0.0.1:8000";


export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from?.pathname || '/';

  // Resolve lazy initializer cleanly on mount
  const [username, setUsername] = useState(
    () => localStorage.getItem('remembered_username') || ''
  );
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(
    () => Boolean(localStorage.getItem('remembered_username'))
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${PYTHON_API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Invalid credentials. Please try again.');
      }

      // Persist JWT token and user identity (no duplicate :8080 call)
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      if (rememberMe) {
        localStorage.setItem('remembered_username', data.username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      setSuccessMessage(`Welcome back, ${data.username}! Redirecting...`);
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 800);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* Official Jurisdiction Top Masthead Ribbon */}
      <aside aria-label="Official government portal notice" className="bg-[#EFEEEA] border-b border-slate-200/80 py-1.5 px-4 sm:px-6 lg:px-12 text-slate-600 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-medium tracking-wide">
              An Official National Education Portal • Secure Citizen Registry
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-default">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Standard 256-Bit SSL
            </span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">
              English (US)
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

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 hidden sm:inline">New to Edu-Nexis?</span>
            <Link
              to="/register"
              className="text-slate-900 font-semibold hover:text-teal-700 underline underline-offset-4 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10 transition-all">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold tracking-wide mb-3">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Citizen Gateway
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Sign In
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Access your personalized AI career roadmap, academic records, and verified opportunity matches.
              </p>
            </div>

            {errorMessage && (
              <div role="alert" className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div role="status" className="mb-6 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
                <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Field 1: Username */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="username" className="text-sm font-semibold text-slate-800">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">Citizen ID / Handle</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your registered username"
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <a href="#forgot-password" className="text-xs text-teal-700 font-medium hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Keep Session Active Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-teal-600 accent-teal-700 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">
                    Remember my username on this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm rounded-lg shadow-xs hover:shadow-sm transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Register Alternative */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don&apos;t have an Edu-Nexis account yet?{' '}
                  <Link
                    to="/register"
                    className="text-teal-700 font-semibold hover:text-teal-800 hover:underline inline-flex items-center gap-0.5"
                  >
                    Create Citizen Account
                  </Link>
                </p>
              </div>
            </form>

            {/* Official Security Signifier */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-teal-800 font-medium">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                JWT Bearer Token Authentication
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>National Education Standards Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Official Agency Footer */}
      <footer className="bg-[#F5F4F0] border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-12 text-slate-500 text-xs mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-semibold text-slate-800">
              Edu-Nexis Navigator
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>
              © {new Date().getFullYear()} Department of National Education Services. All rights reserved.
            </span>
          </div>

          <nav aria-label="Footer legal and support links" className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
            <a href="#privacy" className="hover:text-slate-800 hover:underline transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-800 hover:underline transition-colors">Terms of Governance</a>
            <a href="#accessibility" className="hover:text-slate-800 hover:underline transition-colors">Accessibility Standards</a>
            <a href="#security" className="hover:text-slate-800 hover:underline transition-colors">Security Compliance</a>
            <a href="#registry" className="text-teal-700 font-medium hover:underline">Public Registry</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}