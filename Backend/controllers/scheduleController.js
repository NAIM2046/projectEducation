const { getDB } = require('../config/db.js');
require('dotenv').config();

const addSchedule = async (req, res) => {
  const schedule = req.body;
  const db = getDB();

  try {
   

    const result = await db.collection('schedules').insertOne(schedule);

    res.status(201).json({
      message: 'Schedule created successfully',
      scheduleId: result.insertedId,
    });
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
const getSchedule = async (req, res) => {
    const db = getDB();
    try {
      const schedule = await db.collection('schedules').find({}).toArray();
      res.status(200).json(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
module.exports = { addSchedule , getSchedule};
