import React from 'react';
import { Link } from 'react-router-dom';


export default function TopBar(){
  return (
    <div className="divnavbar">
    <nav className="navbar">
      <div className ="logo">
        CZMD
      </div>
      <ul className="navMenu">

      {  <Link to="/" className='Homebtn'>Go to Home</Link> }
      </ul>
    </nav>
    </div>
  );
}