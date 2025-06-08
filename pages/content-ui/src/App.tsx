import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AiDiscussionToggle } from './components/AiDiscussionToggle.js';
import { getCurrentConversationId } from './services/conversationService.js';
import { MESSAGE_TAG } from './services/messageService.js';
import { useMessageMonitor } from './hooks/useMessageMonitor.js';
import { addPulseAnimation } from './services/domService.js';

export default function App() {
  const [shouldShow, setShouldShow] = useState(false);
  const [insertPoint, setInsertPoint] = useState<HTMLElement | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Start monitoring for new messages
  useMessageMonitor();

  useEffect(() => {
    console.log('Sus Text content UI loaded');

    // Add pulse animation styles
    addPulseAnimation();

    const createToggleContainer = (currentConversationId: string): HTMLDivElement => {
      // Clean up any existing toggles from other conversations
      const existingToggles = document.querySelectorAll(
        '[id^="ai-discussion-toggle-container"]:not([id$="' + currentConversationId + '"])',
      );
      existingToggles.forEach(toggle => toggle.remove());

      const toggleId = `ai-discussion-toggle-container-${currentConversationId}`;

      // Check if toggle already exists for this conversation
      let container = document.getElementById(toggleId) as HTMLDivElement;
      if (!container) {
        container = document.createElement('div');
        container.id = toggleId;
      }

      return container;
    };

    const checkForGoogleVoice = () => {
      // Check if we're on Google Voice and have a conversation
      const currentId = getCurrentConversationId();
      const isGoogleVoice = window.location.hostname === 'voice.google.com';
      const hasMessageList = document.querySelector(MESSAGE_TAG);

      if (isGoogleVoice && currentId && hasMessageList) {
        // Find the insertion point
        const headerPoint = document.querySelector('gv-thread-details-header > div');
        if (headerPoint) {
          const container = createToggleContainer(currentId);

          // Find the header-content and action-buttons within the flex container
          const headerContent = headerPoint.querySelector('.header-content');
          const actionButtons = headerPoint.querySelector('.action-buttons');

          if (headerContent && actionButtons && !container.parentElement) {
            // Insert the toggle between header-content and action-buttons
            headerPoint.insertBefore(container, actionButtons);
            console.log('✅ AI toggle container inserted between header content and action buttons');
          } else if (!container.parentElement) {
            // Fallback: append to the end of the container
            headerPoint.appendChild(container);
            console.log('⚠️ Fallback: AI toggle container appended to end of container');
          }

          containerRef.current = container;
          setInsertPoint(container);
          setConversationId(currentId);
          setShouldShow(true);
          return;
        }
      }

      setShouldShow(false);
      setInsertPoint(null);
      setConversationId(null);
    };

    // Initial check
    checkForGoogleVoice();

    // Monitor for changes
    const observer = new MutationObserver(() => {
      checkForGoogleVoice();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Monitor URL changes
    let currentUrl = window.location.href;
    const urlChangeInterval = setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(checkForGoogleVoice, 1000); // Small delay for page load
      }
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(urlChangeInterval);
    };
  }, []);

  if (!shouldShow || !insertPoint || !conversationId) {
    return null;
  }

  return createPortal(<AiDiscussionToggle />, insertPoint);
}
