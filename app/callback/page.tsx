'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      return;
    }

    if (code) {
      // Here you would typically exchange the code for an access token
      // For now, we'll just show success
      setStatus('success');
      setMessage('Successfully connected to Spotify!');
      
      // In a real app, you'd handle the token exchange here
      console.log('Authorization code received:', code);
      
      // Redirect to dashboard or home after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } else {
      setStatus('error');
      setMessage('No authorization code received');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <div className="border-b-2 border-dashed border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Unifi</h1>
          <p className="text-gray-600 text-sm uppercase tracking-wider">Authentication Status</p>
        </div>

        <div className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="text-gray-600">Processing your Spotify connection...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-semibold">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you back to the app...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold">{message}</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}