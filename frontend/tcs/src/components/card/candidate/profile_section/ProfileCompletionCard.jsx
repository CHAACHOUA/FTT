import React, { useMemo } from 'react';
import { FaCheckCircle, FaTimesCircle, FaCamera, FaPhone, FaBriefcase, FaGraduationCap, FaTools } from 'react-icons/fa';
import { Card } from '../../../common';
import './ProfileCompletionCard.css';

const ChecklistItem = ({ completed, icon, label, anchor }) => {
  const Icon = icon;
  return (
    <a href={anchor} className="completion-check-item" style={{ textDecoration: 'none' }}>
      <span className={`completion-check-icon ${completed ? 'completed' : 'pending'}`}>
        {completed ? <FaCheckCircle /> : <FaTimesCircle />}
      </span>
      <span className="completion-check-label">
        <Icon className="completion-trait-icon" /> {label}
      </span>
    </a>
  );
};

const ProfileCompletionCard = ({ formData }) => {
  const {
    profile_picture,
    phone,
    linkedin,
    email,
    experiences = [],
    skills = [],
    educations = [],
  } = formData || {};

  const checklist = useMemo(() => {
    const hasPhoto = Boolean(profile_picture);
    const hasContact = Boolean(phone) && Boolean(email);
    const hasExperience = Array.isArray(experiences) && experiences.length > 0;
    const hasSkill = Array.isArray(skills) && skills.length > 0;
    const hasEducation = Array.isArray(educations) && educations.length > 0;

    return [
      { key: 'photo', completed: hasPhoto, label: 'Photo de profil', icon: FaCamera, anchor: '#presentation' },
      { key: 'contact', completed: hasContact, label: 'Infos de contact', icon: FaPhone, anchor: '#contact' },
      { key: 'experience', completed: hasExperience, label: 'Au moins une expérience', icon: FaBriefcase, anchor: '#experience' },
      { key: 'skill', completed: hasSkill, label: 'Au moins une compétence', icon: FaTools, anchor: '#skill' },
      { key: 'education', completed: hasEducation, label: 'Au moins une formation', icon: FaGraduationCap, anchor: '#education' },
    ];
  }, [profile_picture, phone, linkedin, email, experiences, skills, educations]);

  const completedCount = checklist.filter(c => c.completed).length;
  const percent = Math.round((completedCount / checklist.length) * 100);

  return (
    <Card size="lg" variant="default" shadow="md" borderRadius="xl" className="profile-completion-card">
      <div className="completion-header">
        <h3 className="completion-title">Complétez votre profil</h3>
        <span className="completion-percentage">{percent}%</span>
      </div>
      <div className="completion-progress">
        <div className="completion-progress-bar">
          <div className="completion-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="completion-ratio">{completedCount}/{checklist.length}</span>
      </div>

      <div className="completion-checklist">
        {checklist.map(item => (
          <ChecklistItem
            key={item.key}
            completed={item.completed}
            icon={item.icon}
            label={item.label}
            anchor={item.anchor}
          />
        ))}
      </div>
    </Card>
  );
};

export default ProfileCompletionCard;


