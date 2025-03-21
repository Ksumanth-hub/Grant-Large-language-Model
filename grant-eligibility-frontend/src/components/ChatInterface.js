import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your grant eligibility assistant. Tell me about your organization and what kind of funding you're looking for, and I'll help you find potential grants you might be eligible for."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relatedGrants, setRelatedGrants] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.text }),
      });
      
      const data = await response.json();
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.answer || "I'm sorry, I couldn't find any relevant information."
      };
      
      setMessages(prev => [...prev, botMessage]);
      setRelatedGrants(data.relevant_grants || []);
    } catch (error) {
      console.error('Error getting answer:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm sorry, there was an error processing your request. Please try again later."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "I'm an indigenous artist in Alberta looking for funding for a film project",
    "Our tech startup in Ontario needs R&D funding for AI development",
    "I run a small bakery affected by COVID-19 and need help with recovery",
    "We're a non-profit organization focused on environmental conservation"
  ];

  const handleExampleClick = (question) => {
    setInput(question);
  };

  return (
    <div className="chat-container">
      <div className="chat-main">
        <div className="messages-container">
          <div className="messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your organization and funding needs..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
          
          <div className="example-questions">
            <p>Try asking:</p>
            <div className="examples">
              {exampleQuestions.map((question, index) => (
                <button 
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className="example-button"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {relatedGrants.length > 0 && (
          <div className="related-grants">
            <h3>Related Grants</h3>
            <div className="grants-list">
              {relatedGrants.map((grant, index) => (
                <div key={index} className="related-grant-item">
                  <h4>{grant.program_name}</h4>
                  <span className={`status-badge ${grant.program_status.toLowerCase()}`}>
                    {grant.program_status}
                  </span>
                  <p>{grant.location}, {grant.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;