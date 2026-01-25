import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/course');
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="p-4">Loading courses...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Available Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course._id} className="bg-white rounded shadow-md overflow-hidden hover:shadow-lg transition">
                        <img
                            src={course.thumbnail || 'https://via.placeholder.com/300'}
                            alt={course.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                            <p className="text-gray-600 mb-2 text-sm">{course.category}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold text-indigo-600">${course.price}</span>
                                <Link to={`/course/${course._id}`} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseList;
