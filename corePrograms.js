var corePrograms = corePrograms || [];

corePrograms.push({
    name: "info",
    alias: [],
    man: "This command gives you info about the system.",
    entryPoint: function (argv, stdin, stdout, fs, _return) {
        stdout.end("System version");
        _return();
    }
});

corePrograms.push({
    name: "echo",
    alias: [],
    man: "This command behaves like a parrot.",
    entryPoint: function (argv, stdin, stdout, fs, _return) {
        if (argv.length > 1) {
            for (var i = 1; i < argv.length; i++) {
                stdout.write(argv[i]);
            }
            _return();
        } else {
            stdin.on("data", function (data) { stdout.write(data) });
            stdin.on("end", function () { _return() });
        }
    }
});

corePrograms.push({
    name: "caesar",
    alias: [],
    man: "Vini, vidi, encodi",
    entryPoint: function (argv, stdin, stdout, fs, _return) {
        if (argv.length != 2) {
            _return();
        } else {
            var n = parseInt(argv[1]);
            stdin.on("data", function (data) { stdout.write(data.split("").map(function (x) { return String.fromCharCode(x.charCodeAt(0) + n) }).join("")) });
            stdin.on("end", function () { _return() });
        }
    }
});

corePrograms.push({
    name: "cd",
    alias: [],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return) {
        if (argv.length == 1) {
            stdout.write(fs.getCurrentPath());
        } else if (argv.length == 2) {
            if (fs.navigateChild(argv[1])) {

            } else {
                stdout.write("That folder does not exist");
            }
        }else{
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "mkdir",
    alias: [],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return) {
        if (argv.length == 2) {
           if (fs.createFolder(argv[1])) {

            } else {
                stdout.write("That folder already exists");
            }
        } else{
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "dir",
    alias: ["ls"],
    man: "",
    entryPoint: function (argv, stdin, stdout, fs, _return) {
        if (argv.length ==1 ) {
           fs.getChilds().forEach(stdout.write);
        } else{
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});