self.importScripts('unijs_core/fileSystem.js');

self.addEventListener('fetch', function (event) {
    var uri = parseUri(event.request.url);
    console.log(uri.path);
    if (uri.path.indexOf("/filesystem") == 0) {
        var path=uri.path.slice(11);
        var fs=FS();
        var file = fs.readFile(path);
        if (file === false) {
            event.respondWith(new Response("This file does not exist"));
            return;
        }
        if (file === "Locked") {
            event.respondWith(new Response("This file does not exist"));
            return;
        }
        var content = "";
        file.on("data", function (x) { content += x; });
        file.on("end", function () {
            event.respondWith(new Response(content));
        });
    } else {
        event.respondWith(fetch(event.request));
    }
});


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