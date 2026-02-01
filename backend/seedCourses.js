const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Teacher = require("./models/teacherSchema");
const Course = require("./models/courseSchema");

dotenv.config();

const courses = [
    {
        title: "MERN Stack Development",
        description: "Learn MongoDB, Express, React, and Node.js to build full-stack web applications.",
        category: "Web Development",
        price: 5000,
        duration: "6 Months",
        level: "Intermediate",
        thumbnail: "/course_thumbnails/mern.png",
        syllabus: [
            { topic: "HTML/CSS/JS", description: "Frontend Basics" },
            { topic: "React", description: "Modern Frontend Library" },
            { topic: "Node/Express", description: "Backend Runtime and Framework" },
            { topic: "MongoDB", description: "NoSQL Database" }
        ]
    },
    {
        title: "Java Full Stack Development",
        description: "Master Java, Spring Boot, and frontend technologies for enterprise application development.",
        category: "Software Development",
        price: 6000,
        duration: "6 Months",
        level: "Advanced",
        thumbnail: "/course_thumbnails/java.png",
        syllabus: [
            { topic: "Core Java", description: "Object Oriented Programming" },
            { topic: "Spring Boot", description: "Enterprise Framework" },
            { topic: "Hibernate", description: "ORM" },
            { topic: "Frontend", description: "React or Angular" }
        ]
    },
    {
        title: "Python Full Stack Development",
        description: "Comprehensive course on Python, Django/Flask, and frontend integration.",
        category: "Software Development",
        price: 5500,
        duration: "5 Months",
        level: "Beginner",
        thumbnail: "/course_thumbnails/python.png",
        syllabus: [
            { topic: "Python Basics", description: "Syntax and Data Structures" },
            { topic: "Django", description: "Web Framework" },
            { topic: "REST APIs", description: "Building APIs" }
        ]
    },
    {
        title: "Data Structures & Algorithms",
        description: "Deep dive into DSA using Java/C++ to crack top product-based company interviews.",
        category: "Computer Science",
        price: 4000,
        duration: "4 Months",
        level: "Advanced",
        thumbnail: "/course_thumbnails/dsa.png",
        syllabus: [
            { topic: "Arrays & Strings", description: "Basic structures" },
            { topic: "Trees & Graphs", description: "Advanced structures" },
            { topic: "DP", description: "Dynamic Programming" }
        ]
    },
    {
        title: "Data Analytics",
        description: "Learn to analyze data using Excel, SQL, Power BI, and Python.",
        category: "Data Science",
        price: 4500,
        duration: "4 Months",
        level: "Intermediate",
        thumbnail: "/course_thumbnails/analytics.png",
        syllabus: [
            { topic: "Excel", description: "Advanced Excel" },
            { topic: "SQL", description: "Database Querying" },
            { topic: "Power BI", description: "Visualization" }
        ]
    },
    {
        title: "Graphic Design",
        description: "Master Photoshop, Illustrator, and Canva to become a creative graphic designer.",
        category: "Design",
        price: 3500,
        duration: "3 Months",
        level: "Beginner",
        thumbnail: "/course_thumbnails/design.png",
        syllabus: [
            { topic: "Photoshop", description: "Photo Editing" },
            { topic: "Illustrator", description: "Vector Graphics" },
            { topic: "UI Principles", description: "Design Theory" }
        ]
    },
    {
        title: "Digital Marketing",
        description: "Learn SEO, SEM, Social Media Marketing, and Content Strategy.",
        category: "Marketing",
        price: 3000,
        duration: "3 Months",
        level: "Beginner",
        thumbnail: "/course_thumbnails/marketing.png",
        syllabus: [
            { topic: "SEO", description: "Search Engine Optimization" },
            { topic: "Social Media", description: "SMM" },
            { topic: "Ads", description: "Google and Facebook Ads" }
        ]
    }
];

const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Seeding");

        // 1. Find or Create a Default Teacher
        let instructor = await Teacher.findOne({ email: "default@instructor.com" });
        if (!instructor) {
            console.log("Creating default instructor...");
            const hashedDummyPassword = "$2a$12$DummyHashValueForSeedingOnly...."; // In real usage use bcrypt, but this is a seed script. 
            // actually let's just make it a valid one if possible or just use a dummy string since we might not login as them immediately
            // or better, let's use a simple string, schema checks if it exists. 
            // Wait, schema requires password. Let's just put a placeholder.

            instructor = new Teacher({
                name: "Default Instructor",
                email: "default@instructor.com",
                phone: "9999999999",
                password: "hashedpassword123", // Manually hashed or just placeholder if not logging in
                subject: "General",
                qualification: "PhD",
                experience: "10 Years"
            });
            await instructor.save();
            console.log("Default instructor created with ID:", instructor._id);
        } else {
            console.log("Using existing default instructor:", instructor._id);
        }

        // 2. Seed Courses
        for (const courseData of courses) {
            const existingCourse = await Course.findOne({ title: courseData.title });
            if (existingCourse) {
                console.log(`Course '${courseData.title}' already exists. Updating thumbnail...`);
                existingCourse.thumbnail = courseData.thumbnail;
                await existingCourse.save();
            } else {
                const newCourse = new Course({
                    ...courseData,
                    instructor: instructor._id
                });
                await newCourse.save();
                console.log(`Course '${courseData.title}' created.`);

                // Optionally update teacher's assigned courses
                instructor.assignedCourses.push(newCourse._id);
            }
        }
        await instructor.save(); // Save updated assigned courses if any

        console.log("Seeding completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedCourses();
