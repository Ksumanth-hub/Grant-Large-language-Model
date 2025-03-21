# -*- coding: utf-8 -*-
"""
Grant Eligibility RAG System with Flask API - Updated with Proposal Generation
"""

import os
import json
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

# Initialize Flask app
app = Flask(__name__, static_folder='./build')
CORS(app)  # Enable CORS for all routes

# Constants for Ollama API
OLLAMA_API = "http://localhost:11434/api/chat"
HEADERS = {"Content-Type": "application/json"}
MODEL = "llama3.2"

# Path to your grants JSON file
grants_file = "grantss.json"

# Load grants data with error handling
def load_grants(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            content = re.sub(r'[\x00-\x1F\x7F]', '', content)
            grants = json.loads(content)
        return grants
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Error occurred near position {e.pos}")
        
        # Create a minimal sample to continue
        print("Creating a minimal sample to continue...")
        return [json.loads('''
        {
            "program_id": 1,
            "program_name": "Alberta Made Production Grant",
            "program_source": "Alberta Media Fund",
            "description": "Sample grant description",
            "program_status": "Closed",
            "main_industry": "Art Entertainment and Recreation",
            "location": "Alberta",
            "country": "Canada",
            "target_audience": "NGO, Educational Institution and Researcher, Senior"
        }
        ''')]

# Process grants and create documents
def process_grants(grants):
    documents = []
    for grant in grants:
        # Create a comprehensive text representation of the grant
        grant_text = f"""
        Program Name: {grant.get('program_name', '')}
        Program Source: {grant.get('program_source', '')}
        Program Type: {grant.get('program_type', '')}
        Program Target: {grant.get('program_target', '')}
        Description: {grant.get('description', '')}
        Program Status: {grant.get('program_status', '')}
        Main Industry: {grant.get('main_industry', '')}
        Location: {grant.get('location', '')}
        Country: {grant.get('country', '')}
        Min Employees: {grant.get('min_employees', '')}
        Max Employees: {grant.get('max_employees', '')}
        Min Revenue: {grant.get('min_revenue', '')}
        Max Revenue: {grant.get('max_revenue', '')}
        Target Audience: {grant.get('target_audience', '')}
        Open Date: {grant.get('open_date', '')}
        Close Date: {grant.get('close_date', '')}
        Min Funding: {grant.get('min_funding', '')}
        Max Funding: {grant.get('max_funding', '')}
        Amount: {grant.get('amount', '')}
        Unit: {grant.get('unit', '')}
        Selling Internationally: {grant.get('selling_internationally', '')}
        Incorporated: {grant.get('incorporated', '')}
        For Profit: {grant.get('for_profit', '')}
        Indigenous Group: {grant.get('indigenous_group', '')}
        URL: {grant.get('url', '')}
        """
        
        # Create a document with metadata
        doc = Document(
            page_content=grant_text,
            metadata={
                "program_id": grant.get('program_id', ''),
                "program_name": grant.get('program_name', ''),
                "program_status": grant.get('program_status', ''),
                "location": grant.get('location', ''),
                "country": grant.get('country', ''),
                "target_audience": grant.get('target_audience', ''),
                "main_industry": grant.get('main_industry', '')
            }
        )
        documents.append(doc)
    
    return documents

# Split documents into chunks for better retrieval
def split_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    docs = text_splitter.split_documents(documents)
    print(f'# of Grants: {len(documents)}')
    print(f'# of Document Chunks: {len(docs)}')
    return docs

# Create vector database from documents
def create_vector_db(docs):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db = FAISS.from_documents(docs, embeddings)
    return db

# Save FAISS index to disk
def save_faiss_index(db, index_path="grants_faiss_index"):
    print(f"Saving FAISS index to {index_path}...")
    db.save_local(index_path)
    print("Index saved successfully!")

# Load FAISS index from disk
def load_faiss_index(embeddings, index_path="grants_faiss_index"):
    try:
        if os.path.exists(index_path):
            print(f"Loading existing FAISS index from {index_path}...")
            # Add the allow_dangerous_deserialization parameter
            db = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
            print("Index loaded successfully!")
            return db
        else:
            print(f"No existing index found at {index_path}")
            return None
    except Exception as e:
        print(f"Error loading index: {e}")
        return None
    except Exception as e:
        print(f"Error loading index: {e}")
        return None

# Call Ollama API directly for text generation
def ollama_generate(prompt):
    messages = [
        {"role": "user", "content": prompt}
    ]
    
    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_API, json=payload, headers=HEADERS)
        return response.json()['message']['content']
    except Exception as e:
        print(f"Error calling Ollama API: {e}")
        return "Error generating response"

