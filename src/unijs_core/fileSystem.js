var FS = (function () {
    // Let us open our database
    var db;
    var request = indexedDB.open("fs");
    request.onerror = function (event) {
        alert("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onsuccess = function (event) {
        db = event.target.result;
    };
    db.onerror = function (event) {
        // Generic error handler for all errors targeted at this database's
        // requests!
        alert("Database error: " + event.target.errorCode);
    };
    request.onupgradeneeded = function (event) {
        var db = event.target.result;

        // Create an objectStore to hold information about our customers. We're
        // going to use "ssn" as our key path because it's guaranteed to be
        // unique - or at least that's what I was told during the kickoff meeting.
        var objectStore = db.createObjectStore("files", { keyPath: "id" });

        // Create an index to search customers by email. We want to ensure that
        // no two customers have the same email, so use a unique index.
        //objectStore.createIndex("email", "email", { unique: true });

        // Use transaction oncomplete to make sure the objectStore creation is 
        // finished before adding data into it.
        objectStore.transaction.oncomplete = function (event) {
            // Store values in the newly created objectStore.
            // var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
            // for (var i in customerData) {
            //     customerObjectStore.add(customerData[i]);
            // }
        };
    };

    if (!localStorage.nextId) {
        localStorage.nextId = 0;
    }
    var nextId = +localStorage.nextId;

    function deleteItem(id, cb) {
        var request = db.transaction(["files"], "readwrite")
            .objectStore("files")
            .delete(id);
        request.onsuccess = function (event) {
            cb(event)
        };
        // localStorage.removeItem(id);
    }

    function getNextId() {
        nextId = +localStorage.nextId;
        localStorage.nextId = nextId + 1;
        return nextId++;
    }

    function Folder(name_i, parent_i) {
        var name = name_i;
        var id = getNextId();
        var childs = [];
        var parent = parent_i;

        function save() {
            if (localStorage[id]) {
                var storageChilds = JSON.parse(localStorage[id]).childs;
                storageChilds.forEach(function (x) { //For each element in the hdd
                    if (childs.filter(function (y) { return y.id == x.id }).length == 0) {//If there are no elements with the same id
                        childs.push(x);
                    }
                });
            }
            var transaction = db.transaction(["files"], "readwrite");
            var objectStore = transaction.objectStore("files");
            objectStore.add({ name: name, childs: childs, parent: parent, id: id, type: "folder" });
            // localStorage[id] = JSON.stringify({ name: name, childs: childs, parent: parent, id: id, type: "folder" });
        }
        save();

        return {
            getId: function () { return id },
            getType: function () { return "folder" },
            getName: function () { return name },
            getChilds: function () { return childs },
            getParent: function () { return parent },
            addChild: function (c) { childs.push({ id: c.getId(), name: c.getName(), type: c.getType() }); save() },
            removeChild: function (name) { childs = childs.filter(function (x) { return x.name != name }); save() }
        };
    }

    function File(name_i, data_i) {
        var name = name_i;
        var id = getNextId();
        var data = data_i;
        var lock = Lock();

        function save() {
            var transaction = db.transaction(["files"], "readwrite");
            var objectStore = transaction.objectStore("files");
            objectStore.add({ name: name, id: id, type: "file", lock: lock.toString(), data: data });
            // localStorage[id] = JSON.stringify({ name: name, id: id, type: "file", lock: lock.toString(), data: data });
        }
        save();

        return {
            getId: function () { return id },
            getType: function () { return "file" },
            getName: function () { return name },
            getData: function () { return data.toString(); },
            setData: function (data_n) { data = data_n; save(); },
            addData: function (data_n) { data += data_n; save(); },
            slock: function () { var r = lock.slock(); save(); return r; },
            xlock: function () { var r = lock.xlock(); save(); return r; },
            sunlock: function () { var r = lock.sunlock(); save(); return r; },
            xunlock: function () { var r = lock.xunlock(); save(); return r; }
        };
    }

    function FolderFromStorage(f) {
        var name = f.name
        var id = f.id;
        var childs = f.childs
        var parent = f.parent

        function save() {
            if (localStorage[id]) {
                var storageChilds = JSON.parse(localStorage[id]).childs;
                storageChilds.forEach(function (x) { //For each element in the hdd
                    if (childs.filter(function (y) { return y.id == x.id }).length == 0) {//If there are no elements with the same id
                        childs.push(x);
                    }
                });
            }
            var transaction = db.transaction(["files"], "readwrite");
            var objectStore = transaction.objectStore("files");
            objectStore.add({ name: name, childs: childs, parent: parent, id: id, type: "folder" });
            // localStorage[id] = JSON.stringify({ name: name, childs: childs, parent: parent, id: id, type: "folder" });
        }


        return {
            getId: function () { return id },
            getType: function () { return "folder" },
            getName: function () { return name },
            getChilds: function () { return childs },
            getParent: function () { return parent },
            addChild: function (c) { childs.push({ id: c.getId(), name: c.getName(), type: c.getType() }); save() },
            removeChild: function (name) { childs = childs.filter(function (x) { return x.name != name }); save() }
        };
    }

    function FileFromStorage(f) {
        var name = f.name;
        var id = f.id;
        var data = f.data;
        var lock = Lock(f.lock)

        function save() {
            var transaction = db.transaction(["files"], "readwrite");
            var objectStore = transaction.objectStore("files");
            objectStore.add({ name: name, id: id, type: "file", lock: lock.toString(), data: data });
            localStorage[id] = JSON.stringify({ name: name, id: id, type: "file", lock: lock.toString(), data: data });
        }

        return {
            getId: function () { return id },
            getType: function () { return "file" },
            getName: function () { return name },
            getData: function () { return data.toString() },
            setData: function (data_n) { data = data_n; save(); },
            addData: function (data_n) { data += data_n; save(); },
            slock: function () { var r = lock.slock(); save(); return r; },
            xlock: function () { var r = lock.xlock(); save(); return r; },
            sunlock: function () { var r = lock.sunlock(); save(); return r; },
            xunlock: function () { var r = lock.xunlock(); save(); return r; }
        };
    }

    function getItemId(n, cb) {
        var transaction = db.transaction(["files"]);
        var objectStore = transaction.objectStore("files");
        var request = objectStore.get(n);
        request.onerror = function (event) {
            // Handle errors!
        };
        request.onsuccess = function (event) {
            switch (request.result.type) {
                case "folder":
                    cb(FolderFromStorage(request.result));
                case "file":
                    cb(FileFromStorage(request.result));
                default:
                    return false;
            }
        };
    }



    var currentFolder;
    getItemId(0, function (x) {
        if (x == false) {
            currentFolder = Folder("root", null);
        } else {
            currentFolder = x;
        }
    });

    function navigateUp() {
        if (currentFolder.getParent() != null) {
            getItemId(currentFolder.getParent(), function (x) {
                currentFolder = x;
            });
            return true;
        }
        return false;
    }
    function navigateChild(name) {
        var childs = currentFolder.getChilds();
        childs = childs.filter(function (c) { return c.name == name; });
        if (childs.length == 0) {
            return false;
        }
        getItemId(childs[0].id, function (x) {
            currentFolder = x;
        });
        return true;
    }

    function navigatePath(path) {
        if (path == undefined) {
            var a = 1 + 1;
        }
        if (path[0] == "/") {
            while (navigateUp()); //Go to the root
        }
        var childs = path.split("/").filter(function (x) { return x != "" });
        for (var i = 0; i < childs.length; i++) {
            if (childs[i] == "..") {
                if (!navigateUp()) {
                    return false;
                }
            } else if (!navigateChild(childs[i])) {
                return false;
            }
        }
        return true;
    }

    function getCurrentPath() {
        var path = "/";
        function navigateRecursively(cd) {
            if (cd && cd.getParent() != null) {
                path = "/" + cd.getName() + path;
                getItemId(cd.getParent(), function (x) {
                    navigateRecursively(x)
                });
            }
        }
        navigateRecursively(currentFolder);
        return path;
    }

    function navigateToParent(path) {
        var parentPath = path.split("/").slice(0, -1).join("/");
        name = path.split("/").splice(-1, 1)[0];
        var cd = getCurrentPath();
        navigatePath(parentPath);
        return cd;
    }

    function getFileName(path) {
        return path.split("/").splice(-1, 1)[0];
    }

    function deleteFile(name) {
        if (name.indexOf("/") != -1) {
            var oldDir = navigateToParent(name);
            name = getFileName(name);
        }
        var childs = currentFolder.getChilds();
        if (oldDir != undefined) {
            navigatePath(oldDir);
        }
        childs = childs.filter(function (c) { return c.name == name && c.type == "file"; });
        if (childs.length > 0) {
            childs.forEach(function (x) { deleteItem(x.id); });
            currentFolder.removeChild(name);
            return true;
        }
        return false;
    }

    function deleteFolder(name) {
        if (name.indexOf("/") != -1) {
            var oldDir = navigateToParent(name);
            name = getFileName(name);
        }
        var childs = currentFolder.getChilds();
        if (oldDir != undefined) {
            navigatePath(oldDir);
        }
        childs = childs.filter(function (c) { return c.name == name && c.type == "folder"; });
        if (childs.length > 0) {
            var oldfolder = currentFolder;
            childs.forEach(function (x) {
                getItemId(x.id, function (item) { //Navigate to child
                    currentFolder = item;
                    currentFolder.getChilds().filter(function (c) { return c.type == "folder"; }).forEach(function (c) { //Delete all of its childs
                        deleteChild(c.name);
                    });
                    deleteItem(x.id); //Delete that item itself
                });
            });
            currentFolder = oldfolder;
            currentFolder.removeChild(name); //Remove the child from the list
            return true;
        }
        return false;
    }

    function deleteChild(name) {
        return deleteFile(name) || deleteFolder(name); //Try delete file, if fails delete folder,if both fail return false
    }

    return {
        getType: function (path) {
            var parentPath = path.split("/").slice(0, -1).join("/");
            name = path.split("/").splice(-1, 1)[0];
            var cd = getCurrentPath();
            navigatePath(parentPath);
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            if (childs.length == 0) {
                return false;
            }
            navigatePath(cd);
            return childs[0].type;
        },
        getChilds: function () {
            return currentFolder.getChilds().map(function (x) { return { name: x.name, type: x.type }; });
        },
        getCurrentFolder: function () {
            return currentFolder.getName();
        },
        getCurrentPath: getCurrentPath,
        navigateUp: navigateUp,
        navigateChild: navigateChild,
        navigatePath: navigatePath,
        createFolder: function (name) {
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            if (childs.length == 0) {
                currentFolder.addChild(Folder(name, currentFolder.getId()));
                return true;
            }
            return false;
        },
        createFile: function (name, content) {
            if (name.indexOf("/") != -1) {
                var oldDir = navigateToParent(name);
                name = getFileName(name);
            }
            var childs = currentFolder.getChilds();
            if (oldDir != undefined) {
                navigatePath(oldDir);
            }
            childs = childs.filter(function (c) { return c.name == name; });
            if (childs.length == 0) {
                currentFolder.addChild(File(name, content));
                return true;
            }
            return false;
        },
        deleteFile: deleteFile,
        deleteFolder: deleteFolder,
        deleteChild: deleteChild,
        readFile: function (name) {
            if (name.indexOf("/") != -1) {
                var oldDir = navigateToParent(name);
                name = getFileName(name);
            }
            var stream = Stream();
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            if (oldDir != undefined) {
                navigatePath(oldDir);
            }
            if (childs.length != 0) {
                getItemId(childs[0].id, function (file) {
                    if (file.slock()) {

                    } else {
                        stream.end("LOCKED");
                    }
                    var chunks = file.getData().split("\n").map(function (x) { return x });
                    if (chunks[chunks.length - 1] == "\n") {
                        chunks.pop();//To avoid creating a new empty line
                    }
                    chunks.forEach(stream.write);
                    file.sunlock();
                    stream.end();
                });
            } else {
                stream.end("NOTFOUND");
            }
            return stream;
        },
        writeFile: function (name, stream,cb) {
            if (name.indexOf("/") != -1) {
                var oldDir = navigateToParent(name);
                name = getFileName(name);
            }
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            var file;
            if (childs.length != 0) {
                getItemId(childs[0].id,writeThisFile);
            } else {
                file = File(name, "");
                currentFolder.addChild(file);
                writeThisFile(file);
            }
            function writeThisFile(file) {
                if (oldDir != undefined) {
                    navigatePath(oldDir);
                }
                if (file.xlock()) {

                } else {
                    cb(false); //Locked file
                }
                file.setData("");
                stream.on("data", function (x) {
                    file.addData(x);
                });
                stream.on("end", function (x) {
                    file.xunlock();
                    cb(true);
                });
            }
        },
        appendFile: function (name, stream, cb) {
            if (name.indexOf("/") != -1) {
                var oldDir = navigateToParent(name);
                name = getFileName(name);
            }
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            var file;
            if (childs.length != 0) {
                getItemId(childs[0].id, appendThisFile);
            } else {
                file = File(name, "");
                currentFolder.addChild(file);
                appendThisFile(file);
            }
            function appendThisFile(file) {
                if (oldDir != undefined) {
                    navigatePath(oldDir);
                }
                if (file.xlock()) {

                } else {
                    cb(false); //Locked file
                }
                stream.on("data", function (x) {
                    file.addData(x);
                });
                stream.on("end", function (x) {
                    file.xunlock();
                    cb(true);
                });
            }
        }
    };
});