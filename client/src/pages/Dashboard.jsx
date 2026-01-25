import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}</h2>
                <p className="text-gray-600">Email: {user.email}</p>
                <p className="text-gray-600">Role: <span className="capitalize">{user.role}</span></p>

                {/* Role specific content can go here */}
                {user.role === 'admin' && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded">
                        <h3 className="font-bold text-indigo-700">Admin Controls</h3>
                        <p>Manage users, teachers, and courses.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
