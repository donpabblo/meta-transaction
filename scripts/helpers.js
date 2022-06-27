const fs = require('fs');

function writeConfig(forwarder, recipient) {
    rawdata = fs.readFileSync('config.json');
    scriptConfig = JSON.parse(rawdata);
    scriptConfig.forwarder = forwarder;
    scriptConfig.recipient = recipient;
    scriptData = JSON.stringify(scriptConfig);
    fs.writeFileSync('config.json', scriptData);
}

module.exports = {
    writeConfig
}