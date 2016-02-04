var connection = {};
var messageCallback;
var fetchEvent;

var db;
var request = indexedDB.open("sockets");
request.onerror = function (event) {
    alert("Why didn't you allow my web app to use IndexedDB?!");
};
request.onsuccess = function (event) {
    db = event.target.result;
    db.onerror = function (event) {
        console.log("Database error: " + event.target.errorCode);
    };
};
request.onupgradeneeded = function (event) {
    var db = event.target.result;

    var objectStore = db.createObjectStore("fs", { keyPath: "id" });

    objectStore.transaction.oncomplete = function (event) {

    };
};



self.addEventListener('fetch', function (e) {
    console.log(e.request.referrer,parseUri(e.request.url).path);
    if (parseUri(e.request.url).path.indexOf("/fileSystem//") == 0) {
        e.respondWith(new Promise(function (resolve, reject) {
            var transaction = db.transaction(["fs"], "readwrite");
            var objectStore = transaction.objectStore("fs");
            console.log("requested "+parseUri(e.request.url).path.slice(13));
            objectStore.put({ id: "path", data: parseUri(e.request.url).path.slice(13) });
            pollData();
            function pollData() {
                var transaction = db.transaction(["fs"]);
                var objectStore = transaction.objectStore("fs");
                var request = objectStore.get("data");
                request.onerror = function (event) {
                    // Handle errors!
                };
                request.onsuccess = function (event) {
                    if(request.result){
                        console.log("retrieved "+request.result.data);
                        var transaction = db.transaction(["fs"], "readwrite");
                        var objectStore = transaction.objectStore("fs");
                        objectStore.delete( "data");
                        if(request.result.data){
                            var myHeaders = new Headers();
                            myHeaders.append('Content-Type', 'text/html');
                            resolve(new Response(request.result.data,{headers:myHeaders}));
                        }else{
                            resolve(new Response("File not found"));
                        }
                    }else{
                        setTimeout(pollData,300);
                    }
                };
            }
        }));
    } else {
        e.respondWith(fetch(e.request));
    }
});


// self.addEventListener('message', function (event) {
//     console.log("Message received");
//     var transaction = db.transaction(["sockets"], "readwrite");
//     var objectStore = transaction.objectStore("sockets");
//     objectStore.add({ id: "data", data: event.data });
//     objectStore.add({ id: "socket", data: event.ports[0] });
// });



// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str) {
    var o = parseUri.options,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};