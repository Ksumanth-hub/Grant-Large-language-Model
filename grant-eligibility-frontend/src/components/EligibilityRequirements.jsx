// EligibilityRequirements.jsx
import React from 'react';
import './EligibilityRequirements.css'; // You would need to create this CSS file

const EligibilityRequirements = ({ requirements }) => {
  return (
    <div className="eligibility-container">
      <h2 className="eligibility-title">Eligibility Requirements</h2>
      <p className="eligibility-subtitle">
        Please review the eligibility requirements below to determine if your organization qualifies for this grant.
      </p>
      
      <div className="requirements-list">
        {requirements.map((requirement, index) => (
          <div key={index} className="requirement-item">
            <div className="requirement-header">
              <div className="requirement-number">{index + 1}</div>
              <div className="requirement-content">{requirement}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EligibilityRequirements;