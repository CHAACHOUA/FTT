// src/features/candidate/section/UploadCV.jsx
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { FileUp, FileCheck, Loader2, AlertCircle, Upload } from "lucide-react";
import '../../styles/candidate/uploadCV.css';

const UploadCV = ({ onUpload }) => {
  const { accessToken } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('📌 Please select a valid PDF file.');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('📌 Please drop a valid PDF file.');
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('📌 Please select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/candidates/upload-cv/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('CV parsed:', response.data);
      onUpload(response.data); 
    } catch (err) {
      console.error('Erreur CV :', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || "Une erreur est survenue lors de l'upload.";
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-cv-container" id="uploadcv">
      <h2 className="upload-title"> Upload your CV</h2>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange}
          className="file-input"
        />
        <div className="drop-zone-content">
          <Upload size={32} className="upload-icon" />
          {file ? (
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          ) : (
            <>
              <p className="drop-text">Drag & drop your CV here</p>
              <p className="drop-subtext">or click to browse</p>
            </>
          )}
        </div>
      </div>

      <button 
        onClick={handleUpload} 
        disabled={loading || !file} 
        className="upload-button"
      >
        {loading ? <Loader2 size={18} className="spin" /> : <FileCheck size={18} />} 
        {loading ? ' Uploading...' : ' Upload CV'}
      </button>
    </div>
  );
};

export default UploadCV;
