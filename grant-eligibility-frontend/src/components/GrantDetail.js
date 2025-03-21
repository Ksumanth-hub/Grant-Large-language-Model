import React, { useState } from 'react';
import './GrantDetail.css';

function GrantDetail({ grant, eligibilityQuestions }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!grant) {
    return null;
  }

  const formatContent = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const parts = line.split(':');
      
      if (parts.length > 1) {
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        
        if (value) {
          return (
            <div key={index} className="detail-item">
              <span className="detail-label">{label}:</span>
              <span className="detail-value">{value}</span>
            </div>
          );
        }
      }
      
      return <p key={index}>{line.trim()}</p>;
    });
  };

  const formatQuestions = (questionsText) => {
    if (!questionsText) return <p>No eligibility questions available.</p>;
    
    // Split by numbers (1. 2. 3. etc) and filter empty lines
    const questions = questionsText.split(/\d+\./).filter(q => q.trim());
    
    if (questions.length === 0) {
      // If splitting didn't work, just split by newlines
      return questionsText.split('\n').filter(q => q.trim()).map((q, i) => (
        <div key={i} className="question-item">
          <p>{q}</p>
        </div>
      ));
    }
    
    return questions.map((question, index) => (
      <div key={index} className="question-item">
        <span className="question-number">{index + 1}.</span>
        <p>{question.trim()}</p>
      </div>
    ));
  };

  return (
    <div className="grant-detail">
      <div className="grant-header">
        <h2>{grant.program_name}</h2>
        <span className={`status-badge ${grant.program_status.toLowerCase()}`}>
          {grant.program_status}
        </span>
      </div>
      
      <div className="tabs">
        <button 
          className={activeTab === 'details' ? 'active' : ''} 
          onClick={() => setActiveTab('details')}
        >
          Grant Details
        </button>
        <button 
          className={activeTab === 'eligibility' ? 'active' : ''} 
          onClick={() => setActiveTab('eligibility')}
        >
          Eligibility Questions
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'details' ? (
          <div className="grant-details">
            {formatContent(grant.full_content)}
          </div>
        ) : (
          <div className="eligibility-questions">
            <h3>Check Your Eligibility</h3>
            <p className="tip">
              Answer these questions to determine if you're likely eligible for this grant.
            </p>
            <div className="questions-list">
              {formatQuestions(eligibilityQuestions)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GrantDetail;