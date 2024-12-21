
const createRandomId = () => {
    return Math.floor(Math.random() * 10000000000) + 1;
}

module.exports = { createRandomId };