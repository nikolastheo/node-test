"use strict";
function Message(id, group, message, createdDate) {
    this.id = id;
    this.group = group;
    this.message = message;
    this.createdDate = createdDate;
}

module.exports = Message;