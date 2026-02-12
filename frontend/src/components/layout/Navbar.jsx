import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📍</span>
          <span className="brand-text">Planzo</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Discover</Link>

          {user ? (
            <>
              {user.role === 'organizer' && (
                <Link to="/organizer" className="nav-link">Dashboard</Link>
              )}
              <Link to="/checkout" className="nav-link cart-link">
                Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              <div className="nav-user">
                <span className="nav-user-name">{user.full_name || user.fullName}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
