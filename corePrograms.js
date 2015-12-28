var corePrograms = corePrograms || [];

corePrograms.push({
    name: "info",
    alias: [],
    man: "This command gives you info about the system.",
    entryPoint: function (argv, stdin, stdout, _return) {
        stdout.end("System version");
        _return();
    }
});

corePrograms.push({
    name: "echo",
    alias: [],
    man: "This command behaves like a parrot.",
    entryPoint: function (argv, stdin, stdout, _return) {
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
    entryPoint: function (argv, stdin, stdout, _return) {
        if (argv.length != 2) {
            _return();
        } else {
            var n= parseInt(argv[1]);
            stdin.on("data", function (data) { stdout.write(data.split("").map(function(x){return String.fromCharCode(x.charCodeAt(0)+n)}).join("")) });
            stdin.on("end", function () { _return() });
        }
    }
});