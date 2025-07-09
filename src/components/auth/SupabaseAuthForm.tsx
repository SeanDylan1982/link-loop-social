
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';
import { TermsModal } from '@/components/modals/TermsModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';

export const SupabaseAuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { login, signup } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({ title: "Welcome back!" });
      } else {
        if (!acceptedTerms || !acceptedPrivacy) {
          toast({ 
            title: "Error", 
            description: "You must accept both the Terms of Service and Privacy Policy to create an account.",
            variant: "destructive"
          });
          return;
        }
        await signup(username, email, password);
        toast({ 
          title: "Account created!", 
          description: "Please check your email to verify your account." 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">SocialConnect</CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back! Sign in to your account' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            {!isLogin && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                  />
                  <label htmlFor="terms" className="text-sm">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </button>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={acceptedPrivacy}
                    onCheckedChange={setAcceptedPrivacy}
                  />
                  <label htmlFor="privacy" className="text-sm">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (!isLogin && (!acceptedTerms || !acceptedPrivacy))}
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <TermsModal 
        open={showTerms} 
        onOpenChange={(open) => {
          if (!open) setAcceptedTerms(true);
          setShowTerms(open);
        }}
      />
      <PrivacyModal 
        open={showPrivacy} 
        onOpenChange={(open) => {
          if (!open) setAcceptedPrivacy(true);
          setShowPrivacy(open);
        }}
      />
    </div>
  );
};
