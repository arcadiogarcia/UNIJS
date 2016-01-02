var FS = (function () {
    if (!localStorage.nextId) {
        localStorage.nextId = 0;
    }
    var nextId = localStorage.nextId;

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
            addChild: function (c) { childs.push({ id: c.getId(), name: c.getName(), type: c.getType() }); save() }
        };
    }

    function File(name_i, data_i) {
        var name = name_i;
        var id = getNextId();
        var data = data_i;
        var lock = Lock();

        function save() {
            localStorage[id] = JSON.stringify({ name: name, id: id, type: "file", lock: lock.toString(), data: data });
            console.log(localStorage[id]);
        }
        save();

        return {
            getId: function () { return id },
            getType: function () { return "file" },
            getName: function () { return name },
            getData: function () { return data },
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
            addChild: function (c) { childs.push({ id: c.getId(), name: c.getName(), type: c.getType() }); save() }
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
            getData: function () { return data },
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

    return {
        getChilds: function () {
            return currentFolder.getChilds().map(function (x) { return { name: x.name, type: x.type }; });
        },
        getCurrentFolder: function () {
            return currentFolder.getName();
        },
        getCurrentPath: function () {
            var path = "/";
            var cd = currentFolder;
            while (cd && cd.getParent() != null) {
                path = "/" + cd.getName() + path;
                cd = getItemId(cd.getParent());
            }
            return path;
        },
        navigateUp: function () {
            console.log(currentFolder.getParent());
            if (currentFolder.getParent() != null) {
                currentFolder = getItemId(currentFolder.getParent());
                return true;
            }
            return false;
        },
        navigateChild: function (name) {
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            if (childs.length == 0) {
                return false;
            }
            currentFolder = getItemId(childs[0].id);
            return true;
        },
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
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            if (childs.length == 0) {
                currentFolder.addChild(File(name, content));
                return true;
            }
            return false;
        },
        readFile: function (name) {
            var stream = Stream();
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
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
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            var file;
            if (childs.length != 0) {
                file = getItemId(childs[0].id);
            } else {
                file = File(name, "");
                currentFolder.addChild(file);
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
            var childs = currentFolder.getChilds();
            childs = childs.filter(function (c) { return c.name == name; });
            var file;
            if (childs.length != 0) {
                file = getItemId(childs[0].id);
            } else {
                file = File(name, "");
                currentFolder.addChild(file);
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