import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- REMOVED: import { jwtDecode } from 'jwt-decode'; ---
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const getToken = () => localStorage.getItem('token');

// --- ADDED: Helper function to replace jwt-decode ---
// This safely decodes the payload from a JWT token
const simpleJwtDecode = (token) => {
  try {
    const base64Url = token.split('.')[1]; // Get payload
    if (!base64Url) {
      throw new Error("Invalid JWT: No payload");
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null; // Return null if decoding fails
  }
};

// Styles
const styles = {
// ... (styles remain the same) ...
  chatContainer: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', width: '100%', maxWidth: '800px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  header: { padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1a202c' },
  statusText: { margin: 0, fontSize: '0.9rem', color: '#64748b' },
  adminButton: { padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', backgroundColor: '#1a202c', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  buttonDisabled: { backgroundColor: '#94a3b8', cursor: 'not-allowed' },
  messageArea: { flexGrow: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  message: { padding: '0.75rem 1.2rem', borderRadius: '18px', maxWidth: '75%', wordBreak: 'break-word', lineHeight: '1.5' },
  sender: { fontWeight: 'bold', marginRight: '0.5rem', fontSize: '0.8rem', color: '#333', marginBottom: '0.2rem' },
  myMessage: { backgroundColor: '#f0b900', color: '#1a202c', alignSelf: 'flex-end', borderBottomRightRadius: '4px', marginLeft: 'auto' },
  otherMessage: { backgroundColor: '#eef2f9', color: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' },
  aiMessage: { backgroundColor: '#f1f5f9', color: '#334155', alignSelf: 'flex-start', borderBottomLeftRadius: '4px', border: '1px solid #e2e8f0' },
  systemMessage: { alignSelf: 'center', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', margin: '0.5rem 0' },
  inputArea: { display: 'flex', padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  input: { flexGrow: 1, border: '1px solid #cbd5e0', borderRadius: '20px', padding: '0.75rem 1rem', marginRight: '0.5rem', fontSize: '1rem' },
  button: { border: 'none', borderRadius: '20px', padding: '0.75rem 1.5rem', backgroundColor: '#1a202c', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
};

// --- API Helper ---
const api = axios.create({ baseURL: 'http://localhost:5000/api/' });
api.interceptors.request.use((config) => {
  config.headers['x-auth-token'] = getToken();
  return config;
});

// --- Component ---
export const InquiryChatPage = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const messageAreaRef = useRef(null);

  // 1. Get current user
  useEffect(() => {
    const token = getToken();
    if (!token) {
        navigate('/login');
        return;
    }
    try {
      // --- MODIFIED: Use the helper function ---
      const decoded = simpleJwtDecode(token); 
      if (!decoded) {
          throw new Error("Failed to decode token");
      }
      setCurrentUser(decoded.user);
    } catch (err) { 
        console.error("Token decode error:", err);
        localStorage.removeItem('token'); // Clear bad token
        navigate('/login');
    }
  }, [navigate]);

  // 2. Fetch inquiry details and message history
  useEffect(() => {
// ... (rest of the component remains the same) ...
    if (!inquiryId || !currentUser) return;

    const setupChat = async () => {
      setLoading(true);
      try {
        const inquiryRes = await api.get(`inquiries/${inquiryId}`);
        setInquiry(inquiryRes.data);

        const messagesRes = await api.get(`inquiries/${inquiryId}/messages`);
        setMessages(messagesRes.data);

        // Join the socket room
        console.log(`Socket emitting join_inquiry_room for ${inquiryId}`);
        socket.emit('join_inquiry_room', inquiryId);
        
      } catch (err) {
        console.error("Error setting up chat:", err);
        if (err.response?.status === 403) alert("Access Denied");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    setupChat();
  }, [inquiryId, currentUser, navigate]);

  // 3. Listen for new messages and handoff events
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      console.log("Socket received 'receive_inquiry_message'", message);
      // Check if message is valid and has an inquiry ID
      if (message && message.inquiry === inquiryId) {
        setMessages((prev) => [...prev, message]);
      } else if (message) {
        console.warn("Received message for a different inquiry:", message.inquiry);
      }
    };
    
    const handleChatTakenOver = (updatedInquiry) => {
        console.log("Socket received 'chat_taken_over'", updatedInquiry);
        if (updatedInquiry && updatedInquiry._id === inquiryId) {
            setInquiry(updatedInquiry); // Update inquiry state (shows admin name)
            // Add a system message
            const sysMsg = { _id: Date.now(), senderType: 'system', content: `${updatedInquiry.assignedAdmin?.name || 'Admin'} has joined the chat.` };
            setMessages((prev) => [...prev, sysMsg]);
        }
    };

    socket.on('receive_inquiry_message', handleReceiveMessage);
    socket.on('chat_taken_over', handleChatTakenOver);

    return () => {
      console.log("Cleaning up socket listeners for InquiryChat");
      socket.off('receive_inquiry_message', handleReceiveMessage);
      socket.off('chat_taken_over', handleChatTakenOver);
    };
  }, [inquiryId]); // Only depends on inquiryId

  // 4. Auto-scroll
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 5. Handle Sending Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser && inquiry) {
      console.log("Socket emitting 'send_inquiry_message'");
      socket.emit('send_inquiry_message', {
        inquiryId: inquiry._id,
        senderId: currentUser.id,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  // 6. Handle Admin Takeover
  const handleTakeover = async () => {
    if (isTakingOver || inquiry?.chatState === 'admin') return;
    setIsTakingOver(true);
    try {
        await api.put(`inquiries/${inquiryId}/takeover`);
        // Socket event 'chat_taken_over' will update the state
    } catch (err) {
        console.error("Error taking over chat", err);
        alert("Failed to take over chat.");
    } finally {
        setIsTakingOver(false);
    }
  };

  // --- Render Logic ---
  if (loading) return <div>Loading chat...</div>;
  if (!inquiry || !currentUser) return <div>Could not load conversation.</div>;

  const isAdmin = currentUser.role === 'admin';
  const chatStatus = inquiry.chatState === 'ai' 
    ? "Chatting with AI Assistant" 
    : `Chatting with ${inquiry.assignedAdmin?.name || 'Admin'}`;

  // Render a single message
  const renderMessage = (msg) => {
    // Check for msg existence
    if (!msg || !msg._id) {
        console.warn("Invalid message object passed to renderMessage:", msg);
        return null; // Don't render invalid messages
    }
      
    // System message
    if (msg.senderType === 'system') {
        return <div key={msg._id} style={styles.systemMessage}>{msg.content}</div>;
    }

    let style = styles.otherMessage;
    let senderName = inquiry.client?.name || 'Client'; // Default to client name
    
    if (msg.senderType === 'ai') {
        style = styles.aiMessage;
        senderName = "AI Assistant";
    } else if (msg.sender && msg.sender._id === currentUser.id) {
        style = styles.myMessage;
        senderName = "You";
    } else if (msg.sender) { // Other user (admin or client)
        senderName = msg.sender.name;
    } else if (!msg.sender && msg.senderType === 'user') {
        // Fallback for user message with no sender (shouldn't happen)
        senderName = inquiry.client?.name || 'Client';
    }

    return (
        <div key={msg._id} style={{ ...styles.message, ...style }}>
            <div style={styles.sender}>{senderName}</div>
            {msg.content}
        </div>
    );
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <div>
            <h3 style={styles.headerTitle}>
                Inquiry: {inquiry.offeringType}
            </h3>
            <p style={styles.statusText}>
                {chatStatus}
            </p>
        </div>
        {isAdmin && inquiry.chatState === 'ai' && (
            <button 
                onClick={handleTakeover} 
                disabled={isTakingOver}
                style={{...styles.adminButton, ...(isTakingOver ? styles.buttonDisabled : {})}}
            >
                {isTakingOver ? "Taking over..." : "Take Over Chat"}
            </button>
        )}
      </div>

      <div style={styles.messageArea} ref={messageAreaRef}>
        {messages.map((msg) => renderMessage(msg))}
      </div>
      
      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.button} disabled={loading}>Send</button>
      </form>
    </div>
  );
};

