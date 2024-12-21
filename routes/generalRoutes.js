const router = require('express').Router();
const { helloWorld, users, getUserById, getUserByName, getUserByGender,
    addNewUser, deleteUser, updateUser, usersXML,
    books, booksXML
} = require('../controllers/generalControllers');

// Throttling
const helloReqQueue = [];
const helloMaxRequests = 5;
const REEQUEST_INTERVAL = 1000;

setInterval(() => {
    if(helloReqQueue.length > 0) {
        const { req, res, next } = helloReqQueue.shift();
        console.log(helloReqQueue.length);
        helloWorld(req, res, next);
    }
}, REEQUEST_INTERVAL);

const handleHelloWorld = (req, res, next) => {
    if(helloReqQueue.length < helloMaxRequests) {
        helloReqQueue.push({req, res, next });
    } else {
        res.status(429).send({
            error: {
                code: 429,
                message: "Too many requests. Please try again later."
            }
        });
    }
}

router.get("/helloworld",handleHelloWorld);

router.get("/users",users,usersXML);
router.get("/users/:userid",getUserById);
router.get("/users/name/:username",getUserByName);
router.get("/users/gender/:usergender",getUserByGender);

router.post("/users/create",addNewUser);

router.delete("/users/:id",deleteUser);

router.put("/users/:id",updateUser);

router.get("/books", books, booksXML);

module.exports = router;