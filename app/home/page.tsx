'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [user, setUser] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // In a real app, you would clear tokens from storage
    window.location.href = '/login';
  };

  const handleGoToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Unifi</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user}!
                  </span>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={handleGoToLogin}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Unifi
          </h2>
          
          {isAuthenticated ? (
            <div className="space-y-6">
              <p className="text-xl text-muted-foreground">
                Great! You&apos;re connected to Spotify.
              </p>
              <div className="max-w-2xl mx-auto p-6 bg-card border border-border rounded-lg">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Connected Account
                </h3>
                <p className="text-muted-foreground">
                  Spotify User: <span className="font-medium text-foreground">{user}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your app is now ready to access your Spotify data!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xl text-muted-foreground">
                Connect your Spotify account to get started.
              </p>
              <Button 
                onClick={handleGoToLogin}
                size="lg"
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}