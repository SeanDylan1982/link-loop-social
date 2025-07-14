import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runAllTests } from './messaging-debug';
import { useAuth } from '@/hooks/useAuth';

/**
 * Test Runner Component for Messaging System
 * 
 * This component provides a UI to run the messaging system tests
 * and displays the results in the console.
 */
export const MessagingTestRunner: React.FC = () => {
  const { user } = useAuth();
  const [receiverId, setReceiverId] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runTests = async () => {
    if (!user || !receiverId) return;
    
    setRunning(true);
    setResults([]);
    
    // Override console.log to capture output
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      originalLog(...args);
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    
    try {
      await runAllTests(user.id, receiverId);
      setResults(logs);
    } catch (error) {
      console.error('Test execution error:', error);
      logs.push(`ERROR: ${error}`);
      setResults(logs);
    } finally {
      // Restore console.log
      console.log = originalLog;
      setRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Messaging System Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current User ID (Sender):</p>
              <Input value={user?.id || ''} disabled />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Receiver User ID:</p>
              <Input 
                value={receiverId} 
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="Enter receiver's user ID"
              />
            </div>
            
            <Button 
              onClick={runTests} 
              disabled={running || !user || !receiverId}
            >
              {running ? 'Running Tests...' : 'Run Messaging Tests'}
            </Button>
            
            {results.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Test Results:</p>
                <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {results.join('\n')}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingTestRunner;