import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import authService from '../api/authService'; // Import service

const socket = io('http://localhost:5000');

const styles = {
  container: { maxWidth: '800px', margin: '2rem auto', padding: '1rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', height: '80vh', display: 'flex', flexDirection: 'column' },
  header: { borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem', textAlign: 'center' },
  chatWindow: { flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  message: { padding: '0.8rem 1.2rem', borderRadius: '18px', maxWidth: '75%', fontSize: '0.95rem', lineHeight: '1.5' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#f0b900', color: '#1a202c', borderBottomRightRadius: '4px' },
  aiMsg: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#2d3748', borderBottomLeftRadius: '4px' },
  adminMsg: { alignSelf: 'flex-start', backgroundColor: '#1a202c', color: 'white', borderBottomLeftRadius: '4px' }, 
  inputArea: { display: 'flex', gap: '1rem' },
  input: { flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' },
  button: { padding: '0 2rem', borderRadius: '8px', border: 'none', backgroundColor: '#1a202c', color: 'white', cursor: 'pointer', fontWeight: 'bold' }
};

const SmartSupportChat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('ai'); 
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null); // Store real Conversation ID
  const chatEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded.user);
      
      if (location.state?.context) {
        setMessages([{ role: 'ai', text: `Hello! I see you're interested in the ${location.state.context}. I've notified the admin team. How can I help?` }]);
      }
    }

    socket.on('receive_dm', (msg) => {
      if (msg.sender._id !== user?.id) {
        setMode('human'); 
        setMessages(prev => [...prev, { role: 'admin', text: msg.content }]);
      }
    });

    return () => socket.off('receive_dm');
  }, [location.state, user?.id]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  // NEW: Function to ensure we have a valid conversation ID
  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    try {
      const res = await authService.startChat();
      setConversationId(res.data._id);
      // Join the socket room for this conversation
      socket.emit('join_dm_room', res.data._id);
      return res.data._id;
    } catch (error) {
      console.error("Failed to start chat:", error);
      return null;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');

    // --- CHECK KEYWORDS TO SWITCH TO HUMAN MODE ---
    if (mode === 'ai' && (userText.toLowerCase().includes('admin') || userText.toLowerCase().includes('human'))) {
      setMode('human');
      setMessages(prev => [...prev, { role: 'ai', text: 'Connecting you to an admin... One moment.' }]);
      
      // Initialize the conversation immediately so the socket is ready
      await ensureConversation();
      return; 
    }

    // --- MODE 1: HUMAN CHAT ---
    if (mode === 'human') {
      const chatId = await ensureConversation(); // Ensure we have an ID
      
      if (chatId) {
        const messageData = {
          conversationId: chatId, // Send the Real Conversation ID
          senderId: user.id,
          content: userText
        };
        socket.emit('send_dm', messageData);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Error: Could not connect to chat server.' }]);
      }
      return;
    }

    // --- MODE 2: AI CHAT ---
    try {
      // Replace with your real API Key
      const apiKey = "AIzaSyC9_UhoLB85L-T4eZwHPWe8Z6zPJY7Urcs"; 
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a helpful construction assistant. Context: ${location.state?.context || 'general'}. User says: ${userText}` }] }]
        })
      });
      const data = await response.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't understand that.";
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "AI offline. Switching to human support." }]);
      setMode('human');
      await ensureConversation();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{mode === 'ai' ? 'Construct AI' : 'Live Support'}</h2>
        <small style={{color: mode === 'ai' ? 'green' : 'blue'}}>
          {mode === 'ai' ? 'AI Active (Type "admin" to switch)' : 'Connected to Admin'}
        </small>
      </div>
      
      <div style={styles.chatWindow}>
        {messages.map((msg, i) => (
          <div key={i} style={{...styles.message, ...(msg.role === 'user' ? styles.userMsg : (msg.role === 'admin' ? styles.adminMsg : styles.aiMsg))}}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
        <button type="submit" style={styles.button}>Send</button>
      </form>
    </div>
  );
};

export default SmartSupportChat;