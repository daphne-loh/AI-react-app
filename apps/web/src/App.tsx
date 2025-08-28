import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { ProtectedRoute } from './components/auth';
import ComingSoon from './pages/ComingSoon';
import { Register, Login } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AccountSettings from './pages/Profile/AccountSettings';
import { FoodItemsPage } from './pages/FoodItems';
import { FoodItemManagement } from './pages/Admin';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProfileProvider>
          <div className="App">
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<ComingSoon />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/collections" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold mb-4">Collections</h1>
                      <p className="text-gray-600">Coming in Epic 2</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Food Items Database Test Page */}
            <Route 
              path="/food-items" 
              element={
                <ProtectedRoute>
                  <FoodItemsPage />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/food-items" 
              element={
                <ProtectedRoute>
                  <FoodItemManagement />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/subscribe" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Subscribe</h1>
                    <p className="text-gray-600">Coming in Epic 3</p>
                  </div>
                </div>
              } 
            />
            
            {/* Redirect for authenticated users trying to access auth pages */}
            <Route 
              path="/forgot-password" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Password Reset</h1>
                    <p className="text-gray-600">Coming Soon</p>
                  </div>
                </div>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </UserProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App