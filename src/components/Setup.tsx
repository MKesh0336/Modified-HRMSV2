import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logo from 'figma:asset/fc4b410fb12d2e806b8e1ba3c15a6e1805882282.png';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-937488f4`;

export function Setup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/seed-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account');
      }

      setSuccess(true);
      console.log('Admin created successfully:', data);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Setup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#d4af37]/30">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img src={logo} alt="Al Faiz Multinational Group" className="w-20 h-20 object-contain mx-auto" />
          </div>
          <div>
            <CardTitle className="text-[#d4af37]">Al Faiz Multinational Group</CardTitle>
            <p className="text-gray-400 mt-2">
              HRMS System - Initial Setup
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Create your administrator account to get started
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-500/50">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[#d4af37] mb-2">Setup Complete!</h3>
                <p className="text-emerald-400">
                  Admin account created successfully.
                  <br />
                  Redirecting to login...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-[#0a0a0a] border-[#d4af37]/30 text-gray-300 placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@alfaizmng.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-[#0a0a0a] border-[#d4af37]/30 text-gray-300 placeholder:text-gray-600"
                />
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="bg-[#0a0a0a] border-[#d4af37]/30 text-gray-300 placeholder:text-gray-600"
                />
              </div>

              <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg p-3">
                <p className="text-gray-300 text-sm">
                  <strong className="text-[#d4af37]">Note:</strong> This will create the first administrator account. 
                  After setup, you can create additional users from the admin panel.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-black hover:bg-[#b8941f] font-medium"
              >
                {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </Button>

              <div className="text-center">
                <a 
                  href="/"
                  className="text-sm text-[#d4af37] hover:text-[#b8941f]"
                >
                  Already have an account? Login
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}