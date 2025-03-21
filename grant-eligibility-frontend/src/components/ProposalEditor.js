import React, { useState, useEffect } from 'react';
import './ProposalEditor.css';

function ProposalEditor({ proposal, onUpdateProposal, onReset, onBack, grantName }) {
  const [editedProposal, setEditedProposal] = useState(proposal);
  const [activeSection, setActiveSection] = useState('full');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    setEditedProposal(proposal);
  }, [proposal]);
  
  // Function to split the proposal into sections
  const extractSections = () => {
    // This is a simplified approach; in practice, you'd need more robust parsing
    const sections = {
      executiveSummary: '',
      organizationInfo: '',
      projectDescription: '',
      goals: '',
      methodology: '',
      timeline: '',
      budget: '',
      evaluation: '',
      sustainability: '',
      conclusion: ''
    };
    
    // Try to identify sections using common headings
    const lines = proposal.split('\n');
    let currentSection = 'executiveSummary'; // Default
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('executive summary') || lowerLine.includes('summary')) {
        currentSection = 'executiveSummary';
      } else if (lowerLine.includes('organization') || lowerLine.includes('about us')) {
        currentSection = 'organizationInfo';
      } else if (lowerLine.includes('project description') || lowerLine.includes('overview')) {
        currentSection = 'projectDescription';
      } else if (lowerLine.includes('goals') || lowerLine.includes('objectives')) {
        currentSection = 'goals';
      } else if (lowerLine.includes('methodology') || lowerLine.includes('approach')) {
        currentSection = 'methodology';
      } else if (lowerLine.includes('timeline') || lowerLine.includes('schedule')) {
        currentSection = 'timeline';
      } else if (lowerLine.includes('budget') || lowerLine.includes('financial')) {
        currentSection = 'budget';
      } else if (lowerLine.includes('evaluation') || lowerLine.includes('measuring')) {
        currentSection = 'evaluation';
      } else if (lowerLine.includes('sustainability') || lowerLine.includes('continuation')) {
        currentSection = 'sustainability';
      } else if (lowerLine.includes('conclusion')) {
        currentSection = 'conclusion';
      }
      
      sections[currentSection] += line + '\n';
    });
    
    return sections;
  };
  
  const sections = extractSections();
  
  const handleSectionChange = (e) => {
    setActiveSection(e.target.value);
  };
  
  const handleEditChange = (e) => {
    setEditedProposal(e.target.value);
  };
  
  const handleSectionEditChange = (e, sectionKey) => {
    const updatedSections = { ...sections };
    updatedSections[sectionKey] = e.target.value;
    
    // Rebuild the full proposal
    setEditedProposal(Object.values(updatedSections).join('\n'));
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate saving delay
    setTimeout(() => {
      onUpdateProposal(editedProposal);
      setIsSaving(false);
      setSaveMessage('Changes saved successfully!');
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }, 1000);
  };
  
  const handleDownload = () => {
    // Create a blob with the content
    const blob = new Blob([editedProposal], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${grantName.replace(/\s+/g, '-').toLowerCase()}-proposal.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadPDF = () => {
    // In a real application, you would use a library like jsPDF
    // or call a backend service to generate a PDF
    alert('PDF generation would be implemented with a library like jsPDF');
  };
  
  const handleDownloadDocx = () => {
    // In a real application, you would use a library like docx
    // or call a backend service to generate a DOCX file
    alert('DOCX generation would be implemented with a library or backend service');
  };
  
  // Define section titles for the dropdown
  const sectionTitles = {
    full: 'Full Proposal',
    executiveSummary: 'Executive Summary',
    organizationInfo: 'Organization Information',
    projectDescription: 'Project Description',
    goals: 'Goals & Objectives',
    methodology: 'Methodology/Approach',
    timeline: 'Timeline',
    budget: 'Budget',
    evaluation: 'Evaluation',
    sustainability: 'Sustainability',
    conclusion: 'Conclusion'
  };
  
  return (
    <div className="proposal-editor">
      <div className="editor-toolbar">
        <div className="section-selector">
          <label htmlFor="section-select">Edit Section:</label>
          <select 
            id="section-select" 
            value={activeSection} 
            onChange={handleSectionChange}
          >
            {Object.entries(sectionTitles).map(([key, title]) => (
              <option key={key} value={key}>{title}</option>
            ))}
          </select>
        </div>
        
        <div className="toolbar-actions">
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <div className="download-dropdown">
            <button className="download-button">Download ▼</button>
            <div className="download-options">
              <button onClick={handleDownload}>Text (.txt)</button>
              <button onClick={handleDownloadPDF}>PDF</button>
              <button onClick={handleDownloadDocx}>Word (.docx)</button>
            </div>
          </div>
        </div>
      </div>
      
      {saveMessage && (
        <div className="save-notification">
          {saveMessage}
        </div>
      )}
      
      <div className="editor-main">
        {activeSection === 'full' ? (
          <textarea
            className="proposal-textarea full"
            value={editedProposal}
            onChange={handleEditChange}
            placeholder="Your proposal will appear here. You can edit the text directly."
          />
        ) : (
          <div className="section-editor">
            <h3>{sectionTitles[activeSection]}</h3>
            <textarea
              className="proposal-textarea section"
              value={sections[activeSection]}
              onChange={(e) => handleSectionEditChange(e, activeSection)}
              placeholder={`Edit the ${sectionTitles[activeSection]} section here.`}
            />
          </div>
        )}
      </div>
      
      <div className="proposal-preview">
        <h3>Preview</h3>
        <div className="preview-content">
          {editedProposal.split('\n').map((line, i) => (
            line ? <p key={i}>{line}</p> : <br key={i} />
          ))}
        </div>
      </div>
      
      <div className="bottom-navigation">
        <button className="back-button" onClick={onBack}>
          Back to Proposal Generation
        </button>
        <button className="reset-button" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
}

export default ProposalEditor;