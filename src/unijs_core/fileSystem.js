var FS = (function () {
    if (!localStorage.nextId) {
        localStorage.nextId = 0;
    }
    var nextId = +localStorage.nextId;

    function deleteItem(id) {
        localStorage.removeItem(id);
    }

    function getNextId() {
        localStorage.nextId = nextId + 1;
        return nextId++;
    }

    function Folder(name_i, parent_i) {
        var name = name_i;
        var id = getNextId();
        var childs = [];
        var parent = parent_i;

        function save() {
            localStorage[id] = JSON.stringify({ name: name, childs: childs, parent: parent, id: id, type: "folder" });
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
            localStorage[id] = JSON.stringify({ name: name, id: id, type: "file", lock: lock.toString(), data: data });
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

    function FolderString(string) {
        var f = JSON.parse(string);
        var name = f.name
        var id = f.id;
        var childs = f.childs
        var parent = f.parent

        function save() {
            localStorage[id] = JSON.stringify({ name: name, childs: childs, parent: parent, id: id, type: "folder" });
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

    function FileString(string) {
        var f = JSON.parse(string);
        var name = f.name;
        var id = f.id;
        var data = f.data;
        var lock = Lock(f.lock)

        function save() {
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

    function getItemId(n) {
        if (typeof localStorage[n] === "undefined") {
            return false;
        }
        switch (JSON.parse(localStorage[n]).type) {
            case "folder":
                return FolderString(localStorage[n]);
            case "file":
                return FileString(localStorage[n]);
            default:
                return false;
        }

    }



    var currentFolder;
    if (!getItemId(0)) {
        Folder("root", null);
    }

    currentFolder = getItemId(0);
    function navigateUp() {
        if (currentFolder.getParent() != null) {
            currentFolder = getItemId(currentFolder.getParent());
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
        currentFolder = getItemId(childs[0].id);
        return true;
    }

    function navigatePath(path) {
        if(path==undefined){
            var a=1+1;
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
        var cd = currentFolder;
        while (cd && cd.getParent() != null) {
            path = "/" + cd.getName() + path;
            cd = getItemId(cd.getParent());
        }
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
            childs = childs.filter(function (c) { return c.name == name && c.type=="file"; });
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
            childs = childs.filter(function (c) { return c.name == name && c.type=="folder"; });
            if (childs.length > 0) {
                var oldfolder= currentFolder;              
                childs.forEach(function (x) {
                     currentFolder = getItemId(x.id); //Navigate to child
                     currentFolder.getChilds().filter(function (c) { return c.type=="folder"; }).forEach(function(c){ //Delete all of its childs
                         deleteChild(c.name);
                         });
                     deleteItem(x.id); }); //Delete that item itself
                currentFolder=oldfolder;
                currentFolder.removeChild(name); //Remove the child from the list
                return true;
            }
            return false;
    }
    
    function deleteChild(name){
        return deleteFile(name)||deleteFolder(name); //Try delete file, if fails delete folder,if both fail return false
    }

    return {
        getType:function (path) {
            var parentPath = path.split("/").slice(0, -1).join("/");
            name = path.split("/").splice(-1, 1)[0];
            var cd = getCurrentPath();
            navigatePath(parentPath);
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            if(childs.length==0){
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
                var file = getItemId(childs[0].id);
                if (file.slock()) {

                } else {
                    return "Locked";
                }
                Stream.executeAsync(function () {
                    var chunks = file.getData().split("\n").map(function (x) { return x + "\n" });
                    if (chunks[chunks.length - 1] == "\n") {
                        chunks.pop();//To avoid creating a new empty line
                    }
                    chunks.forEach(stream.write);
                    file.sunlock();
                    stream.end();
                });
                return stream;
            }
            return false;
        },
        writeFile: function (name, stream) {
            if (name.indexOf("/") != -1) {
                var oldDir = navigateToParent(name);
                name = getFileName(name);
            }
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            var file;
            if (childs.length != 0) {
                file = getItemId(childs[0].id);
            } else {
                file = File(name, "");
                currentFolder.addChild(file);
            }
            if (oldDir != undefined) {
                navigatePath(oldDir);
            }
            if (file.xlock()) {

            } else {
                return false; //Locked file
            }
            file.setData("");
            stream.on("data", function (x) {
                file.addData(x);
            });
            stream.on("end", function (x) {
                file.xunlock()
            });
            return true;
        },
        appendFile: function (name, stream) {
            if (name.indexOf("/") != -1) {
                var oldDir = navigateToParent(name);
                name = getFileName(name);
            }
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            var file;
            if (childs.length != 0) {
                file = getItemId(childs[0].id);
            } else {
                file = File(name, "");
                currentFolder.addChild(file);
            }
            if (oldDir != undefined) {
                navigatePath(oldDir);
            }
            if (file.xlock()) {

            } else {
                return false; //Locked file
            }
            stream.on("data", function (x) {
                file.addData(x);
            });
            stream.on("end", function (x) {
                file.xunlock()
            });
            return true;
        }
    };
});