import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaCheck, FaTimes, FaClock, FaCalendarAlt, FaSearch } from 'react-icons/fa';

const Attendance = () => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]); // Currently, teacher might select course first, then if batch filter needed
    // Simplified: Teacher selects a Course. Then optionally filters by Batch (if API supports it).
    // Let's assume teacher sees all students in course, or filtered by batch.

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/teachers/courses');
            setCourses(data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchStudents = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/teachers/courses/${selectedCourse}/attendance-students`);
            setStudents(data || []);
            // Initialize all as Present by default?? Or Absent? Let's leave unset for manual entry.
            // Or default to Present for easier workflow.
            const initialStatus = {};
            data.forEach(s => initialStatus[s._id] = 'Present');
            setAttendance(initialStatus);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                student: studentId,
                status
            }));

            await api.post('/teachers/attendance', {
                courseId: selectedCourse,
                date: selectedDate,
                records,
                notes: 'Marked via Teacher Dashboard'
            });

            setMessage('Attendance marked successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Daily Attendance</h1>

            <Card>
                <Card.Content className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1">Select Course</label>
                        <select
                            className="w-full p-2 border rounded-lg bg-[var(--color-surface)]"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded-lg"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <Button onClick={fetchStudents} disabled={!selectedCourse} isLoading={loading}>
                        <FaSearch className="mr-2" /> Load Students
                    </Button>
                </Card.Content>
            </Card>

            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {students.length > 0 && (
                <Card>
                    <Card.Header className="flex justify-between items-center">
                        <Card.Title>Mark Attendance</Card.Title>
                        <span className="text-sm text-gray-500">{students.length} Students Enrolled</span>
                    </Card.Header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-sm text-[var(--color-text-secondary)]">
                                <tr>
                                    <th className="p-4 border-b">Student Name</th>
                                    <th className="p-4 border-b text-center">Present</th>
                                    <th className="p-4 border-b text-center">Absent</th>
                                    <th className="p-4 border-b text-center">Late</th>
                                    <th className="p-4 border-b text-center">Excused</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map(student => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{student.name}</td>
                                        {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                                            <td key={status} className="p-4 text-center">
                                                <label className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`status-${student._id}`}
                                                        value={status}
                                                        checked={attendance[student._id] === status}
                                                        onChange={() => handleStatusChange(student._id, status)}
                                                        className="accent-[var(--color-primary)] w-4 h-4"
                                                    />
                                                </label>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t flex justify-end">
                        <Button size="lg" onClick={handleSubmit}>
                            Submit Attendance
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Attendance;
