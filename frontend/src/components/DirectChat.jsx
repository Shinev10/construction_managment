import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import authService from '../api/authService'; // Ensure this path is correct

const socket = io('http://localhost:5000');

const styles = {
  pageContainer: { padding: '2rem', height: 'calc(100vh - 80px)', display: 'flex', justifyContent: 'center', backgroundColor: '#f7fafc', fontFamily: 'system-ui, sans-serif' },
  chatContainer: { width: '100%', maxWidth: '800px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0' },
  header: { padding: '1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1a202c', margin: 0 },
  statusIndicator: { fontSize: '0.875rem', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  messagesArea: { flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f9fafb' },
  messageBubble: { maxWidth: '70%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', lineHeight: '1.5', position: 'relative' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#f0b900', color: '#1a202c', borderBottomRightRadius: '2px' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#374151', borderBottomLeftRadius: '2px' },
  senderName: { fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 'bold', opacity: 0.8 },
  inputArea: { padding: '1.5rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' },
  input: { flex: 1, padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  sendButton: { padding: '0 2rem', backgroundColor: '#1a202c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' },
};

export const DirectChatPage = () => {
  const { recipientId } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. Identify Current User
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.user);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // 2. Fetch Conversation ID & Join Room & Load History
  useEffect(() => {
    if (!currentUser) return; // Wait for current user to be loaded

    const initChat = async () => {
        try {
            // As Admin, we request chat with 'recipientId' (the Client)
            // As Client, 'recipientId' is likely undefined or irrelevant for startChat if using null
            const targetId = currentUser.role === 'admin' ? recipientId : null;
            
            // This API call gets the SHARED Conversation ID
            const res = await authService.startChat(targetId);
            
            if (res.data && res.data._id) {
                const convoId = res.data._id;
                setConversationId(convoId);
                console.log(`✅ Joining Room: ${convoId}`);
                socket.emit('join_dm_room', convoId);

                // --- NEW: Load Chat History ---
                try {
                    const history = await authService.getChatHistory(convoId);
                    setMessages(history.data);
                } catch (err) {
                    console.error("Failed to load history", err);
                }
            }
        } catch (error) {
            console.error("Failed to initialize chat room:", error);
        }
    };

    initChat();

    // Listen for messages
    const handleReceiveMessage = (message) => {
      console.log("📩 Received DM:", message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receive_dm', handleReceiveMessage);

    return () => {
      socket.off('receive_dm', handleReceiveMessage);
    };
  }, [currentUser, recipientId]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !conversationId) return;

    const messageData = {
      conversationId: conversationId, // Use the REAL MongoDB Conversation ID
      senderId: currentUser.id,
      content: newMessage,
    };

    // Optimistic UI Update
    const optimisticMessage = {
      _id: Date.now(),
      sender: { _id: currentUser.id, name: currentUser.name },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    
    // Emit to server
    socket.emit('send_dm', messageData);
    setNewMessage('');
  };

  if (!currentUser) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading chat...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Direct Message</h2>
            <span style={{fontSize: '0.9rem', color: '#718096'}}>
              Connected
            </span>
          </div>
          <div style={styles.statusIndicator}>
            <span style={{height: '10px', width: '10px', backgroundColor: '#059669', borderRadius: '50%'}}></span>
            Live
          </div>
        </div>

        <div style={styles.messagesArea}>
          {messages.length === 0 && (
            <div style={{textAlign: 'center', color: '#a0aec0', marginTop: '2rem'}}>
              Start the conversation...
            </div>
          )}
          {messages.map((msg, index) => {
            const isMe = msg.sender._id === currentUser.id;
            return (
              <div key={index} style={{...styles.messageBubble, ...(isMe ? styles.myMessage : styles.theirMessage)}}>
                {!isMe && <div style={styles.senderName}>{msg.sender.name || 'User'}</div>}
                {msg.content}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input
            type="text"
            style={styles.input}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" style={styles.sendButton}>Send</button>
        </form>
      </div>
    </div>
  );
};