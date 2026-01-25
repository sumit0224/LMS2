import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const CourseDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/course/${id}`);
                setCourse(data);
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    if (loading) return <div className="p-4">Loading...</div>;
    if (!course) return <div className="p-4">Course not found.</div>;

    return (
        <div className="container mx-auto p-4">
            <Link to="/courses" className="text-indigo-600 mb-4 inline-block">&larr; Back to Courses</Link>
            <div className="bg-white rounded shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2">
                        <img
                            src={course.thumbnail || 'https://via.placeholder.com/600x400'}
                            alt={course.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-6 md:w-1/2">
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                        <p className="text-gray-700 mb-4">{course.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <span className="font-semibold text-gray-600">Level:</span> {course.level}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Duration:</span> {course.duration}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Category:</span> {course.category}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Price:</span> ${course.price}
                            </div>
                        </div>

                        {course.instructor && (
                            <div className="mb-6 p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold">Instructor</h3>
                                <p>{course.instructor.name}</p>
                                <p className="text-sm text-gray-500">{course.instructor.email}</p>
                            </div>
                        )}

                        <button className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition">
                            Enroll Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
