import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { UserRole } from '../types';

export const AdminAuth: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { signUpUser, loginUser } = useApp();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  
  // Sign Up State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [passcode, setPasscode] = useState('');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');

  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Valid email is required.');
      return;
    }

    const res = signUpUser({
      name,
      email,
      teamNumber: teamNumber || 'FTC Team',
      role: 'contributor',
      hardwareSpecialty: 'Hardware',
      passcode,
    });

    if (res.success) {
      setSuccessMsg(res.message);
      if (onSuccess) setTimeout(onSuccess, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Email is required.');
      return;
    }

    const res = loginUser(loginEmail, loginPasscode);
    if (res.success) {
      setSuccessMsg(res.message);
      if (onSuccess) setTimeout(onSuccess, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit'] text-white">
                Member Portal
              </h2>
              <p className="text-xs text-slate-400">Contributor & Admin Access</p>
            </div>
          </div>

          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                authMode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                authMode === 'signin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feedback */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {authMode === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@team.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  FTC Team #
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11115"
                  value={teamNumber}
                  onChange={(e) => setTeamNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Access Key <span className="text-slate-500">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Key"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@team.org"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Passcode
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
