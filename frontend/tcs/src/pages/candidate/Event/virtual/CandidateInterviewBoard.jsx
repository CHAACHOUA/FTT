import React from 'react';
import { useParams } from 'react-router-dom';
import InterviewBoard from '../../../../components/trello/InterviewBoard';

const CandidateInterviewBoard = ({ forumId: propForumId }) => {
  const { forumId: paramForumId } = useParams();
  
  // Utiliser le forumId passé en props ou celui des params
  const forumId = propForumId || paramForumId;
  
  console.log('🎯 CandidateInterviewBoard loaded with forumId:', forumId);

  return (
    <div className="candidate-interview-board">
      <InterviewBoard forumId={forumId} />
    </div>
  );
};

export default CandidateInterviewBoard;
