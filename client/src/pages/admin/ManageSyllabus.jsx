import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManageSyllabus = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [syllabus, setSyllabus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        totalDuration: ''
    });
    const [moduleData, setModuleData] = useState({
        moduleTitle: '',
        description: '',
        duration: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCourses();
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

    const fetchSyllabus = async (courseId) => {
        try {
            const { data } = await api.get(`/syllabus/${courseId}`);
            setSyllabus(data);
            setShowCreateForm(false);
        } catch (error) {
            if (error.response?.status === 404) {
                setSyllabus(null);
                setShowCreateForm(true);
            }
        }
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSyllabus(null);
        setShowCreateForm(false);
        setError('');
        setSuccess('');
        fetchSyllabus(course._id);
    };

    const handleCreateSyllabus = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data } = await api.post('/syllabus', {
                course: selectedCourse._id,
                title: formData.title,
                totalDuration: formData.totalDuration,
                modules: []
            });
            setSyllabus(data.syllabus);
            setShowCreateForm(false);
            setSuccess('Syllabus created successfully!');
            setFormData({ title: '', totalDuration: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create syllabus');
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data } = await api.post(`/syllabus/${syllabus._id}/module`, moduleData);
            setSyllabus(data.syllabus);
            setShowModuleForm(false);
            setSuccess('Module added successfully!');
            setModuleData({ moduleTitle: '', description: '', duration: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add module');
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
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Link to="/admin/dashboard" className="text-orange-200 hover:text-white text-sm">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold">Manage Syllabus</h1>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Course List */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Select Course</h2>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                            {courses.map((course) => (
                                <div
                                    key={course._id}
                                    onClick={() => handleCourseSelect(course)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedCourse?._id === course._id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                                        }`}
                                >
                                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                                    <p className="text-sm text-gray-500">{course.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Syllabus Panel */}
                    <div className="lg:col-span-2">
                        {!selectedCourse ? (
                            <div className="bg-white shadow-lg rounded-lg p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No Course Selected</h3>
                                <p className="mt-2 text-sm text-gray-500">Select a course from the list to manage its syllabus.</p>
                            </div>
                        ) : showCreateForm ? (
                            <div className="bg-white shadow-lg rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">Create Syllabus for {selectedCourse.title}</h2>
                                <form onSubmit={handleCreateSyllabus} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration</label>
                                        <input
                                            type="text"
                                            value={formData.totalDuration}
                                            onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
                                            placeholder="e.g., 12 weeks"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                                    >
                                        Create Syllabus
                                    </button>
                                </form>
                            </div>
                        ) : syllabus ? (
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{syllabus.title}</h2>
                                        <p className="text-sm text-gray-500">{syllabus.totalDuration || 'Duration not set'}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModuleForm(true)}
                                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                                    >
                                        + Add Module
                                    </button>
                                </div>

                                {/* Add Module Form */}
                                {showModuleForm && (
                                    <div className="p-4 bg-orange-50 border-b border-orange-200">
                                        <form onSubmit={handleAddModule} className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={moduleData.moduleTitle}
                                                    onChange={(e) => setModuleData({ ...moduleData, moduleTitle: e.target.value })}
                                                    placeholder="Module Title *"
                                                    required
                                                    className="px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                                <input
                                                    type="text"
                                                    value={moduleData.duration}
                                                    onChange={(e) => setModuleData({ ...moduleData, duration: e.target.value })}
                                                    placeholder="Duration (e.g., 2 weeks) *"
                                                    required
                                                    className="px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={moduleData.description}
                                                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                                                placeholder="Module Description"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm"
                                                >
                                                    Add Module
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowModuleForm(false)}
                                                    className="text-gray-600 px-4 py-2 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Modules List */}
                                <div className="divide-y divide-gray-200">
                                    {syllabus.modules?.length > 0 ? (
                                        syllabus.modules.map((module, index) => (
                                            <div key={index} className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            Module {index + 1}: {module.moduleTitle}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{module.description}</p>
                                                        <span className="text-xs text-orange-600">{module.duration}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        {module.lectures?.length || 0} lectures
                                                    </span>
                                                </div>
                                                {module.lectures?.length > 0 && (
                                                    <ul className="mt-3 ml-4 space-y-1">
                                                        {module.lectures.map((lecture, lIdx) => (
                                                            <li key={lIdx} className="text-sm text-gray-600 flex items-center gap-2">
                                                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                                {lecture.title}
                                                                <span className="text-xs text-gray-400">({lecture.contentType})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            No modules yet. Click "Add Module" to create one.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white shadow-lg rounded-lg p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSyllabus;
