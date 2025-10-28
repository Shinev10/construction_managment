import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
// CORRECTED Import: Use the library name directly
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import axios from 'axios'; // Using axios for API calls

// Establish connection
const socket = io('http://localhost:5000'); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

// Helper to get token
const getToken = () => localStorage.getItem('token'); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

// Styles (you can customize these)
const styles = { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  chatContainer: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', width: '100%', maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  header: { padding: '1rem', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ccc' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  headerTitle: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  messageArea: { flexGrow: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f9f9f9' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  message: { marginBottom: '0.8rem', padding: '0.5rem 1rem', borderRadius: '18px', maxWidth: '75%', wordBreak: 'break-word' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  sender: { fontWeight: 'bold', marginRight: '0.5rem', fontSize: '0.8rem', color: '#333' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  myMessage: { backgroundColor: '#f0b900', color: '#1a202c', alignSelf: 'flex-end', borderBottomRightRadius: '4px', marginLeft: 'auto' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  otherMessage: { backgroundColor: '#eef2f9', color: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  inputArea: { display: 'flex', padding: '1rem', borderTop: '1px solid #ccc' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  input: { flexGrow: 1, border: '1px solid #ccc', borderRadius: '20px', padding: '0.75rem 1rem', marginRight: '0.5rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  button: { border: 'none', borderRadius: '20px', padding: '0.75rem 1.5rem', backgroundColor: '#1a202c', color: 'white', cursor: 'pointer', fontWeight: 'bold' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
};

const DirectChat = ({ recipientId }) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const [messages, setMessages] = useState([]); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const [newMessage, setNewMessage] = useState(''); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const [currentUser, setCurrentUser] = useState(null); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const [conversation, setConversation] = useState(null); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const [recipient, setRecipient] = useState(null); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const [loading, setLoading] = useState(true); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  const messageAreaRef = useRef(null); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

  // DEBUG: Log when component mounts
  useEffect(() => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      console.log("DirectChat mounted for recipientId:", recipientId); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  }, [recipientId]);


  useEffect(() => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    // 1. Get current user from token
    const token = getToken(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    if (token) { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      try {
        const decoded = jwtDecode(token); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        setCurrentUser(decoded.user); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        // DEBUG: Log current user
        console.log("Current user set:", decoded.user); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      } catch (err) { console.error("Token decode error:", err); } // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    }
  }, []);

  // 2. Get/Create conversation and fetch messages
  useEffect(() => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    if (!currentUser || !recipientId) return; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

    const setupChat = async () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      setLoading(true); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      const config = { headers: { 'x-auth-token': getToken() } }; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      // DEBUG: Log before API call
      console.log(`Setting up chat between ${currentUser.id} and ${recipientId}`); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

      try {
        // Get or create the conversation
        const convoRes = await axios.post( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          'http://localhost:5000/api/chat/conversation', // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          { recipientId }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          config // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        );
        const convo = convoRes.data; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        setConversation(convo); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        // DEBUG: Log conversation details
        console.log("Conversation details:", convo); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

        // Find the recipient's info from participants
        const otherUser = convo.participants.find(p => p._id === recipientId); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        setRecipient(otherUser); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        console.log("Recipient details:", otherUser); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

        // Fetch message history
        const messagesRes = await axios.get( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          `http://localhost:5000/api/chat/conversation/${convo._id}/messages`, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          config // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        );
        setMessages(messagesRes.data); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        console.log("Fetched messages:", messagesRes.data); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

        // Join the socket room
        console.log(`Emitting join_dm_room for conversationId: ${convo._id}`); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        socket.emit('join_dm_room', convo._id); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

      } catch (err) {
        console.error("Error setting up chat:", err); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      } finally {
        setLoading(false); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      }
    };

    setupChat(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  }, [currentUser, recipientId]);

  // 3. Listen for new messages
  useEffect(() => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    const handleReceiveDm = (message) => { // Define handler function // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        // DEBUG: Log received message and current conversation ID
        console.log("Received 'receive_dm' event:", message); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        console.log("Current conversation state ID:", conversation?._id); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

        // Only add if the message belongs to this conversation
        if (conversation && message.conversation === conversation._id) { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
            console.log("Message matches current conversation. Adding to state."); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
            setMessages((prevMessages) => [...prevMessages, message]); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        } else {
            console.log("Message does NOT match current conversation. Ignoring."); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        }
    };

    socket.on('receive_dm', handleReceiveDm); // Use the handler // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

    // Cleanup function
    return () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        console.log("Cleaning up 'receive_dm' listener."); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        socket.off('receive_dm', handleReceiveDm); // Use the same handler function reference // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    };
  }, [conversation]); // Re-run if conversation changes // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

  // 4. Auto-scroll
  useEffect(() => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    if (messageAreaRef.current) { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    }
  }, [messages]);

  const handleSendMessage = (e) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    e.preventDefault(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    if (newMessage.trim() && currentUser && conversation) { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      const messageData = { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        conversationId: conversation._id, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        senderId: currentUser.id, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        content: newMessage, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      };
      // DEBUG: Log message being sent
      console.log("Sending 'send_dm' event with data:", messageData); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      socket.emit('send_dm', messageData); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
      setNewMessage(''); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    }
  };

  if (loading) return <div>Loading chat...</div>; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
  if (!recipient) return <div>Could not find user to chat with.</div>; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

  return ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>Chat with {recipient.name} ({recipient.role})</h3>
      </div>
      <div style={styles.messageArea} ref={messageAreaRef}>
        {messages.map((msg) => ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          <div 
            key={msg._id} 
            style={{
              ...styles.message,
              ...(msg.sender._id === currentUser.id ? styles.myMessage : styles.otherMessage) // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
            }}
          >
            <div style={styles.sender}>
              {msg.sender._id === currentUser.id ? 'You' : msg.sender.name}
            </div>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)} // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
          placeholder="Type a message..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send</button>
      </form>
    </div>
  );
};

// A new page component to host the chat
export const DirectChatPage = () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    const { recipientId } = useParams(); // Get recipient ID from URL // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    if (!recipientId) return <div>No recipient specified.</div>; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

    // This component assumes it's rendered inside ProtectedLayout
    return ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
        <DirectChat recipientId={recipientId} /> // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]
    );
};

export default DirectChat; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/components/DirectChat.jsx]

