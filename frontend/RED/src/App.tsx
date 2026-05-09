import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

/** Very lightweight auth — persisted in sessionStorage.
 *  Replace with a real JWT/cookie flow when connecting a proper backend. */
export function useAuth() {
  const [user, setUser] = useState<string | null>(
    () => sessionStorage.getItem('red_user')
  );

  const login = (username: string) => {
    sessionStorage.setItem('red_user', username);
    setUser(username);
  };

  const logout = () => {
    sessionStorage.removeItem('red_user');
    setUser(null);
  };

  return { user, login, logout };
}

function App() {
  const auth = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            auth.user
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={auth.login} />
          }
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            auth.user
              ? <Dashboard user={auth.user} onLogout={auth.logout} />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chat"
          element={
            auth.user
              ? <Chat user={auth.user} onLogout={auth.logout} />
              : <Navigate to="/login" replace />
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to={auth.user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
