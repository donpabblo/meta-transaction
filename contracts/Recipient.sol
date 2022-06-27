// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Recipient is ERC2771Context {
    
    event FlagCaptured(address previousHolder, address currentHolder, string color);

    address public currentHolder  = address(0);
    string public color = "white";

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function setFlagOwner(string memory _color) external {
        address previousHolder = currentHolder;
        currentHolder = _msgSender();
        color = _color;
        emit FlagCaptured(previousHolder, currentHolder, color);
    }

    function getFlagOwner() external view returns (address, string memory) {
        return (currentHolder, color);
    }
}
