import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const MyAssignments = () => {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [submitModal, setSubmitModal] = useState(null);
    const [submissionData, setSubmissionData] = useState({ submissionText: '', submissionFile: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments(selectedCourse._id);
        }
    }, [selectedCourse]);

    const fetchData = async () => {
        try {
            const [enrollRes, subRes] = await Promise.all([
                api.get('/users/courses'),
                api.get('/submissions/my-submissions')
            ]);
            setEnrollments(enrollRes.data.enrollments || []);
            setSubmissions(subRes.data.submissions || []);

            if (enrollRes.data.enrollments?.length > 0) {
                setSelectedCourse(enrollRes.data.enrollments[0].course);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const { data } = await api.get(`/assignments/course/${courseId}`);
            setAssignments(data.assignments || []);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        }
    };

    const getSubmission = (assignmentId) => {
        return submissions.find(s => s.assignment?._id === assignmentId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!submissionData.submissionText && !submissionData.submissionFile) {
            setError('Please provide text or file submission');
            return;
        }

        try {
            await api.post('/submissions', {
                assignmentId: submitModal._id,
                ...submissionData
            });
            setSuccess('Assignment submitted successfully!');
            setSubmitModal(null);
            setSubmissionData({ submissionText: '', submissionFile: '' });

            // Refresh submissions
            const { data } = await api.get('/submissions/my-submissions');
            setSubmissions(data.submissions || []);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit');
        }
    };

    const getTimeRemaining = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;

        if (diff < 0) return { text: 'Overdue', isOverdue: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return { text: `${days}d ${hours}h remaining`, isOverdue: false };
        if (hours > 0) return { text: `${hours}h remaining`, isOverdue: false, isUrgent: true };
        return { text: 'Due soon', isOverdue: false, isUrgent: true };
    };

    const getStatusBadge = (assignment) => {
        const submission = getSubmission(assignment._id);

        if (!submission) {
            const timeInfo = getTimeRemaining(assignment.dueDate);
            if (timeInfo.isOverdue) {
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Overdue</span>;
            }
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Pending</span>;
        }

        if (submission.status === 'Reviewed') {
            return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Reviewed</span>;
        }

        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Submitted</span>;
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
                    <h1 className="mt-4 text-3xl font-bold">My Assignments</h1>
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

                {/* Course Tabs */}
                {enrollments.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="flex overflow-x-auto">
                            {enrollments.map((enroll) => (
                                <button
                                    key={enroll._id}
                                    onClick={() => setSelectedCourse(enroll.course)}
                                    className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${selectedCourse?._id === enroll.course?._id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {enroll.course?.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Assignments List */}
                <div className="space-y-4">
                    {assignments.length > 0 ? assignments.map((assignment) => {
                        const submission = getSubmission(assignment._id);
                        const timeInfo = getTimeRemaining(assignment.dueDate);

                        return (
                            <div key={assignment._id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                            {getStatusBadge(assignment)}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <span className={`font-medium ${timeInfo.isOverdue ? 'text-red-600' : timeInfo.isUrgent ? 'text-orange-600' : 'text-gray-600'}`}>
                                                ⏰ {timeInfo.text}
                                            </span>
                                            <span className="text-gray-500">Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                                            <span className="text-gray-500">Marks: {assignment.totalMarks}</span>
                                            {assignment.isLateAllowed && (
                                                <span className="text-green-600">Late allowed</span>
                                            )}
                                        </div>

                                        {/* Submission Details */}
                                        {submission && (
                                            <div className={`mt-4 p-4 rounded-lg ${submission.status === 'Reviewed' ? 'bg-green-50' : 'bg-blue-50'}`}>
                                                <p className="text-sm font-medium mb-1">Your Submission</p>
                                                <p className="text-sm text-gray-600">Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
                                                {submission.isLate && <p className="text-sm text-red-600">Submitted late</p>}

                                                {submission.status === 'Reviewed' && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="text-lg font-bold text-green-700">
                                                            Marks: {submission.marksObtained}/{assignment.totalMarks}
                                                        </p>
                                                        {submission.feedback && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                <span className="font-medium">Feedback:</span> {submission.feedback}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="ml-4">
                                        {!submission && !timeInfo.isOverdue && (
                                            <button
                                                onClick={() => setSubmitModal(assignment)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Submit
                                            </button>
                                        )}
                                        {!submission && timeInfo.isOverdue && assignment.isLateAllowed && (
                                            <button
                                                onClick={() => setSubmitModal(assignment)}
                                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                            >
                                                Submit Late
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            {selectedCourse ? 'No assignments for this course yet.' : 'Select a course to view assignments.'}
                        </div>
                    )}
                </div>

                {/* Submit Modal */}
                {submitModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                            <h3 className="text-lg font-semibold mb-4">Submit Assignment</h3>
                            <p className="text-gray-600 mb-4">{submitModal.title}</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Answer *
                                    </label>
                                    <textarea
                                        value={submissionData.submissionText}
                                        onChange={(e) => setSubmissionData({ ...submissionData, submissionText: e.target.value })}
                                        placeholder="Write your answer here..."
                                        rows={6}
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        File URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={submissionData.submissionFile}
                                        onChange={(e) => setSubmissionData({ ...submissionData, submissionFile: e.target.value })}
                                        placeholder="https://drive.google.com/your-file"
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                </div>

                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                <div className="flex gap-2">
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                        Submit Assignment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubmitModal(null);
                                            setError('');
                                        }}
                                        className="text-gray-600 px-4 py-2"
                                    >
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

export default MyAssignments;
