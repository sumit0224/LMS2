import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    FaHome,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaClipboardList,
    FaCalendarCheck,
    FaTasks,
    FaLayerGroup
} from 'react-icons/fa';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const roleLinks = {
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
            { path: '/admin/students', label: 'Students', icon: FaUserGraduate },
            { path: '/admin/teachers', label: 'Teachers', icon: FaChalkboardTeacher },
            { path: '/admin/courses', label: 'Courses', icon: FaBook },
            { path: '/admin/batches', label: 'Batches', icon: FaLayerGroup },
            { path: '/admin/syllabus', label: 'Syllabus', icon: FaClipboardList },
        ],
        teacher: [
            { path: '/teacher/dashboard', label: 'Dashboard', icon: FaHome },
            { path: '/teacher/assignments', label: 'Assignments', icon: FaTasks },
            { path: '/teacher/attendance', label: 'Attendance', icon: FaCalendarCheck },
        ],
        user: [ // Student
            { path: '/student/dashboard', label: 'Dashboard', icon: FaHome },
            { path: '/student/assignments', label: 'My Assignments', icon: FaTasks },
            { path: '/student/attendance', label: 'Attendance', icon: FaCalendarCheck },
        ]
    };

    const links = roleLinks[user.role] || [];

    return (
        <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] min-h-[calc(100vh-4rem)] hidden md:block">
            <div className="py-6 px-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                            ${isActive
                                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]'
                            }
                        `}
                    >
                        <link.icon className="text-lg" />
                        {link.label}
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
