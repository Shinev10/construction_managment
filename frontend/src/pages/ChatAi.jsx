import React, { useState } from 'react';

// Styles for the Chat AI component, updated for theme and full-screen
const styles = {
  // --- EDITED: Page container adjusted for full-screen content ---
  pageContainer: {
    minHeight: 'calc(100vh - 80px)', // Fill space below navbar
    padding: '2rem 5%', // Adjusted padding for full width
    backgroundColor: '#f7fafc', // Light background to match theme
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // Align chat box to the top
    fontFamily: 'system-ui, sans-serif',
  },
  // --- EDITED: Chat component container now allows full width ---
  container: {
    // maxWidth: '800px', // Removed maxWidth
    width: '100%', // Ensure it takes available width
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#1a202c',
  },
  chatWindow: {
    height: '450px', // Slightly taller chat window
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem', // Increased margin
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    padding: '0.75rem 1.2rem', // Increased padding
    borderRadius: '18px',
    maxWidth: '75%',
    lineHeight: '1.5',
    fontSize: '0.95rem', // Slightly larger font
  },
  userMessage: {
    backgroundColor: '#f0b900', // Yellow for user messages
    color: '#1a202c',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px',
  },
  aiMessage: {
    backgroundColor: '#eef2f9', // Lighter grey for AI messages
    color: '#1e293b',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px',
  },
  inputArea: {
    display: 'flex',
    gap: '1rem',
  },
  input: {
    flexGrow: 1,
    padding: '0.85rem 1rem', // Slightly taller input
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.85rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#1a202c', // Dark button
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: { // Style for disabled button
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  thinkingMessage: {
    fontStyle: 'italic',
    color: '#6b7280',
  }
};

const ChatAi = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return; // Prevent sending empty or while loading

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: `You are a helpful assistant specialized in construction management software. Keep answers concise, friendly, and focused on construction topics. User asks: ${input}` }] }],
      };

      // --- Simple Exponential Backoff ---
      let response;
      let attempts = 0;
      const maxAttempts = 3;
      let delay = 1000; // Start with 1 second

      while (attempts < maxAttempts) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          break; // Success! Exit the loop.
        } else if (response.status === 429 || response.status >= 500) {
          // If rate limited or server error, wait and retry
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error(`API request failed after ${maxAttempts} attempts with status: ${response.status}`);
          }
          // console.log(`Attempt ${attempts} failed. Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Double the delay for the next attempt
        } else {
          // For other errors (like 400), don't retry, just throw
          throw new Error(`API request failed with status: ${response.status}`);
        }
      }
      // --- End of Backoff Logic ---


      if (!response.ok) { // Check again after the loop
        throw new Error('Failed to get response from AI');
      }

      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        const aiMessage = { role: 'ai', text: aiText };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
         throw new Error('No content in AI response');
      }

    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage = { role: 'ai', text: 'Sorry, I am having trouble connecting. Please try again later.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // --- Page container handles background and full width padding ---
    <div style={styles.pageContainer}>
      {/* --- Inner container styles the chat box itself --- */}
      <div style={styles.container}>
        <h1 style={styles.title}>Chat with our AI Assistant</h1>
        <div style={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : styles.aiMessage),
              }}
            >
              {msg.text}
            </div>
          ))}
          {isLoading &&
            <div style={{...styles.message, ...styles.aiMessage, ...styles.thinkingMessage}}>
              Thinking...
            </div>
          }
        </div>
        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input
            type="text"
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about construction management..."
            disabled={isLoading}
          />
          <button
            type="submit"
            style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}}
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAi;

