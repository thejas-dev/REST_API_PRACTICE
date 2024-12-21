const { users, books } = require('../database/generalDatabase')
const { createRandomId } = require("../utilities/helpers")

const cache = {};

module.exports.helloWorld = async(req,res,next) => {
    res.json({message: "Hello, World!"});
}

module.exports.users = async(req,res,next) => {
    try{
        if(users.length > 0) {
            if(req.query?.type?.toLowerCase() === "xml") {
                return next();
            }
            console.log("From cache : ",cache[JSON.stringify(req.query)])
            
            const limit = req.query?.limit?.toLowerCase() || 20;
            const page = req.query?.page?.toLowerCase() || 1;
            const sort = req.query?.sort?.toLowerCase() || "id";
            const order = req.query?.order?.toLowerCase() || "asc";
            
            if(cache[JSON.stringify(req.query)]){
                return res.status(200).json({
                    status:"success",
                    page: page,
                    limit: limit,
                    users: cache[JSON.stringify(req.query)]
                });
            }

            users.sort((a, b) => {
                if(a[sort] < b[sort]) return order === "asc" ? -1 : 1;
                if(a[sort] > b[sort]) return order === "asc" ? 1 : -1;
                return 0;
            });

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            const fetchedUsers = users.slice(startIndex, endIndex);
            res.status(200).json({
                status:"success",
                page: page,
                limit: limit,
                users: fetchedUsers
            });
            cache[JSON.stringify(req.query)] = fetchedUsers;
        }else{
            res.status(500).send({
                error:{
                    code: 500,
                    message: "There is something wrong in our side. Please try again"
                }
            });
        }
    }catch(e){
        console.log(e);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in getting users"
            }
        });
    } 
}

module.exports.usersXML = (req, res, next) => {
    try{

        console.log("From cache (XML) : ",cache[JSON.stringify(req.query)])

        const limit = req.query?.limit?.toLowerCase() || 20;
        const page = req.query?.page?.toLowerCase() || 1;
        const sort = req.query?.sort?.toLowerCase() || "id";
        const order = req.query?.order?.toLowerCase() || "asc";

        if(cache[JSON.stringify(req.query)]){
            return res.type("application/xml").send(cache[JSON.stringify(req.query)]);
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        users.sort((a, b) => {
            if(a[sort] < b[sort]) return order === "asc" ? -1 : 1;
            if(a[sort] > b[sort]) return order === "asc" ? 1 : -1;
            return 0;
        });

        const fetchedUsers = users.slice(startIndex, endIndex);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <users>
            ${fetchedUsers.map(user => `
                <user>
                    <id>${user.id}</id>
                    <username>${user.username}</username>
                    <age>${user.age}</age>
                    <gender>${user.gender}</gender>
                    <favColor>${user.favColor}</favColor>
                </user>
            `).join("")}
        </users>`;

        cache[JSON.stringify(req.query)] = xml;
        res.type("application/xml").send(xml);
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in generating XML",
            }
        });
    }
}

module.exports.getUserById = async(req,res,next) => {
    try{
        const userId = parseInt(req.params.userid);
        const user = users.find(user => user.id === userId);

        if(user) {
            res.status(200).json({status:"success",user: user})
        }else{
            res.status(404).send({
                error:{
                    code: 404,
                    message: "User not found"
                }
            });
        }
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in getting user by id"
            }
        });
    }
}

module.exports.getUserByName = (req,res,next) => {
    try{
        const userName = req.params.username;
        const user = users.find(user => user.username === userName);
        if(user) {
            res.status(200).json({status:"success",user: user})
        }else{
            res.status(404).send({
                error:{
                    code: 404,
                    message: "User not found"
                }
            });
        }
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in getting user by name"
            }
        });
    }
}

module.exports.getUserByGender = (req,res,next) => {
    try{
        const gender = req.params.usergender.toLowerCase();
        const usersByGender = users.filter(user => user.gender.toLowerCase() === gender);
        if(usersByGender.length > 0) {
            res.status(200).json({status:"success",users: usersByGender})
        }else{
            res.status(404).send({
                error:{
                    code:404,
                    message: "No Users found with this gender"
                }
            });
        }
    }catch(err) {
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in getting users by gender"
            }
        });
    }
}

module.exports.addNewUser = (req,res,next) => {
    try{
        const user = req.body.user;
        console.log(user);
        users.push({id:createRandomId(), ...user});
        res.status(201).json({status:"success",message: "Added successfully."});
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in adding user"
            }
        });
    }
}

module.exports.deleteUser = (req,res,next) => {
    try{
        const id = req.params.id;
        const index = users.findIndex(user => user.id === parseInt(id));
        if(index !== -1) {
            users.splice(index, 1);
            res.status(200).json({status:"success",message: "User deleted successfully."});
        }else{
            res.status(404).send({
                error:{
                    code:404,
                    message: "User not found"
                }
            });
        }
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in deleting user"
            }
        });
    } 
}

module.exports.updateUser = (req, res, next) => {
    try{
        const id = req.params.id;
        const updatedUser = req.body.user;
        const index = users.findIndex(user => user.id === parseInt(id));
        if(index !== -1) {
            users[index] = {...users[index],...updatedUser};
            res.status(200).json({status:"success",message: "User updated successfully."});
        } else {
            res.status(404).send({
                error:{
                    code:404,
                    message: "User not found"
                }
            });
        }
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in updating user"
            }
        });
    } 
}

module.exports.books = async(req,res,next) => {
    try {
        if(req.admin){
            if(books.length > 0) {
                if(req.query?.type?.toLowerCase() === "xml") {
                    return next();
                }
                res.status(200).json({status:"success",books: books})
            }else{
                res.status(500).send({
                    error: {
                        code: 500,
                        message: "There is something wrong in our side. Please try again"
                    }
                })
            }
        } else {
            return res.status(403).send({
                error: {
                    code: 403,
                    message: "Access denied. You are not an admin."
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in fetching books"
            }
        });
    }
}

module.exports.booksXML = (req, res, next) => {
    try{
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <books>
            ${books.map(book => `
                <book>
                    <id>${book.id}</id>
                    <title>${book.title}</title>
                    <author>${book.author}</author>
                    <publication_year>${book.publication_year}</publication_year>
                </book>
            `).join("")}
        </books>`;

        res.type("application/xml").send(xml);
    }catch(err){
        console.log(err);
        res.status(500).send({
            error: {
                code: 500,
                message: "Error in generating XML",
            }
        });
    }
}