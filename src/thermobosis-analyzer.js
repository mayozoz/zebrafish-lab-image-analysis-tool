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

  return (
    <div className="page">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Zebrafish Thrombosis Analyzer</h1>
        <p className="text-sm opacity-80">Upload and analyze zebrafish thrombosis images</p>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Image Upload</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 mb-4 cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
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
              className="hidden"
            />
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600">
                {isDragActive ? 'Drop the files here' : 'Drag & drop images here, or click to select files'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Supported formats: .tif, .tiff, .png</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 text-sm flex items-center"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAdvanced ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="preview-toggle" 
                checked={showPreview} 
                onChange={() => setShowPreview(!showPreview)}
                className="mr-2"
              />
              <label htmlFor="preview-toggle" className="text-sm">Show Image Previews</label>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blob Size Parameter
              </label>
              <div className="flex items-center">
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
              <p className="text-xs text-gray-500 mt-1">
                Adjust this parameter to control the minimum size of clots to detect. Higher values detect only larger clots.
              </p>
            </div>
          )}
          
          {files.length > 0 && (
            <>
              <h3 className="font-medium mt-6 mb-2">Uploaded Images ({files.length})</h3>
              <ul className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <li key={index} className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {showPreview && file.preview && (
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="h-12 w-12 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {typeof file.size === 'number' ? (file.size / 1024).toFixed(1) : '?'} KB
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          
          <div className="mt-6">
            <button
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className={`py-2 px-4 rounded-md flex items-center justify-center w-full font-medium ${
                isProcessing || files.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Images...
                </>
              ) : (
                <>Analyze Images</>
              )}
            </button>
          </div>
        </div>
        
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            <div className="mb-6">
              <button
                onClick={downloadResults}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV Results
              </button>
            </div>
            
            <div className="border rounded-md">
              <div className="bg-gray-50 p-3 border-b grid grid-cols-3 font-medium">
                <div>Image</div>
                <div>Score</div>
                <div>Region of Interest</div>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {results.processedFiles.map((file, index) => (
                  <div key={index} className="p-3 grid grid-cols-3 items-center">
                    <div className="truncate">{file.originalName}</div>
                    <div>{file.score}</div>
                    <div>
                      <img 
                        src={file.roi} 
                        alt={`ROI for ${file.originalName}`} 
                        className="h-16 object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-100 border-t p-4 text-center text-sm text-gray-600">
        Zebrafish Thrombosis Analysis Tool
      </footer>
    </div>
  );
};

export default ThrombosisAnalyzer;