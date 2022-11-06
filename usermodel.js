const { mongoose} = require("mongoose");
const bcrypt = require ('bcryptjs');
const {db} = require("./db")


const schema = new db.Schema({
    first_name:'string' , 
    last_name:'string',
    email: {type: 'string', unique: true, required: true} ,
    password:'string',
});

schema.pre('save', async function() {
 this.password= await bcrypt.hash(this.password,5)
});

schema.methods.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const user = db.model('user', schema);
 module.exports = {user};