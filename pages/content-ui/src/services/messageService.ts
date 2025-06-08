import type { VoiceData } from '../types';

// Message tag for Google Voice text message list
export const MESSAGE_TAG = 'gv-text-message-list';

// Calculate realistic typing delay based on 30 WPM
export const calculateTypingDelay = (text: string): number => {
  const wordsPerMinute = 30;
  const words = text.trim().split(/\s+/).length;
  const typingTimeMinutes = words / wordsPerMinute;
  const typingTimeMs = typingTimeMinutes * 60 * 1000;

  // Add some randomness (±20%) to make it more human-like
  const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
  const finalDelay = typingTimeMs * randomFactor;

  // Minimum 2 seconds, maximum 30 seconds for very long responses
  return Math.max(2000, Math.min(30000, finalDelay));
};

// Get voice text data from Google Voice DOM
export const getVoiceTextFromNumber = (html: Element): VoiceData => {
  const voiceText: VoiceData = { number: '', messages: [] };

  // extract phone number from first sender element
  const senderEl = html.querySelector('.sender') as HTMLElement;
  voiceText.number = senderEl?.textContent?.trim() || '';

  // Debug: Let's see what all message-related elements exist
  const allPotentialMessages = html.querySelectorAll('.message-row, [class*="message"], [class*="text"]');
  console.log('🔍 All potential message elements in DOM:', allPotentialMessages.length);
  allPotentialMessages.forEach((el, index) => {
    const content = el.textContent?.trim().substring(0, 100) || '';
    const isMessageRow = el.classList.contains('message-row');
    console.log(`  ${index + 1}. Class: "${el.className}", IsMessageRow: ${isMessageRow}, Content: "${content}..."`);

    // If this is NOT a message-row, let's understand why
    if (!isMessageRow) {
      console.log(`    🔍 Non-message-row element details:`, el);
      console.log(`    🔍 Parent element:`, el.parentElement);
      console.log(`    🔍 Has .content child:`, !!el.querySelector('.content'));
    }
  });

  // select all message rows
  const rows = html.querySelectorAll('.message-row');
  console.log('🔍 getVoiceTextFromNumber: Found', rows.length, '.message-row elements specifically');

  // Let's also check for other potential message selectors
  const alternativeSelectors = ['[class*="message"]', '[class*="text-message"]', '[class*="chat"]', '.content'];

  alternativeSelectors.forEach(selector => {
    const elements = html.querySelectorAll(selector);
    console.log(`🔍 Alternative selector "${selector}":`, elements.length, 'elements');
    if (selector === '.content') {
      // For .content elements, let's see which ones are NOT inside .message-row
      elements.forEach((el, index) => {
        const isInsideMessageRow = el.closest('.message-row');
        if (!isInsideMessageRow) {
          console.log(`  🚨 Orphaned .content element ${index + 1}:`, el.textContent?.trim().substring(0, 50));
        }
      });
    }
  });

  rows.forEach((row, index) => {
    console.log(`🔍 Processing message row ${index + 1}:`, row);
    console.log(`🔍 Row ${index + 1} classes:`, row.className);

    const container = row.closest('.container') as HTMLElement;
    if (!container) {
      console.log(`⚠️ Row ${index + 1}: No container found, skipping`);
      return;
    }

    // parse hidden date info
    const hiddenEl = container.querySelector('.cdk-visually-hidden');
    let timestamp = 0;
    if (hiddenEl) {
      const hiddenText = hiddenEl.textContent?.trim() || '';
      console.log(`🕒 Row ${index + 1}: Hidden text:`, hiddenText);
      const parts = hiddenText.split(', ');
      if (parts.length >= 3) {
        const len = parts.length;
        const dateParts = parts.slice(len - 3);
        let dateStr = dateParts.join(', ');
        dateStr = dateStr.replace(/\.$/, '');
        timestamp = new Date(dateStr).getTime();
        console.log(`🕒 Row ${index + 1}: Parsed timestamp:`, timestamp, '(', dateStr, ')');
      } else {
        console.log(`⚠️ Row ${index + 1}: Not enough date parts:`, parts);
      }
    } else {
      console.log(`⚠️ Row ${index + 1}: No hidden date element found`);
    }

    // get message text
    const contentEl = row.querySelector('.content') as HTMLElement;
    const text = contentEl?.textContent?.trim() || '';
    console.log(`📝 Row ${index + 1}: Text content:`, text);

    // determine author
    const isOutgoing = row.classList.contains('outgoing');
    const author = isOutgoing ? 'you' : voiceText.number;
    console.log(`👤 Row ${index + 1}: Author:`, author, '(isOutgoing:', isOutgoing, ')');

    // construct message object
    const id = `${timestamp}-${index}`;
    const message = {
      id,
      text,
      timestamp,
      read: true,
      deleted: false,
      author,
    };

    console.log(`✅ Row ${index + 1}: Created message:`, message);
    voiceText.messages.push(message);
  });

  console.log('📊 getVoiceTextFromNumber: Final result:', voiceText);
  console.log(
    '⚠️ DISCREPANCY CHECK: Parser found',
    voiceText.messages.length,
    'messages, but DOM has',
    allPotentialMessages.length,
    'potential message elements',
  );

  // Let's see if there are any .content elements that aren't inside .message-row
  const allContentElements = html.querySelectorAll('.content');
  const contentInMessageRows = html.querySelectorAll('.message-row .content');
  console.log('🔍 Total .content elements:', allContentElements.length);
  console.log('🔍 .content elements inside .message-row:', contentInMessageRows.length);

  if (allContentElements.length > contentInMessageRows.length) {
    console.log('🚨 Found orphaned .content elements (not inside .message-row):');
    allContentElements.forEach((el, index) => {
      if (!el.closest('.message-row')) {
        console.log(`  Orphaned content ${index + 1}:`, el.textContent?.trim());
        console.log(`  Parent element:`, el.parentElement);
      }
    });
  }

  return voiceText;
};

