/**
 * Messaging System Debug Tests
 * 
 * This file contains tests to diagnose issues with the messaging system,
 * specifically focusing on why receiver IDs are getting lost during the
 * message sending process.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Test 1: Trace the flow of a direct message creation
 * This test logs the complete flow of creating a direct message conversation
 */
export async function testDirectMessageFlow(senderId: string, receiverId: string) {
  console.log('=== TEST 1: Direct Message Flow ===');
  console.log('Sender ID:', senderId);
  console.log('Receiver ID:', receiverId);
  
  try {
    // Step 1: Check if conversation already exists
    console.log('\nStep 1: Checking for existing conversation');
    const { data: candidateConvs } = await supabase
      .from('conversations')
      .select('id')
      .eq('is_group', false);
    
    console.log('Found', candidateConvs?.length || 0, 'potential conversations');
    
    let existingConversationId = null;
    
    // Step 2: Check participants for each conversation
    console.log('\nStep 2: Checking participants');
    for (const conv of candidateConvs || []) {
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id);
      
      const participantIds = (parts || []).map(p => p.user_id);
      console.log(`Conversation ${conv.id} has participants:`, participantIds);
      
      if (participantIds.length === 2 && 
          participantIds.includes(senderId) && 
          participantIds.includes(receiverId)) {
        existingConversationId = conv.id;
        console.log('Found existing conversation:', existingConversationId);
        break;
      }
    }
    
    // Step 3: Create new conversation if needed
    let conversationId = existingConversationId;
    if (!conversationId) {
      console.log('\nStep 3: Creating new conversation');
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([{ title: null, is_group: false, creator_id: senderId }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }
      
      conversationId = conversation.id;
      console.log('Created new conversation:', conversationId);
      
      // Step 4: Add participants
      console.log('\nStep 4: Adding participants');
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: senderId },
          { conversation_id: conversationId, user_id: receiverId }
        ]);
      
      if (participantError) {
        console.error('Error adding participants:', participantError);
        return;
      }
      
      console.log('Added participants successfully');
    }
    
    // Step 5: Send a test message
    console.log('\nStep 5: Sending test message');
    const messageContent = `Test message from ${senderId} to ${receiverId}`;
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: messageContent,
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error sending message:', messageError);
      return;
    }
    
    console.log('Message sent successfully:', message);
    
    // Step 6: Verify message was created correctly
    console.log('\nStep 6: Verifying message');
    const { data: verifyMessage } = await supabase
      .from('messages')
      .select('*')
      .eq('id', message.id)
      .single();
    
    console.log('Verified message:', verifyMessage);
    
    // Step 7: Check conversation participants again
    console.log('\nStep 7: Verifying conversation participants');
    const { data: finalParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);
    
    console.log('Final participants:', finalParticipants?.map(p => p.user_id));
    
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
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants (
          user_id,
          profiles:profiles (
            id, username, avatar
          )
        )
      `)
      .eq('id', conversationId)
      .single();
    
    if (error) {
      console.error('Error fetching conversation:', error);
      return;
    }
    
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
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: messageContent,
        })
        .select()
        .single();
      
      if (messageError) {
        console.error('Error sending message:', messageError);
      } else {
        console.log('Message sent successfully:', message);
      }
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
    
    // Try to insert (will fail due to foreign key constraints, but we'll see the schema error)
    const { error } = await supabase
      .from('messages')
      .insert([testMessage]);
    
    if (error) {
      console.log('Schema test result:', error);
      // Check if the error is about receiver_id not existing
      if (error.message.includes('receiver_id')) {
        console.log('DIAGNOSIS: receiver_id column does not exist in messages table');
      } else {
        console.log('DIAGNOSIS: receiver_id may exist but other constraints failed');
      }
    } else {
      console.log('UNEXPECTED: Test message inserted successfully');
    }
    
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