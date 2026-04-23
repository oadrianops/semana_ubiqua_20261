import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { ConnectBankPage } from './pages/ConnectBank';
import { ScorePage } from './pages/ScorePage';
import { CreditPage } from './pages/CreditPage';
import { CreditDetailPage } from './pages/CreditDetail';
import { useAuthStore } from './store/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/conectar"
        element={
          <ProtectedRoute>
            <ConnectBankPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/score"
        element={
          <ProtectedRoute>
            <ScorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/credito"
        element={
          <ProtectedRoute>
            <CreditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/credito/:id"
        element={
          <ProtectedRoute>
            <CreditDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
