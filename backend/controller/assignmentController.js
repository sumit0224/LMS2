const Assignment = require("../models/assignmentSchema");
const Course = require("../models/courseSchema");
const Teacher = require("../models/teacherSchema");

// Create assignment (Teacher only)
const createAssignment = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { courseId, title, description, dueDate, totalMarks, isLateAllowed, maxAttempts } = req.body;

        // Verify teacher is assigned to this course
        const teacher = await Teacher.findById(teacherId);
        if (!teacher || !teacher.assignedCourses.includes(courseId)) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this course"
            });
        }

        const assignment = new Assignment({
            course: courseId,
            title,
            description,
            dueDate,
            totalMarks,
            createdBy: teacherId,
            isLateAllowed: isLateAllowed || false,
            maxAttempts: maxAttempts || 1
        });

        await assignment.save();

        res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get assignments by course
const getAssignmentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userRole = req.user?.role;

        let query = { course: courseId };

        // Students can only see published assignments
        if (userRole === "User" || userRole === "user") {
            query.status = "Published";
        }

        const assignments = await Assignment.find(query)
            .populate("createdBy", "name email")
            .sort({ dueDate: 1 });

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single assignment
const getAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id)
            .populate("createdBy", "name email")
            .populate("course", "title");

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update assignment (Teacher only)
const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const updates = req.body;

        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Verify ownership
        if (assignment.createdBy.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own assignments"
            });
        }

        Object.assign(assignment, updates);
        await assignment.save();

        res.json({
            success: true,
            message: "Assignment updated successfully",
            assignment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Publish assignment
const publishAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        if (assignment.createdBy.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: "You can only publish your own assignments"
            });
        }

        assignment.status = "Published";
        await assignment.save();

        res.json({
            success: true,
            message: "Assignment published successfully",
            assignment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete assignment (Teacher only)
const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        if (assignment.createdBy.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own assignments"
            });
        }

        await Assignment.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Assignment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teacher's assignments (all courses)
const getTeacherAssignments = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const assignments = await Assignment.find({ createdBy: teacherId })
            .populate("course", "title")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAssignment,
    getAssignmentsByCourse,
    getAssignment,
    updateAssignment,
    publishAssignment,
    deleteAssignment,
    getTeacherAssignments
};
