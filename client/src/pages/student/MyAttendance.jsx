import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const MyAttendance = () => {
    const { user } = useContext(AuthContext);
    const [attendanceData, setAttendanceData] = useState([]);
    const [overallStats, setOverallStats] = useState({ totalDays: 0, presentDays: 0, overallPercentage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get('/attendance/my-attendance');
            setAttendanceData(data.attendance || []);
            setOverallStats(data.overallStats || { totalDays: 0, presentDays: 0, overallPercentage: 0 });
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPercentageColor = (percentage) => {
        if (percentage >= 75) return 'text-green-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 75) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Link to="/student/dashboard" className="text-indigo-200 hover:text-white text-sm">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold">My Attendance</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Overall Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Overall Attendance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-3xl font-bold text-indigo-600">{overallStats.totalDays}</p>
                            <p className="text-gray-600">Total Classes</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-3xl font-bold text-green-600">{overallStats.presentDays}</p>
                            <p className="text-gray-600">Classes Attended</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className={`text-3xl font-bold ${getPercentageColor(overallStats.overallPercentage)}`}>
                                {overallStats.overallPercentage}%
                            </p>
                            <p className="text-gray-600">Overall Percentage</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Overall Progress</span>
                            <span className={`font-medium ${getPercentageColor(overallStats.overallPercentage)}`}>
                                {overallStats.overallPercentage}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(overallStats.overallPercentage)}`}
                                style={{ width: `${overallStats.overallPercentage}%` }}
                            ></div>
                        </div>
                        {overallStats.overallPercentage < 75 && (
                            <p className="mt-2 text-sm text-red-600">
                                ⚠️ Your attendance is below 75%. Please improve your attendance.
                            </p>
                        )}
                    </div>
                </div>

                {/* Course-wise Attendance */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h2 className="text-lg font-semibold">Course-wise Attendance</h2>
                    </div>

                    {attendanceData.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {attendanceData.map((course) => (
                                <div key={course.courseId} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{course.courseTitle}</h3>
                                            <p className="text-sm text-gray-500">
                                                {course.presentDays} present out of {course.totalDays} classes
                                            </p>
                                        </div>
                                        <div className={`text-2xl font-bold ${getPercentageColor(course.percentage)}`}>
                                            {course.percentage}%
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(course.percentage)}`}
                                            style={{ width: `${course.percentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="mt-3 flex gap-4 text-sm">
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            Present: {course.presentDays}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                            Absent: {course.absentDays}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>No attendance records found.</p>
                            <p className="text-sm mt-1">Attendance will appear here once your teachers start marking it.</p>
                        </div>
                    )}
                </div>

                {/* Attendance Legend */}
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-3">Attendance Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span>75% or above - Good Standing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span>50% - 74% - Needs Improvement</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span>Below 50% - Critical</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAttendance;
