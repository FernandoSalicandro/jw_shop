 const errorHandler = (err, req, res, next) => {
    res.status(500).json({
        message: 'Errore interno del server'
    })
}


export default errorHandler;



