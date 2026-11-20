import { Navigate, Outlet, useLocation } from 'react-router-dom';

function isTokenValid(token) {
  if (!token) return false;

  try {
    // Decode JWT payload to check expiration (`exp` claim)
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true; // Non-JWT opaque token fallback

    const decoded = JSON.parse(atob(payloadBase64));
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    return false;
  }
}

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('token');

  if (isTokenValid(token)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}