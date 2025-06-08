// DOM manipulation utilities for Google Voice integration

export const insertToggleIntoGoogleVoice = async (toggleElement: HTMLElement): Promise<void> => {
  const insertPoint = document.querySelector('gv-thread-details-header > div');
  if (!insertPoint) {
    console.log('Insert point not found, retrying...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return insertToggleIntoGoogleVoice(toggleElement);
  }

  // Clean up any existing AI toggles
  const existingToggles = document.querySelectorAll('[id^="ai-discussion-toggle-container"]');
  existingToggles.forEach(toggle => toggle.remove());

  // Find the header-content and action-buttons within the flex container
  const headerContent = insertPoint.querySelector('.header-content');
  const actionButtons = insertPoint.querySelector('.action-buttons');

  if (headerContent && actionButtons) {
    // Insert the toggle between header-content and action-buttons
    insertPoint.insertBefore(toggleElement, actionButtons);
    console.log('✅ AI toggle inserted between header content and action buttons');
  } else {
    // Fallback: append to the end of the container
    insertPoint.appendChild(toggleElement);
    console.log('⚠️ Fallback: AI toggle appended to end of container');
  }
};

export const addPulseAnimation = (): void => {
  // Add pulse animation if not already added
  if (!document.getElementById('ai-pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'ai-pulse-animation';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { 
          opacity: 1; 
          transform: scale(1); 
          box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.7);
        }
        50% { 
          opacity: 0.8; 
          transform: scale(1.5); 
          box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.3);
        }
      }
    `;
    document.head.appendChild(style);
  }
};
