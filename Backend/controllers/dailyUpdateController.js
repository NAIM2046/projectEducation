const { getDB } = require("../config/db.js");
require("dotenv").config();


const getAttendancebyClass_sub_data = async (req, res) => {
  const db = getDB();
  const Attendance = db.collection("attendanceInfo");
  const { class: className, subject, date } = req.params;

  try {
    const record = await Attendance.findOne({
      class: className,
      subject,
      date,
    });

    if (!record) return res.status(210).json({ message: "Not found data" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
 const setAttendanceDefault = async (req, res) => {
  const db = getDB();
  const AttendanceInfo = db.collection("attendanceInfo");
  const { className, subject, date, students, defaultStatus } = req.body;

  try {
    // Find existing attendance document
    const existing = await AttendanceInfo.findOne({
      class: className,
      subject: subject,
      date: date,
    });

    if (existing) {
      // Update all statuses in the existing records array
      const updatedRecords = existing.records.map((record) => ({
        ...record,
        status: defaultStatus,
      }));

      await AttendanceInfo.updateOne(
        { _id: existing._id },
        { $set: { records: updatedRecords } }
      );

      return res.json({ message: "Attendance updated successfully" });
    }

    // Create new attendance document
    const newDoc = {
      class: className,
      subject,
      date,
      records: students.map((student) => ({
        studentId: student._id,
        roll: student.roll,
        status: defaultStatus,
      })),
    };

    await AttendanceInfo.insertOne(newDoc);
    res.json({ message: "Attendance created successfully" });
  } catch (err) {
    console.error("Error in set-default:", err);
    res.status(500).json({ message: "Server error" });
  }
};

 const updataAttendanceSingle = async (req, res) => {
  const db = getDB(); // make sure you are using this correctly
  const AttendanceInfo = db.collection("attendanceInfo");

  const { className, subject, date, studentId, roll, status, students } = req.body;

  try {
    const existing = await AttendanceInfo.findOne({
      class: className,
      subject,
      date,
    });

    if (existing) {
      const existingRecords = existing.records || [];

      const recordIndex = existingRecords.findIndex(
        (r) => r.studentId.toString() === studentId
      );

      if (recordIndex !== -1) {
        // Update existing student's status
        existingRecords[recordIndex].status = status;
      } else {
        // Add new student record
        existingRecords.push({
          studentId,
          roll,
          status,
        });
      }

      await AttendanceInfo.updateOne(
        { _id: existing._id },
        { $set: { records: existingRecords } }
      );

      return res.json({ message: "Student attendance updated successfully" });
    }

    // If attendance doc doesn't exist, create new one
    const newRecords = students.map((student) => ({
      studentId: student._id,
      roll: student.roll,
      status: student._id === studentId ? status : "",
    }));

    await AttendanceInfo.insertOne({
      class: className,
      subject,
      date,
      records: newRecords,
    });

    res.json({ message: "Attendance created and student updated successfully" });
  } catch (error) {
    console.error("Error updating single student attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getAttendancebyClass_sub_data,
  setAttendanceDefault,
  updataAttendanceSingle
  // Add other functions here as needed
}