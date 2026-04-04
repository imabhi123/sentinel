import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/chakra-petch';
import sentinelLogo from '../assets/login/sentinelogo.svg';
import satelliteBackground from '../assets/login/Satelitebackground.svg';
import Loader from '../components/common/Loader';
import LoginLayout from '../components/layout/LoginLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    setIsLoading(true);
    console.log('Google login clicked');
  };

  const handleEmailContinue = () => {
    setIsLoading(true);
    console.log('Email:', email);
  };

  const handleDemoBtnClick = () => {
    navigate('/disaster-management');
  };

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${satelliteBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#0d0d0d',
      }}
    >
      {/* Show loader when loading */}
      {isLoading && <Loader />}

      <LoginLayout>
        {/* CARD */}
        <div className="relative rounded-3xl border border-white/10 p-10 flex flex-col items-center gap-5 shadow-2xl" style={{ background: 'rgba(10, 12, 22, 0.85)', backdropFilter: 'blur(16px)' }}>
          {/* Title */}
          <h1 className="font-chakra text-4xl font-bold text-white text-center">
            SpatialGrid
          </h1>

          {/* Logo */}
          <img
            src={sentinelLogo}
            alt="Sentinel Logo"
            className="w-24 h-24"
          />

          {/* SENTINEL */}
          <h2 className="font-chakra text-2xl font-normal text-white tracking-widest text-center">
            SENTINEL
          </h2>

          {/* Subtitle */}
          <p className="text-gray-400 text-sm text-center">
            Log in or Register with your email.
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white rounded-xl py-3.5 px-5 text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="rgba(255,255,255,0.95)"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="rgba(255,255,255,0.95)"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="rgba(255,255,255,0.95)"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="rgba(255,255,255,0.95)"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3.5">
            <div className="flex-1 h-px bg-white/12" />
            <span className="text-gray-500 text-xs tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/12" />
          </div>

          {/* Email input */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full bg-white/7 border border-white/12 rounded-xl py-3.5 px-5 text-white text-sm placeholder-gray-400 outline-none focus:border-blue-500/70 transition-colors disabled:opacity-60"
          />

          {/* Continue button */}
          <button
            onClick={handleEmailContinue}
            disabled={isLoading || !email}
            className="w-full bg-white/9 hover:bg-white/15 text-white border border-white/12 rounded-xl py-3.5 px-5 text-sm font-semibold transition-all disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading…' : 'Continue'}
          </button>

          {/* Demo Button */}
          <div className="w-full pt-2">
            <button
              onClick={handleDemoBtnClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50 rounded-xl py-3.5 px-5 text-sm font-semibold transition-all"
            >
              🚀 EXPLORE DEMO - Disaster Management
            </button>
          </div>
        </div>
      </LoginLayout>
    </div>
  );
}
