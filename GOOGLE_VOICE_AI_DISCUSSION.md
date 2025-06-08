# Google Voice AI Discussion

This Chrome extension adds AI-powered automated responses to Google Voice text message conversations using a local LLM (Large Language Model).

## Features

- **AI Discussion Toggle**: A convenient toggle button that appears on Google Voice text message pages
- **Real-time Message Monitoring**: Automatically detects new incoming messages when AI Discussion is active
- **Context-Aware Responses**: The AI maintains conversation context to provide relevant responses
- **Local LLM Integration**: Uses Ollama running locally for privacy and control
- **Automatic Message Sending**: AI responses are automatically posted as text messages

## Prerequisites

1. **Ollama Installation**: You need to have Ollama running locally on your machine
   - Install Ollama from [https://ollama.ai](https://ollama.ai)
   - Start Ollama service: `ollama serve`
   - Pull a model (recommended): `ollama pull deepseek-r1:7b`

2. **Chrome Extension**: This extension must be loaded in Chrome

## Setup Instructions

1. **Install and Configure Ollama**:
   ```bash
   # Install Ollama (follow instructions at ollama.ai)
   
   # Start Ollama service
   ollama serve
   
   # Pull the recommended model
   ollama pull deepseek-r1:7b
   ```

2. **Load the Chrome Extension**:
   - Build the extension: `npm run build` (or `pnpm build`)
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

3. **Open Google Voice**:
   - Navigate to [voice.google.com](https://voice.google.com)
   - Open any text message conversation

## How to Use

1. **Activate AI Discussion**:
   - Look for the "AI Discussion" toggle in the top-right corner of the Google Voice page
   - The toggle shows a red indicator when OFF and green when ON
   - Click the toggle to activate AI Discussion

2. **Start Conversing**:
   - When someone sends you a text message, the AI will automatically generate and send a response
   - The AI maintains context of the conversation history
   - The AI will not respond to your own messages (to avoid loops)

3. **Deactivate When Needed**:
   - Click the toggle again to turn OFF AI Discussion
   - This stops the automatic AI responses

## Technical Details

### Architecture

The implementation follows the sequence diagram pattern:

1. **Content Script**: Monitors Google Voice pages and injects the AI Discussion toggle
2. **Background Script**: Handles communication with the local Ollama API
3. **Message Detection**: Real-time monitoring of new incoming messages
4. **Context Management**: Maintains conversation history for better AI responses
5. **Message Posting**: Automatically sends AI responses through the Google Voice interface

### Message Flow

```
Incoming Message → Content Script → Background Script → Ollama API → LLM Response → Posted as Text Message
```

### Supported Models

The extension is configured to use `deepseek-r1:7b` by default, but you can modify the model in the content script:

```typescript
// In pages/content/src/index.ts, modify this line:
model: 'deepseek-r1:7b',  // Change to your preferred model
```

## Troubleshooting

### AI Discussion Not Working

1. **Check Ollama Service**:
   - Ensure Ollama is running: `ollama list`
   - Verify the model is available: `ollama list`
   - Test API manually: `curl http://localhost:11434/api/generate -d '{"model":"deepseek-r1:7b","prompt":"test","stream":false}'`

2. **Check Extension Console**:
   - Open Chrome DevTools (F12) on the Google Voice page
   - Look for console messages starting with "Google Voice AI Discussion"
   - Check for any error messages

3. **Check Background Script**:
   - Go to `chrome://extensions/`
   - Click "Service Worker" link for this extension
   - Check for error messages in the background script console

### Toggle Not Appearing

1. Make sure you're on a Google Voice text message page (not the main inbox)
2. Refresh the page if the toggle doesn't appear
3. Check that the extension is enabled and has proper permissions

### Messages Not Being Sent

1. Verify the text input area and send button are detectable by the script
2. Check if Google Voice UI has changed (may require selector updates)
3. Ensure you have permission to send messages in the conversation

## Configuration

### Changing the LLM Model

Edit `pages/content/src/index.ts` and modify the model name:

```typescript
model: 'your-preferred-model',  // e.g., 'mistral', 'codellama', etc.
```

### Customizing the AI Prompt

The AI prompt can be customized in the `sendToLLM` function in the content script:

```typescript
const prompt = `Your custom prompt here...`;
```

### Adjusting Response Timing

You can modify the delay for message processing:

```typescript
setTimeout(processNewMessages, 500); // Adjust delay in milliseconds
```

## Privacy and Security

- **Local Processing**: All AI processing happens locally through Ollama
- **No Data Transmission**: Conversation data is not sent to external servers
- **Temporary Storage**: Conversation context is stored only in memory during the session
- **User Control**: You have complete control over when AI Discussion is active

## Limitations

- Only works with Google Voice web interface
- Requires Ollama to be running locally
- Response quality depends on the chosen LLM model
- May not work if Google Voice UI changes significantly

## Development

### Building the Extension

```bash
pnpm install
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Testing

The extension includes logging for debugging. Check the browser console for detailed operation logs.

## Contributing

Feel free to submit issues or pull requests to improve the functionality, add support for other models, or enhance the user experience. 