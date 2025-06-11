import React from 'react';


const ForumInfos = ({ forum }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">À propos :</h3>
          <h1 className="text-2xl font-bold mb-2">{forum.name}</h1>
        <p className="text-gray-500 mb-4">Organisé par {forum.organizer?.name}</p>

      <p className="mb-4">{forum.description}</p>
      {forum.highlight && <p className="mb-2 text-gray-700">{forum.highlight}</p>}
      <p className="mb-2 text-sm text-gray-500">Type : {forum.type}</p>
      <p className="text-sm text-gray-500">
        Date : {forum.date} 
      </p>
    </div>
  );
};

export default ForumInfos;
