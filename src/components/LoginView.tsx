import React, { useState, useEffect } from 'react';
import { useAppState } from '../lib/StateContext';
import { Shield, Eye, EyeOff, Lock, User, Check, Key } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithUsernamePassword, loginWithGoogle, loginAsDemo, schoolSettings } = useAppState();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockCountdown, setLockCountdown] = useState<number>(0);

  // Check if locked on mount
  useEffect(() => {
    const checkLock = () => {
      const lockUntilStr = localStorage.getItem("sim_login_lock_until");
      if (lockUntilStr) {
        const lockUntil = new Date(lockUntilStr);
        const diff = lockUntil.getTime() - new Date().getTime();
        if (diff > 0) {
          setLockCountdown(Math.ceil(diff / 1000));
        } else {
          localStorage.removeItem("sim_login_lock_until");
          localStorage.setItem("sim_login_failed_attempts", "0");
          setLockCountdown(0);
        }
      }
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Silakan isi username dan password Anda.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginWithUsernamePassword(username, password);
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("sim_remember_me", "true");
          localStorage.setItem("sim_remembered_profile", JSON.stringify({
            uid: "admin-local",
            email: "admin@smpn1rangsang.sch.id",
            displayName: "Administrator SMPN 1 Rangsang",
            photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            role: "admin"
          }));
        } else {
          localStorage.removeItem("sim_remember_me");
          localStorage.removeItem("sim_remembered_profile");
        }
      } else {
        setError(result.message);
        // Refresh lock countdown if it just locked
        const lockUntilStr = localStorage.getItem("sim_login_lock_until");
        if (lockUntilStr) {
          const lockUntil = new Date(lockUntilStr);
          setLockCountdown(Math.ceil((lockUntil.getTime() - new Date().getTime()) / 1000));
        }
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'operator') => {
    loginAsDemo(role);
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="login-screen-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* School Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center">
            {schoolSettings.logoSekolah ? (
              <img 
                src={schoolSettings.logoSekolah} 
                alt="Logo Sekolah" 
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Shield className="w-12 h-12 text-slate-700" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          SIM KESISWAAN
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium font-sans">
          {schoolSettings.namaSekolah || "SMP Negeri 1 Rangsang"}
        </p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px] font-mono shadow-sm">
          Tahun Pelajaran {schoolSettings.tahunPelajaran} — Sem. {schoolSettings.semester}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs text-red-600 leading-relaxed font-medium">
              {error}
            </div>
          )}

          {lockCountdown > 0 ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Akun Terkunci Sementara</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                Anda memasukkan password salah sebanyak 5 kali berturut-turut. Keamanan sistem diaktifkan. Silakan tunggu:
              </p>
              <div className="text-3xl font-bold font-mono text-slate-800 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200 inline-block">
                {formatCountdown(lockCountdown)}
              </div>
            </div>
          ) : (
            <form className="space-y-4 text-xs" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-slate-600 font-semibold mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-medium text-xs"
                    placeholder="Masukkan username (e.g. admin)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-slate-600 font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-slate-400 transition-all font-medium text-xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300 bg-white'}`}>
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-semibold text-slate-500">Ingat Saya</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all cursor-pointer disabled:bg-slate-400"
                >
                  {loading ? 'Memproses Masuk...' : 'Masuk Aplikasi'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs font-medium">
                <span className="px-2 bg-white text-slate-400 uppercase tracking-wider text-[10px]">Atau Gunakan Mode Demo</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 mr-1.5 text-indigo-500" />
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('operator')}
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
              >
                <User className="w-4 h-4 mr-1.5 text-emerald-500" />
                <span>Demo Operator</span>
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                Default Credentials: <strong className="font-semibold text-slate-600">admin</strong> / <strong className="font-semibold text-slate-600">admin</strong>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
