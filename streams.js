var Stream = function () {
    var handlers = {};
    return {
        on: function (action, callback) {
            handlers[action] = callback;
        },
        write: function (data) {
            console.log("Writing: "+data);
            if (typeof handlers["data"] === "function") {
                handlers["data"](data);
            }
        },
        end: function (data) {
            if (typeof handlers["end"] === "function") {
                handlers["end"](data);
            }
        },
        pipe: function (stream) {
            handlers["data"] = stream.write;
            handlers["end"] = stream.end;
        }
    };
};