const fs = require("fs");
const path = require("path");

const json = fs.readFileSync(path.join(__dirname, '..', 'keys.json'));
const keys = JSON.parse(json);

let currentIndex = 0;

const selectDomain = () => {
    currentIndex = (currentIndex + 1) % keys.length;  // Round-robin selection
    // currentIndex = 10;


    const domain = keys[currentIndex];
    return {
        domain: domain.domain,
        sender: domain.sender,
        connectionString: domain.connectionString,
    };
}

module.exports = { selectDomain };
