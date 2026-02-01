const Submission = require("../models/submissionSchema");
const Assignment = require("../models/assignmentSchema");
const Enrollment = require("../models/enrollmentSchema");
const User = require("../models/userSchema");

// Submit assignment (Student only)
const submitAssignment = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { assignmentId, submissionText, submissionFile } = req.body;

        // Get assignment details
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Check if published
        if (assignment.status !== "Published") {
            return res.status(400).json({ success: false, message: "Assignment not available for submission" });
        }

        // Verify student is enrolled in the course
        const enrollment = await Enrollment.findOne({
            student: studentId,
            course: assignment.course,
            status: { $ne: "Cancelled" }
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        // Check due date
        const now = new Date();
        const isLate = now > new Date(assignment.dueDate);

        if (isLate && !assignment.isLateAllowed) {
            return res.status(400).json({
                success: false,
                message: "Submission deadline has passed"
            });
        }

        // Check for existing submission
        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: studentId
        });

        if (existingSubmission) {
            // Check max attempts
            if (existingSubmission.attemptNumber >= assignment.maxAttempts) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum ${assignment.maxAttempts} attempt(s) allowed`
                });
            }

            // Update existing submission
            existingSubmission.submissionText = submissionText || existingSubmission.submissionText;
            existingSubmission.submissionFile = submissionFile || existingSubmission.submissionFile;
            existingSubmission.attemptNumber += 1;
            existingSubmission.isLate = isLate;
            existingSubmission.status = "Submitted";
            await existingSubmission.save();

            return res.json({
                success: true,
                message: "Submission updated successfully",
                submission: existingSubmission
            });
        }

        // Create new submission
        const submission = new Submission({
            assignment: assignmentId,
            student: studentId,
            course: assignment.course,
            submissionText,
            submissionFile,
            isLate
        });

        await submission.save();

        res.status(201).json({
            success: true,
            message: "Assignment submitted successfully",
            submission
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted this assignment"
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get submissions for an assignment (Teacher)
const getSubmissionsByAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.id;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Verify teacher owns this assignment
        if (assignment.createdBy.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: "You can only view submissions for your own assignments"
            });
        }

        const submissions = await Submission.find({ assignment: assignmentId })
            .populate("student", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            submissions,
            totalCount: submissions.length,
            reviewedCount: submissions.filter(s => s.status === "Reviewed").length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Review/Grade submission (Teacher)
const reviewSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const { marksObtained, feedback } = req.body;

        const submission = await Submission.findById(id).populate("assignment");
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        // Verify teacher owns the assignment
        if (submission.assignment.createdBy.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: "You can only grade submissions for your own assignments"
            });
        }

        // Validate marks
        if (marksObtained > submission.assignment.totalMarks) {
            return res.status(400).json({
                success: false,
                message: `Marks cannot exceed ${submission.assignment.totalMarks}`
            });
        }

        submission.marksObtained = marksObtained;
        submission.feedback = feedback;
        submission.status = "Reviewed";
        await submission.save();

        res.json({
            success: true,
            message: "Submission reviewed successfully",
            submission
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get student's submissions
const getStudentSubmissions = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;

        // If accessing another student's submissions, ensure it's the same user
        if (req.params.studentId && req.params.studentId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own submissions"
            });
        }

        const submissions = await Submission.find({ student: studentId })
            .populate({
                path: "assignment",
                select: "title dueDate totalMarks status course",
                populate: { path: "course", select: "title" }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single submission
const getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id)
            .populate("student", "name email")
            .populate("assignment", "title dueDate totalMarks");

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        res.json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitAssignment,
    getSubmissionsByAssignment,
    reviewSubmission,
    getStudentSubmissions,
    getSubmission
};