# Determine if a grant is intended for companies/organizations or individuals
def determine_grant_type(grant_content):
    """
    Use the LLM to determine if a grant is intended for companies/organizations 
    or for individuals based on its content.
    """
    prompt = f"""
    Analyze the grant information below and determine whether this grant is primarily intended for:
    1. Companies/Organizations
    2. Individuals
    
    Your response should be exactly one word: either "COMPANY" or "INDIVIDUAL".
    
    Grant Information:
    ------------------
    {grant_content}
    ------------------
    """
    
    response = ollama_generate(prompt).strip()
    
    # Normalize the response
    if "company" in response.lower() or "organization" in response.lower():
        return "COMPANY"
    elif "individual" in response.lower():
        return "INDIVIDUAL"
    else:
        # Default to company if unclear
        return "COMPANY"

# Generate eligibility questions for a grant using Ollama API
def extract_eligibility_points(grant_doc, grant_type):
    """
    Extract key eligibility requirements from grant information
    based on the grant type (company or individual).
    """
    if grant_type == "COMPANY":
        prompt = f"""
        You are a grant eligibility expert. Based on the grant information provided, extract the key eligibility requirements 
        that an ORGANIZATION must meet to qualify for this grant.
        
        Focus on extracting concrete eligibility criteria such as:
        - Company size/employee requirements
        - Revenue thresholds or limitations
        - Years in operation
        - Industry or sector requirements
        - Legal structure requirements (for-profit, non-profit, etc.)
        - Location or jurisdiction requirements
        - Previous funding history limitations
        - Any other specific eligibility criteria mentioned
        
        Format your response as a bulleted list of eligibility points. Each point should be clear and concise.
        If the grant information doesn't specify a particular criterion, don't include it.

        Grant Information
        ------------------
        {grant_doc.page_content}
        ------------------

        Key eligibility requirements for organizations:
        """
    else:  # INDIVIDUAL
        prompt = f"""
        You are a grant eligibility expert. Based on the grant information provided, extract the key eligibility requirements 
        that an INDIVIDUAL must meet to qualify for this grant.
        
        Focus on extracting concrete eligibility criteria such as:
        - Age requirements
        - Educational qualifications
        - Professional experience requirements
        - Residency or citizenship requirements
        - Income thresholds
        - Previous grant/funding history limitations
        - Portfolio or work samples requirements
        - Specific skills or credentials needed
        - Any other specific eligibility criteria mentioned
        
        Format your response as a bulleted list of eligibility points. Each point should be clear and concise.
        If the grant information doesn't specify a particular criterion, don't include it.

        Grant Information:
        ------------------
        {grant_doc.page_content}
        ------------------

        Key eligibility requirements for individuals:
        """
    
    return ollama_generate(prompt)

