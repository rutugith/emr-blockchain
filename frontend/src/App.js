import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import EncountersPage from './pages/EncountersPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import PatientListPage from './pages/PatientListPage';
import PatientDetailsPage from './pages/PatientDetailsPage';

function ConditionalNavbar() {
  const { pathname } = useLocation();
  const hideOn = ['/', '/signup'];
  if (hideOn.includes(pathname)) return null;
  return <Navbar />;
}

function App() {
  return (
    <Router>
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute><PatientsPage /></ProtectedRoute>
        } />

        <Route path="/encounters" element={
          <ProtectedRoute><EncountersPage /></ProtectedRoute>
        } />

        <Route path="/patients/list" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
