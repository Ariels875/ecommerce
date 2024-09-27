// src/components/Header.js
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/admin">Admin Panel</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;