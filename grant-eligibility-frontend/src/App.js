import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import EligibilityCheck from './components/EligibilityCheck';
import ProposalGenerator from './components/ProposalGenerator';
import ProposalEditor from './components/ProposalEditor';


function App() {
  // Steps: 1. Search, 2. Eligibility Check, 3. Proposal Generation, 4. Edit & Download
  const [currentStep, setCurrentStep] = useState(1);
  
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [eligibilityPoints, setEligibilityPoints] = useState('');
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [userInputs, setUserInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [grantType, setGrantType] = useState(null); // 'COMPANY' or 'INDIVIDUAL'

  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      setSearchResults(data.results || []);
      // Reset everything else when a new search is performed
      setSelectedGrant(null);
      setEligibilityPoints('');
      setGeneratedProposal('');
      setUserInputs({});
      setGrantType(null);
    } catch (error) {
      console.error('Error searching grants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGrant = async (grant) => {
    setSelectedGrant(grant);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grant_content: grant.full_content }),
      });
      
      const data = await response.json();
      
      // Store the eligibility points
      setEligibilityPoints(data.eligibility_points || '');
      
      // Store the grant type
      setGrantType(data.grant_type || 'COMPANY');
      
      // Move to eligibility step
      setCurrentStep(2);
    } catch (error) {
      console.error('Error getting eligibility requirements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEligibility = (isEligible) => {
    if (isEligible) {
      // If user confirms they're eligible, move to proposal generation step
      setCurrentStep(3);
    }
  };

  const handleUserInputChange = (fieldName, value) => {
    setUserInputs(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const generateProposal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate_proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          grant_content: selectedGrant.full_content,
          user_inputs: userInputs,
          grant_type: grantType
        }),
      });
      
      const data = await response.json();
      setGeneratedProposal(data.proposal || '');
      
      // Move to proposal editing step
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating proposal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProposal = (newProposal) => {
    setGeneratedProposal(newProposal);
  };

  const resetApplication = () => {
    setCurrentStep(1);
    setSelectedGrant(null);
    setEligibilityPoints('');
    setGeneratedProposal('');
    setUserInputs({});
    setGrantType(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: // Search & Select Grant
        return (
          <div className="search-step">
            <h2>Find Your Grant</h2>
            <SearchBar onSearch={handleSearch} />
            
            {isLoading ? (
              <div className="loading">Searching for grants...</div>
            ) : (
              <ResultsList 
                results={searchResults} 
                onSelectGrant={handleSelectGrant}
                selectedGrantId={selectedGrant?.program_name}
              />
            )}
          </div>
        );
        
      case 2: // Eligibility Check
        return (
          <div className="eligibility-step">
            <h2>Check Your Eligibility</h2>
            <div className="selected-grant-info">
              <h3>{selectedGrant.program_name}</h3>
              <span className={`status-badge ${selectedGrant.program_status?.toLowerCase() || 'unknown'}`}>
                {selectedGrant.program_status}
              </span>
            </div>
            
            {isLoading ? (
              <div className="loading">Loading eligibility requirements...</div>
            ) : (
              <EligibilityCheck 
                eligibilityPoints={eligibilityPoints}
                onConfirmEligibility={handleConfirmEligibility}
                onReset={resetApplication}
                grantInfo={selectedGrant}
                grantType={grantType}
              />
            )}
          </div>
        );
        
      case 3: // Proposal Generation
        return (
          <div className="proposal-gen-step">
            <h2>Generate Your Proposal</h2>
            <div className="selected-grant-info">
              <h3>{selectedGrant.program_name}</h3>
              <span className={`status-badge ${selectedGrant.program_status?.toLowerCase() || 'unknown'}`}>
                {selectedGrant.program_status}
              </span>
            </div>
            
            {isLoading ? (
              <div className="loading">Generating your proposal...</div>
            ) : (
              <ProposalGenerator 
                grantInfo={selectedGrant}
                userInputs={userInputs}
                onInputChange={handleUserInputChange}
                onGenerate={generateProposal}
                onBack={() => setCurrentStep(2)}
                grantType={grantType}
              />
            )}
          </div>
        );
        
      case 4: // Proposal Editing & Download
        return (
          <div className="proposal-edit-step">
            <h2>Review & Download Your Proposal</h2>
            <div className="selected-grant-info">
              <h3>{selectedGrant.program_name}</h3>
              <span className={`status-badge ${selectedGrant.program_status?.toLowerCase() || 'unknown'}`}>
                {selectedGrant.program_status}
              </span>
            </div>
            
            <ProposalEditor 
              proposal={generatedProposal}
              onUpdateProposal={updateProposal}
              onReset={resetApplication}
              onBack={() => setCurrentStep(3)}
              grantName={selectedGrant.program_name}
              grantType={grantType}
            />
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  // Progress bar calculation
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grant Proposal Wizard</h1>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          <div className="steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Search</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Eligibility</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Generate</div>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Edit & Download</div>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {renderCurrentStep()}
      </main>
      
      <footer>
        <p>© 2025 Grant Proposal Wizard | Powered by Ollama API</p>
      </footer>
    </div>
  );
}

export default App;