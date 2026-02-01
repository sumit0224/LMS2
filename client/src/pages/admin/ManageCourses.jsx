import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        duration: '',
        level: 'Beginner',
        instructor: '',
        status: 'Draft',
        language: 'English'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchTeachers();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/admin/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/admin/teachers');
            setTeachers(data);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/admin/course', {
                ...formData,
                price: Number(formData.price)
            });
            setSuccess('Course created successfully!');
            setFormData({
                title: '', description: '', category: '', price: '',
                duration: '', level: 'Beginner', instructor: '', status: 'Draft', language: 'English'
            });
            setShowForm(false);
            fetchCourses();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create course');
        }
    };

    const handleStatusToggle = async (courseId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
            await api.put(`/admin/course/${courseId}`, { status: newStatus });
            fetchCourses();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await api.delete(`/admin/course/${courseId}`);
            setSuccess('Course deleted successfully!');
            fetchCourses();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete course');
        }
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
            <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white shadow-lg">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link to="/admin/dashboard" className="text-purple-200 hover:text-white text-sm">
                                ← Back to Dashboard
                            </Link>
                            <h1 className="mt-2 text-3xl font-bold">Manage Courses</h1>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-white text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                        >
                            {showForm ? 'Cancel' : '+ Add Course'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Messages */}
                {success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Add Course Form */}
                {showForm && (
                    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 8 weeks"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor *</label>
                                <select
                                    name="instructor"
                                    value={formData.instructor}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name} ({teacher.subject})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <div key={course._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="h-32 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <span>{course.level}</span>
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                        <span className="font-medium">Instructor:</span> {course.instructor?.name || 'Unassigned'}
                                    </div>
                                    <div className="flex items-center justify-between text-sm mb-4">
                                        <span className="text-purple-600 font-bold">₹{course.price}</span>
                                        <span className="text-gray-500">{course.enrollmentCount} enrolled</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusToggle(course._id, course.status)}
                                            className={`flex-1 py-2 px-3 rounded text-sm font-medium ${course.status === 'Active'
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                        >
                                            {course.status === 'Active' ? 'Set Draft' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="py-2 px-3 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No courses found. Click "Add Course" to create one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCourses;
