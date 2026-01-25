import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="text-xl font-bold text-indigo-600">
                <Link to="/">LMS2</Link>
            </div>
            <div className="flex items-center space-x-4">
                <Link to="/courses" className="text-gray-600 hover:text-indigo-600">Courses</Link>

                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin/dashboard" className="text-gray-600 hover:text-indigo-600">Admin</Link>
                        )}
                        {user.role === 'teacher' && (
                            <Link to="/teacher/dashboard" className="text-gray-600 hover:text-indigo-600">Teacher</Link>
                        )}
                        {user.role === 'user' && (
                            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</Link>
                        )}

                        <div className="flex items-center space-x-2">
                            <FaUserCircle className="text-2xl text-gray-500" />
                            <span className="font-medium text-gray-700">{user.name}</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700">
                            <FaSignOutAlt className="mr-1" /> Logout
                        </button>
                    </>
                ) : (
                    <div className="space-x-2">
                        <Link to="/login" className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50">Login</Link>
                        {/* You might want a register link here too */}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
