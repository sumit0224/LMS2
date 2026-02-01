import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const Assignments = () => {
    const { user } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showSubmissions, setShowSubmissions] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [gradeModal, setGradeModal] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        description: '',
        dueDate: '',
        totalMarks: 100,
        isLateAllowed: false,
        maxAttempts: 1
    });

    const [gradeData, setGradeData] = useState({
        marksObtained: '',
        feedback: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignRes, courseRes] = await Promise.all([
                api.get('/assignments/my-assignments'),
                api.get('/teachers/courses')
            ]);
            setAssignments(assignRes.data.assignments || []);
            setCourses(courseRes.data.courses || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/assignments', formData);
            setSuccess('Assignment created successfully!');
            setShowForm(false);
            setFormData({
                courseId: '',
                title: '',
                description: '',
                dueDate: '',
                totalMarks: 100,
                isLateAllowed: false,
                maxAttempts: 1
            });
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create assignment');
        }
    };

    const handlePublish = async (id) => {
        try {
            await api.put(`/assignments/${id}/publish`);
            setSuccess('Assignment published!');
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to publish');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/assignments/${id}`);
            setSuccess('Assignment deleted!');
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete');
        }
    };

    const viewSubmissions = async (assignmentId) => {
        try {
            const { data } = await api.get(`/submissions/assignment/${assignmentId}`);
            setSubmissions(data.submissions || []);
            setShowSubmissions(assignmentId);
        } catch (error) {
            setError('Failed to load submissions');
        }
    };

    const handleGrade = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/submissions/${gradeModal._id}/review`, gradeData);
            setSuccess('Submission graded!');
            setGradeModal(null);
            setGradeData({ marksObtained: '', feedback: '' });
            viewSubmissions(showSubmissions);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to grade');
        }
    };

    const getStatusColor = (status) => {
        return status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white shadow-lg">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Link to="/teacher/dashboard" className="text-teal-200 hover:text-white text-sm">
                        ← Back to Dashboard
                    </Link>
                    <div className="mt-4 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Assignments</h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-teal-50"
                        >
                            + Create Assignment
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Messages */}
                {success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                        <button onClick={() => setSuccess('')} className="float-right">&times;</button>
                    </div>
                )}
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                        <button onClick={() => setError('')} className="float-right">&times;</button>
                    </div>
                )}

                {/* Create Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                required
                                className="border rounded-lg px-4 py-2"
                            >
                                <option value="">Select Course *</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>{course.title}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Assignment Title *"
                                required
                                className="border rounded-lg px-4 py-2"
                            />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description *"
                                required
                                className="border rounded-lg px-4 py-2 md:col-span-2"
                                rows={3}
                            />
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                                className="border rounded-lg px-4 py-2"
                            />
                            <input
                                type="number"
                                value={formData.totalMarks}
                                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                                placeholder="Total Marks"
                                min={1}
                                className="border rounded-lg px-4 py-2"
                            />
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isLateAllowed}
                                        onChange={(e) => setFormData({ ...formData, isLateAllowed: e.target.checked })}
                                    />
                                    Allow late submissions
                                </label>
                            </div>
                            <input
                                type="number"
                                value={formData.maxAttempts}
                                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                                placeholder="Max Attempts"
                                min={1}
                                max={5}
                                className="border rounded-lg px-4 py-2"
                            />
                            <div className="md:col-span-2 flex gap-2">
                                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
                                    Create Assignment
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-gray-600 px-4 py-2">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Assignments List */}
                <div className="grid gap-4">
                    {assignments.length > 0 ? assignments.map((assignment) => (
                        <div key={assignment._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                            {assignment.status}
                                        </span>
                                        {isOverdue(assignment.dueDate) && (
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span>Course: {assignment.course?.title}</span>
                                        <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                                        <span>Marks: {assignment.totalMarks}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {assignment.status === 'Draft' && (
                                        <button
                                            onClick={() => handlePublish(assignment._id)}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                        >
                                            Publish
                                        </button>
                                    )}
                                    <button
                                        onClick={() => viewSubmissions(assignment._id)}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                    >
                                        Submissions
                                    </button>
                                    <button
                                        onClick={() => handleDelete(assignment._id)}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            No assignments created yet. Click "Create Assignment" to get started.
                        </div>
                    )}
                </div>

                {/* Submissions Modal */}
                {showSubmissions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Submissions ({submissions.length})</h3>
                                <button onClick={() => setShowSubmissions(null)} className="text-gray-500 hover:text-gray-700">
                                    &times;
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-96">
                                {submissions.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {submissions.map((sub) => (
                                                <tr key={sub._id} className={sub.isLate ? 'bg-red-50' : ''}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{sub.student?.name}</div>
                                                        <div className="text-sm text-gray-500">{sub.student?.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {new Date(sub.createdAt).toLocaleString()}
                                                        {sub.isLate && <span className="ml-2 text-red-600">(Late)</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${sub.status === 'Reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>{sub.status}</span>
                                                    </td>
                                                    <td className="px-4 py-3">{sub.marksObtained ?? '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => {
                                                                setGradeModal(sub);
                                                                setGradeData({
                                                                    marksObtained: sub.marksObtained || '',
                                                                    feedback: sub.feedback || ''
                                                                });
                                                            }}
                                                            className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                                                        >
                                                            {sub.status === 'Reviewed' ? 'Edit Grade' : 'Grade'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center text-gray-500">No submissions yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Grade Modal */}
                {gradeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold mb-4">Grade Submission</h3>
                            <p className="text-sm text-gray-600 mb-4">Student: {gradeModal.student?.name}</p>

                            {gradeModal.submissionText && (
                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Submission:</p>
                                    <p className="text-sm">{gradeModal.submissionText}</p>
                                </div>
                            )}

                            <form onSubmit={handleGrade} className="space-y-4">
                                <input
                                    type="number"
                                    value={gradeData.marksObtained}
                                    onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                                    placeholder="Marks Obtained *"
                                    required
                                    min={0}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                <textarea
                                    value={gradeData.feedback}
                                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    placeholder="Feedback (optional)"
                                    rows={3}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                                        Save Grade
                                    </button>
                                    <button type="button" onClick={() => setGradeModal(null)} className="text-gray-600 px-4 py-2">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assignments;
