var Stream = function () {
    var handlers = {};
    var writeStack = [];
    var end,ended=false;
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
                    if (ended==true) {
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
        unshift: function (data) {
            if (typeof handlers["data"] === "function") {
                handlers["data"](data);
            } else {
                writeStack.unshift(data);
            }
        },
        end: function (data) {
            if (ended==false) {
                ended=true;
                if (typeof handlers["end"] === "function") {
                    handlers["end"](data);
                }else {
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


Stream.executeAsync = function (cb) {
    window.setTimeout(cb, 0);
}