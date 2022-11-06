const jwt = require('jsonwebtoken')

async function verifyToken(token, secret) {
    try {
        const user = await jwt.verify(token,secret);

        return {isValid: true, message: "verification successful", user}
    } catch (error) {
        return {isValid: false, message: error.message}
    }
}

module.exports = {verifyToken};