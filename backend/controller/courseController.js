const Course = require("../models/courseSchema");

const getAllCourses = async (req, res) => {
    try {
        // You might want to filter or limit fields for the list view
        const courses = await Course.find().select("title category level price thumbnail instructor duration");
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getCourseDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate("instructor", "name email");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getAllCourses, getCourseDetails };
