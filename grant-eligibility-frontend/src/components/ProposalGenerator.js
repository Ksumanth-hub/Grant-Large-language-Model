import React, { useState, useEffect } from 'react';
import './ProposalGenerator.css';

function ProposalGenerator({ 
  grantInfo, 
  userInputs, 
  onInputChange, 
  onGenerate, 
  onBack,
  grantType  // New prop
}) {
  const [currentSection, setCurrentSection] = useState('');
  
  // Define the sections and their fields based on grant type
  const companySections = {
    organization: {
      title: 'Organization Information',
      fields: [
        { 
          id: 'orgName', 
          label: 'Organization Name',
          type: 'text',
          placeholder: 'Will appear as [ORGANIZATION NAME] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'orgType', 
          label: 'Organization Type',
          type: 'select',
          options: [
            'For-profit Business',
            'Non-profit Organization',
            'Educational Institution',
            'Government Entity',
            'Research Institution',
            'Other'
          ],
          placeholder: 'Select organization type',
          usePlaceholder: false
        },
        { 
          id: 'orgDescription', 
          label: 'Organization Description',
          type: 'textarea',
          placeholder: 'Will appear as [ORGANIZATION DESCRIPTION] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'yearEstablished', 
          label: 'Year Established',
          type: 'number',
          placeholder: 'e.g., 2010',
          usePlaceholder: false
        },
        { 
          id: 'numEmployees', 
          label: 'Number of Employees',
          type: 'number',
          placeholder: 'Enter the number of people in your organization',
          usePlaceholder: false
        },
        { 
          id: 'annualRevenue', 
          label: 'Annual Revenue (in local currency)',
          type: 'number',
          placeholder: 'Will appear as [ANNUAL REVENUE] in proposal',
          usePlaceholder: true
        }
      ]
    },
    project: {
      title: 'Project Information',
      fields: [
        { 
          id: 'projectTitle', 
          label: 'Project Title',
          type: 'text',
          placeholder: 'Enter a concise title for your project',
          usePlaceholder: false
        },
        { 
          id: 'projectSummary', 
          label: 'Project Summary',
          type: 'textarea',
          placeholder: 'Provide a brief overview of your project (100-200 words)',
          usePlaceholder: false
        },
        { 
          id: 'projectGoals', 
          label: 'Project Goals & Objectives',
          type: 'textarea',
          placeholder: 'List the main goals and objectives of your project',
          usePlaceholder: false
        },
        { 
          id: 'projectDuration', 
          label: 'Project Duration (months)',
          type: 'number',
          placeholder: 'e.g., 12',
          usePlaceholder: false
        },
        { 
          id: 'projectAlignment', 
          label: 'Alignment with Organization Mission',
          type: 'textarea',
          placeholder: 'Explain how this project aligns with your organization\'s mission and strategic goals',
          usePlaceholder: false
        }
      ]
    },
    capacity: {
      title: 'Organizational Capacity',
      fields: [
        { 
          id: 'teamDescription', 
          label: 'Project Team Description',
          type: 'textarea',
          placeholder: 'Will appear as [PROJECT TEAM DESCRIPTION] in proposal',
          usePlaceholder: true 
        },
        { 
          id: 'pastExperience', 
          label: 'Relevant Past Experience',
          type: 'textarea',
          placeholder: 'Describe your organization\'s experience with similar projects or in this field',
          usePlaceholder: false
        },
        { 
          id: 'partnerships', 
          label: 'Partnerships & Collaborations',
          type: 'textarea',
          placeholder: 'List any partners or collaborators for this project and their roles',
          usePlaceholder: false
        },
        { 
          id: 'facilities', 
          label: 'Facilities & Resources',
          type: 'textarea',
          placeholder: 'Describe the facilities, equipment, and resources your organization will use for this project',
          usePlaceholder: false
        }
      ]
    },
    budget: {
      title: 'Budget Information',
      fields: [
        { 
          id: 'totalBudget', 
          label: 'Total Budget Required (in local currency)',
          type: 'number',
          placeholder: 'e.g., 50000',
          usePlaceholder: false
        },
        { 
          id: 'amountRequested', 
          label: 'Amount Requested from this Grant',
          type: 'number',
          placeholder: 'e.g., 25000',
          usePlaceholder: false
        },
        { 
          id: 'otherFunding', 
          label: 'Other Funding Sources',
          type: 'textarea',
          placeholder: 'Will appear as [OTHER FUNDING SOURCES] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'budgetBreakdown', 
          label: 'Budget Breakdown',
          type: 'textarea',
          placeholder: 'Will appear as [BUDGET BREAKDOWN] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'financialSustainability', 
          label: 'Financial Sustainability Plan',
          type: 'textarea',
          placeholder: 'Explain how the project will be financially sustained after the grant period',
          usePlaceholder: false
        }
      ]
    },
    impact: {
      title: 'Impact & Outcomes',
      fields: [
        { 
          id: 'expectedOutcomes', 
          label: 'Expected Outcomes',
          type: 'textarea',
          placeholder: 'What specific outcomes do you expect from this project?',
          usePlaceholder: false
        },
        { 
          id: 'beneficiaries', 
          label: 'Beneficiaries',
          type: 'textarea',
          placeholder: 'Who will benefit from this project and how?',
          usePlaceholder: false
        },
        { 
          id: 'impactMeasurement', 
          label: 'Impact Measurement',
          type: 'textarea',
          placeholder: 'Describe how you will measure the impact of your project',
          usePlaceholder: false
        },
        { 
          id: 'riskManagement', 
          label: 'Risk Management',
          type: 'textarea',
          placeholder: 'Identify potential risks and how you plan to mitigate them',
          usePlaceholder: false
        },
        { 
          id: 'additionalInfo', 
          label: 'Additional Information',
          type: 'textarea',
          placeholder: 'Any other relevant information you want to include in your proposal',
          usePlaceholder: false
        }
      ]
    }
  };
  
  const individualSections = {
    personal: {
      title: 'Personal Information',
      fields: [
        { 
          id: 'fullName', 
          label: 'Full Name',
          type: 'text',
          placeholder: 'Will appear as [YOUR NAME] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'profession', 
          label: 'Profession/Occupation',
          type: 'text',
          placeholder: 'Will appear as [YOUR PROFESSION] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'biography', 
          label: 'Professional Biography',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR PROFESSIONAL BIOGRAPHY] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'education', 
          label: 'Educational Background',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR EDUCATIONAL BACKGROUND] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'relevantExperience', 
          label: 'Relevant Experience',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR RELEVANT EXPERIENCE] in proposal',
          usePlaceholder: true
        }
      ]
    },
    project: {
      title: 'Project Information',
      fields: [
        { 
          id: 'projectTitle', 
          label: 'Project Title',
          type: 'text',
          placeholder: 'Enter a concise title for your project',
          usePlaceholder: false
        },
        { 
          id: 'projectSummary', 
          label: 'Project Summary',
          type: 'textarea',
          placeholder: 'Provide a brief overview of your project (100-200 words)',
          usePlaceholder: false
        },
        { 
          id: 'projectGoals', 
          label: 'Project Goals & Objectives',
          type: 'textarea',
          placeholder: 'List the main goals and objectives of your project',
          usePlaceholder: false
        },
        { 
          id: 'projectDuration', 
          label: 'Project Duration (months)',
          type: 'number',
          placeholder: 'e.g., 12',
          usePlaceholder: false
        },
        { 
          id: 'personalMotivation', 
          label: 'Personal Motivation',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR PERSONAL MOTIVATION] in proposal',
          usePlaceholder: true
        }
      ]
    },
    skills: {
      title: 'Skills & Resources',
      fields: [
        { 
          id: 'relevantSkills', 
          label: 'Relevant Skills',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR RELEVANT SKILLS] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'collaborators', 
          label: 'Collaborators (if any)',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR COLLABORATORS] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'facilities', 
          label: 'Facilities & Resources',
          type: 'textarea',
          placeholder: 'Describe the facilities, equipment, and resources you have access to for this project',
          usePlaceholder: false
        },
        { 
          id: 'timeCommitment', 
          label: 'Time Commitment',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR TIME COMMITMENT] in proposal',
          usePlaceholder: true
        }
      ]
    },
    budget: {
      title: 'Budget Information',
      fields: [
        { 
          id: 'totalBudget', 
          label: 'Total Budget Required (in local currency)',
          type: 'number',
          placeholder: 'e.g., 20000',
          usePlaceholder: false
        },
        { 
          id: 'amountRequested', 
          label: 'Amount Requested from this Grant',
          type: 'number',
          placeholder: 'e.g., 15000',
          usePlaceholder: false
        },
        { 
          id: 'personalContribution', 
          label: 'Personal Contribution',
          type: 'number',
          placeholder: 'Will appear as [YOUR PERSONAL CONTRIBUTION] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'otherFunding', 
          label: 'Other Funding Sources',
          type: 'textarea',
          placeholder: 'Will appear as [OTHER FUNDING SOURCES] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'budgetBreakdown', 
          label: 'Budget Breakdown',
          type: 'textarea',
          placeholder: 'Will appear as [BUDGET BREAKDOWN] in proposal',
          usePlaceholder: true
        }
      ]
    },
    impact: {
      title: 'Impact & Outcomes',
      fields: [
        { 
          id: 'expectedOutcomes', 
          label: 'Expected Outcomes',
          type: 'textarea',
          placeholder: 'What specific outcomes do you expect from this project?',
          usePlaceholder: false
        },
        { 
          id: 'personalGrowth', 
          label: 'Personal Growth',
          type: 'textarea',
          placeholder: 'Will appear as [YOUR PERSONAL GROWTH GOALS] in proposal',
          usePlaceholder: true
        },
        { 
          id: 'communityBenefit', 
          label: 'Benefit to Community',
          type: 'textarea',
          placeholder: 'How will your project benefit your community or field?',
          usePlaceholder: false
        },
        { 
          id: 'futureDirections', 
          label: 'Future Directions',
          type: 'textarea',
          placeholder: 'Describe your plans for continuing or expanding this work after the grant period',
          usePlaceholder: false
        },
        { 
          id: 'additionalInfo', 
          label: 'Additional Information',
          type: 'textarea',
          placeholder: 'Any other relevant information you want to include in your proposal',
          usePlaceholder: false
        }
      ]
    }
  };
  
  // Use different starting sections based on grant type
  useEffect(() => {
    // Default to company type if grantType is null or undefined
    const type = grantType || 'COMPANY';
    
    if (type === 'COMPANY') {
      setCurrentSection('organization');
    } else {
      setCurrentSection('personal');
    }
  }, [grantType]);
  
  // Select the appropriate sections based on grant type
  const sections = (grantType === 'INDIVIDUAL') ? individualSections : companySections;
  
  // Custom Privacy Notice Component
  const PrivacyNoticeComponent = () => (
    <div className="placeholder-notice">
      <div className="notice-content">
        <h4>Privacy-Focused Proposal Generation</h4>
        <p>
          <span className="notice-icon">🔒</span> Fields with a <span className="highlight-text">blue background</span> are privacy-protected. 
          You can leave these empty and the system will include appropriate placeholders in your proposal.
          This allows you to add sensitive information directly to the document after it's generated.
        </p>
      </div>
    </div>
  );
  
  // Helper function to render form fields with improved placeholder display
  const renderField = (field) => {
    // Create cleaner field note for placeholder fields
    const fieldNote = field.usePlaceholder ? (
      <div className="field-note">
        <span className="placeholder-icon">ℹ️</span> This field will appear as <strong>{field.placeholder.match(/\[([^\]]+)\]/)?.[0] || "placeholder"}</strong> in your proposal if left empty
      </div>
    ) : null;

    // Improve the placeholder text formatting to be more concise
    const getPlaceholder = () => {
      if (field.usePlaceholder) {
        // Extract just the placeholder text for a cleaner input field
        const placeholderMatch = field.placeholder.match(/\[([^\]]+)\]/);
        return placeholderMatch ? `Enter or leave empty for [${placeholderMatch[1]}]` : field.placeholder;
      }
      return field.placeholder;
    };

    switch(field.type) {
      case 'textarea':
        return (
          <>
            <textarea
              id={field.id}
              value={userInputs[field.id] || ''}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              placeholder={getPlaceholder()}
              rows={5}
              className={field.usePlaceholder ? 'placeholder-field' : ''}
            />
            {fieldNote}
          </>
        );
      case 'select':
        return (
          <>
            <select
              id={field.id}
              value={userInputs[field.id] || ''}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              className={field.usePlaceholder ? 'placeholder-field' : ''}
            >
              <option value="">-- Select --</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {fieldNote}
          </>
        );
      default: // text, number, etc.
        return (
          <>
            <input
              type={field.type}
              id={field.id}
              value={userInputs[field.id] || ''}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              placeholder={getPlaceholder()}
              className={field.usePlaceholder ? 'placeholder-field' : ''}
            />
            {fieldNote}
          </>
        );
    }
  };
  
  // Check if current section is complete - modified to skip placeholder fields
  const isSectionComplete = (sectionId) => {
    if (!sections[sectionId]) return false;
    
    const section = sections[sectionId];
    return section.fields.every(field => 
      // If it's a placeholder field, it's always considered "complete"
      field.usePlaceholder || 
      (userInputs[field.id] && userInputs[field.id].toString().trim() !== '')
    );
  };
  
  // Check if all sections are complete
  const isFormComplete = () => {
    return Object.keys(sections).every(sectionId => isSectionComplete(sectionId));
  };
  
  // Handle section navigation
  const goToNextSection = () => {
    const sectionKeys = Object.keys(sections);
    const currentIndex = sectionKeys.indexOf(currentSection);
    if (currentIndex < sectionKeys.length - 1) {
      setCurrentSection(sectionKeys[currentIndex + 1]);
    }
  };
  
  const goToPrevSection = () => {
    const sectionKeys = Object.keys(sections);
    const currentIndex = sectionKeys.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sectionKeys[currentIndex - 1]);
    }
  };

  // Prepare data for submission - add placeholders for empty fields that should use placeholders
  const prepareDataForSubmission = () => {
    const preparedData = {...userInputs};
    
    // Go through all sections and fields
    Object.values(sections).forEach(section => {
      section.fields.forEach(field => {
        // If it's a placeholder field and it's empty, add a placeholder marker
        if (field.usePlaceholder && (!preparedData[field.id] || preparedData[field.id].trim() === '')) {
          // Extract the placeholder text from the field's placeholder attribute
          const placeholderMatch = field.placeholder.match(/\[([^\]]+)\]/);
          const placeholderText = placeholderMatch ? placeholderMatch[0] : `[PLACEHOLDER_${field.id.toUpperCase()}]`;
          preparedData[field.id] = placeholderText;
        }
      });
    });
    
    return preparedData;
  };

  // Handle generate button click
  const handleGenerate = () => {
    const preparedData = prepareDataForSubmission();
    onGenerate(preparedData);
  };

  // Safety check - if currentSection is not valid, set it to the first section
  useEffect(() => {
    if (currentSection === '' || !sections[currentSection]) {
      // Set to first section if current is invalid
      const firstSectionKey = Object.keys(sections)[0];
      if (firstSectionKey) {
        setCurrentSection(firstSectionKey);
      }
    }
  }, [currentSection, sections]);
  
  // If sections or currentSection is not ready yet, show loading state
  if (!sections || Object.keys(sections).length === 0 || !currentSection || !sections[currentSection]) {
    return <div className="loading">Loading form...</div>;
  }
  
  return (
    <div className="proposal-generator">
      <PrivacyNoticeComponent />
      
      <div className="grant-type-indicator">
        <span className={`grant-type-badge ${grantType === 'INDIVIDUAL' ? 'individual' : 'company'}`}>
          {grantType === 'INDIVIDUAL' ? 'Individual Grant' : 'Organization Grant'}
        </span>
      </div>
      
      <div className="section-tabs">
        {Object.entries(sections).map(([sectionId, section]) => (
          <button
            key={sectionId}
            className={`section-tab ${currentSection === sectionId ? 'active' : ''} ${isSectionComplete(sectionId) ? 'complete' : ''}`}
            onClick={() => setCurrentSection(sectionId)}
          >
            {section.title}
            {isSectionComplete(sectionId) && <span className="complete-check">✓</span>}
          </button>
        ))}
      </div>
      
      <div className="grant-context">
        <div className="grant-context-header">
          <h3>Generating Proposal For:</h3>
          <div className="grant-name">{grantInfo.program_name}</div>
        </div>
        <div className="grant-tips">
          <h4>Tailoring Tips</h4>
          <ul>
            <li>Focus on outcomes relevant to {grantInfo.main_industry || 'your industry'}</li>
            <li>Target audience should align with: {grantInfo.target_audience || 'the grant requirements'}</li>
            <li>Be specific about how your {grantType === 'INDIVIDUAL' ? 'project' : 'organization'} benefits {grantInfo.location || 'the target location'}</li>
            {grantType === 'INDIVIDUAL' ? (
              <li>Personal information will be represented by placeholders in the proposal</li>
            ) : (
              <li>Organization-specific details will use placeholders where indicated</li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="form-section">
        <h3>{sections[currentSection].title}</h3>
        
        <div className="form-fields">
          {sections[currentSection].fields.map(field => (
            <div key={field.id} className={`form-field ${field.usePlaceholder ? 'placeholder-enabled' : ''}`}>
              <label htmlFor={field.id}>
                {field.label}
                {field.usePlaceholder && <span className="optional-marker"> (optional)</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
        
        <div className="section-navigation">
          {currentSection !== Object.keys(sections)[0] && (
            <button 
              className="prev-button"
              onClick={goToPrevSection}
            >
              Previous
            </button>
          )}
          
          {currentSection !== Object.keys(sections)[Object.keys(sections).length - 1] ? (
            <button 
              className="next-button"
              onClick={goToNextSection}
              disabled={!isSectionComplete(currentSection)}
            >
              Next
            </button>
          ) : (
            <button 
              className="generate-button"
              onClick={handleGenerate}
              disabled={!isFormComplete()}
            >
              Generate Proposal
            </button>
          )}
        </div>
      </div>
      
      <div className="bottom-navigation">
        <button className="back-button" onClick={onBack}>
          Back to Eligibility Check
        </button>
        
        <div className="completion-status">
          <div className="completion-bar">
            <div 
              className="completion-progress" 
              style={{ 
                width: `${Object.keys(sections).filter(s => isSectionComplete(s)).length / Object.keys(sections).length * 100}%` 
              }}
            ></div>
          </div>
          <span className="completion-text">
            {Object.keys(sections).filter(s => isSectionComplete(s)).length} of {Object.keys(sections).length} sections complete
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProposalGenerator;