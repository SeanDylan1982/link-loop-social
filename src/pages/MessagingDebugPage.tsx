import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import MessagingTestRunner from '@/tests/run-messaging-tests';

/**
 * Messaging Debug Page
 * 
 * This page provides tools to diagnose and fix messaging system issues.
 */
const MessagingDebugPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useSupabaseAuth();
  
  // Only allow admins to access this page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access this page.</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  const handleNavChange = (tab: string) => {
    navigate(`/?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="" onTabChange={handleNavChange} />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Messaging System Diagnostics</h1>
        
        <div className="space-y-8">
          <MessagingTestRunner />
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Common Issues & Solutions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Issue: Receiver ID not being passed correctly</h3>
                <p className="text-gray-600 mt-1">
                  The receiver ID may be lost when navigating between components or when the conversation
                  participant structure doesn't match what the code expects.
                </p>
                <div className="mt-2 bg-gray-100 p-3 rounded">
                  <p className="font-medium">Solution:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>Ensure the receiver ID is explicitly passed to the useConversation hook</li>
                    <li>Check the participant data structure in the ConversationPage component</li>
                    <li>Verify that the receiver ID is correctly extracted from participants</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Issue: Messages table schema mismatch</h3>
                <p className="text-gray-600 mt-1">
                  The code might be trying to use a receiver_id column that doesn't exist in the messages table.
                </p>
                <div className="mt-2 bg-gray-100 p-3 rounded">
                  <p className="font-medium">Solution:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>Check if the messages table has a receiver_id column</li>
                    <li>If not, either add the column or modify the code to not use it</li>
                    <li>Ensure the message sending function matches the database schema</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Issue: Conversation participants not properly loaded</h3>
                <p className="text-gray-600 mt-1">
                  The participant profiles might not be correctly loaded from the database.
                </p>
                <div className="mt-2 bg-gray-100 p-3 rounded">
                  <p className="font-medium">Solution:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>Check the SQL query used to fetch conversation participants</li>
                    <li>Verify the join between conversation_participants and profiles tables</li>
                    <li>Ensure the data structure matches what the component expects</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingDebugPage;