import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaBookReader, FaCheckCircle, FaClipboardList, FaPlay, FaCalendarCheck, FaArrowRight, FaBook } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            const { data } = await api.get('/users/courses');
            if (data.success) {
                setEnrollments(data.enrollments);
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
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

    const inProgressCount = enrollments.filter(e => e.status !== 'Completed').length;
    const completedCount = enrollments.filter(e => e.status === 'Completed').length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-black/10 blur-3xl"></div>

                <h1 className="text-4xl font-extrabold tracking-tight relative z-10">Student Dashboard</h1>
                <p className="mt-2 text-indigo-100 text-lg relative z-10">
                    Welcome to <span className="font-bold text-white">AppWars Technologies</span>, <span className="font-semibold">{user?.name}</span>. Let's code your future!
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg shadow-blue-500/20">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm mr-4">
                        <FaBookReader className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-blue-100 text-sm font-medium">In Progress</p>
                        <p className="text-3xl font-bold">{inProgressCount}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg shadow-green-500/20">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm mr-4">
                        <FaCheckCircle className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-green-100 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold">{completedCount}</p>
                    </div>
                </Card>
                <Card className="flex items-center p-6 bg-white border border-[var(--color-border)]">
                    <div className="p-3 bg-purple-50 rounded-lg mr-4">
                        <FaClipboardList className="text-2xl text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[var(--color-text-secondary)] text-sm font-medium">Assignments Due</p>
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">--</p> {/* Placeholder for backend data */}
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Grid (2 Col) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">My Learning</h2>
                        <Link to="/courses" className="text-sm font-medium text-[var(--color-primary)] hover:underline">Browse More Courses</Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {enrollments.length > 0 ? (
                            enrollments.map((enrollment) => (
                                <Card key={enrollment._id} className="flex flex-col h-full hover:shadow-lg transition-transform hover:-translate-y-1">
                                    <div className="h-32 bg-gray-100 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-80 transition-opacity group-hover:opacity-90"></div>
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Course</p>
                                        </div>
                                    </div>

                                    <Card.Content className="flex-1 flex flex-col pt-4">
                                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1 line-clamp-1">
                                            {enrollment.course?.title}
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                            {enrollment.course?.instructor?.name || 'Instructor'}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs mb-1.5 font-medium text-[var(--color-text-secondary)]">
                                                <span>Progress</span>
                                                <span>{enrollment.progress}%</span>
                                            </div>
                                            <div className="w-full bg-[var(--color-background)] rounded-full h-2">
                                                <div
                                                    className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <Link to={`/student/course/${enrollment.course?._id}`}>
                                                <Button size="sm" className="w-full group">
                                                    {enrollment.progress > 0 ? 'Continue' : 'Start'} <FaPlay className="ml-2 text-xs transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card.Content>
                                </Card>
                            ))
                        ) : (
                            <Card className="col-span-full border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                                <div className="p-4 bg-[var(--color-background)] rounded-full mb-4">
                                    <FaBook className="text-3xl text-[var(--color-text-secondary)]" />
                                </div>
                                <h3 className="text-lg font-medium text-[var(--color-text-primary)]">No Enrolled Courses</h3>
                                <p className="text-[var(--color-text-secondary)] max-w-sm mt-1 mb-6">
                                    Browse our catalog and enroll in courses to start learning.
                                </p>
                                <Link to="/courses">
                                    <Button variant="primary">Browse Courses</Button>
                                </Link>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Sidebar (1 Col) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link to="/student/assignments" className="block text-inherit no-underline">
                            <Card className="hover:border-[var(--color-primary)] transition-colors group cursor-pointer">
                                <Card.Content className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 rounded-lg group-hover:scale-110 transition-transform">
                                        <FaClipboardList className="text-xl text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--color-text-primary)]">Assignments</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)]">View due tasks</p>
                                    </div>
                                    <FaArrowRight className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                </Card.Content>
                            </Card>
                        </Link>
                        <Link to="/student/attendance" className="block text-inherit no-underline">
                            <Card className="hover:border-[var(--color-primary)] transition-colors group cursor-pointer">
                                <Card.Content className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                                        <FaCalendarCheck className="text-xl text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[var(--color-text-primary)]">Attendance</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Check your record</p>
                                    </div>
                                    <FaArrowRight className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                                </Card.Content>
                            </Card>
                        </Link>
                    </div>

                    <Card className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] mt-8">
                        <Card.Header>
                            <Card.Title className="text-sm uppercase tracking-wider text-[var(--color-text-secondary)]">Profile Snapshot</Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-4 pt-0">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--color-text-primary)]">{user?.name}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{user?.email}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
