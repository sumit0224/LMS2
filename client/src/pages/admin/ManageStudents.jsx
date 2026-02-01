import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FaPlus, FaSearch, FaArrowLeft, FaLayerGroup, FaBook } from 'react-icons/fa';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Selection State for Modals
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [modalType, setModalType] = useState(null); // 'course' | 'batch'
    const [selectedId, setSelectedId] = useState(''); // ID of course or batch to assign

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', courseId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentRes, courseRes, batchRes] = await Promise.all([
                api.get('/admin/students'),
                api.get('/admin/courses'),
                api.get('/admin/batches')
            ]);
            setStudents(studentRes.data);
            setFilteredStudents(studentRes.data);
            setCourses(courseRes.data);
            setBatches(batchRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents(students);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(lowerTerm) ||
                student.email.toLowerCase().includes(lowerTerm)
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const { data: userData } = await api.post('/admin/register/user', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (formData.courseId && userData.user?._id) {
                // If course selected during creation, assign it immediately
                await api.put('/admin/assign-course-student', {
                    studentId: userData.user._id,
                    courseId: formData.courseId
                });
            }

            setSuccess('Student created successfully!');
            setFormData({ name: '', email: '', phone: '', password: '', courseId: '' });
            setShowForm(false);
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create student');
        }
    };

    const handleAssign = async () => {
        if (!selectedId) return;
        setError('');
        setSuccess('');

        try {
            if (modalType === 'course') {
                await api.put('/admin/assign-course-student', {
                    studentId: selectedStudent._id,
                    courseId: selectedId
                });
                setSuccess(`Course assigned to ${selectedStudent.name}`);
            } else {
                await api.put('/admin/assign-batch', {
                    studentId: selectedStudent._id,
                    batchId: selectedId
                });
                setSuccess(`Batch assigned to ${selectedStudent.name}`);
            }
            setSelectedStudent(null);
            setModalType(null);
            setSelectedId('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Assignment failed');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/admin/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm flex items-center gap-1 mb-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Manage Students</h1>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : <><FaPlus className="mr-2" /> Add Student</>}
                </Button>
            </div>

            {/* Notifications */}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded">{success}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

            {/* Add Student Form */}
            {showForm && (
                <Card>
                    <Card.Content>
                        <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
                            <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} required />
                            <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Initial Course (Optional)</label>
                                <select
                                    name="courseId"
                                    className="w-full p-2 border rounded"
                                    value={formData.courseId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                            <Button type="submit" className="md:col-span-2">Create Student</Button>
                        </form>
                    </Card.Content>
                </Card>
            )}

            {/* Table */}
            <Card>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold">Students</h2>
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Batch</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredStudents.map(student => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.isActive ? 'Active' : 'Inactive'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">{student.email}</div>
                                        <div className="text-xs text-gray-500">{student.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        {/* Since user schema was updated but not populated in GET /students yet, might be hidden until populated. Assuming population works or basic check */}
                                        {student.batch ? <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">In Batch</span> : <span className="text-xs text-gray-400">None</span>}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => { setSelectedStudent(student); setModalType('course'); }}
                                            className="text-xs"
                                        >
                                            <FaBook className="mr-1" /> Course
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => { setSelectedStudent(student); setModalType('batch'); }}
                                            className="text-xs"
                                        >
                                            <FaLayerGroup className="mr-1" /> Batch
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Assignment Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <Card className="w-full max-w-md animate-scale-up">
                        <Card.Header>
                            <Card.Title>
                                Assign {modalType === 'course' ? 'Course' : 'Batch'} to {selectedStudent.name}
                            </Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-4">
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                            >
                                <option value="">Select {modalType}</option>
                                {modalType === 'course'
                                    ? courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)
                                    : batches.map(b => (
                                        <option key={b._id} value={b._id} disabled={b.students.length >= b.limit}>
                                            {b.title} ({b.students.length}/{b.limit})
                                        </option>
                                    ))
                                }
                            </select>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => { setSelectedStudent(null); setSelectedId(''); }}>Cancel</Button>
                                <Button onClick={handleAssign}>Assign</Button>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;