@app.route('/api/eligibility', methods=['POST'])
def get_eligibility_requirements():
    data = request.json
    grant_content = data.get('grant_content', '')

    if not grant_content:
        return jsonify({'error': 'No grant content provided'}), 400

    try:
        # Determine if the grant is for companies or individuals
        grant_type = determine_grant_type(grant_content)

        # Create a temporary document
        doc = Document(page_content=grant_content)

        # Extract eligibility points based on the grant type
        eligibility_points = extract_eligibility_points(doc, grant_type)

        return jsonify({
            'eligibility_points': eligibility_points,
            'grant_type': grant_type
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Generate a grant proposal based on user inputs
def generate_grant_proposal(grant_content, user_inputs, grant_type):
    """
    Generate a grant proposal tailored to either companies or individuals
    based on the grant type, using placeholders for sensitive information.
    """
    # Format user inputs into a readable structure with placeholders
    formatted_inputs = ""
    for key, value in user_inputs.items():
        # Convert camelCase to readable form
        readable_key = re.sub(r'([a-z])([A-Z])', r'\1 \2', key).title()
        
        # Check if this is potentially sensitive personal information
        sensitive_keys = ['name', 'email', 'phone', 'address', 'social', 'birth', 'sin', 'ssn', 
                         'personal', 'identity', 'passport', 'license', 'health']
        
        is_sensitive = any(s in key.lower() for s in sensitive_keys)
        
        # Use placeholder for sensitive information
        if is_sensitive:
            formatted_inputs += f"{readable_key}: [YOUR {readable_key.upper()} HERE]\n"
        else:
            formatted_inputs += f"{readable_key}: {value}\n"

    if grant_type == "COMPANY":
        prompt = f"""
        You are an expert grant writer specializing in COMPANY/ORGANIZATION grant proposals. Based on the grant information 
        and the organization's inputs, create a professional grant proposal tailored for an organizational applicant.
        
        Structure your proposal with these company-focused sections:
        1. Executive Summary
        2. Organization Background and Capability
        3. Project Description and Alignment with Grant Objectives
        4. Organizational Capacity and Resources
        5. Implementation Plan with Roles and Responsibilities
        6. Budget and Financial Sustainability
        7. Expected Outcomes and Impact Measurement
        8. Risk Management and Contingency Plans
        9. Conclusion
        
        IMPORTANT: For any sections requiring specific personal information (names, contact details, etc.), 
        use placeholders like [ORGANIZATION REPRESENTATIVE NAME], [CONTACT EMAIL], etc. instead of generating 
        fictional personal information.
        
        Emphasize organizational strengths, capacity, track record, and how the company's mission aligns with the grant's purpose.

        Grant Information:
        ------------------
        {grant_content}
        ------------------

        Organization Information:
        ------------------
        {formatted_inputs}
        ------------------

        Create a complete and professional company-focused grant proposal with appropriate placeholders for sensitive information:
        """
    else:  # INDIVIDUAL
        prompt = f"""
        You are an expert grant writer specializing in INDIVIDUAL grant proposals. Based on the grant information 
        and the individual's inputs, create a professional grant proposal tailored for an individual applicant.
        
        Structure your proposal with these individual-focused sections:
        1. Executive Summary
        2. Personal Background and Qualifications
        3. Project Description and Alignment with Grant Objectives
        4. Personal Capacity and Resources
        5. Implementation Plan with Timeline
        6. Budget and Financial Plan
        7. Expected Outcomes and Personal Growth
        8. Future Directions and Sustainability
        9. Conclusion
        
        IMPORTANT: For any sections requiring specific personal information (names, contact details, etc.), 
        use placeholders like [YOUR NAME], [YOUR EMAIL], [YOUR PHONE NUMBER], etc. instead of generating 
        fictional personal information.
        
        Emphasize personal qualifications, experiences, skills, and how the individual's goals align with the grant's purpose.

        Grant Information:
        ------------------
        {grant_content}
        ------------------

        Individual Information:
        ------------------
        {formatted_inputs}
        ------------------

        Create a complete and professional individual-focused grant proposal with appropriate placeholders for sensitive information:
        """
    
    return ollama_generate(prompt)

# Initialize the database at startup
def initialize_db():
    # Load the grants data
    print("Loading grants data...")
    grants = load_grants(grants_file)
    
    # Initialize embeddings
    print("Initializing embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Try to load existing index first
    db = load_faiss_index(embeddings)
    
    # If no index exists, create one
    if db is None:
        # Process grants into documents
        print("Processing grants into documents...")
        documents = process_grants(grants)
        
        # Split documents into chunks
        print("Splitting documents...")
        docs = split_documents(documents)
        
        # Create vector database
        print("Creating vector database...")
        db = create_vector_db(docs)
        
        # Save the index for future use
        save_faiss_index(db)
    
    return db, embeddings

# Initialize DB at startup
db, embeddings = initialize_db()

# API Routes
@app.route('/api/search', methods=['POST'])
def search_grants():
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    try:
        # Get relevant documents
        results_with_scores = db.similarity_search_with_score(query, k=3)
        
        # Format results
        formatted_results = []
        for i, (doc, score) in enumerate(results_with_scores):
            formatted_results.append({
                'program_name': doc.metadata.get('program_name', 'N/A'),
                'program_status': doc.metadata.get('program_status', 'N/A'),
                'location': doc.metadata.get('location', 'N/A'),
                'country': doc.metadata.get('country', 'N/A'),
                'main_industry': doc.metadata.get('main_industry', 'N/A'),
                'target_audience': doc.metadata.get('target_audience', 'N/A'),
                'content_preview': doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content,
                'relevance_score': float(score),
                'full_content': doc.page_content
            })
        
        return jsonify({'results': formatted_results})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions', methods=['POST'])
def get_eligibility_questions():
    data = request.json
    grant_content = data.get('grant_content', '')
    
    if not grant_content:
        return jsonify({'error': 'No grant content provided'}), 400
    
    try:
        # Determine if the grant is for companies or individuals
        grant_type = determine_grant_type(grant_content)
        
        # Create a temporary document
        doc = Document(page_content=grant_content)
        
        # Generate questions based on the grant type
        questions = generate_eligibility_questions(doc, grant_type)
        
        return jsonify({
            'questions': questions,
            'grant_type': grant_type
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/answer', methods=['POST'])
def get_eligibility_answer():
    data = request.json
    question = data.get('question', '')
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    try:
        # Get relevant documents for the question
        relevant_docs = db.similarity_search(question, k=3)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # Get answer
        answer = answer_eligibility_
        question(context, question)
        
        # Get metadata for relevant grants
        grants_data = []
        for doc in relevant_docs:
            grants_data.append({
                'program_name': doc.metadata.get('program_name', 'N/A'),
                'program_status': doc.metadata.get('program_status', 'N/A'),
                'location': doc.metadata.get('location', 'N/A'),
                'country': doc.metadata.get('country', 'N/A')
            })
        
        return jsonify({
            'answer': answer,
            'relevant_grants': grants_data
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate_proposal', methods=['POST'])
def get_proposal():
    data = request.json
    grant_content = data.get('grant_content', '')
    user_inputs = data.get('user_inputs', {})
    grant_type = data.get('grant_type', 'COMPANY')  # Default to company if not specified
    
    if not grant_content:
        return jsonify({'error': 'No grant content provided'}), 400
    
    if not user_inputs:
        return jsonify({'error': 'No user inputs provided'}), 400
    
    try:
        # Generate the proposal based on the grant type
        proposal = generate_grant_proposal(grant_content, user_inputs, grant_type)
        
        return jsonify({'proposal': proposal})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve React static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True, port=5000)