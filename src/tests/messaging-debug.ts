/**
 * Messaging System Debug Tests
 * 
 * This file contains tests to diagnose issues with the messaging system,
 * specifically focusing on why receiver IDs are getting lost during the
 * message sending process.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = {
  get: (url: string, token?: string) => fetch(`${API_URL}${url}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }).then(res => res.json()),
  post: (url: string, data: any, token?: string) => fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(data),
  }).then(res => res.json()),
};

/**
 * Test 1: Trace the flow of a direct message creation
 * This test logs the complete flow of creating a direct message conversation
 */
export async function testDirectMessageFlow(senderId: string, receiverId: string) {
  console.log('=== TEST 1: Direct Message Flow ===');
  console.log('Sender ID:', senderId);
  console.log('Receiver ID:', receiverId);
  
  try {
    // Step 1 & 2: Find or create DM conversation
    console.log('\nStep 1 & 2: Finding or creating DM conversation');
    const { id: conversationId } = await api.post('/api/conversations/dm', { friendId: receiverId });
    console.log('Using conversation ID:', conversationId);

    // Step 3: Send a test message
    console.log('\nStep 3: Sending test message');
    const messageContent = `Test message from ${senderId} to ${receiverId}`;
    const message = await api.post('/api/messages', { conversationId, content: messageContent, receiverId });
    console.log('Message sent successfully:', message);

    // Step 4: Verify message was created correctly
    console.log('\nStep 4: Verifying message');
    const messages = await api.get(`/api/messages/${conversationId}`);
    const verifyMessage = messages.find((m: any) => m.id === message.id);
    console.log('Verified message:', verifyMessage);

    // Step 5: Check conversation participants again
    console.log('\nStep 5: Verifying conversation participants');
    const conversation = await api.get(`/api/conversations/${conversationId}`);
    console.log('Final participants:', conversation.participants.map((p: any) => p.id));
    
    return {
      success: true,
      conversationId,
      messageId: message.id
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Test 2: Trace the receiver ID through the ConversationPage component
 * This test simulates the flow in the ConversationPage component
 */
export async function testConversationPageFlow(conversationId: string, currentUserId: string) {
  console.log('=== TEST 2: ConversationPage Flow ===');
  console.log('Conversation ID:', conversationId);
  console.log('Current User ID:', currentUserId);
  
  try {
    // Step 1: Fetch conversation details
    console.log('\nStep 1: Fetching conversation details');
    const conversation = await api.get(`/api/conversations/${conversationId}`);
    
    console.log('Conversation:', conversation);
    
    // Step 2: Extract participants
    console.log('\nStep 2: Extracting participants');
    const participantProfiles = conversation.participants || [];
    console.log('Participant profiles:', participantProfiles);
    
    // Step 3: Find the other participant (receiver)
    console.log('\nStep 3: Finding receiver');
    const other = participantProfiles.find((p: any) => {
      // Try different paths to find the ID
      const profileId = p.profiles?.id || p.user_id;
      console.log('Checking participant:', p, 'ID path:', profileId);
      return profileId && profileId !== currentUserId;
    });
    
    const receiverId = other?.profiles?.id || other?.user_id;
    console.log('Found receiver ID:', receiverId);
    
    // Step 4: Send a test message
    console.log('\nStep 4: Sending test message with explicit receiver');
    if (receiverId) {
      const messageContent = `Test message with explicit receiver: ${receiverId}`;
      const message = await api.post('/api/messages', { conversationId, content: messageContent, receiverId });
      console.log('Message sent successfully:', message);
    }
    
    return {
      success: true,
      receiverId,
      participantStructure: JSON.stringify(participantProfiles, null, 2)
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Test 3: Check database schema for messages table
 */
export async function checkMessagesSchema() {
  console.log('=== TEST 3: Messages Table Schema ===');
  
  try {
    // This is a simple way to check the schema - we'll insert a test message with all fields
    // and see what the database accepts
    const testMessage = {
      conversation_id: '00000000-0000-0000-0000-000000000000', // Fake ID
      sender_id: '00000000-0000-0000-0000-000000000000', // Fake ID
      receiver_id: '00000000-0000-0000-0000-000000000000', // Fake ID
      content: 'Schema test message'
    };
    
    // This test is no longer relevant as the backend handles the schema.
    console.log('Schema test is now handled by the backend.');
    
    return {
      success: true,
      error
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Run all tests
 */
export async function runAllTests(senderId: string, receiverId: string) {
  console.log('======= MESSAGING SYSTEM DIAGNOSTICS =======');
  console.log('Running tests with:');
  console.log('Sender ID:', senderId);
  console.log('Receiver ID:', receiverId);
  
  // Test 1
  const test1Result = await testDirectMessageFlow(senderId, receiverId);
  console.log('\nTest 1 Result:', test1Result.success ? 'SUCCESS' : 'FAILED');
  
  // Test 2 (if Test 1 succeeded)
  let test2Result = { success: false };
  if (test1Result.success && test1Result.conversationId) {
    test2Result = await testConversationPageFlow(test1Result.conversationId, senderId);
    console.log('\nTest 2 Result:', test2Result.success ? 'SUCCESS' : 'FAILED');
  }
  
  // Test 3
  const test3Result = await checkMessagesSchema();
  console.log('\nTest 3 Result:', test3Result.success ? 'SUCCESS' : 'FAILED');
  
  // Final diagnosis
  console.log('\n======= DIAGNOSIS =======');
  if (!test1Result.success) {
    console.log('ISSUE: Failed to create conversation or send initial message');
  } else if (!test2Result.success) {
    console.log('ISSUE: Failed to extract receiver ID from conversation participants');
  } else if (test2Result.receiverId !== receiverId) {
    console.log('ISSUE: Extracted receiver ID does not match expected receiver');
    console.log('Expected:', receiverId);
    console.log('Found:', test2Result.receiverId);
    console.log('Participant structure:', test2Result.participantStructure);
  } else {
    console.log('The messaging system appears to be working correctly in tests.');
    console.log('The issue may be in the UI components or state management.');
  }
}