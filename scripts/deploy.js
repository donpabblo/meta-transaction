const { task } = require("hardhat/config");
const { writeConfig } = require("./helpers");

task("deploy", "Deploys contracts")
    .setAction(async function (taskArguments, hre) {
        const forwarderContract = await hre.ethers.getContractFactory("Forwarder");
        const forwarder = await forwarderContract.deploy();
        const forwarderAddress = forwarder.address;
        console.log(`Forwarder contract deployed to address: ${forwarderAddress}`);

        const recipientContract = await hre.ethers.getContractFactory("Recipient");
        const recipient = await recipientContract.deploy(forwarderAddress);//Set trusted forwarder to "forwarderAddress"
        const recipientAddress = recipient.address;
        console.log(`Recipient contract deployed to address: ${recipientAddress}`);

        writeConfig(forwarderAddress, recipientAddress);//Writing contract addresses to config.json 
    });