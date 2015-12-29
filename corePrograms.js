var corePrograms = corePrograms || [];

corePrograms.push({
    name: "info",
    alias: [],
    man: "This command gives you info about the system.",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        stdout.end("System version");
        _return();
    }
});

corePrograms.push({
    name: "echo",
    alias: [],
    man: "This command behaves like a parrot.",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        if (argv.length > 1) {
            for (var i = 1; i < argv.length; i++) {
                stdout.write(argv[i]);
            }
            _return();
        } else {
            stdin.on("data", function (data) { stdout.write(data) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "caesar",
    alias: [],
    man: "Vini, vidi, encodi",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        if (argv.length != 2) {
            _return();
        } else {
            var n = parseInt(argv[1]);
            stdin.on("data", function (data) { stdout.write(data.split("").map(function (x) { return String.fromCharCode(x.charCodeAt(0) + n) }).join("")) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "cd",
    alias: [],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        if (argv.length == 1) {
            stdout.write(fs.getCurrentPath());
        } else if (argv.length == 2) {
            var folders = argv[1].split("/").filter(function(x){return x!="";});
            for (var i = 0; i < folders.length; i++) {
                if (folders[i] != "..") {
                    if (fs.navigateChild(folders[i])) {

                    } else {
                        stdout.write("Folder "+folders[i]+" is not a child of "+fs.getCurrentFolder());
                        break;
                    }
                } else {
                    if (fs.navigateUp()) {

                    } else {
                        stdout.write("You are already in the root folder");
                        break;
                    }
                }
            }
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "mkdir",
    alias: [],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        if (argv.length == 2) {
            if (fs.createFolder(argv[1])) {

            } else {
                stdout.write("That folder already exists");
            }
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "dir",
    alias: ["ls"],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        if (argv.length == 1) {
            fs.getChilds().forEach(stdout.write);
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "tree",
    alias: [],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return,async) {
        function printTree(level, levelsfinished) {
            var tabs = "", i = 0;
            level = level || 0;
            levelsfinished = levelsfinished || 0;
            while (i++ < level-levelsfinished) {
                tabs += "│";
            }
            i=0;
            while (i++ < levelsfinished) {
                tabs += " ";
            }
            var childs = fs.getChilds();
            for (i = 0; i < childs.length; i++) {
                fs.navigateChild(childs[i]);
                if (i != childs.length - 1) {
                    stdout.write(tabs + "├── " + childs[i]);
                } else {
                    levelsfinished+=1;
                    stdout.write(tabs + "└── " + childs[i]);
                }
                printTree(level + 1, levelsfinished);
                fs.navigateUp();
            }
        }
        if (argv.length == 1) {
            stdout.write(fs.getCurrentFolder());
            printTree();
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});