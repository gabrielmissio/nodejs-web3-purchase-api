// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract PurchaseEventProxy {
    enum State { Aborted, PurchaseConfirmed, ItemReceived, SellerRefunded }
    event PurchaseStateChange(address contractAddress, State state);
 
    function emitPurchaseStateChange(State _state) external {
        emit PurchaseStateChange(msg.sender, _state);
    }
}