// Post LLM response as a new text message with realistic typing delay
export const postLLMResponse = async (responseText: string): Promise<boolean> => {
  // Calculate typing delay based on response length
  const typingDelay = calculateTypingDelay(responseText);
  console.log(`⏱️ Simulating typing delay: ${Math.round(typingDelay / 1000)}s for response: "${responseText}"`);

  // Wait for the realistic typing time
  await new Promise(resolve => setTimeout(resolve, typingDelay));

  // Find the text input area
  const textInput = document.querySelector(
    'textarea[placeholder*="Type a message"], textarea[aria-label*="message"]',
  ) as HTMLTextAreaElement;

  if (textInput) {
    // Set the response text
    textInput.value = responseText;

    // Trigger input events to ensure Google Voice recognizes the change
    textInput.dispatchEvent(new Event('input', { bubbles: true }));
    textInput.dispatchEvent(new Event('change', { bubbles: true }));

    // Find and click the send button
    await new Promise(resolve => setTimeout(resolve, 100));

    const sendButton = document.querySelector(
      'button[aria-label*="Send"], button[title*="Send"], gv-icon-button[data-mat-icon-name="send"]',
    ) as HTMLElement;

    if (sendButton) {
      sendButton.click();
      console.log('✅ LLM response sent successfully:', responseText);
      return true;
    } else {
      console.warn('Send button not found, trying alternative selectors');
      // Try alternative selectors
      const altSendButton = document.querySelector('[role="button"][aria-label*="send" i]') as HTMLElement;
      if (altSendButton) {
        altSendButton.click();
        console.log('✅ LLM response sent via alternative button:', responseText);
        return true;
      } else {
        console.error('❌ Could not find send button');
        return false;
      }
    }
  } else {
    console.error('❌ Text input not found');
    return false;
  }
};
