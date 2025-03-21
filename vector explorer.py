from flask import Flask, request, jsonify, send_from_directory
import os
import numpy as np
import faiss
import pickle
import json
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to your FAISS index
INDEX_PATH = "grants_faiss_index"

# HTML content for the frontend
HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grant Vector Database Explorer</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        h1, h2, h3 {
            color: #1a73e8;
        }
        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        input, button, select {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background-color: #1a73e8;
            color: white;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #0d5bdd;
        }
        .vector-display {
            overflow-x: auto;
            margin-top: 10px;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
        }
        .visualization {
            height: 400px;
            margin-top: 20px;
        }
        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            padding: 15px;
            margin-bottom: 15px;
        }
        .metadata {
            background-color: #f0f7ff;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .vector-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 5px;
        }
        .vector-cell {
            background: #e9ecef;
            padding: 5px;
            border-radius: 3px;
            text-align: center;
            font-size: 11px;
        }
        .search-results {
            margin-top: 20px;
        }
        .slider-container {
            margin: 20px 0;
        }
        .error {
            color: #d32f2f;
            padding: 10px;
            background: #ffebee;
            border-radius: 4px;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border: 1px solid transparent;
        }
        .tab.active {
            border: 1px solid #ddd;
            border-bottom: 1px solid white;
            border-radius: 4px 4px 0 0;
            margin-bottom: -1px;
            background: white;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <h1>Grant Vector Database Explorer</h1>
    
    <div class="tabs">
        <div class="tab active" data-tab="upload">Upload & Process</div>
        <div class="tab" data-tab="explore">Explore Vectors</div>
        <div class="tab" data-tab="search">Semantic Search</div>
        <div class="tab" data-tab="visualize">Visualize</div>
    </div>
    
    <div id="upload" class="tab-content active container">
        <h2>Upload Vector Database Files</h2>
        <p>Upload your <code>index.faiss</code> and <code>index.pkl</code> files from the <code>grants_faiss_index</code> directory.</p>
        
        <div class="controls">
            <div>
                <h3>FAISS Index File</h3>
                <input type="file" id="faissFile" accept=".faiss">
            </div>
            <div>
                <h3>Pickle File</h3>
                <input type="file" id="pickleFile" accept=".pkl">
            </div>
        </div>
        
        <button id="processDummyData">Use Sample Data Instead</button>
        <p><small>If you're having trouble with the file upload, this will generate sample vector data for demonstration.</small></p>
        
        <div id="uploadStatus"></div>
    </div>
    
    <div id="explore" class="tab-content container">
        <h2>Explore Vector Embeddings</h2>
        
        <div class="controls">
            <div>
                <label for="vectorId">Vector ID:</label>
                <input type="number" id="vectorId" min="0" value="0">
                <button id="showVector">Show Vector</button>
            </div>
            <div>
                <label for="vectorCount">Total Vectors:</label>
                <input type="text" id="vectorCount" readonly>
                <label for="vectorDim">Dimensions:</label>
                <input type="text" id="vectorDim" readonly>
            </div>
        </div>
        
        <div id="vectorCard" class="card">
            <h3>Vector Data</h3>
            <div class="metadata" id="vectorMetadata"></div>
            <h4>Vector Values (first 20 dimensions)</h4>
            <div class="vector-display" id="vectorValues"></div>
            <div class="vector-grid" id="vectorGrid"></div>
        </div>
    </div>
    
    <div id="search" class="tab-content container">
        <h2>Semantic Search</h2>
        <p>Enter a query to find similar grants in the vector space.</p>
        
        <div class="controls">
            <div>
                <input type="text" id="searchQuery" placeholder="Enter search query...">
                <button id="searchButton">Search</button>
            </div>
            <div>
                <label for="numResults">Number of results:</label>
                <input type="number" id="numResults" min="1" max="10" value="3">
            </div>
        </div>
        
        <div class="search-results" id="searchResults"></div>
    </div>
    
    <div id="visualize" class="tab-content container">
        <h2>Vector Visualization</h2>
        <p>Visualizing high-dimensional vectors in 2D space using dimension reduction.</p>
        
        <div class="controls">
            <div>
                <label for="visualizeMethod">Visualization Method:</label>
                <select id="visualizeMethod">
                    <option value="pca">PCA (Principal Component Analysis)</option>
                    <option value="tsne">t-SNE (Approximated)</option>
                </select>
            </div>
            <div>
                <label for="numVectors">Number of vectors to visualize:</label>
                <input type="number" id="numVectors" min="5" max="100" value="50">
                <button id="visualizeButton">Visualize</button>
            </div>
        </div>
        
        <div class="visualization">
            <canvas id="vectorChart"></canvas>
        </div>
    </div>

    <script>
        // Global state
        let vectorData = null;
        let metadata = null;
        let chart = null;

        // Tab functionality
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Generate dummy data for demonstration
        document.getElementById('processDummyData').addEventListener('click', function() {
            const dimensions = 384;  // Typical for MiniLM-L6
            const numVectors = 20;
            
            // Generate random vector data
            vectorData = Array.from({ length: numVectors }, () => 
                Array.from({ length: dimensions }, () => (Math.random() * 2 - 1) * 0.5)
            );
            
            // Generate fake metadata
            metadata = Array.from({ length: numVectors }, (_, i) => ({
                id: `doc_${i}`,
                program_name: `Grant Program ${i + 1}`,
                description: `This is a sample grant program for ${['education', 'healthcare', 'arts', 'technology', 'environment'][i % 5]} projects.`,
                main_industry: ['Education', 'Healthcare', 'Arts and Culture', 'Technology', 'Environment'][i % 5],
                location: ['Alberta', 'Ontario', 'British Columbia', 'Quebec', 'Manitoba'][i % 5],
                target_audience: ['Non-profits', 'Individuals', 'Small Businesses', 'Educational Institutions', 'Indigenous Groups'][i % 5]
            }));
            
            document.getElementById('uploadStatus').innerHTML = `
                <div class="card">
                    <h3>Sample Data Generated</h3>
                    <p>Successfully created ${numVectors} vectors with ${dimensions} dimensions each.</p>
                </div>
            `;
            
            document.getElementById('vectorCount').value = numVectors;
            document.getElementById('vectorDim').value = dimensions;
            
            // Switch to explore tab
            document.querySelector('.tab[data-tab="explore"]').click();
        });

        // Show vector details
        document.getElementById('showVector').addEventListener('click', function() {
            if (!vectorData) {
                alert('Please upload vector data or use sample data first.');
                return;
            }
            
            const id = parseInt(document.getElementById('vectorId').value);
            if (id < 0 || id >= vectorData.length) {
                alert(`Vector ID must be between 0 and ${vectorData.length - 1}`);
                return;
            }
            
            const vector = vectorData[id];
            const meta = metadata[id];
            
            // Display metadata
            document.getElementById('vectorMetadata').innerHTML = `
                <p><strong>Document ID:</strong> ${meta.id}</p>
                <p><strong>Program Name:</strong> ${meta.program_name}</p>
                <p><strong>Main Industry:</strong> ${meta.main_industry}</p>
                <p><strong>Location:</strong> ${meta.location}</p>
                <p><strong>Target Audience:</strong> ${meta.target_audience}</p>
            `;
            
            // Display vector values (first 20 only)
            document.getElementById('vectorValues').textContent = JSON.stringify(vector.slice(0, 20));
            
            // Display vector as grid
            const grid = document.getElementById('vectorGrid');
            grid.innerHTML = '';
            for (let i = 0; i < Math.min(100, vector.length); i++) {
                const cell = document.createElement('div');
                cell.className = 'vector-cell';
                cell.textContent = vector[i].toFixed(3);
                
                // Color coding based on value
                const value = vector[i];
                const intensity = Math.min(Math.abs(value) * 2, 1);
                if (value > 0) {
                    cell.style.backgroundColor = `rgba(0, 123, 255, ${intensity})`;
                    if (intensity > 0.7) cell.style.color = 'white';
                } else {
                    cell.style.backgroundColor = `rgba(255, 193, 7, ${intensity})`;
                }
                
                grid.appendChild(cell);
            }
        });

        // Search functionality
        document.getElementById('searchButton').addEventListener('click', function() {
            if (!vectorData) {
                alert('Please upload vector data or use sample data first.');
                return;
            }
            
            const query = document.getElementById('searchQuery').value;
            const numResults = parseInt(document.getElementById('numResults').value);
            
            // In a real application, we would convert the query to a vector using the same model
            // Here we'll simulate it by creating a random vector and finding similar vectors
            const queryVector = Array.from({ length: vectorData[0].length }, () => (Math.random() * 2 - 1) * 0.5);
            
            // Calculate cosine similarity with all vectors (simplified)
            const similarities = vectorData.map((vec, idx) => {
                // Cosine similarity calculation
                let dotProduct = 0;
                let normA = 0;
                let normB = 0;
                for (let i = 0; i < vec.length; i++) {
                    dotProduct += vec[i] * queryVector[i];
                    normA += vec[i] * vec[i];
                    normB += queryVector[i] * queryVector[i];
                }
                const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                return { idx, similarity };
            });
            
            // Sort by similarity (highest first)
            similarities.sort((a, b) => b.similarity - a.similarity);
            
            // Display results
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = `<h3>Results for: "${query}"</h3>`;
            
            for (let i = 0; i < Math.min(numResults, similarities.length); i++) {
                const result = similarities[i];
                const meta = metadata[result.idx];
                
                resultsContainer.innerHTML += `
                    <div class="card">
                        <h4>${meta.program_name}</h4>
                        <p>${meta.description}</p>
                        <div class="metadata">
                            <p><strong>Main Industry:</strong> ${meta.main_industry}</p>
                            <p><strong>Location:</strong> ${meta.location}</p>
                            <p><strong>Target Audience:</strong> ${meta.target_audience}</p>
                            <p><strong>Similarity Score:</strong> ${result.similarity.toFixed(4)}</p>
                        </div>
                    </div>
                `;
            }
        });

        // Visualization functionality
        document.getElementById('visualizeButton').addEventListener('click', function() {
            if (!vectorData) {
                alert('Please upload vector data or use sample data first.');
                return;
            }
            
            const method = document.getElementById('visualizeMethod').value;
            const numVectors = Math.min(
                parseInt(document.getElementById('numVectors').value),
                vectorData.length
            );
            
            // Simple PCA implementation (for demonstration)
            function simplePCA(vectors, dimensions = 2) {
                // Center the data
                const means = Array(vectors[0].length).fill(0);
                vectors.forEach(vec => {
                    vec.forEach((val, i) => {
                        means[i] += val / vectors.length;
                    });
                });
                
                const centered = vectors.map(vec => 
                    vec.map((val, i) => val - means[i])
                );
                
                // For simplicity, we'll just take the first two dimensions
                // In a real PCA, we would compute eigenvectors of the covariance matrix
                const result = centered.map(vec => [vec[0], vec[1]]);
                
                return result;
            }
            
            // Simple t-SNE approximation (not actual t-SNE, just for demo)
            function simpleTSNE(vectors, dimensions = 2) {
                // Just add some noise to PCA for demonstration
                const pca = simplePCA(vectors, dimensions);
                return pca.map(point => [
                    point[0] + (Math.random() - 0.5) * 0.5,
                    point[1] + (Math.random() - 0.5) * 0.5
                ]);
            }
            
            // Perform dimension reduction
            let reducedVectors;
            if (method === 'pca') {
                reducedVectors = simplePCA(vectorData.slice(0, numVectors));
            } else {
                reducedVectors = simpleTSNE(vectorData.slice(0, numVectors));
            }
            
            // Create colors based on industry
            const industries = [...new Set(metadata.slice(0, numVectors).map(m => m.main_industry))];
            const colors = [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(153, 102, 255, 0.7)'
            ];
            
            const dataPoints = reducedVectors.map((point, i) => ({
                x: point[0],
                y: point[1],
                industry: metadata[i].main_industry,
                label: metadata[i].program_name
            }));
            
            // Create datasets grouped by industry
            const datasets = industries.map((industry, i) => {
                const points = dataPoints.filter(p => p.industry === industry);
                return {
                    label: industry,
                    data: points.map(p => ({ x: p.x, y: p.y })),
                    backgroundColor: colors[i % colors.length],
                    pointRadius: 8,
                    pointHoverRadius: 12
                };
            });
            
            // Clear previous chart
            if (chart) {
                chart.destroy();
            }
            
            // Create the chart
            const ctx = document.getElementById('vectorChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: datasets
                },
                options: {
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const i = context.dataIndex;
                                    const dsIndex = context.datasetIndex;
                                    const industry = industries[dsIndex];
                                    const matchingPoints = dataPoints.filter(p => p.industry === industry);
                                    return matchingPoints[i].label;
                                }
                            }
                        },
                        legend: {
                            position: 'right'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Dimension 1'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Dimension 2'
                            }
                        }
                    }
                }
            });
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return HTML_CONTENT

