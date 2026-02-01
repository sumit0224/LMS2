import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaArrowLeft, FaCheckCircle, FaCircle, FaPlayCircle, FaFileAlt, FaVideo, FaQuestionCircle, FaUserTie } from 'react-icons/fa';

const StudentCourseView = () => {
    const { courseId } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [syllabus, setSyllabus] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedLectures, setCompletedLectures] = useState([]);
    const [success, setSuccess] = useState('');
    const [activeModule, setActiveModule] = useState(0); // For accordion behavior

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const { data } = await api.get(`/users/courses/${courseId}`);
            if (data.success) {
                setCourse(data.course);
                setEnrollment(data.enrollment);
                setCompletedLectures(data.enrollment?.completedLectures || []);
            }
            try {
                const syllabusRes = await api.get(`/users/courses/${courseId}/syllabus`);
                if (syllabusRes.data.success) setSyllabus(syllabusRes.data.syllabus);
            } catch (err) { setSyllabus(null); }
        } catch (error) {
            console.error('Failed to fetch course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async (lectureId, isCompleted) => {
        if (!enrollment) return;
        try {
            const { data } = await api.put(`/users/progress/${enrollment._id}`, {
                lectureId,
                isCompleted: !isCompleted
            });
            if (data.success) {
                setEnrollment(data.enrollment);
                setCompletedLectures(data.enrollment.completedLectures);
                setSuccess(isCompleted ? 'Marked incomplete' : 'Lesson completed!');
                setTimeout(() => setSuccess(''), 2000);
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    const isLessonCompleted = (lectureId) => completedLectures.includes(lectureId);

    const getIconForType = (type) => {
        switch (type) {
            case 'Video': return <FaVideo />;
            case 'PDF': return <FaFileAlt />;
            case 'Quiz': return <FaQuestionCircle />;
            default: return <FaPlayCircle />;
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>;
    if (!course) return <div className="p-8 text-center text-[var(--color-text-secondary)]">Course not found.</div>;

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link to="/student/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm flex items-center gap-1 mb-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{course.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                    </div>
                </div>
            </div>

            {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded border border-green-200 fixed top-4 right-4 z-50 animate-fade-in shadow-lg">{success}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Syllabus */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress Card */}
                    {enrollment && (
                        <Card className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white border-none">
                            <Card.Content className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Overall Progress</p>
                                    <p className="text-3xl font-bold">{enrollment.progress}%</p>
                                </div>
                                <div className="w-1/3">
                                    <div className="w-full bg-white/20 rounded-full h-2">
                                        <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${enrollment.progress}%` }}></div>
                                    </div>
                                    <p className="text-right text-xs text-blue-100 mt-1">{completedLectures.length} / {syllabus?.modules?.reduce((acc, m) => acc + (m.lectures?.length || 0), 0) || 0} Lessons</p>
                                </div>
                            </Card.Content>
                        </Card>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Course Curriculum</h2>
                        {syllabus && syllabus.modules?.length > 0 ? (
                            syllabus.modules.map((module, modIndex) => (
                                <Card key={modIndex} className={`overflow-hidden transition-all duration-300 ${activeModule === modIndex ? 'ring-1 ring-[var(--color-primary)]' : ''}`}>
                                    <div
                                        className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                        onClick={() => setActiveModule(activeModule === modIndex ? null : modIndex)}
                                    >
                                        <div>
                                            <h3 className="font-bold text-[var(--color-text-primary)]">Module {modIndex + 1}: {module.moduleTitle}</h3>
                                            <p className="text-xs text-[var(--color-text-secondary)]">{module.duration} • {module.lectures?.length || 0} Lessons</p>
                                        </div>
                                        <span className={`transform transition-transform ${activeModule === modIndex ? 'rotate-180' : ''}`}>▼</span>
                                    </div>

                                    {/* Lessons List */}
                                    {activeModule === modIndex && (
                                        <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
                                            {module.lectures?.length > 0 ? (
                                                module.lectures.map((lecture, lecIndex) => {
                                                    const lectureId = `${modIndex}-${lecIndex}`;
                                                    const completed = isLessonCompleted(lectureId);
                                                    return (
                                                        <div key={lecIndex} className={`px-6 py-4 flex items-center justify-between hover:bg-[var(--color-background)] transition-colors ${completed ? 'bg-green-50/50' : ''}`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-full ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-[var(--color-text-secondary)]'}`}>
                                                                    {getIconForType(lecture.contentType)}
                                                                </div>
                                                                <div>
                                                                    <p className={`font-medium ${completed ? 'text-green-800 line-through opacity-75' : 'text-[var(--color-text-primary)]'}`}>
                                                                        {lecture.title}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                                                        {lecture.contentType} • {lecture.duration}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant={completed ? "outline" : "secondary"}
                                                                className={completed ? "border-green-200 text-green-700 hover:bg-green-50" : ""}
                                                                onClick={() => handleLessonComplete(lectureId, completed)}
                                                            >
                                                                {completed ? <><FaCheckCircle className="mr-1" /> Done</> : "Mark Complete"}
                                                            </Button>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-4 text-center text-sm text-[var(--color-text-secondary)]">No content available yet.</div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-[var(--color-text-secondary)]">Content is being prepared by the instructor.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Info */}
                <div className="space-y-6">
                    <Card>
                        <Card.Header><Card.Title>Instructor</Card.Title></Card.Header>
                        <Card.Content className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--color-surface)] rounded-full flex items-center justify-center text-2xl text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                <FaUserTie />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--color-text-primary)]">{course.instructor?.name || 'Instructor'}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{course.instructor?.email}</p>
                            </div>
                        </Card.Content>
                    </Card>

                    <Card>
                        <Card.Header><Card.Title>About Course</Card.Title></Card.Header>
                        <Card.Content className="space-y-4">
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                {course.description}
                            </p>
                            <div className="pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-[var(--color-text-secondary)] block">Level</span>
                                    <span className="font-medium text-sm">{course.level}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-[var(--color-text-secondary)] block">Duration</span>
                                    <span className="font-medium text-sm">{course.duration}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-[var(--color-text-secondary)] block">Enrolled Date</span>
                                    <span className="font-medium text-sm">{enrollment ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentCourseView;
