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
            this.on("data",stream.write);
            this.on("end",stream.end);
        }
    };
};


var StreamTee=function(){
    var s1=Stream();
    var s2=Stream();
     return {
        on1: function (action, callback) {
            s1.on(action,callback);
        },
        on2: function (action, callback) {
            s2.on(action,callback);
        },
        write: function (data) {
            s1.write(data);
            s2.write(data);
        },
        unshift: function (data) {
            s1.unshift(data);
            s2.unshift(data);
        },
        end: function (data) {
            s1.end(data);
            s2.end(data);
        },
        pipe1: function (stream) {
            s1.pipe(stream);
        },
        pipe2: function (stream) {
            s2.pipe(stream);
        }
    };
}


Stream.executeAsync = function (cb) {
    window.setTimeout(cb, 0);
}