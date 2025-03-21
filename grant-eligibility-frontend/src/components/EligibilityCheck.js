import React, { useState } from 'react';
import './EligibilityCheck.css';

function EligibilityCheck({ 
  eligibilityPoints, 
  onConfirmEligibility, 
  onReset,
  grantInfo,
  grantType
}) {
  const [userConfirmation, setUserConfirmation] = useState(null);
  
  // Parse the bullet points from the text response
  const parseEligibilityPoints = (pointsText) => {
    if (!pointsText) return [];
    
    // Split by bullet points or numbers at the beginning of lines
    const regex = /[-•*]\s+|(?:\d+\.)\s+/;
    const lines = pointsText.split('\n').filter(line => line.trim());
    
    // Process each line to extract points
    return lines
      .filter(line => regex.test(line) || line.trim().length > 10) // Only keep lines that look like points
      .map((line, index) => ({
        id: index + 1,
        // Remove bullet point or number prefix
        text: line.replace(regex, '').trim()
      }));
  };
  
  const parsedPoints = parseEligibilityPoints(eligibilityPoints);
  
  const handleConfirmEligibility = (isEligible) => {
    setUserConfirmation(isEligible);
    // If confirmed eligible, move to the next step
    if (isEligible) {
      setTimeout(() => onConfirmEligibility(true), 1000);
    }
  };
  
  return (
    <div className="eligibility-check">
      <div className="grant-details-panel">
        <h3>Grant Details</h3>
        <div className="grant-details-content">
          <p><strong>Program Name:</strong> {grantInfo.program_name}</p>
          <p><strong>Location:</strong> {grantInfo.location}, {grantInfo.country}</p>
          <p><strong>Industry:</strong> {grantInfo.main_industry}</p>
          <p><strong>Target Audience:</strong> {grantInfo.target_audience}</p>
          
          <p className="grant-type">
            <strong>Grant Type:</strong> 
            <span className={`grant-type-badge ${grantType === 'COMPANY' ? 'company' : 'individual'}`}>
              {grantType === 'COMPANY' ? 'For Organizations' : 'For Individuals'}
            </span>
          </p>
          
          <div className="grant-description">
            <p><strong>Description:</strong></p>
            <p>{grantInfo.content_preview}</p>
          </div>
        </div>
      </div>
      
      {userConfirmation === null ? (
        <div className="eligibility-requirements">
          <div className="instructions">
            <h3>Eligibility Requirements</h3>
            <p>
              {grantType === 'COMPANY' ? 
                "Please review the eligibility requirements below to determine if your organization qualifies for this grant." : 
                "Please review the eligibility requirements below to determine if you qualify for this grant."
              }
            </p>
          </div>
          
          <div className="requirements-list">
            {parsedPoints.length > 0 ? (
              parsedPoints.map(point => (
                <div key={point.id} className="requirement-item">
                  <div className="point-number">{point.id}</div>
                  <div className="point-text">{point.text}</div>
                </div>
              ))
            ) : (
              <p className="no-requirements">No specific eligibility requirements could be extracted from the grant information.</p>
            )}
          </div>
          
          <div className="eligibility-confirmation">
            <p className="confirmation-question">
              {grantType === 'COMPANY' ? 
                "Based on the requirements above, does your organization meet all the eligibility criteria?" : 
                "Based on the requirements above, do you meet all the eligibility criteria?"
              }
            </p>
            
            <div className="confirmation-buttons">
              <button 
                className="confirm-yes-button"
                onClick={() => handleConfirmEligibility(true)}
              >
                Yes, I'm Eligible
              </button>
              <button 
                className="confirm-no-button"
                onClick={() => handleConfirmEligibility(false)}
              >
                No, I'm Not Eligible
              </button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="back-button" onClick={onReset}>
              Back to Search
            </button>
          </div>
        </div>
      ) : (
        <div className={`eligibility-result ${userConfirmation ? 'eligible' : 'not-eligible'}`}>
          {userConfirmation ? (
            <>
              <div className="result-icon success">✓</div>
              <h2>
                {grantType === 'COMPANY' ? 
                  "Great! You've confirmed your organization is eligible" : 
                  "Great! You've confirmed you're eligible"
                }
              </h2>
              <p>
                {grantType === 'COMPANY' ? 
                  "You've confirmed that your organization meets all the eligibility requirements for this grant. You can now proceed to generate a proposal." : 
                  "You've confirmed that you meet all the eligibility requirements for this grant. You can now proceed to generate a proposal."
                }
              </p>
              <div className="action-buttons">
                <button className="continue-button">
                  Continue to Proposal Generation
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="result-icon failure">✗</div>
              <h2>
                {grantType === 'COMPANY' ? 
                  "You've indicated your organization is not eligible" : 
                  "You've indicated you're not eligible"
                }
              </h2>
              <p>
                {grantType === 'COMPANY' ? 
                  "Based on your confirmation, your organization does not meet all the eligibility requirements for this grant. You may want to search for a different grant that better matches your organization's situation." : 
                  "Based on your confirmation, you do not meet all the eligibility requirements for this grant. You may want to search for a different grant that better matches your situation."
                }
              </p>
              <div className="action-buttons">
                <button className="back-button" onClick={onReset}>
                  Back to Search
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default EligibilityCheck;