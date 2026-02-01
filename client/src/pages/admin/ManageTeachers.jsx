import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FaPlus, FaSearch, FaChalkboardTeacher, FaArrowLeft, FaExchangeAlt } from 'react-icons/fa';

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Assign Course Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        subject: '',
        qualification: '',
        experience: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTeachers();
        fetchCourses();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredTeachers(teachers);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = teachers.filter(teacher =>
                teacher.name.toLowerCase().includes(lowerTerm) ||
                teacher.email.toLowerCase().includes(lowerTerm) ||
                teacher.subject.toLowerCase().includes(lowerTerm)
            );
            setFilteredTeachers(filtered);
        }
    }, [searchTerm, teachers]);

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/admin/teachers');
            setTeachers(data);
            setFilteredTeachers(data);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/admin/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
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
            await api.post('/admin/register/teacher', formData);
            setSuccess('Teacher created successfully!');
            setFormData({ name: '', email: '', phone: '', password: '', subject: '', qualification: '', experience: '' });
            setShowForm(false);
            fetchTeachers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create teacher');
        }
    };

    const handleAssignCourse = async () => {
        if (!selectedTeacher || !selectedCourse) return;

        try {
            await api.put('/admin/assign-course', {
                teacherId: selectedTeacher._id,
                courseId: selectedCourse
            });
            setSuccess('Course assigned successfully!');
            setShowAssignModal(false);
            setSelectedTeacher(null);
            setSelectedCourse('');
            fetchTeachers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to assign course');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/admin/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm flex items-center gap-1 mb-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Manage Teachers</h1>
                    <p className="text-[var(--color-text-secondary)]">Onboard and manage instructor profiles.</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? 'secondary' : 'primary'}
                >
                    {showForm ? 'Cancel' : <><FaPlus className="mr-2" /> Add Teacher</>}
                </Button>
            </div>

            {/* Notifications */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in flex items-center">
                    <span className="font-medium mr-2">Success:</span> {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in flex items-center">
                    <span className="font-medium mr-2">Error:</span> {error}
                </div>
            )}

            {/* Add Teacher Form */}
            {showForm && (
                <Card className="animate-slide-up">
                    <Card.Header>
                        <Card.Title>Add New Teacher</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Full Name *" name="name" value={formData.name} onChange={handleInputChange} required />
                            <Input type="email" label="Email *" name="email" value={formData.email} onChange={handleInputChange} required />
                            <Input type="tel" label="Phone *" name="phone" value={formData.phone} onChange={handleInputChange} required pattern="[0-9]{10}" />
                            <Input type="password" label="Password *" name="password" value={formData.password} onChange={handleInputChange} required minLength="6" />
                            <Input label="Subject *" name="subject" value={formData.subject} onChange={handleInputChange} required />
                            <Input label="Qualification *" name="qualification" value={formData.qualification} onChange={handleInputChange} required />
                            <Input label="Experience" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g., 5 years" />

                            <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" isLoading={loading}>
                                    Create Teacher
                                </Button>
                            </div>
                        </form>
                    </Card.Content>
                </Card>
            )}

            {/* Search & Table */}
            <Card>
                <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Teacher List ({filteredTeachers.length})</h2>
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            className="pl-10 pr-4 py-2 w-full border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--color-border)]">
                        <thead className="bg-[var(--color-background)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Subject/Qual</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Assigned Courses</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[var(--color-border)]">
                            {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--color-text-primary)]">{teacher.name}</div>
                                                    <div className="text-xs text-[var(--color-text-secondary)]">{teacher.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[var(--color-text-primary)]">{teacher.subject}</div>
                                            <div className="text-xs text-[var(--color-text-secondary)]">{teacher.qualification}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {teacher.assignedCourses?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.assignedCourses.map((course, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            {course.title || course}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[var(--color-text-secondary)]">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTeacher(teacher);
                                                    setShowAssignModal(true);
                                                }}
                                                className="text-primary hover:text-primary-hover hover:bg-primary-light/10"
                                            >
                                                Assign Course
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
                                        No teachers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Assign Course Modal Overlay */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md pointer-events-auto">
                        <Card.Header>
                            <Card.Title>Assign Course to {selectedTeacher?.name}</Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Select Course</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="block w-full px-4 py-2.5 bg-white border border-[var(--color-border)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                >
                                    <option value="">Choose a course</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedTeacher(null);
                                        setSelectedCourse('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssignCourse}
                                    disabled={!selectedCourse}
                                >
                                    Assign Course
                                </Button>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ManageTeachers;
