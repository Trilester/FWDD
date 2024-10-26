import React from 'react';

function Header() {
  return (
    <header style={headerStyle}>
      <h1 style={{ margin: '0' }}>Mine Finder</h1>
      <nav>
        <ul style={navListStyle}>
          {/* Top Right Register and Logout Links */}
          <li style={{ float: 'right' }}><a href="Register">Register</a></li>
          <li style={{ float: 'right', marginRight: '10px' }}><a href="Logout">Logout</a></li>
        </ul>
      </nav>
    </header>
  );
}

// Styles for header and navigation list
const headerStyle = {
  padding: '20px',
  textAlign: 'center',
  borderBottom: '2px solid #ddd',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px'
};

const navListStyle = {
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
};

export default Header;
