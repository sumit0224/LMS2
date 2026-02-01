const Syllabus = require("../models/syllabusSchema");
const Course = require("../models/courseSchema");

// Create syllabus for a course (Admin/Teacher)
const createSyllabus = async (req, res) => {
    try {
        const { course, title, modules, totalDuration, learningOutcomes } = req.body;

        if (!course || !title) {
            return res.status(400).json({ message: "Course and title are required" });
        }

        // Check if course exists
        const courseExists = await Course.findById(course);
        if (!courseExists) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if syllabus already exists for this course
        const existingSyllabus = await Syllabus.findOne({ course });
        if (existingSyllabus) {
            return res.status(400).json({ message: "Syllabus already exists for this course" });
        }

        const newSyllabus = new Syllabus({
            course,
            title,
            modules: modules || [],
            totalDuration,
            learningOutcomes: learningOutcomes || []
        });

        await newSyllabus.save();

        res.status(201).json({ message: "Syllabus created successfully", syllabus: newSyllabus });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get syllabus by course ID
const getSyllabusByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const syllabus = await Syllabus.findOne({ course: courseId }).populate("course", "title description");

        if (!syllabus) {
            return res.status(404).json({ message: "Syllabus not found for this course" });
        }

        res.status(200).json(syllabus);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update syllabus (Admin/Teacher)
const updateSyllabus = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSyllabus = await Syllabus.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedSyllabus) {
            return res.status(404).json({ message: "Syllabus not found" });
        }

        res.status(200).json({ message: "Syllabus updated successfully", syllabus: updatedSyllabus });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add lesson to a module (Teacher)
const addLesson = async (req, res) => {
    try {
        const { syllabusId, moduleIndex } = req.params;
        const { title, contentType, duration, contentUrl, isFreePreview } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Lesson title is required" });
        }

        const syllabus = await Syllabus.findById(syllabusId);
        if (!syllabus) {
            return res.status(404).json({ message: "Syllabus not found" });
        }

        if (moduleIndex >= syllabus.modules.length) {
            return res.status(400).json({ message: "Invalid module index" });
        }

        const newLesson = {
            title,
            contentType: contentType || "Video",
            duration: duration || 0,
            contentUrl: contentUrl || "",
            isFreePreview: isFreePreview || false
        };

        syllabus.modules[moduleIndex].lectures.push(newLesson);
        await syllabus.save();

        res.status(201).json({ message: "Lesson added successfully", syllabus });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add module to syllabus
const addModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { moduleTitle, description, duration } = req.body;

        if (!moduleTitle || !duration) {
            return res.status(400).json({ message: "Module title and duration are required" });
        }

        const syllabus = await Syllabus.findById(id);
        if (!syllabus) {
            return res.status(404).json({ message: "Syllabus not found" });
        }

        const newModule = {
            moduleTitle,
            description: description || "",
            duration,
            lectures: []
        };

        syllabus.modules.push(newModule);
        await syllabus.save();

        res.status(201).json({ message: "Module added successfully", syllabus });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete syllabus
const deleteSyllabus = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSyllabus = await Syllabus.findByIdAndDelete(id);

        if (!deletedSyllabus) {
            return res.status(404).json({ message: "Syllabus not found" });
        }

        res.status(200).json({ message: "Syllabus deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createSyllabus,
    getSyllabusByCourse,
    updateSyllabus,
    addLesson,
    addModule,
    deleteSyllabus
};
