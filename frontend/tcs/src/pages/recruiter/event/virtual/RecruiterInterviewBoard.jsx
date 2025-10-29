import React from 'react';
import { useParams } from 'react-router-dom';
import InterviewBoard from '../../../components/trello/InterviewBoard';

const RecruiterInterviewBoard = () => {
  const { forumId } = useParams();

  return (
    <div className="recruiter-interview-board">
      <InterviewBoard forumId={forumId} />
    </div>
  );
};

export default RecruiterInterviewBoard;
