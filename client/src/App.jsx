import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageCourses from './pages/admin/ManageCourses';
import ManageSyllabus from './pages/admin/ManageSyllabus';
import ManageBatches from './pages/admin/ManageBatches';

// Teacher Pages
import TeacherCourseDetail from './pages/teacher/TeacherCourseDetail';
import Assignments from './pages/teacher/Assignments';
import Attendance from './pages/teacher/Attendance';

// Student Pages
import StudentCourseView from './pages/student/StudentCourseView';
import MyAssignments from './pages/student/MyAssignments';
import MyAttendance from './pages/student/MyAttendance';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/course/:id" element={<CourseDetails />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <StudentDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <StudentDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/course/:courseId"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <StudentCourseView />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <MyAssignments />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardLayout>
                      <MyAttendance />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <DashboardLayout>
                      <TeacherDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/course/:courseId"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <DashboardLayout>
                      <TeacherCourseDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <DashboardLayout>
                      <Assignments />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <DashboardLayout>
                      <Attendance />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ManageStudents />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ManageTeachers />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ManageCourses />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/syllabus"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ManageSyllabus />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
