import { sampleFunction } from '@src/sampleFunction';

console.log('Google Voice AI Discussion content script loaded');

// Note: The content-ui package now handles all UI rendering and message processing
// This content script just provides basic initialization and monitoring

// Check if we're on Google Voice
const isGoogleVoice = () => window.location.hostname === 'voice.google.com';

// Basic initialization
const initialize = () => {
  if (isGoogleVoice()) {
    console.log('✅ Google Voice detected - content-ui will handle UI injection and message processing');

    // The content-ui App component will:
    // 1. Monitor for Google Voice message lists
    // 2. Inject the AI Discussion toggle
    // 3. Handle all message processing and AI responses
    // 4. Manage conversation state
  } else {
    console.log('ℹ️ Not on Google Voice, content-ui will not activate');
  }
};

// Initialize immediately
initialize();

// Monitor URL changes for SPA navigation
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('🔄 URL changed, re-initializing');
    setTimeout(initialize, 1000); // Small delay for page load
  }
}, 1000);

console.log('Google Voice AI Discussion content script initialization complete');
