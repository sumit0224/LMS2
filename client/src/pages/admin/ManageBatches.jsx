import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FaPlus, FaTrash, FaUsers, FaCalendarAlt } from 'react-icons/fa';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        limit: 10,
        startDate: '',
        schedule: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchRes, courseRes] = await Promise.all([
                api.get('/admin/batches'),
                api.get('/admin/courses')
            ]);
            setBatches(batchRes.data || []);
            setCourses(courseRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert comma-separated schedule to array
            const scheduleArray = formData.schedule.split(',').map(s => s.trim()).filter(s => s);

            await api.post('/admin/batch', {
                ...formData,
                schedule: scheduleArray
            });

            setMessage('Batch created successfully!');
            setShowModal(false);
            setFormData({ title: '', courseId: '', limit: 10, startDate: '', schedule: '' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to create batch: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Manage Batches</h1>
                <Button onClick={() => setShowModal(true)}>
                    <FaPlus className="mr-2" /> Create Batch
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                    <Card key={batch._id}>
                        <Card.Content>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{batch.title}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">{batch.course?.title}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${batch.students.length >= batch.limit ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {batch.students.length} / {batch.limit} Students
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt />
                                    <span>Starts: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaUsers />
                                    <span>Schedule: {batch.schedule?.join(', ') || 'Not set'}</span>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                ))}
            </div>

            {/* Create Batch Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <Card.Header>
                            <Card.Title>Create New Batch</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Batch Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Course</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a Course</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Limit (Max 10)"
                                        value={formData.limit}
                                        onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                                        max={10}
                                        required
                                    />
                                    <Input
                                        type="date"
                                        label="Start Date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="Schedule (e.g., Mon 10am, Wed 2pm)"
                                    value={formData.schedule}
                                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                    placeholder="Comma separated"
                                />
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                                    <Button type="submit">Create Batch</Button>
                                </div>
                            </form>
                        </Card.Content>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ManageBatches;
