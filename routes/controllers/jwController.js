import connection from '../../data/jw_db.js'

const index = (req, res, next) => {

    const sql = `
    SELECT * FROM products`

    connection.query(sql, (err, productsResults) => {
        if (err) return next(err);
        res.status(200).json(productsResults)
    })


}

const show = (req, res, next) => {
    const { id } = req.params
    const sql = `
    SELECT *
    FROM products
    WHERE id = ?
    `

    connection.query(sql, [id], (err,productResults) => {
        if(err) return next(err);
        if(productResults.length === 0) return res.status(404).json({
            message : "Prodotto Non Trovato"
        });
        res.status(200).json(productResults)
    })
}


export default { index, show }