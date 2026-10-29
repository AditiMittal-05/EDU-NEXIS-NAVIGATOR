import { useState } from 'react';
import { useAuth } from '../hook/useAuth';

export default function Register() {
  const { handleRegister } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password requirement checks
  const passwordCriteria = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: 'Upper & lowercase letters', valid: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
    { label: 'At least 1 number', valid: /\d/.test(formData.password) },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('Please accept the Data Governance and Privacy Terms to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await handleRegister({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccessMessage('Registration successful! Redirecting to dashboard...');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to complete registration. Please try again.';
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
          {/* Logo & Entity Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-xs">
              {/* Government Academic Emblem SVG */}
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

          {/* Quick Sign-In Link */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 hidden sm:inline">Already have an account?</span>
            <a
              href="/login"
              className="text-slate-900 font-semibold hover:text-teal-700 underline underline-offset-4 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-lg">
          {/* Card Container */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10 transition-all">
            {/* Card Header & Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold tracking-wide mb-3">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Accredited Citizen Registration
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Create Account
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Enter your credentials to access verified educational records, curricula, and institutional portals.
              </p>
            </div>

            {/* Error / Success Feedback */}
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Field 1: Username */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="username" className="text-sm font-semibold text-slate-800">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">Public handle</span>
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
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. j.citizen.academic"
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition"
                  />
                </div>
                <p className="text-xs text-slate-500 pl-0.5">
                  Unique handle or ID verified across state and educational registers.
                </p>
              </div>

              {/* Field 2: Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-teal-700 font-medium">Primary Contact</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@institution.gov or personal email"
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">Min. 8 characters</span>
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
                    value={formData.password}
                    onChange={handleChange}
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

                {/* Password Criteria Checklist */}
                {formData.password.length > 0 && (
                  <div className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-2.5 rounded-lg bg-[#F8F7F3] border border-slate-200/70 text-xs">
                      {passwordCriteria.map((criterion, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 ${
                            criterion.valid ? 'text-teal-700 font-medium' : 'text-slate-400'
                          }`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 shrink-0 ${criterion.valid ? 'text-teal-600' : 'text-slate-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{criterion.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-teal-600 accent-teal-700 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="#terms" className="text-teal-700 hover:text-teal-800 underline font-medium">
                      National Educational Data Governance &amp; Privacy Terms
                    </a>{' '}
                    and certify that all registration information is accurate.
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
                      <span>Processing Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Sign-In Alternative */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already registered with Edu-Nexis?{' '}
                  <a
                    href="/login"
                    className="text-teal-700 font-semibold hover:text-teal-800 hover:underline inline-flex items-center gap-0.5"
                  >
                    Sign in to your account
                    <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </p>
              </div>
            </form>

            {/* Official Security Signifier */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-teal-800 font-medium">
                <svg className="w-3.5 h-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Protected by 256-bit Civic Encryption
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>National Education Standards Compliant</span>
            </div>
          </div>

          {/* Institutional Help Callout */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Need administrative or university faculty access?</span>
              <a href="#institutional-support" className="text-slate-800 font-semibold hover:text-teal-700 underline">
                Request Institutional Tier
              </a>
            </p>
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
