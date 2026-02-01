import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaCalendarCheck, FaArrowRight, FaBook } from 'react-icons/fa';

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedCourses();
    }, []);

    const fetchAssignedCourses = async () => {
        try {
            const { data } = await api.get('/teachers/courses');
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
    const activeCourses = courses.filter(c => c.status === 'Active').length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Instructor Portal</h1>
                    <p className="mt-2 text-emerald-50">
                        Welcome back, <span className="font-semibold text-white uppercase tracking-wide">{user?.name}</span>.
                        Inspire the next generation of <span className="font-bold">AppWars</span> developers.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm mr-4">
                        <FaBook className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">Assigned Courses</p>
                        <p className="text-3xl font-bold">{courses.length}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm mr-4">
                        <FaUserGraduate className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-emerald-100 text-sm font-medium">Total Students</p>
                        <p className="text-3xl font-bold">{totalStudents}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-6 bg-white border border-[var(--color-border)]">
                    <div className="p-3 bg-blue-50 rounded-lg mr-4">
                        <FaClipboardList className="text-2xl text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[var(--color-text-secondary)] text-sm font-medium">Pending Assignments</p>
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">--</p>
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course List (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">My Courses</h2>
                        <span className="text-sm text-[var(--color-text-secondary)]">{activeCourses} Active</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <Card key={course._id} className="flex flex-col h-full hover:shadow-lg transition-transform hover:-translate-y-1">
                                    <div className="h-32 bg-gray-100 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-background)] opacity-50"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold shadow-sm ${course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Card.Content className="flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-1">{course.title}</h3>
                                        <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2 flex-1">
                                            {course.description || "No description provided."}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-4">
                                            <span className="flex items-center gap-1"><FaUserGraduate /> {course.enrollmentCount || 0} Students</span>
                                        </div>
                                        <Link to={`/teacher/course/${course._id}`} className="block">
                                            <Button variant="primary" size="sm" className="w-full">
                                                Manage Course
                                            </Button>
                                        </Link>
                                    </Card.Content>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                                <FaBook className="mx-auto text-4xl text-gray-300 mb-3" />
                                <p>No courses assigned to you yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Quick Actions (1 Col) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link to="/teacher/assignments" className="block text-inherit no-underline">
                            <Card className="hover:border-[var(--color-primary)] transition-colors group cursor-pointer">
                                <Card.Content className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 rounded-lg group-hover:scale-110 transition-transform">
                                        <FaClipboardList className="text-xl text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--color-text-primary)]">Assignments</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Create & Grade tasks</p>
                                    </div>
                                    <FaArrowRight className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                </Card.Content>
                            </Card>
                        </Link>
                        <Link to="/teacher/attendance" className="block text-inherit no-underline">
                            <Card className="hover:border-[var(--color-primary)] transition-colors group cursor-pointer">
                                <Card.Content className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                                        <FaCalendarCheck className="text-xl text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--color-text-primary)]">Attendance</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Track daily presence</p>
                                    </div>
                                    <FaArrowRight className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                </Card.Content>
                            </Card>
                        </Link>
                    </div>

                    <Card className="bg-[var(--color-surface)] mt-8">
                        <Card.Header>
                            <Card.Title className="text-base">Instructor Profile</Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-3">
                            <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                                <span className="text-sm text-[var(--color-text-secondary)]">Name</span>
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{user?.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                                <span className="text-sm text-[var(--color-text-secondary)]">Subject</span>
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{user?.subject}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-[var(--color-text-secondary)]">Experience</span>
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{user?.experience || 'N/A'}</span>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
