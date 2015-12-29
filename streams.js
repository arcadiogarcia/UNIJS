var Stream = function () {
    var handlers = {};
    var writeStack = [];
    var end;
    return {
        on: function (action, callback) {
            handlers[action] = callback;
            switch (action) {
                case "data":
                    while (writeStack.length) {
                        callback(writeStack.shift());//FIFO
                    }
                    break;
                case "end":
                    if (typeof end !== "undefined") {
                        callback(end);
                    }
                    break;
                default:
                    console.log("Warning: '" + action + "' is an unrecognized stream action, you might have a typo there");
            }
        },
        write: function (data) {
            if (typeof handlers["data"] === "function") {
                handlers["data"](data);
            } else {
                writeStack.push(data);
            }
        },
        end: function (data) {
            if (typeof handlers["end"] === "function") {
                handlers["end"](data);
            } else {
                if (typeof end !== "undefined") {
                    end = data;
                }
            }
        },
        pipe: function (stream) {
            handlers["data"] = stream.write;
            handlers["end"] = stream.end;
        }
    };
};