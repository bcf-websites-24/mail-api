const fs = require("fs");
const path = require("path");

const json = fs.readFileSync(path.join(__dirname, '..', 'keys.json'));
const keys = JSON.parse(json);

let currentIndex = 0;

const selectDomain = () => {
    const domain = keys[currentIndex];
    currentIndex = (currentIndex + 1) % keys.length;  // Round-robin selection
    return {
        domain: domain.domain,
        sender: `DoNotReply@${domain.domain}.buetcsefest2024.com`,
        connectionString: domain.connectionString,
    };
}

module.exports = { selectDomain };
