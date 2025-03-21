import React from 'react';
import './ResultsList.css';

function ResultsList({ results, onSelectGrant, selectedGrantId }) {
  if (results.length === 0) {
    return (
      <div className="results-list empty">
        <p>No grants found. Try a different search query.</p>
      </div>
    );
  }

  // Helper function to safely get CSS class for program status
  const getStatusClass = (status) => {
    if (!status) return 'unknown';
    return status.toLowerCase();
  };

  return (
    <div className="results-list">
      <h2>Found {results.length} Grants</h2>
      <div className="results-scrollable">
        {results.map((grant, index) => (
          <div 
            key={index} 
            className={`result-item ${selectedGrantId === grant.program_name ? 'selected' : ''}`}
            onClick={() => onSelectGrant(grant)}
          >
            <div className="result-header">
              <h3>{grant.program_name || 'Unnamed Grant'}</h3>
              {grant.program_status && (
                <span className={`status-badge ${getStatusClass(grant.program_status)}`}>
                  {grant.program_status}
                </span>
              )}
            </div>
            
            <div className="result-details">
              <p><strong>Location:</strong> {grant.location || 'N/A'}{grant.country ? `, ${grant.country}` : ''}</p>
              <p><strong>Industry:</strong> {grant.main_industry || 'N/A'}</p>
              <p><strong>Target:</strong> {grant.target_audience || 'N/A'}</p>
            </div>
            
            <div className="result-preview">
              <p>{grant.content_preview ? grant.content_preview.substring(0, 150) + '...' : 'No description available'}</p>
            </div>
            
            <div className="result-score">
              <span>Relevance: {Math.round((1 - grant.relevance_score) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsList;