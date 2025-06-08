import { generateText } from 'ai';
import { createOllama, ollama } from 'ollama-ai-provider';

// Custom fetch function that uses Chrome message passing to avoid CORS issues
const backgroundFetch = async (url: string, options: RequestInit): Promise<Response> => {
  return new Promise((resolve, reject) => {
    // Send a message to the background script to make the request
    chrome.runtime.sendMessage(
      {
        type: 'OLLAMA_API_REQUEST',
        url,
        options: {
          method: options.method || 'GET',
          headers: options.headers || {},
          body: options.body || null,
        },
      },
      response => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', JSON.stringify(chrome.runtime.lastError));
          console.error(JSON.stringify(url));
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response || !response.success) {
          reject(new Error(response?.error || 'Unknown error'));
          return;
        }

        // Create a mock Response object
        const mockResponse = new Response(JSON.stringify(response.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        resolve(mockResponse);
      },
    );
  });
};

export async function sampleFunction() {
  console.log('sampleFunction called');
  try {
    // Configure ollama with custom fetch function that uses message passing
    const ollamaWithBackgroundFetch = createOllama({
      fetch: backgroundFetch as any,
      baseURL: 'http://localhost:11434/api',
      // headers: "deepseek-r1:1.5b"
    });

    const text = await generateText({
      model: ollamaWithBackgroundFetch('deepseek-r1:7b'),
      prompt: 'Hello, how are you??',
      headers: {
        stream: 'false',
      },
    });

    console.log('Generated text:', text);
    return text;
  } catch (error) {
    console.error('Error in sampleFunction:', error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return `Error: ${JSON.stringify(error)}`;
  }
}
