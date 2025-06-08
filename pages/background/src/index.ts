// Background script for handling CORS requests to Ollama API and AI Discussion functionality

console.log('🚀 Google Voice AI Discussion background script starting...');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background script received message:', message.type);

  // Handle connection test
  if (message.type === 'CONNECTION_TEST') {
    console.log('✅ Connection test successful');
    sendResponse({ success: true, message: 'Background script is ready' });
    return true;
  }

  if (message.type === 'OLLAMA_API_REQUEST') {
    console.log('🔄 Background script received Ollama API request', message);

    // Extract request details from the message
    const { url, options } = message;

    console.log('🌐 Making fetch request to:', url);
    console.log('📋 Request options:', JSON.stringify(options, null, 2));

    // Log the parsed body to see what we're actually sending
    try {
      const parsedBody = JSON.parse(options.body);
      console.log('📤 Parsed request body:', JSON.stringify(parsedBody, null, 2));
    } catch (e) {
      console.log('❌ Could not parse request body:', options.body);
    }

    // Make the fetch request from the background script (which is not subject to CORS)
    fetch(url, options)
      .then(response => {
        console.log('📡 Ollama API response status:', response.status);
        console.log('📄 Response content-type:', response.headers.get('content-type'));

        if (!response.ok) {
          // Get response text for more details on 403
          return response.text().then(errorText => {
            console.error('❌ Ollama API Error Details:');
            console.error('   Status:', response.status);
            console.error('   Status Text:', response.statusText);
            console.error('   Response Body:', errorText || '(empty body)');
            console.error('   Content-Type:', response.headers.get('content-type'));
            console.error('   Content-Length:', response.headers.get('content-length'));
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          });
        }

        // Convert the response to text or JSON based on the content type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }
        return response.text();
      })
      .then(data => {
        console.log('✅ Ollama API response data received');
        // Send the response back to the content script
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('❌ Error in background fetch:', error);

        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to Ollama API. Please ensure Ollama is running on localhost:11434';
        }

        sendResponse({ success: false, error: errorMessage });
      });

    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }

  // Handle AI Discussion state messages
  if (message.type === 'AI_DISCUSSION_STATE') {
    console.log('🔄 AI Discussion state changed:', message.isActive);
    // Could be used for analytics or state management
    sendResponse({ success: true });
    return true;
  }

  // Handle conversation context updates
  if (message.type === 'CONVERSATION_CONTEXT_UPDATE') {
    console.log('🔄 Conversation context updated:', message.contextLength);
    // Could be used for context management or analytics
    sendResponse({ success: true });
    return true;
  }
});

// Listen for extension installation/startup
chrome.runtime.onInstalled.addListener(details => {
  console.log('Google Voice AI Discussion extension installed/updated:', details.reason);

  // Could set up initial configuration or show welcome message
  if (details.reason === 'install') {
    console.log('Extension installed for the first time');
  }
});

// Listen for tab updates to detect Google Voice pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('voice.google.com')) {
    console.log('Google Voice page detected:', tab.url);
    // Could inject content script or perform other initialization
  }
});

console.log('Google Voice AI Discussion background script loaded');
