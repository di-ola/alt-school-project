require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken')
 require ('./db');
const {user} =  require('./usermodel')
const {article} = require('./article')
const {validateUserMiddleware, validateArticleIdMiddleware} = require('./middleware');

const secret = process.env['secret'];

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post("/signup", async (req,res)=>{
    const userExist = await user.findOne({email: req.body.email});
    if(userExist) {
        return res.json({
            message: "User with email already exist"
        });
    }

    const newUser = await user.create(req.body);

    return res.json({
        message: "User signed up successfully",
        data:{id: newUser.id,
             first_name: newUser.first_name ,
              last_name: newUser.last_name,
               email: newUser.email}
    });
});



app.post("/login", async (req,res)=>{
    const email = req.body.email
    const password = req.body.password
    const userExist = await user.findOne({email});

    if (userExist=== null) {
        return res.json({
            message:"user not found"
        });
    }

    const isValidPassword = await userExist.isPasswordValid(password);
    if(isValidPassword === false) {
        return res.status(422).json({
            message:"login credentials incorrect"
        }); 
    }

    const data ={
        id: userExist.id,
        first_name: userExist.first_name ,
         last_name: userExist.last_name,
          email: userExist.email
    };
    const token = await jwt.sign(data,secret,{expiresIn:'1h'});

    return res.json({
        message:"user logged in successfully",
        data: data,
        token

    });

});

   
app.post(
    "/articles",
    validateUserMiddleware("You need to be signed in, to create an article"),
    async(req,res)=>{
    const data = {
        title:req.body.title,
        description:req.body.description,
        tags:req.body.tags,
        body:req.body.body,
        author:req.user.id
    };

    const newArticle = await article.create(data);
    return res.json({
        message:"successfully created",
        data: newArticle
    })
})

app.get("/articles",async(req,res)=>{
    const page = req.query.page ? req.query.page : 1;
    const per_page = req.query.per_page ? req.query.per_page : 20;
    const skip = (page-1)*per_page;
    const articles = await article.find({},{},{skip, limit: per_page})
        .populate("author", "-_id first_name last_name");

    return res.json({
        message:"successfully created",
        data: articles
    })
   
})

app.put(
    "/articles/:id/publish",
    validateUserMiddleware("You need to be signed in, to publish an article"),
    validateArticleIdMiddleware,
    async (req,res)=>{
    const user = req.user;
    const articleId = req.params.id;
    const retrievedArticle = await article.findById(articleId);

    if(retrievedArticle === null) {
        return res.status(404).json({
            message: "Article does not exist",
        });
    }

    if(retrievedArticle.author.toString() !== user.id) {
        return res.status(422).json({
            message: "You do not have access to publish this article",
        });
    }

    if(retrievedArticle.state === "published") {
        return res.status(200).json({
            message: "Article already published",
        });
    }

    await article.updateOne({_id: articleId}, {state: "published"});

    return res.json({
        message:"successfully published",
    });
})

app.put(
    "/articles/:id",
    validateUserMiddleware("You need to be signed in, to delete an article"),
    validateArticleIdMiddleware,
    async (req,res)=>{
    const user = req.user;
    const articleId = req.params.id;
    const retrievedArticle = await article.findById(articleId);

    if(retrievedArticle === null) {
        return res.status(404).json({
            message: "Article does not exist",
        });
    }

    if(retrievedArticle.author.toString() !== user.id) {
        return res.status(422).json({
            message: "You do not have access to delete this article",
        });
    }


    const title = req.body.title;
    const description = req.body.description;
    const tags = req.body.tags;
    const body = req.body.body;

    if(title || description || tags || body) {
        await article.updateOne(
            {_id: articleId},
            {
                ...(title && {title}),
                ...(description && {description}),
                ...(tags && {tags}),
                ...(body && {body}),
            }
        );
    }

    return res.json({
        message:"successfully updated",
    });
})

app.delete(
    "/articles/:id",
    validateUserMiddleware("You need to be signed in, to delete an article"),
    validateArticleIdMiddleware,
    async (req,res)=>{
    const user = req.user;
    const articleId = req.params.id;
    const retrievedArticle = await article.findById(articleId);

    if(retrievedArticle === null) {
        return res.status(404).json({
            message: "Article does not exist",
        });
    }

    if(retrievedArticle.author.toString() !== user.id) {
        return res.status(422).json({
            message: "You do not have access to delete this article",
        });
    }


    await article.deleteOne({_id: articleId});

    return res.json({
        message:"successfully deleted",
    });
})

app.get(
    "/my-articles",
    validateUserMiddleware("You need to be signed in, to get your articles"),
    async (req,res)=>{
     const page = req.query.page ? req.query.page : 1;
     const per_page = req.query.per_page ? req.query.per_page : 20;
     const state = req.query.state;
     const skip = (page-1)*per_page;
     let articles = [];

     if(state && state!== null) {
        articles = await article.find(
            {author: req.user.id, state},
            {},
            {skip, limit: per_page}
        );
     }
     else {
        articles = await article.find(
            {author: req.user.id},
            {},
            {skip, limit: per_page}
        );
     }

    return res.json({
        message:"articles fetched successfully",
        data: articles
    });
})

app.listen(process.env['port'], () => {
    console.log(`App listening on port ${process.env['port']}`)
})

