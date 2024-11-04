/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: 
Student ID: 156333221
Date: Nov 03, 2024
Vercel Web App URL: 
GitHub Repository URL: https://github.com/ocarrascoo/WEB322

********************************************************************************/ 

const express = require('express');
const app = express();
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
// Serve static files
app.use(express.static('public'));



cloudinary.config({
    cloud_name: 'testseneca',
    api_key: '991562193533881',
    api_secret: 'zayyuutjP1spPr2aK2gZmTTKhtk',
    secure: true
});



const upload = multer(); 


// Routes
app.get('/', (req, res) => {
    res.redirect('/about');
});

const storeService = require('./store-service');



app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'additem.html'));
});

// POST /items/add route
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    const processItem = (imageUrl) => {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then((newItem) => {
                res.redirect('/items'); 
            })
            .catch((err) => {
                console.error("Error adding item:", err);
                res.status(500).send("Error adding item.");
            });
    };

    if (req.file) {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        streamUpload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Error uploading to Cloudinary:", error);
            res.status(500).send("Error uploading image.");
        });
    } else {
        processItem("");
    }
});



const PORT = process.env.PORT || 8080;

storeService.initialize().then(() => {
    
    app.get('/shop', (req, res) => {
        storeService.getPublishedItems().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({ message: err });
        });
    });



    app.get('/items', (req, res) => {
        if (req.query.category) {
            storeService.getItemsByCategory(req.query.category).then((data) => {
                res.json(data);
            }).catch((err) => {
                res.json({ message: err });
            });
        } else if (req.query.minDate) {
            storeService.getItemsByMinDate(req.query.minDate).then((data) => {
                res.json(data);
            }).catch((err) => {
                res.json({ message: err });
            });
        } else {
            storeService.getAllItems().then((data) => {
                res.json(data);
            }).catch((err) => {
                res.json({ message: err });
            });
        }
    });
    

    app.get('/items/:id', (req, res) => {
        storeService.getItemById(parseInt(req.params.id)).then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({ message: err });
        });
    });
    
    

    app.get('/categories', (req, res) => {
        storeService.getCategories().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({ message: err });
        });
    });

    app.use((req, res) => {
        res.status(404).send('Page Not Found');
    });

    app.listen(PORT, () => {
        console.log(`Express http server listening on port ${PORT}`);
    });

}).catch((err) => {
    console.log("Failed to initialize store-service: " + err);
});



app.get('/items/add',(req, res)=>{
    res.sendFile(path.join(__dirname, 'views', 'additem.html'));
})


app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});
