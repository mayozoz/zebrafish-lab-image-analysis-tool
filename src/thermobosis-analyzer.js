import React, { useState, useRef } from 'react';
import './thrombosis-analyzer.css';

const ThrombosisAnalyzer = () => {
  const [files, setFiles] = useState([]);
  const [blobSize, setBlobSize] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handle file uploads
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    addFiles(selectedFiles);
  };
  
  const addFiles = (selectedFiles) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      selectedFiles.forEach(file => {
        // Check if the file is already in the list
        if (!prevFiles.some(prevFile => prevFile.name === file.name)) {
          // Check if the file is an image of the correct type
          if (file.type === 'image/tiff' || file.type === 'image/png' || 
              file.name.endsWith('.tif') || file.name.endsWith('.tiff') || file.name.endsWith('.png')) {
            // Create preview for the file
            const fileWithPreview = {
              ...file,
              preview: URL.createObjectURL(file)
            };
            newFiles.push(fileWithPreview);
          }
        }
      });
      return newFiles;
    });
  };
  
  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };
  
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  // Remove a file from the list
  const removeFile = (fileName) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.name !== fileName);
      return updatedFiles;
    });
  };

  // Process the uploaded files 
  const processFiles = () => {
    setIsProcessing(true);
    
    // Mock processing - in real implementation this would call your backend
    setTimeout(() => {
      // Simulated results
      const mockResults = {
        csvUrl: '#',
        processedFiles: files.map(file => ({
          originalName: file.name,
          score: Math.random().toFixed(4),
          roi: file.preview // In a real implementation, this would be the processed image
        }))
      };
      
      setResults(mockResults);
      setIsProcessing(false);
    }, 2000);
  };

  // Download the CSV results
  const downloadResults = () => {
    if (!results) return;
    
    // In a real implementation, this would use the actual CSV from the backend
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Filename,Score\n" + 
      results.processedFiles.map(file => `${file.originalName},${file.score}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "thrombosis_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean up the file previews when component unmounts
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const uploadedCount = files.length;
  const averageScore = results
    ? (
        results.processedFiles.reduce((total, file) => total + Number(file.score), 0) /
        results.processedFiles.length
      ).toFixed(4)
    : null;

  return (
    <div className="analyzer-page">
      <header className="analyzer-header">
        <div>
          <p className="eyebrow">Lab Image Workflow</p>
          <h1>Zebrafish Thrombosis Analyzer</h1>
          <p>Upload microscopy images, tune clot detection, and export analysis scores.</p>
        </div>
        <div className="header-stats" aria-label="Current upload summary">
          <span>{uploadedCount}</span>
          <small>{uploadedCount === 1 ? 'image loaded' : 'images loaded'}</small>
        </div>
      </header>

      <main className="analyzer-main">
        <section className="panel upload-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Image Upload</h2>
            </div>
            <label className="preview-toggle" htmlFor="preview-toggle">
              <input
                type="checkbox"
                id="preview-toggle"
                checked={showPreview}
                onChange={() => setShowPreview(!showPreview)}
              />
              <span>Previews</span>
            </label>
          </div>

          <div
            className={`drop-zone ${isDragActive ? 'drop-zone-active' : ''}`}
            onClick={handleFileInputClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".tif,.tiff,.png,image/tiff,image/png"
              multiple
              className="file-input"
            />
            <div className="drop-zone-content">
              <div className="upload-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              </div>
              <p className="drop-title">
                {isDragActive ? 'Drop the files here' : 'Drag & drop images here, or click to select files'}
              </p>
              <p className="drop-subtitle">Supported formats: .tif, .tiff, .png</p>
            </div>
          </div>

          <div className="control-row">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
              className="secondary-button"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAdvanced ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
          </div>
          
          {showAdvanced && (
            <div className="advanced-panel">
              <label className="field-label">
                Blob Size Parameter
              </label>
              <div className="range-row">
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={blobSize}
                  onChange={(e) => setBlobSize(parseInt(e.target.value))}
                  className="w-full mr-4"
                />
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={blobSize}
                  onChange={(e) => setBlobSize(parseInt(e.target.value))}
                  className="blob-size-input"
                />
              </div>
              <p className="field-help">
                Adjust this parameter to control the minimum size of clots to detect. Higher values detect only larger clots.
              </p>
            </div>
          )}
          
          {files.length > 0 && (
            <div className="file-section">
              <h3>Uploaded Images ({files.length})</h3>
              <ul className="file-list">
                {files.map((file, index) => (
                  <li key={index} className="file-item">
                    <div className="file-details">
                      {showPreview && file.preview && (
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="file-thumbnail"
                        />
                      )}
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          {typeof file.size === 'number' ? (file.size / 1024).toFixed(1) : '?'} KB
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(file.name)}
                      className="remove-button"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
            <button
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
            className="primary-button"
            >
              {isProcessing ? (
                <>
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Images...
                </>
              ) : (
                <>Analyze Images</>
              )}
            </button>
        </section>
        
        {results && (
          <section className="panel results-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Step 2</p>
                <h2>Analysis Results</h2>
              </div>
              <div className="result-summary">
                <span>{averageScore}</span>
                <small>average score</small>
              </div>
            </div>

            <div className="results-actions">
              <button
                onClick={downloadResults}
                className="download-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV Results
              </button>
            </div>
            
            <div className="results-table">
              <div className="results-header">
                <div>Image</div>
                <div>Score</div>
                <div>Region of Interest</div>
              </div>
              <div className="results-body">
                {results.processedFiles.map((file, index) => (
                  <div key={index} className="result-row">
                    <div className="result-name">{file.originalName}</div>
                    <div className="score-pill">{file.score}</div>
                    <div>
                      <img 
                        src={file.roi} 
                        alt={`ROI for ${file.originalName}`} 
                        className="roi-image"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <footer className="analyzer-footer">
        Zebrafish Thrombosis Analysis Tool
      </footer>
    </div>
  );
};

export default ThrombosisAnalyzer;
