import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Establish connection outside the component to avoid re-creating it on re-renders
const socket = io('http://localhost:5000'); // Your backend URL

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    width: '100%',
    maxWidth: '600px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
  },
  messageArea: {
    flexGrow: 1,
    padding: '1rem',
    overflowY: 'auto',
    backgroundColor: '#f9f9f9',
  },
  message: {
    marginBottom: '0.8rem',
  },
  sender: {
    fontWeight: 'bold',
    marginRight: '0.5rem',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: '#888',
  },
  inputArea: {
    display: 'flex',
    padding: '0.5rem',
    borderTop: '1px solid #ccc',
  },
  input: {
    flexGrow: 1,
    border: '1px solid #ccc',
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
  },
  button: {
    border: 'none',
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
};

const Chat = ({ projectId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageAreaRef = useRef(null);

  useEffect(() => {
    // Join the project room when the component mounts
    socket.emit('join_project_room', projectId);

    // Listen for incoming messages
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off('receive_message');
    };
  }, [projectId]);
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        projectId,
        senderId: userId,
        content: newMessage,
      };
      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messageArea} ref={messageAreaRef}>
        {messages.map((msg) => (
          <div key={msg._id} style={styles.message}>
            <span style={styles.sender}>{msg.sender?.name || 'User'}:</span>
            <span>{msg.content}</span>
            <div style={styles.timestamp}>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send</button>
      </form>
    </div>
  );
};

export default Chat;
