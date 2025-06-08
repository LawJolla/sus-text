import { sendToLLM, showUserNotification } from './ollamaService';
import { postLLMResponse, getVoiceTextFromNumber, MESSAGE_TAG } from './messageService';
import { getCurrentConversationId, getConversationState, updateConversationState } from './conversationService';
import { AIState } from '../types';

// Initialize conversation context from existing messages
export const initializeConversationContext = async (conversationId: string) => {
  const state = getConversationState(conversationId);
  const messageElement = document.querySelector(MESSAGE_TAG);

  if (messageElement) {
    const content = messageElement.querySelector('section');
    if (content) {
      const voiceData = getVoiceTextFromNumber(content);
      const sortedMessages = voiceData.messages
        .map(msg => ({
          text: msg.text,
          author: msg.author,
          timestamp: msg.timestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      updateConversationState(conversationId, {
        conversationContext: sortedMessages,
        lastProcessedMessageCount: sortedMessages.length,
      });

      console.log('✅ Initialized conversation context with', sortedMessages.length, 'messages for', conversationId);

      // Check if we need to respond to the most recent message
      await checkForImmediateResponse(conversationId);
    }
  }
};

// Check if the most recent message needs a response
export const checkForImmediateResponse = async (conversationId: string) => {
  const state = getConversationState(conversationId);

  if (!state.isActive || state.conversationContext.length === 0 || state.isProcessingMessage) {
    return;
  }

  // Get the most recent message
  const mostRecentMessage = state.conversationContext[state.conversationContext.length - 1];

  // Check if we already processed this message
  if (mostRecentMessage.timestamp <= state.lastProcessedMessageTimestamp) {
    console.log('ℹ️ Already processed this message, skipping');
    return;
  }

  // Check if the most recent message is from someone else (not us)
  const isFromOtherPerson =
    !mostRecentMessage.author.toLowerCase().includes('you') && mostRecentMessage.author !== 'You';

  if (isFromOtherPerson) {
    console.log('🔄 Most recent message is from other person, sending AI response...');
    console.log('📨 Last message:', mostRecentMessage);

    // Set processing lock
    updateConversationState(conversationId, { isProcessingMessage: true });

    try {
      // Send AI response for the most recent message
      const llmResponse = await sendToLLM(
        mostRecentMessage,
        state.conversationContext,
        conversationId,
        state.selectedModel,
        state.selectedPersona,
      );

      if (llmResponse) {
        // Post LLM response as new text message with realistic delay
        const success = await postLLMResponse(llmResponse);

        if (success) {
          // Add our response to context
          const updatedContext = [
            ...state.conversationContext,
            {
              text: llmResponse,
              author: 'You',
              timestamp: Date.now(),
            },
          ];

          // Update the conversation state
          updateConversationState(conversationId, {
            conversationContext: updatedContext,
            lastProcessedMessageCount: updatedContext.length,
            lastProcessedMessageTimestamp: mostRecentMessage.timestamp,
          });

          console.log('✅ AI response sent for most recent message');
        }
      }
    } catch (error) {
      console.error('❌ Error processing immediate response:', error);
      showUserNotification('Error processing AI response', 'error');
    } finally {
      // Always release the processing lock
      updateConversationState(conversationId, { isProcessingMessage: false });
    }
  } else {
    console.log('ℹ️ Most recent message is from us, no response needed');
  }
};

// Process new incoming messages
export const processNewMessages = async () => {
  const conversationId = getCurrentConversationId();
  console.log('🔍 processNewMessages called, conversationId:', conversationId);

  if (!conversationId) {
    console.log('❌ No conversation ID, exiting processNewMessages');
    return;
  }

  const state = getConversationState(conversationId);
  console.log('📊 State check - isActive:', state.isActive, 'isProcessingMessage:', state.isProcessingMessage);

  if (!state.isActive || state.isProcessingMessage) {
    console.log('⏸️ Skipping processing - AI inactive or already processing');
    return;
  }

  const messageElement = document.querySelector(MESSAGE_TAG);
  if (messageElement) {
    const content = messageElement.querySelector('section');
    if (content) {
      const voiceData = getVoiceTextFromNumber(content);
      const currentMessages = voiceData.messages.sort((a, b) => a.timestamp - b.timestamp);

      console.log(
        '📨 Current message count:',
        currentMessages.length,
        'vs last processed:',
        state.lastProcessedMessageCount,
      );

      // Check if there are new messages
      if (currentMessages.length > state.lastProcessedMessageCount) {
        const newMessages = currentMessages.slice(state.lastProcessedMessageCount);
        console.log('📩 New messages detected:', newMessages.length, 'for conversation:', conversationId);

        // Set processing lock
        updateConversationState(conversationId, { isProcessingMessage: true });

        try {
          // Process each new message
          for (let i = 0; i < newMessages.length; i++) {
            const newMessage = newMessages[i];
            console.log(`🔄 Processing message ${i + 1}/${newMessages.length}:`, newMessage);

            // Skip if this is our own message
            const isOwnMessage = newMessage.author.toLowerCase().includes('you') || newMessage.author === 'You';
            if (isOwnMessage) {
              console.log('⏭️ Skipping own message');
              continue;
            }

            // Skip if we already processed this message
            if (newMessage.timestamp <= state.lastProcessedMessageTimestamp) {
              console.log('⏭️ Already processed message, skipping');
              continue;
            }

            console.log('✅ Message passed all checks, proceeding with LLM response');

            // Update conversation context
            const updatedContext = [
              ...state.conversationContext,
              {
                text: newMessage.text,
                author: newMessage.author,
                timestamp: newMessage.timestamp,
              },
            ];

            updateConversationState(conversationId, {
              conversationContext: updatedContext,
            });

            // Send to LLM for response
            const llmResponse = await sendToLLM(
              newMessage,
              updatedContext,
              conversationId,
              state.selectedModel,
              state.selectedPersona,
            );

            if (llmResponse) {
              // Post LLM response
              const success = await postLLMResponse(llmResponse);

              if (success) {
                // Add LLM response to context
                const finalContext = [
                  ...updatedContext,
                  {
                    text: llmResponse,
                    author: 'You',
                    timestamp: Date.now(),
                  },
                ];

                updateConversationState(conversationId, {
                  conversationContext: finalContext,
                  lastProcessedMessageTimestamp: newMessage.timestamp,
                });

                console.log('✅ Response posted successfully');
              }
            }

            // Only process one new message at a time
            break;
          }

          updateConversationState(conversationId, {
            lastProcessedMessageCount: currentMessages.length,
          });
        } catch (error) {
          console.error('❌ Error processing new messages:', error);
          showUserNotification('Error processing new messages', 'error');
        } finally {
          // Always release the processing lock
          updateConversationState(conversationId, { isProcessingMessage: false });
        }
      }
    }
  }
};
