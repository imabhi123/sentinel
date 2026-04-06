import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/chakra-petch';
import spatialGridLogo from '../assets/login/SpatialGrid.png';
import sentinelLogo from '../assets/login/sentinel.png';
import satelliteBackground from '../assets/login/Satelitebackground.svg';
import Grid from '../assets/login/Grid.png';
import Loader from '../components/common/Loader';
import LoginLayout from '../components/layout/LoginLayout';
import { login, signup } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (isSignup) {
        await signup(email, password, name);
        setIsSignup(false);
        setError('Signup successful! Please login.');
      } else {
        await login(email, password);
        navigate('/disaster-management');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = () => {
    navigate('/disaster-management');
  };

  return (
    <div
      className="relative w-screen h-screen"
      style={{
        backgroundColor: '#0d0d0d',
      }}
    >
      {/* Satellite Background Image */}
      <div
        className="absolute pointer-events-none"
        style={{
          backgroundImage: `url(${satelliteBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '1599.94px',
          height: '1066.63px',
          top: '27.95px',
          left: '85.36px',
          opacity: 1,
        }}
      />

      {/* Grid Overlay */}
      <div
        className="absolute pointer-events-none"
        style={{
          backgroundImage: `url(${Grid})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '1600px',
          height: '900px',
          top: '40.95px',
          left: '100px',
          opacity: 1,
        }}
      />

      {/* Show loader when loading */}
      {isLoading && <Loader />}

      <LoginLayout>
        {/* CARD */}
        <div
          className="relative rounded-2xl border border-white/10 p-10 flex flex-col items-center gap-4 shadow-2xl"
          style={{
            background: 'rgba(10, 12, 22, 0.95)',
            backdropFilter: 'blur(16px)',
            width: '420px'
          }}
        >
          {/* Title */}
          <img src={spatialGridLogo} alt="SpatialGrid" className="w-36 h-auto" />

          {/* Logo */}
          <img src={sentinelLogo} alt="Sentinel" className="w-28 h-auto" />

          {/* Subtitle */}
          <p className="text-[11px] text-gray-400 text-center">
            {isSignup ? 'Register your account' : 'Log in to your account'}
          </p>

          {error && <p className="text-red-500 text-[12px] text-center">{error}</p>}

          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-9 bg-white/10 border border-white/10 rounded-sm text-center text-[14px] text-white placeholder:text-gray-400 outline-none focus:border-blue-500/70 transition"
            />
          )}

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-9 bg-white/10 border border-white/10 rounded-sm text-center text-[14px] text-white placeholder:text-gray-400 outline-none focus:border-blue-500/70 transition disabled:opacity-60"
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full h-9 bg-white/10 border border-white/10 rounded-sm text-center text-[14px] text-white placeholder:text-gray-400 outline-none focus:border-blue-500/70 transition disabled:opacity-60"
          />

          <button
            onClick={handleAuth}
            disabled={isLoading || !email || !password || (isSignup && !name)}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[14px] font-medium flex items-center justify-center transition disabled:opacity-40"
          >
            {isLoading ? 'Loading…' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>

          <p className="text-[11px] text-gray-400 text-center cursor-pointer hover:text-white" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Already have an account? Log in' : 'Don\'t have an account? Sign up'}
          </p>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-gray-500 tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleDemoClick}
            className="w-full h-9 bg-white/10 hover:bg-white/20 text-white rounded-sm text-[14px] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            🚀 Demo - Disaster Management
          </button>
        </div>
      </LoginLayout>
    </div>
  );
}