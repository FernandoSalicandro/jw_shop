import connection from '../data/jw_db.js'

const discount = (req, res) => {
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // Questo formatterà la data come 'YYYY-MM-DD HH:MM:SS'

    console.log('Current date:', currentDate); // Debug

    let sql = `
    SELECT *
    FROM discount_codes 
    WHERE ? BETWEEN start_date AND end_date`;

    connection.query(sql, [currentDate], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Query results:', results); // Debug
        return res.status(200).json({
            data: results
        });
    });
}

const verifyDiscount = (req, res) => {
    const { code, currentDate } = req.body;

    if (!code || !currentDate) {
        return res.status(400).json({
            valid: false,
            message: 'Code and date are required'
        });
    }

    const sql = `
    SELECT *
    FROM discount_codes
    WHERE code = ?
    AND ? BETWEEN start_date AND end_date`;

    connection.query(sql, [code, currentDate], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({
                valid: false,
                message: 'Invalid code or expired code'
            });
        }

        return res.status(200).json({
            valid: true,
            discount: results[0]
        });
    });
}

export default { discount, verifyDiscount };