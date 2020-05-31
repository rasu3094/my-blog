import express from "express";
import bodyParser from "body-parser"
import { MongoClient } from "mongodb"
import path from 'path';

// mock database
const articles = {
    "learn-react": {
        "upvotes": 0,
        "comments": []
    },
    "learn-node": {
        "upvotes": 0,
        "comments": []
    },
    "my-thoughts-on-resumes": {
        "upvotes": 0,
        "comments": []
    }
}

const app = express();

app.use(express.static(path.join(__dirname,"./build")))
app.use(bodyParser.json());



const withDB = async (operations) => {
    try {
        const mongoClient = await MongoClient.connect('mongodb://127.0.0.1:27017/', {useNewUrlParser: true, useUnifiedTopology: true});
        const db = mongoClient.db('my-blog');

        await operations(db);

        mongoClient.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error connecting with mongo db"});
    }
}

app.get("/api/articles/:name", async (req, res) => {

    withDB(async (db) => {
        const articleName = req.params.name;
        const article =  await db.collection('articles').findOne({name: articleName});
        res.status(200).json(article);
    });

    // try {
    //     const articleName = req.params.name;
    //     const mongoClient = await MongoClient.connect('mongodb://127.0.0.1:27017/', {useUnifiedTopology: true, useNewUrlParser: true});
    //     const db = mongoClient.db('my-blog');

    //     const article =  await db.collection('articles').findOne({name: articleName});
    //     mongoClient.close();
    //     res.status(200).json(article);

        
    // } catch (error) {
    //     console.log(error)
    //     res.status(500).json({ message: "Error connecting with mongo db"});
    // }
    
});

app.get("/api/articles/:name/upvote", async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;
        const article =  await db.collection('articles').findOne({name: articleName});
        res.status(200).json(article.upvotes);
    });

    // try {
    //     const articleName = req.params.name;
    //     const mongoClient = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
    //     const db = mongoClient.db('my-blog');
    //     const article =  await db.collection('articles').findOne({name: articleName});
    //     mongoClient.close();
    //     res.status(200).json(article.upvotes);
    // } catch (error) {
    //     console.log(error)
    //     res.status(500).json({ message: "Error connecting with mongo db"});
    // }
});


app.post("/api/articles/:name/upvote", async (req, res) => {

    withDB(async (db) => {
        const articleName = req.params.name;
        const article =  await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName}, {
                '$set': {
                       upvotes : article.upvotes + 1
                     }
                 });
        const udpatedArticle =  await db.collection('articles').findOne({name: articleName});
        res.status(200).json(udpatedArticle);
    }, res);
    // try {
    //     const articleName = req.params.name;
    //     const mongoClient = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
    //     const db = mongoClient.db('my-blog');
    //     const article =  await db.collection('articles').findOne({name: articleName});
    //     await db.collection('articles').update({name: articleName}, {
    //         '$set': {
    //             upvotes : article.upvotes + 1
    //         }
    //     });
    //     const udpatedArticle =  await db.collection('articles').findOne({name: articleName});
    //     mongoClient.close();
    //     res.status(200).json(udpatedArticle);
    // } catch (error) {
    //     console.log(error)
    //     res.status(500).json({ message: "Error connecting with mongo db/ Error updating artcile : "+articleName});
    // }
    
});

app.get("/api/articles/:name/comments", (req, res) => {
     withDB(async (db) => {
        const articleName = req.params.name;
        const article =  await db.collection('articles').findOne({name: articleName});
        res.status(200).send(comments.length ? articles[articleName].comments: 'No Comments so far....');
    });
});

app.post("/api/articles/:name/comment", (req, res) => {
    const articleName = req.params.name;
    const { user, comment } = req.body;
    withDB(async (db) => {    
        const article =  await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName}, {
                '$set': {
                        comments : article.comments.concat({ user, comment })
                     }
                 });
        const udpatedArticle =  await db.collection('articles').findOne({name: articleName});
        res.status(200).json(udpatedArticle);
    }, res);

    // const articleName = req.params.name;
    // const { user, comment } = req.body;
    // articles[articleName].comments.push({ user, comment });
    // res.status(200).send(articles[articleName].comments);
});

//sample endpoints
app.get("/hello", (req, res) => res.send('Hello World....'));
app.get("/user/:name", (req, res) => res.send(`Hello ${req.params.name}!`)) // path variable
app.post("/hello", (req, res) => res.send(`Hello ${req.body.name} !`));

//for any other calls.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'/build/index.html'));
})


app.listen(8000, () => console.log("App server started in port 8000 and listening for requests...."));