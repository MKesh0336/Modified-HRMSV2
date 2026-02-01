import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import logo from 'figma:asset/fc4b410fb12d2e806b8e1ba3c15a6e1805882282.png';

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#d4af37]/30">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Al Faiz Multinational Group" className="w-20 h-20 object-contain" />
          </div>
          <CardTitle className="text-center text-[#d4af37]">Al Faiz Multinational Group</CardTitle>
          <CardDescription className="text-center text-gray-400">
            HRMS System - Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@alfaizmng.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0a0a0a] border-[#d4af37]/30 text-gray-300 placeholder:text-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0a0a0a] border-[#d4af37]/30 text-gray-300 placeholder:text-gray-600"
              />
            </div>

            <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#b8941f] font-medium" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                First time setup?{' '}
                <a href="/setup" className="text-[#d4af37] hover:text-[#b8941f] font-medium">
                  Create Admin Account
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Contact your administrator if you need access
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}