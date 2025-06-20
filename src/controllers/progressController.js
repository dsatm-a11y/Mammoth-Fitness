const db = require('../db');

// Get progress measurements with timeframe filtering
const getMeasurements = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userId = req.session.user.id;
        const timeframe = req.query.timeframe || '1M';
        
        let dateFilter = '';
        switch(timeframe) {
            case '1M': dateFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'; break;
            case '3M': dateFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)'; break;
            case '6M': dateFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)'; break;
            case '1Y': dateFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)'; break;
            default: dateFilter = '';
        }
        
        const query = `
            SELECT weight, body_fat, recorded_at 
            FROM body_measurements 
            WHERE user_id = ? ${dateFilter}
            ORDER BY recorded_at DESC`;
        
        const results = await db.query(query, [userId]);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error fetching measurements' });
    }
};

// Add new measurements
const addMeasurement = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userId = req.session.user.id;
        const { weight, body_fat } = req.body;

        if (!weight && !body_fat) {
            return res.status(400).json({ error: 'At least one measurement is required' });
        }

        if (weight && (weight < 20 || weight > 500)) {
            return res.status(400).json({ error: 'Invalid weight value' });
        }
        
        if (body_fat && (body_fat < 1 || body_fat > 50)) {
            return res.status(400).json({ error: 'Invalid body fat percentage' });
        }
        
        const query = `
            INSERT INTO body_measurements (user_id, weight, body_fat)
            VALUES (?, ?, ?)`;
        
        const result = await db.query(query, [userId, weight || null, body_fat || null]);
        res.json({ message: 'Measurements saved successfully', id: result.insertId });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error saving measurements' });
    }
};

// Get exercise progress
const getExerciseProgress = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userId = req.session.user.id;
        const exerciseId = req.params.exerciseId;
        
        const query = `
            SELECT weight, reps, sets, recorded_at
            FROM exercise_progress 
            WHERE user_id = ? AND exercise_id = ?
            ORDER BY recorded_at DESC`;
        
        const results = await db.query(query, [userId, exerciseId]);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error fetching exercise progress' });
    }
};

// Add exercise progress
const addExerciseProgress = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userId = req.session.user.id;
        const { exercise_id, weight, reps, sets } = req.body;
        
        if (!exercise_id || !weight || !reps || !sets) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const query = `
            INSERT INTO exercise_progress (user_id, exercise_id, weight, reps, sets)
            VALUES (?, ?, ?, ?, ?)`;
        
        const result = await db.query(query, [userId, exercise_id, weight, reps, sets]);
        res.json({ message: 'Exercise progress saved successfully', id: result.insertId });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error saving exercise progress' });
    }
};

module.exports = {
    getMeasurements,
    addMeasurement,
    getExerciseProgress,
    addExerciseProgress
};
