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
            localStorage[id] = JSON.stringify({ name: name, childs: childs, parent: parent,id:id });
        }
        save();

        return {
            getId: function () { return id },
            getName: function () { return name },
            getChilds: function () { return childs },
            getParent: function () { return parent },
            addChild: function (c) { childs.push(c.getId()); save() }
        };
    }
    
    function FolderString(string) {
        var f=JSON.parse(string);
        var name = f.name
        var id = f.id;
        var childs = f.childs
        var parent = f.parent

        function save() {
            localStorage[id] = JSON.stringify({ name: name, childs: childs, parent: parent, id:id });
        }

        save();

        return {
            getId: function () { return id },
            getName: function () { return name },
            getChilds: function () { return childs },
            getParent: function () { return parent },
            addChild: function (c) { childs.push(c.getId()); save() }
        };
    }

    function getFolderId(n) {
        if (typeof localStorage[n] === "undefined") {
            return false;
        }
        return FolderString(localStorage[n]);
    }

    var currentFolder;
    if (!getFolderId(0)) {
        Folder("root", null);
    }

    currentFolder = getFolderId(0);

    return {
        getChilds: function () {
            return currentFolder.getChilds();
        },
        getCurrentFolder: function () {
            return currentFolder.getName();
        },
        getCurrentPath: function () {
            var path = "/";
            var cd = currentFolder;
            while (cd.getParent() != null) {
                path = "/" + cd.getName() + path;
                cd = cd.getParent();
            }
            return path;
        },
        navigateUp: function () {
            if (currentFolder.getParent() != null) {
                currentFolder = currentFolder.getParent();
                return true;
            }
            return false;
        },
        navigateChild: function (name) {
            var childs=currentFolder.getChilds();
            childs=childs.map(function (id){return getFolderId(id);});
            childs=childs.filter(function(c){return c.getName()==name;});
            if (childs.length==0){
                return false;
            }
            currentFolder=childs[0];
            return true;
        }
    };
})();