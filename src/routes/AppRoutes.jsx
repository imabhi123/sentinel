import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import DisasterManagement from '../pages/DisasterManagement';
import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/disaster-management" 
        element={
          <ProtectedRoute>
            <DisasterManagement />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
