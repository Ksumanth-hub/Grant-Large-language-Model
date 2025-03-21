# 🎯 Grant Eligibility & Proposal System 📝

A comprehensive tool to help users find grants they're eligible for and generate tailored grant proposals.

## ✨ Overview

This project is a web-based application that uses Retrieval Augmented Generation (RAG) to streamline the grant application process from discovery to submission. The system combines a vector database of grant information with AI-powered analysis to help users find relevant grants, determine eligibility, and create professional grant proposals.

## 🚀 Key Features

- **🔍 Grant Search**: Find relevant grants based on your search criteria using semantic search
- **✅ Eligibility Determination**: Get a clear breakdown of eligibility requirements for any grant
- **📄 Proposal Generation**: Create professionally structured grant proposals customized to specific grants and applicant types
- **🔒 Privacy Protection**: Generate proposals with placeholders for sensitive information
- **👥 Applicant Type Support**: Tailored experiences for both individual and organizational applicants

## 💻 Technology Stack

- **⚛️ Frontend**: React.js with a responsive UI
- **🐍 Backend**: Flask (Python) API
- **🧠 Vector Database**: FAISS for semantic search capabilities
- **🤗 Embeddings**: HuggingFace embeddings (all-MiniLM-L6-v2)
- **🦙 AI Generation**: Llama 3.2 model via Ollama for text generation
- **💾 Data Storage**: JSON and vector-based storage

## ⚙️ How It Works

1. **🗄️ Discovery**: Grant data is processed into vector embeddings and stored in a FAISS database
2. **🔎 Search**: Users can search for grants using natural language queries
3. **🔄 Matching**: The system finds semantically similar grants in the database
4. **📋 Eligibility**: For selected grants, the system analyzes and presents eligibility criteria
5. **📝 Proposal Creation**: Users input organization/project details in a structured form
6. **✨ Generation**: The system creates a complete, professionally formatted grant proposal document
7. **🛡️ Privacy Protection**: Sensitive information can be replaced with placeholders to be filled in later

## 🔒 Privacy Features

The system has been designed with privacy in mind:
- Personal information can be replaced with placeholders in generated proposals
- Sensitive data is only added to the final document by the user
- No personal information is passed through the AI model

## 🏁 Getting Started

1. Clone the repository
2. Install backend dependencies: `pip install -r requirements.txt`
3. Install frontend dependencies: `cd frontend && npm install`
4. Start the backend: `python app.py`
5. Start the frontend: `cd frontend && npm start`

## 📋 Requirements

- Python 3.8+
- Node.js 14+
- Ollama with Llama 3.2 model
- 8GB+ RAM recommended for optimal performance
