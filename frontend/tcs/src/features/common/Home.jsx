import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Welcome to TCS</h1>
      <p><Link to="/signup-candidate">Sign up as Candidate</Link></p>
      <p><Link to="/login">Login</Link></p>
    </div>
  );
}
