const Enrollment = require("../models/enrollmentSchema");
const User = require("../models/userSchema");
const Course = require("../models/courseSchema");

// Enroll student in course (Admin)
const enrollStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).json({ message: "Student ID and Course ID are required" });
        }

        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "Student is already enrolled in this course" });
        }

        // Create enrollment
        const newEnrollment = new Enrollment({
            student: studentId,
            course: courseId,
            status: "Active",
            progress: 0,
            completedLectures: []
        });

        await newEnrollment.save();

        // Also update student's enrolledCourses array
        await User.findByIdAndUpdate(studentId, {
            $addToSet: { enrolledCourses: courseId }
        });

        // Update course enrollment count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { enrollmentCount: 1 }
        });

        res.status(201).json({ message: "Student enrolled successfully", enrollment: newEnrollment });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get student's enrollments
const getStudentEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;

        const enrollments = await Enrollment.find({ student: studentId })
            .populate("course", "title description thumbnail level duration instructor")
            .sort({ enrolledAt: -1 });

        res.status(200).json(enrollments);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get current user's enrollments
const getMyEnrollments = async (req, res) => {
    try {
        const studentId = req.user._id;

        const enrollments = await Enrollment.find({ student: studentId })
            .populate("course", "title description thumbnail level duration instructor")
            .sort({ enrolledAt: -1 });

        res.status(200).json(enrollments);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update student progress (Student)
const updateProgress = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { progress, completedLecture } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        // Verify the enrollment belongs to the requesting user
        if (enrollment.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this enrollment" });
        }

        // Update progress if provided
        if (progress !== undefined) {
            enrollment.progress = Math.min(100, Math.max(0, progress));
        }

        // Add completed lecture if provided and not already completed
        if (completedLecture && !enrollment.completedLectures.includes(completedLecture)) {
            enrollment.completedLectures.push(completedLecture);
        }

        enrollment.lastAccessedAt = Date.now();

        // Auto-complete if progress reaches 100
        if (enrollment.progress >= 100) {
            enrollment.status = "Completed";
        }

        await enrollment.save();

        res.status(200).json({ message: "Progress updated successfully", enrollment });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get enrollments by course (Teacher)
const getEnrollmentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollments = await Enrollment.find({ course: courseId })
            .populate("student", "name email phone")
            .sort({ enrolledAt: -1 });

        res.status(200).json(enrollments);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Cancel enrollment (Admin)
const cancelEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await Enrollment.findById(id);
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        enrollment.status = "Cancelled";
        await enrollment.save();

        // Remove from student's enrolledCourses
        await User.findByIdAndUpdate(enrollment.student, {
            $pull: { enrolledCourses: enrollment.course }
        });

        // Decrement course enrollment count
        await Course.findByIdAndUpdate(enrollment.course, {
            $inc: { enrollmentCount: -1 }
        });

        res.status(200).json({ message: "Enrollment cancelled successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all enrollments (Admin)
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate("student", "name email")
            .populate("course", "title")
            .sort({ enrolledAt: -1 })
            .limit(50);

        res.status(200).json(enrollments);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    enrollStudent,
    getStudentEnrollments,
    getMyEnrollments,
    updateProgress,
    getEnrollmentsByCourse,
    cancelEnrollment,
    getAllEnrollments
};