@app.route('/api/load-vectors', methods=['GET'])
def load_vectors():
    """Load and return basic information about the vector database"""
    try:
        # Check if index exists
        if not os.path.exists(f"{INDEX_PATH}/index.faiss") or not os.path.exists(f"{INDEX_PATH}/index.pkl"):
            return jsonify({
                'error': 'Vector database files not found. Please check the directory path.'
            }), 404
        
        # Load the pickle file
        with open(f"{INDEX_PATH}/index.pkl", "rb") as f:
            data = pickle.load(f)
        
        # Load the FAISS index
        index = faiss.read_index(f"{INDEX_PATH}/index.faiss")
        
        # Get basic information
        vector_count = index.ntotal
        
        # Try to get vector dimension
        vector_dim = -1
        if hasattr(index, 'reconstruct'):
            # Get the first vector to determine dimensions
            try:
                first_vector = index.reconstruct(0)
                vector_dim = len(first_vector)
            except:
                vector_dim = 'unknown'
        
        # Get metadata if available
        metadata = []
        if hasattr(data, "docstore") and hasattr(data.docstore, "_dict"):
            for doc_id, doc in data.docstore._dict.items():
                metadata.append({
                    'id': str(doc_id),
                    'program_name': doc.metadata.get('program_name', 'Unknown'),
                    'program_status': doc.metadata.get('program_status', 'Unknown'),
                    'main_industry': doc.metadata.get('main_industry', 'Unknown'),
                    'location': doc.metadata.get('location', 'Unknown'),
                    'target_audience': doc.metadata.get('target_audience', 'Unknown')
                })
        
        return jsonify({
            'vector_count': vector_count,
            'vector_dim': vector_dim,
            'metadata': metadata
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Error loading vector database: {str(e)}'
        }), 500

def try_faiss_import():
    try:
        import faiss
        print("FAISS is available!")
        return True
    except ImportError:
        print("FAISS is not installed. Run 'pip install faiss-cpu' to install it.")
        return False

if __name__ == '__main__':
    # Check if FAISS is installed
    has_faiss = try_faiss_import()
    
    if has_faiss:
        print("\n\n-------------------------------------------")
        print("Vector Database Explorer is running at http://localhost:5001")
        print("-------------------------------------------\n")
        print("1. Open http://localhost:5001 in your browser")
        print("2. If loading your actual vector data doesn't work, use 'Use Sample Data Instead'")
        print("3. Explore the sample vectors or your actual vector database\n")
        app.run(debug=True, port=5001)
    else:
        print("\n\n-------------------------------------------")
        print("FAISS is required for this application.")
        print("-------------------------------------------\n")
        print("Please install FAISS by running one of these commands:")
        print("  pip install faiss-cpu")
        print("  pip install faiss-gpu  # if you have a compatible GPU")
        print("\nAfter installing, run this script again.")