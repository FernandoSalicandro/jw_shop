const notFound = (req,res,next) => {
    res.status(404).json({
        status : "fail",
        error : 'Not Found'
    })
}

export default notFound;