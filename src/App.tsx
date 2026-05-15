import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { TourDetail } from './pages/TourDetail';
import { Planner } from './pages/Planner';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import { SearchPage } from './pages/Search';


// Protected Route Components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Home */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout><Home /></Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/*  SEARCH ROUTE (THÊM MỚI) */}
      <Route
        path="/search"
        element={
          <Layout>
            <SearchPage />
          </Layout>
        }
      />


      {/* Restaurant / Tour */}
      <Route path="/restaurant/:id" element={<Layout><RestaurantDetail /></Layout>} />
      <Route path="/tour/:id" element={<Layout><TourDetail /></Layout>} />

      {/* Planner */}
      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <Layout><Planner /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;