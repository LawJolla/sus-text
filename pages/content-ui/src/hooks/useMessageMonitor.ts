import { useEffect } from 'react';
import { processNewMessages } from '../services/messageProcessor';
import { MESSAGE_TAG } from '../services/messageService';
import { getCurrentConversationId } from '../services/conversationService';

export const useMessageMonitor = () => {
  useEffect(() => {
    let messageListObserver: MutationObserver | null = null;

    const startMessageListMonitoring = () => {
      const messageElement = document.querySelector(MESSAGE_TAG);
      if (messageElement && !messageListObserver) {
        messageListObserver = new MutationObserver(() => {
          const conversationId = getCurrentConversationId();
          if (conversationId) {
            processNewMessages();
          }
        });

        messageListObserver.observe(messageElement, { childList: true, subtree: true });
        console.log('Started monitoring message list for new messages');
      }
    };

    // Monitor for Google Voice message list element
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(async node => {
          if (node?.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // Check if this is the Google Voice message list
            if (element.tagName?.toLowerCase() === MESSAGE_TAG) {
              console.log('Google Voice message list detected');
              startMessageListMonitoring();
            }

            // Check for new messages in existing message lists
            const conversationId = getCurrentConversationId();
            if (
              conversationId &&
              (element.classList.contains('message-row') || element.querySelector('.message-row'))
            ) {
              console.log('New message element detected, processing...');
              setTimeout(processNewMessages, 500); // Small delay to ensure DOM is updated
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    // Check for existing message list
    startMessageListMonitoring();

    // Check for message list periodically
    const interval = setInterval(() => {
      const conversationId = getCurrentConversationId();
      if (conversationId && document.querySelector(MESSAGE_TAG)) {
        startMessageListMonitoring();
      }
    }, 2000);

    return () => {
      observer.disconnect();
      if (messageListObserver) {
        messageListObserver.disconnect();
      }
      clearInterval(interval);
    };
  }, []);
};
