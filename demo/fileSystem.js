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
            addChild: function (c) { childs.push({id:c.getId(),name:c.getName()}); save() }
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
            addChild: function (c) { childs.push({id:c.getId(),name:c.getName()}); save() }
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
            return currentFolder.getChilds().map(function(x){return x.name;});
        },
        getCurrentFolder: function () {
            return currentFolder.getName();
        },
        getCurrentPath: function () {
            var path = "/";
            var cd = currentFolder;
            while (cd && cd.getParent() != null) {
                path = "/" + cd.getName() + path;
                cd=getFolderId(cd.getParent());
            }
            return path;
        },
        navigateUp: function () {
            console.log(currentFolder.getParent());
            if (currentFolder.getParent() != null) {
                currentFolder = getFolderId(currentFolder.getParent());
                return true;
            }
            return false;
        },
        navigateChild: function (name) {
            var childs=currentFolder.getChilds();
            childs=childs.filter(function(c){return c.name==name;});
            if (childs.length==0){
                return false;
            }
            currentFolder=getFolderId(childs[0].id);
            return true;
        },
        createFolder: function (name) {
            var childs=currentFolder.getChilds();
            childs=childs.filter(function(c){return c.name==name;});
            if (childs.length==0){
                currentFolder.addChild(Folder(name,currentFolder.getId()));
                return true;
            }
            return false;
        }
    };
});