import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/chat.css';

export default function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isOpen]);

  // Check for new messages when chat is closed
  useEffect(() => {
    if (isAuthenticated && !isOpen && user?.role !== 'admin') {
      const interval = setInterval(checkForNewMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isOpen, user]);

  const checkForNewMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/my-chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const currentCount = data.chat.messages?.length || 0;
        
        // Check if there are new messages
        if (currentCount > lastMessageCount && lastMessageCount > 0) {
          setHasNewMessages(true);
        }
        
        if (lastMessageCount === 0) {
          setLastMessageCount(currentCount);
        }
      }
    } catch (error) {
      console.error('Check new messages error:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/my-chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.chat.messages || []);
        setLastMessageCount(data.chat.messages?.length || 0);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.chat.messages);
        setNewMessage('');
        setLastMessageCount(data.chat.messages.length);
        toast.success('Message sent!', { duration: 1500 });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasNewMessages(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAuthenticated || user?.role === 'admin') {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-button ${isOpen ? 'active' : ''}`}
        onClick={() => isOpen ? setIsOpen(false) : handleOpenChat()}
        title="Chat with us"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && hasNewMessages && (
          <span className="chat-badge-dot"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🎓</div>
              <div>
                <h3>RKS Nexus Support</h3>
                <p className="chat-status">
                  <span className="status-dot"></span>
                  Online
                </p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">👋</div>
                <h4>Welcome to RKS Nexus!</h4>
                <p>How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`chat-message ${msg.isAdmin ? 'admin' : 'user'}`}
                >
                  <div className="message-content">
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !newMessage.trim()}>
              {loading ? '...' : '➤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
