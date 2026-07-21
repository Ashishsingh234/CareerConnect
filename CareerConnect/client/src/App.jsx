import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import HRDashboard from './pages/HRDashboard';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import CompanyProfile from './pages/CompanyProfile';
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Chatbot from './components/common/Chatbot';
import JobPost from './pages/JobPost';
import { ChatProvider } from './context/ChatContext';

import ChatWindowPage from './pages/ChatWindowPage';
import References from './pages/References';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text font-sans transition-colors duration-500 overflow-x-hidden">
      <Navbar />
      <main className="w-full flex-grow flex flex-col">
        <ChatProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* NEW: Job Post Route */}
            <Route path="/jobs/post" element={
              <ProtectedRoute allowedRoles={["company", "hr"]}>
                <JobPost />
              </ProtectedRoute>
            } />

            {/* NEW: Chat Window Route (Final) */}
            <Route path="/chats/:chatId" element={
              <ProtectedRoute allowedRoles={["candidate", "company", "hr"]}>
                <ChatWindowPage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/references" element={
              <ProtectedRoute>
                <References />
              </ProtectedRoute>
            } />

            {/* FIX: Company Profile allowed for HR too */}
            <Route path="/company-profile" element={
              <ProtectedRoute allowedRoles={["company", "hr"]}>
                <CompanyProfile />
              </ProtectedRoute>
            } />
            {/* Public company page */}
            <Route path="/companies/:id" element={<CompanyProfile />} />
            {/* Public user profile */}
            <Route path="/users/:id" element={<UserProfile />} />

            <Route path="/dashboard/candidate" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />

            {/* FIX: Dashboards allowed for Company/HR */}
            <Route path="/dashboard/company" element={
              <ProtectedRoute allowedRoles={["company", "hr"]}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/hr" element={
              <ProtectedRoute allowedRoles={["company", "hr"]}>
                <HRDashboard />
              </ProtectedRoute>
            } />

            <Route path="/contact" element={<Contact />} />
          </Routes>
        </ChatProvider>
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
}