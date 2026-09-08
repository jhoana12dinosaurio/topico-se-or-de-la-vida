import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (!username.trim() || !password.trim()) {
        setError('Por favor completa todos los campos');
        setIsLoading(false);
        return;
      }

      const success = login(username, password);
      
      if (!success) {
        setError('Usuario o contraseña incorrectos');
        setPassword('');
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed] bg-grid-lines flex items-center justify-center p-4 relative overflow-hidden">
      {/* Círculos y líneas decorativas de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ede4d4]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#dfd2be]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-diagonal-lines opacity-40 pointer-events-none" />

      {/* Card de Login */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-[#fbf9f5]/90 backdrop-blur-md rounded-3xl border border-[#e8ded0] shadow-[0_12px_40px_-10px_rgba(92,75,56,0.15)] p-8 sm:p-10 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ede4d4] text-[#8c6b44] rounded-2xl mb-4 border border-[#dfd2be] shadow-inner transition-transform duration-300 hover:scale-105">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-[#3d3124] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Tópico Escolar
            </h1>
            <p className="text-[#806f5e] text-sm mt-1 font-medium">Colegio Señor de la Vida</p>
            <div className="w-12 h-1 bg-[#b59e80] mx-auto mt-3 rounded-full opacity-60"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-[#635343] uppercase tracking-wider mb-2">
                Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder="admin1 o admin2"
                  className="w-full px-4 py-3 bg-white border border-[#e2d6c3] rounded-xl text-[#3d3124] placeholder-[#ab9a87] focus:ring-2 focus:ring-[#9c8365] focus:border-[#9c8365] outline-none transition-all duration-200 disabled:bg-[#ede4d4] disabled:cursor-not-allowed text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-[#635343] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-[#e2d6c3] rounded-xl text-[#3d3124] placeholder-[#ab9a87] focus:ring-2 focus:ring-[#9c8365] focus:border-[#9c8365] outline-none transition-all duration-200 disabled:bg-[#ede4d4] disabled:cursor-not-allowed text-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-[#fae8e5] border border-[#f1b8af] rounded-xl animate-fade-in">
                <p className="text-xs text-[#a33827] font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#5c4b38] hover:bg-[#4a3b2b] active:scale-[0.99] disabled:bg-[#b59e80] text-[#fbf9f5] font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm tracking-wide"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#fbf9f5]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-8 pt-5 border-t border-[#ede4d4]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#806f5e] uppercase tracking-wider">Accesos de administrador:</span>
              <span className="text-[10px] bg-[#ede4d4] text-[#635343] px-2 py-0.5 rounded-full font-bold">DEMO</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#f5f0e8] p-2.5 rounded-xl border border-[#e5dac9] hover:border-[#cbbaa2] transition-colors">
                <p className="font-bold text-[#3d3124]">Admin 1</p>
                <p className="text-[#6e5d4d] text-[11px] font-mono mt-0.5">admin1 / admin123</p>
              </div>
              <div className="bg-[#f5f0e8] p-2.5 rounded-xl border border-[#e5dac9] hover:border-[#cbbaa2] transition-colors">
                <p className="font-bold text-[#3d3124]">Admin 2</p>
                <p className="text-[#6e5d4d] text-[11px] font-mono mt-0.5">admin2 / admin456</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#8a7967] text-xs mt-6 font-medium">
          © 2026 Sistema de Gestión Educativa · Tópico Escolar
        </p>
      </div>
    </div>
  );
};
