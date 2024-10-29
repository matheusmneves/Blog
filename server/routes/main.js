const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


//Routes
//Get/Home
router.get('', async (req, res) => {
    try {
        const locals = {
            title: 'NodeJS Blog',
            description: "Simple blog created with NodejS, Express and MongoDB"
        }
        
        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasnextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals, 
            data,
            current: page,
            nextPage: hasnextPage ? nextPage : null
            });
    } catch (error) {
        console.log(error);
    }
});

//Get/Post:id
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: data.description,
        }

        res.render('post', { locals, data });
    } catch (error) {
        console.log(error);
    }
})

//Post/Post - searchTerm
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "",
            description: "",
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[ˆa-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
        });

        res.render("search", {
            data,
            locals
        });
        
    } catch (error) {
        console.log(error);
    }
})


router.get('/about', (req, res) => {
    res.render('about');
});

module.exports = router;