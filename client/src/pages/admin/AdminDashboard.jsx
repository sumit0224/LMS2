import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaClipboardList, FaPlus, FaArrowRight } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        activeCourses: 0,
        recentEnrollments: [] // Assuming backend provides this
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
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

    const statCards = [
        {
            label: 'Total Students',
            value: stats.totalStudents,
            icon: FaUserGraduate,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            link: '/admin/students',
            linkText: 'Manage Students'
        },
        {
            label: 'Total Teachers',
            value: stats.totalTeachers,
            icon: FaChalkboardTeacher,
            color: 'text-green-500',
            bg: 'bg-green-50',
            link: '/admin/teachers',
            linkText: 'Manage Teachers'
        },
        {
            label: 'Total Courses',
            value: stats.totalCourses,
            icon: FaBook,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            link: '/admin/courses',
            linkText: 'Manage Courses'
        },
        {
            label: 'Active Courses',
            value: stats.activeCourses,
            icon: FaClipboardList,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            link: '/admin/syllabus',
            linkText: 'Check Syllabus'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Admin Command Center</h1>
                    <p className="mt-2 text-slate-300">
                        Overview for <span className="text-white font-bold">AppWars Technologies</span>.
                        Hello, <span className="font-semibold text-indigo-400">{user?.name}</span>.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="flex flex-col justify-between">
                        <Card.Content className="flex items-start justify-between pb-2">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">{stat.label}</p>
                                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`text-xl ${stat.color}`} />
                            </div>
                        </Card.Content>
                        <div className="px-6 py-3 bg-[var(--color-background)] border-t border-[var(--color-border)] rounded-b-xl">
                            <Link to={stat.link} className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 group">
                                {stat.linkText}
                                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <QuickActionCard
                            to="/admin/register"
                            title="Register New User"
                            desc="Create admin accounts securely."
                            icon={FaPlus}
                            color="bg-indigo-50 text-indigo-600"
                        />
                        <QuickActionCard
                            to="/admin/students"
                            title="Add Student"
                            desc="Enroll a new student to the platform."
                            icon={FaUserGraduate}
                            color="bg-blue-50 text-blue-600"
                        />
                        <QuickActionCard
                            to="/admin/teachers"
                            title="Add Teacher"
                            desc="Onboard a new instructor."
                            icon={FaChalkboardTeacher}
                            color="bg-green-50 text-green-600"
                        />
                        <QuickActionCard
                            to="/admin/courses"
                            title="Create Course"
                            desc="Launch a new course curriculum."
                            icon={FaBook}
                            color="bg-purple-50 text-purple-600"
                        />
                    </div>
                </div>

                {/* Recent Activity (1 Col) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Recent Enrollments</h2>
                    <Card className="h-full">
                        <Card.Content className="p-0">
                            <div className="divide-y divide-[var(--color-border)]">
                                {stats.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                                    stats.recentEnrollments.map((enrollment, index) => (
                                        <div key={index} className="p-4 hover:bg-[var(--color-background)] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {enrollment.student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                        {enrollment.student?.name || 'Unknown User'}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                                        Joined {enrollment.course?.title || 'Unknown Course'}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                                                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-[var(--color-text-secondary)]">
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const QuickActionCard = ({ to, title, desc, icon: Icon, color }) => (
    <Link to={to} className="block group">
        <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg border-[var(--color-border)]">
            <Card.Content className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="text-xl" />
                </div>
                <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{desc}</p>
                </div>
            </Card.Content>
        </Card>
    </Link>
);

export default AdminDashboard;
