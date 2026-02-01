import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FaArrowLeft, FaBook, FaUserGraduate, FaClipboardList, FaPlus, FaVideo, FaFilePdf, FaFileAlt, FaQuestionCircle } from 'react-icons/fa';

const TeacherCourseDetail = () => {
    const { courseId } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [syllabus, setSyllabus] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Forms State
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [showCreateSyllabusForm, setShowCreateSyllabusForm] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);

    // Data State
    const [lessonData, setLessonData] = useState({ title: '', contentType: 'Video', duration: '', order: 1 });
    const [moduleData, setModuleData] = useState({ moduleTitle: '', description: '', duration: '' });
    const [syllabusData, setSyllabusData] = useState({ title: '', totalDuration: '' });

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const [courseRes, enrollmentsRes] = await Promise.all([
                api.get(`/teachers/courses/${courseId}`),
                api.get(`/teachers/courses/${courseId}/enrollments`)
            ]);

            if (courseRes.data.success) setCourse(courseRes.data.course);
            if (enrollmentsRes.data.success) setEnrollments(enrollmentsRes.data.enrollments);

            try {
                const syllabusRes = await api.get(`/syllabus/${courseId}`);
                setSyllabus(syllabusRes.data);
            } catch (err) {
                setSyllabus(null);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSyllabus = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/syllabus', {
                course: courseId, ...syllabusData, modules: []
            });
            setSyllabus(data.syllabus);
            setShowCreateSyllabusForm(false);
            setSuccess('Syllabus created successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create syllabus');
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!syllabus) return;
        try {
            const { data } = await api.post(`/syllabus/${syllabus._id}/module`, moduleData);
            setSyllabus(data.syllabus);
            setShowModuleForm(false);
            setSuccess('Module added!');
            setModuleData({ moduleTitle: '', description: '', duration: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add module');
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        if (selectedModule === null || !syllabus) return;
        try {
            const { data } = await api.post(`/syllabus/${syllabus._id}/module/${selectedModule}/lesson`, lessonData);
            setSyllabus(data.syllabus);
            setShowLessonForm(false);
            setSuccess('Lesson added!');
            setLessonData({ title: '', contentType: 'Video', duration: '', order: 1 });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add lesson');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>;
    if (!course) return <div className="p-8 text-center text-[var(--color-text-secondary)]">Course not found.</div>;

    const TabButton = ({ name, label }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === name
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link to="/teacher/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm flex items-center gap-1 mb-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{course.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <span className={`${course.status === 'Active' ? 'text-green-600' : 'text-yellow-600'} font-medium`}>{course.status}</span>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded border border-green-200">{success}</div>}
            {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded border border-red-200">{error}</div>}

            {/* Tabs & Content */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-[var(--color-border)] flex">
                    <TabButton name="overview" label="Overview" />
                    <TabButton name="students" label={`Students (${enrollments.length})`} />
                    <TabButton name="syllabus" label="Curriculum" />
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <Card.Header><Card.Title>Course Metadata</Card.Title></Card.Header>
                                <Card.Content className="space-y-4">
                                    <div><span className="text-sm text-[var(--color-text-secondary)] block">Description</span> <p className="text-[var(--color-text-primary)]">{course.description}</p></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><span className="text-sm text-[var(--color-text-secondary)] block">Price</span> <p className="font-medium">₹{course.price}</p></div>
                                        <div><span className="text-sm text-[var(--color-text-secondary)] block">Duration</span> <p className="font-medium">{course.duration}</p></div>
                                    </div>
                                </Card.Content>
                            </Card>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="flex flex-col justify-center items-center p-6 bg-blue-50 border-none">
                                    <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
                                    <p className="text-sm text-blue-800 opacity-75">Enrolled</p>
                                </Card>
                                <Card className="flex flex-col justify-center items-center p-6 bg-green-50 border-none">
                                    <p className="text-3xl font-bold text-green-600">{enrollments.filter(e => e.status === 'Completed').length}</p>
                                    <p className="text-sm text-green-800 opacity-75">Completed</p>
                                </Card>
                                <Card className="flex flex-col justify-center items-center p-6 bg-purple-50 border-none">
                                    <p className="text-3xl font-bold text-purple-600">{syllabus?.modules?.length || 0}</p>
                                    <p className="text-sm text-purple-800 opacity-75">Modules</p>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[var(--color-border)]">
                                <thead className="bg-[var(--color-background)]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Joined</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Progress</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {enrollments.map(enr => (
                                        <tr key={enr._id}>
                                            <td className="px-6 py-4">
                                                <p className="font-medium">{enr.student?.name}</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{enr.student?.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                                                {new Date(enr.enrolledAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                                                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${enr.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs">{enr.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs ${enr.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{enr.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Syllabus Tab */}
                    {activeTab === 'syllabus' && (
                        <div className="space-y-6">
                            {!syllabus ? (
                                !showCreateSyllabusForm ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-[var(--color-text-secondary)] mb-4">No curriculum defined yet.</p>
                                        <Button onClick={() => setShowCreateSyllabusForm(true)} variant="primary">Create Syllabus</Button>
                                    </div>
                                ) : (
                                    <Card>
                                        <Card.Header><Card.Title>Create Syllabus</Card.Title></Card.Header>
                                        <Card.Content>
                                            <form onSubmit={handleCreateSyllabus} className="space-y-4">
                                                <Input label="Title" value={syllabusData.title} onChange={e => setSyllabusData({ ...syllabusData, title: e.target.value })} required />
                                                <Input label="Total Duration" value={syllabusData.totalDuration} onChange={e => setSyllabusData({ ...syllabusData, totalDuration: e.target.value })} />
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="ghost" onClick={() => setShowCreateSyllabusForm(false)}>Cancel</Button>
                                                    <Button type="submit">Create</Button>
                                                </div>
                                            </form>
                                        </Card.Content>
                                    </Card>
                                )
                            ) : (
                                <>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-[var(--color-border)]">
                                        <h3 className="text-lg font-bold">{syllabus.title}</h3>
                                        <Button size="sm" onClick={() => { setShowModuleForm(true); setModuleData({ moduleTitle: '', description: '', duration: '' }); setSelectedModule(null); }}>
                                            <FaPlus className="mr-2" /> Add Module
                                        </Button>
                                    </div>

                                    {showModuleForm && (
                                        <Card>
                                            <Card.Header><Card.Title>Add New Module</Card.Title></Card.Header>
                                            <Card.Content>
                                                <form onSubmit={handleAddModule} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input label="Module Title *" value={moduleData.moduleTitle} onChange={e => setModuleData({ ...moduleData, moduleTitle: e.target.value })} required />
                                                        <Input label="Duration *" value={moduleData.duration} onChange={e => setModuleData({ ...moduleData, duration: e.target.value })} required />
                                                    </div>
                                                    <Input label="Description" value={moduleData.description} onChange={e => setModuleData({ ...moduleData, description: e.target.value })} />
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="ghost" onClick={() => setShowModuleForm(false)}>Cancel</Button>
                                                        <Button type="submit">Save Module</Button>
                                                    </div>
                                                </form>
                                            </Card.Content>
                                        </Card>
                                    )}

                                    {showLessonForm && (
                                        <Card className="border-[var(--color-primary)] border-2">
                                            <Card.Header><Card.Title>Add Lesson to Module {selectedModule + 1}</Card.Title></Card.Header>
                                            <Card.Content>
                                                <form onSubmit={handleAddLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input label="Lesson Title *" value={lessonData.title} onChange={e => setLessonData({ ...lessonData, title: e.target.value })} required />
                                                    <div>
                                                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Content Type</label>
                                                        <select
                                                            value={lessonData.contentType}
                                                            onChange={e => setLessonData({ ...lessonData, contentType: e.target.value })}
                                                            className="w-full px-4 py-2.5 bg-white border border-[var(--color-border)] rounded-lg"
                                                        >
                                                            <option value="Video">Video</option>
                                                            <option value="PDF">PDF</option>
                                                            <option value="Text">Text</option>
                                                            <option value="Quiz">Quiz</option>
                                                        </select>
                                                    </div>
                                                    <Input label="Duration (e.g. 15min)" value={lessonData.duration} onChange={e => setLessonData({ ...lessonData, duration: e.target.value })} />
                                                    <Input type="number" label="Order" value={lessonData.order} onChange={e => setLessonData({ ...lessonData, order: e.target.value })} />
                                                    <div className="md:col-span-2 flex gap-2 justify-end">
                                                        <Button variant="ghost" onClick={() => setShowLessonForm(false)}>Cancel</Button>
                                                        <Button type="submit">Add Lesson</Button>
                                                    </div>
                                                </form>
                                            </Card.Content>
                                        </Card>
                                    )}

                                    <div className="space-y-4">
                                        {syllabus.modules?.map((mod, idx) => (
                                            <Card key={idx} className="overflow-hidden">
                                                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
                                                    <div>
                                                        <h4 className="font-bold text-[var(--color-text-primary)]">Module {idx + 1}: {mod.moduleTitle}</h4>
                                                        <p className="text-xs text-[var(--color-text-secondary)]">{mod.duration}</p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedModule(idx); setShowLessonForm(true); }}>
                                                        <FaPlus className="mr-1" /> Add Lesson
                                                    </Button>
                                                </div>
                                                {mod.lectures?.length > 0 && (
                                                    <div className="divide-y divide-[var(--color-border)]">
                                                        {mod.lectures.map((lec, lIdx) => (
                                                            <div key={lIdx} className="px-6 py-3 flex items-center justify-between hover:bg-white transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-background)] flex items-center justify-center text-[var(--color-primary)] text-sm font-bold border border-[var(--color-border)]">
                                                                        {lIdx + 1}
                                                                    </div>
                                                                    <span className="text-sm font-medium">{lec.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                                                    <span className="flex items-center gap-1">
                                                                        {lec.contentType === 'Video' && <FaVideo />}
                                                                        {lec.contentType === 'PDF' && <FaFilePdf />}
                                                                        {lec.contentType === 'Text' && <FaFileAlt />}
                                                                        {lec.contentType === 'Quiz' && <FaQuestionCircle />}
                                                                        {lec.contentType}
                                                                    </span>
                                                                    <span>{lec.duration}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherCourseDetail;
