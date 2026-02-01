import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Button from './ui/Button';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white font-bold text-lg shadow-lg">AW</div>
                            <span className="text-xl font-extrabold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-transparent bg-clip-text font-serif tracking-tight">
                                AppWars Technologies
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-8 md:flex md:space-x-2">
                            <Link to="/courses" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Browse Courses
                            </Link>

                            {user?.role === 'admin' && (
                                <Link to="/admin/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium">
                                    Admin Panel
                                </Link>
                            )}
                            {user?.role === 'teacher' && (
                                <Link to="/teacher/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium">
                                    Teacher Portal
                                </Link>
                            )}
                            {user?.role === 'user' && (
                                <Link to="/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium">
                                    My Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-background)] rounded-full border border-[var(--color-border)]">
                                    <FaUserCircle className="text-xl text-[var(--color-primary)]" />
                                    <span className="font-medium text-sm text-[var(--color-text-primary)]">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors rounded-full hover:bg-[var(--color-background)]"
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="text-lg" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/admin/login"
                                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium text-sm px-3 py-2"
                                >
                                    Admin
                                </Link>
                                <div className="h-4 w-px bg-[var(--color-border)] mx-1"></div>
                                <Link
                                    to="/login"
                                    className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium text-sm px-4 py-2"
                                >
                                    Login
                                </Link>
                                <Button
                                    to="/register"
                                    variant="primary"
                                    size="sm"
                                    className="shadow-md shadow-indigo-500/20"
                                >
                                    Get Started
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
