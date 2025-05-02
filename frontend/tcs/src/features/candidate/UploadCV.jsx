import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function UploadCv() {
  const { accessToken } = useAuth();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const API = process.env.REACT_APP_API_BASE_URL;


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setParsedData(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
       `${API}/api/cv/upload-cv/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('CV parsed:', response.data);
      setParsedData(response.data);
    } catch (err) {
      console.error("Erreur CV :", err.response?.data || err.message);
      setError("Erreur lors de l'envoi du fichier.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    setParsedData({ ...parsedData, [e.target.name]: e.target.value });
  };

  const handleListChange = (index, field, value, listName) => {
    const updatedList = [...parsedData[listName]];
    updatedList[index][field] = value;
    setParsedData({ ...parsedData, [listName]: updatedList });
  };

  const addListItem = (listName, emptyItem) => {
    const updatedList = [...(parsedData[listName] || []), emptyItem];
    setParsedData({ ...parsedData, [listName]: updatedList });
  };
  const handleSubmitProfile = async () => {
    try {
      const response = await axios.post(
       `${API}/api/users/complete-profile/`,
        parsedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSubmitMessage('✅ Profil enregistré avec succès !');
      console.log('Profil enregistré :', response.data);
    } catch (err) {
      console.error('Erreur enregistrement :', err.response?.data || err.message);
      setSubmitMessage(" Une erreur s'est produite lors de l'enregistrement.");
    }
  };
  
  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h2>Upload your CV (PDF)</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {parsedData && (
        <div style={{ marginTop: '30px' }}>
          <h3>Parsed Data</h3>

          <label>First Name</label>
          <input type="text" name="first_name" value={parsedData.first_name || ''} onChange={handleFieldChange} />

          <label>Last Name</label>
          <input type="text" name="last_name" value={parsedData.last_name || ''} onChange={handleFieldChange} />

          <label>Email</label>
          <input type="email" name="email" value={parsedData.email || ''} onChange={handleFieldChange} />

          <label>Phone</label>
          <input type="text" name="phone" value={parsedData.phone || ''} onChange={handleFieldChange} />

          <label>LinkedIn</label>
          <input type="text" name="linkedin" value={parsedData.linkedin || ''} onChange={handleFieldChange} />

          <hr />
          <h4>Experiences</h4>
          {(parsedData.experiences || []).map((exp, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Job Title"
                value={exp.job_title || ''}
                onChange={(e) => handleListChange(index, 'job_title', e.target.value, 'experiences')}
              />
              <input
                type="text"
                placeholder="Company"
                value={exp.company || ''}
                onChange={(e) => handleListChange(index, 'company', e.target.value, 'experiences')}
              />
              <input
                type="text"
                placeholder="Start Date"
                value={exp.start_date || ''}
                onChange={(e) => handleListChange(index, 'start_date', e.target.value, 'experiences')}
              />
              <input
                type="text"
                placeholder="End Date"
                value={exp.end_date || ''}
                onChange={(e) => handleListChange(index, 'end_date', e.target.value, 'experiences')}
              />
              <textarea
                placeholder="Description"
                value={exp.description || ''}
                onChange={(e) => handleListChange(index, 'description', e.target.value, 'experiences')}
              />
            </div>
          ))}
          <button onClick={() => addListItem('experiences', {
            job_title: '', company: '', start_date: '', end_date: '', description: ''
          })}>
            + Add Experience
          </button>

          <hr />
          <h4>Educations</h4>
          {(parsedData.educations || []).map((edu, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree || ''}
                onChange={(e) => handleListChange(index, 'degree', e.target.value, 'educations')}
              />
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution || ''}
                onChange={(e) => handleListChange(index, 'institution', e.target.value, 'educations')}
              />
              <input
                type="text"
                placeholder="Start Year"
                value={edu.start_year || ''}
                onChange={(e) => handleListChange(index, 'start_year', e.target.value, 'educations')}
              />
              <input
                type="text"
                placeholder="End Year"
                value={edu.end_year || ''}
                onChange={(e) => handleListChange(index, 'end_year', e.target.value, 'educations')}
              />
            </div>
          ))}
          <button onClick={() => addListItem('educations', {
            degree: '', institution: '', start_year: '', end_year: ''
          })}>
            + Add Education
          </button>

          <hr />
          <h4>Skills</h4>
          {(parsedData.skills || []).map((skill, index) => (
            <input
              key={index}
              type="text"
              placeholder="Skill"
              value={skill || ''}
              onChange={(e) => {
                const updatedSkills = [...parsedData.skills];
                updatedSkills[index] = e.target.value;
                setParsedData({ ...parsedData, skills: updatedSkills });
              }}
              style={{ display: 'block', marginBottom: '5px' }}
            />
          ))}
       <button onClick={() => addListItem('skills', '')}>
  + Add Skill
</button>

          <hr />
<h4>Languages</h4>
{(parsedData.languages || []).map((lang, index) => (
  <div key={index} style={{ marginBottom: '10px' }}>
    <input
      type="text"
      placeholder="Language"
      value={lang.name || ''}
      onChange={(e) => handleListChange(index, 'name', e.target.value, 'languages')}
      style={{ marginRight: '10px' }}
    />
    <input
      type="text"
      placeholder="Level (e.g., Fluent, Intermediate)"
      value={lang.level || ''}
      onChange={(e) => handleListChange(index, 'level', e.target.value, 'languages')}
    />
  </div>
))}
<button onClick={() => addListItem('languages', { name: '', level: '' })}>
  + Add Language
</button>
<hr />
<button
  onClick={handleSubmitProfile}
  style={{ marginTop: '20px', padding: '10px 20px', fontWeight: 'bold' }}
>
   Valider mon profil
</button>

{submitMessage && (
  <div style={{ marginTop: '10px', color: submitMessage.startsWith('') ? 'green' : 'red' }}>
    {submitMessage}
  </div>
)}


        </div>
      )}
    </div>
  );
}
