const {verifyToken} = require('./jwt');
const secret = "123wskokijiawu89irewrt78u964579ertugh"

function validateUserMiddleware (err) {
    return async function (req, res, next) {
        const token = req.headers['token'];
    
        if(!token || token === null) {
            return res.status(403).json({message: err });
        }
    
        const response = await verifyToken(token, secret);
    
        if(response.isValid === false) {
            return res.json({
                message: response.message,
            });
        }

        req.user = response.user;
        next();
    }
}

function validateArticleIdMiddleware(req, res, next) {
    const articleId = req.params.id;

    if(articleId.length !=24) {
        return res.status(422).json({
            message: "Please supply a valid article id",
        });
    }

    next();
} 

module.exports = {
    validateUserMiddleware,
    validateArticleIdMiddleware
}