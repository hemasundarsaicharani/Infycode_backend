import db from "../config/firebaseAdmin.js";

const studentsRef = db.ref("students");
const trainersRef = db.ref("trainers");
const batchesRef = db.ref("batch");
const coursesRef = db.ref("courses");

// Helper: Generate next Batch ID (B-0001)
const generateNextBatchID = async () => {
  const snapshot = await batchesRef.once("value");
  const count = snapshot.numChildren();
  return `B-${String(count + 1).padStart(4, "0")}`;
};

// Helper: Normalized status matching
const matchesStatus = (val, targetStatuses) => {
  if (!val) return false;
  return targetStatuses.some(status => status.toLowerCase() === val.toLowerCase());
};

/**
 * @desc Get real-time dashboard data (Counts and full lists) from Firebase
 * @route GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [studentsSnap, trainersSnap, batchesSnap, coursesSnap] = await Promise.all([
      studentsRef.once("value"),
      trainersRef.once("value"),
      batchesRef.once("value"),
      coursesRef.once("value")
    ]);

    const studentsRaw = studentsSnap.val() || {};
    const trainersRaw = trainersSnap.val() || {};
    const batchesRaw = batchesSnap.val() || {};
    const coursesRaw = coursesSnap.val() || {};

    const students = Object.entries(studentsRaw).map(([id, data]) => ({
      id,
      ...data,
      name: data.username || data.name || "N/A",
      status: data.status || "Pending",
      createdAt: data.createdAt || new Date().toISOString()
    }));

    const trainers = Object.entries(trainersRaw).map(([id, data]) => ({
      id,
      ...data,
      name: data.fullName || data.fullname || data.username || data.name || "N/A",
      status: data.status || "Onboarded" // Default to Onboarded so they show up in dropdowns
    }));

    // Normalize batch data for the frontend (Map courseName -> course, trainerName -> trainer)
    const batches = Object.entries(batchesRaw).map(([id, data]) => ({
      id,
      batchId: data.batchId || id, // Prioritize formal batchId, fallback to Firebase id
      ...data,
      course: data.course || data.courseName || "Unknown Course",
      trainer: data.trainer || data.trainerName || "Unassigned",
      capacity: parseInt(data.capacity) || 30,
      enrolled: parseInt(data.enrolled) || 0,
      status: data.status || "Planned"
    }));

    const stats = {
      totalStudents: students.length,
      activeTrainers: trainers.filter(t => !t.status || matchesStatus(t.status, ["Active", "Onboarded"])).length,
      activeBatches: batches.filter(b => !matchesStatus(b.status, ["Completed"])).length, 
      pendingVerifications: students.filter(s => matchesStatus(s.status, ["Pending"])).length,
      coursesCount: Object.keys(coursesRaw).length
    };

    res.status(200).json({
      stats,
      students,
      trainers,
      batches
    });
  } catch (error) {
    console.error("Backend Error fetching dashboard stats:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Create a new training batch in Firebase
 * @route POST /api/admin/batches
 */
export const createBatch = async (req, res) => {
  try {
    const { name, course, trainer, capacity, status } = req.body;

    if (!name || !course || !trainer) {
      return res.status(400).json({ message: "Name, course, and trainer are required." });
    }

    const nextBID = await generateNextBatchID();
    const newBatchRef = batchesRef.push();
    const batchData = {
      batchId: nextBID, // Assign unique sequential Batch ID
      name,
      courseName: course, 
      trainerName: trainer, 
      capacity: parseInt(capacity) || 30,
      enrolled: 0,
      status: status || 'Draft',
      createdAt: new Date().toISOString()
    };

    await newBatchRef.set(batchData);

    res.status(201).json({
      message: "Batch created correctly and synced with Firebase.",
      batch: { id: newBatchRef.key, ...batchData, course, trainer } // Return normalized for immediate frontend use
    });
  } catch (error) {
    console.error("Backend Error creating batch:", error);
    res.status(500).json({ error: error.message });
  }
};
