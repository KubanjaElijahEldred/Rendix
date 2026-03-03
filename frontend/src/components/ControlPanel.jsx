import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  User,
  Lock,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Settings,
  Shield
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';

export default function ControlPanel() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const { 
    isAuthenticated, 
    user, 
    login, 
    register, 
    logout, 
    verifyAccount 
  } = useAuthStore();

  const {
    register: registerForm,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm();

  const {
    register: registerRegisterForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
    reset: resetRegister
  } = useForm();

  const watchedPassword = watch('password', '');

  const onLogin = async (data) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      toast.success('Login successful!');
      resetLogin();
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data) => {
    setIsLoading(true);
    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        full_name: data.fullName
      });
      toast.success('Registration successful! Please check your email.');
      setIsLoginMode(true);
      resetRegister();
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify = async () => {
    setIsLoading(true);
    try {
      await verifyAccount();
      setShowVerification(true);
      toast.success('Account verified!');
      setTimeout(() => setShowVerification(false), 3000);
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="glass-morphism p-6 rounded-2xl h-full">
        <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-rendix-blue to-cyan-400 bg-clip-text text-transparent">
          Account
        </h2>
        
        {/* User Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rendix-blue to-cyan-400 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{user.username}</h3>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-glass">
            <div className="flex items-center space-x-2">
              {user.is_verified ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-yellow-500" />
              )}
              <span className="text-sm">
                {user.is_verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            {!user.is_verified && (
              <button
                onClick={onVerify}
                disabled={isLoading}
                className="text-xs px-3 py-1 rounded-full bg-rendix-blue text-white hover:bg-blue-600 transition-colors"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Verify'}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full glass-button p-3 flex items-center justify-center space-x-2">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          <button className="w-full glass-button p-3 flex items-center justify-center space-x-2">
            <Shield size={16} />
            <span>Security</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full glass-button p-3 flex items-center justify-center space-x-2 text-red-400 hover:text-red-300"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Verification Success Animation */}
        <AnimatePresence>
          {showVerification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl"
            >
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto mb-2 text-green-500 animate-pulse" />
                <p className="text-green-400 font-semibold">Verified!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="glass-morphism p-6 rounded-2xl h-full">
      <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-rendix-blue to-cyan-400 bg-clip-text text-transparent">
        {isLoginMode ? 'Login' : 'Register'}
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLoginMode ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLoginMode ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLoginMode ? 20 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoginMode ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerForm('username', { required: 'Username is required' })}
                    type="text"
                    className="w-full pl-10 pr-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                    placeholder="Enter username"
                  />
                </div>
                {loginErrors.username && (
                  <p className="text-xs text-red-400 mt-1">{loginErrors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerForm('password', { required: 'Password is required' })}
                    type="password"
                    className="w-full pl-10 pr-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                    placeholder="Enter password"
                  />
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-red-400 mt-1">{loginErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full glass-button p-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-rendix-blue to-cyan-500"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerRegisterForm('username', { required: 'Username is required' })}
                    type="text"
                    className="w-full pl-10 pr-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                    placeholder="Choose username"
                  />
                </div>
                {registerErrors.username && (
                  <p className="text-xs text-red-400 mt-1">{registerErrors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerRegisterForm('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                    placeholder="Enter email"
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-xs text-red-400 mt-1">{registerErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  {...registerRegisterForm('fullName')}
                  type="text"
                  className="w-full px-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerRegisterForm('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
                        message: 'Password must contain uppercase, lowercase, digit, and special character'
                      }
                    })}
                    type="password"
                    className="w-full pl-10 pr-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                    placeholder="Create password"
                  />
                </div>
                {registerErrors.password && (
                  <p className="text-xs text-red-400 mt-1">{registerErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerRegisterForm('confirmPassword', { 
                      required: 'Please confirm password',
                      validate: value => value === watchedPassword || 'Passwords do not match'
                    })}
                    type="password"
                    className="w-full pl-10 pr-3 py-2 bg-glass border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rendix-blue"
                    placeholder="Confirm password"
                  />
                </div>
                {registerErrors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{registerErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full glass-button p-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-rendix-blue to-cyan-500"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <User size={16} />
                    <span>Register</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Toggle between login/register */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="text-sm text-rendix-blue hover:text-cyan-400 transition-colors"
        >
          {isLoginMode ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
