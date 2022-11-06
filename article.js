
const {db} = require ("./db")


const schema = new db.Schema({
    title:'string' , 
    description:'string',
    author: {type: db.Types.ObjectId, ref: "user"} ,
    state:{type:'string', default:'draft'},
    read_count:{type:'number', default: 0},
    reading_time:{type:'number'},
    tags:'string',
    body:'string',
    created_at:{type:'date',default:Date.now},
    updated_at:{type:'date', default:Date.now}
});
const article = db.model('article', schema);
 module.exports = {article};

