var CMD_MODULE = (function () {
    var textColor = "#FFF";
    var stdoutColor = "#CCC";

    function defaultColor(s) {
        return "[[;" + textColor + ";]" + s + "]";
    }

    function outputColor(s) {
        return "[[;" + stdoutColor + ";]" + s + "]";
    }


    var programs = {};
    var libraries = {};
    var alias = {};
    var handlers = {};
    var envVariables;
    if (!localStorage.envVariables) {
        envVariables = {};
    } else {
        envVariables = JSON.parse(localStorage.envVariables);
        for (var e in envVariables) {
            setEnvVar(e, envVariables[e]);
        }
    }


    function setEnvVar(key, value) {
        envVariables[key] = value;
        switch (key) {
            case "wallpaper":
                document.body.style["background-image"] = "url('" + value + "')";
                document.body.style["background-size"] = "cover";
                document.body.style["background-position"] = "center center";
                break;
            case "accentColor":
                var stylesheet = document.styleSheets[0];
                stylesheet.cssRules[2].style.backgroundColor = value;
                break;
            case "backgroundColor":
                var stylesheet = document.styleSheets[2];
                stylesheet.cssRules[0].style.backgroundColor = value;
                break;
            case "textColor":
                textColor = value;
                break;
            case "stdoutColor":
                stdoutColor = value;
                break;
        }
    }

    var hardcodedMan = {
        "cmd": "Opens a new terminal",
        "set": "Sets a environment variable",
        "get": "Gets an environment variable",
        "quit": "Closes the terminal",
        "man": "Gives info about a command",
        "ace": "Opens the ace text editor",
        "install": "Install a program from a file",
        "install-lib": "Install a library from a file"
    };

    function executeCommand(input, stdin, w, term, fs) {
        var stdout = Stream();
        var argv = input.split(" ").filter(function (x) { return x != "" });
        var argc = argv.length;
        var command = argv[0];
        var returned = 0;
        var _background = function () { returned = -1; };
        var _return = function () { returned = 1; stdout.end() };
        switch (command) {
            case "cmd":
                var rect = w.div.getBoundingClientRect();
                manager.Window(rect.left + 50, rect.top + 50);
                break;
            case "browser":
                if (argc != 2) {
                    stdout.write("Wrong number of variables");
                } else {
                    var rect = w.div.getBoundingClientRect();
                    manager.GraphicWindow(rect.left + 50, rect.top + 50, argv[1]);
                }
                break;
            case "ace":
                var rect = w.div.getBoundingClientRect();
                manager.GraphicWindow(rect.left + 50, rect.top + 50, "editor/editor.html", false, { fs: fs });
                break;
            case "set":
                if (argc != 3) {
                    stdout.write("Incorrect number of parameters.");
                    stdout.write("You should use 'set variable value'");
                } else {
                    setEnvVar(argv[1], argv[2]);
                    localStorage.envVariables = JSON.stringify(envVariables);
                }
                break;
            case "get":
                if (argc != 2) {
                    stdout.write("Incorrect number of parameters.");
                    stdout.write("You should use 'get variable'");
                } else {
                    stdout.write(envVariables[argv[1]]);
                }
                break;
            case "quit":
                setTimeout(manager.close(w.id), 0);
                break;
            case "man":
            case "help":
                if (argc == 2) {
                    if (hardcodedMan[argv[1]]) {
                        stdout.write(hardcodedMan[argv[1]]);
                    } else if (programs[argv[1]]) {
                        if (programs[argv[1]].alias.length > 0) {
                            stdout.write("Aliases: " + programs[argv[1]].alias.join());
                        }
                        stdout.write(programs[argv[1]].man);
                    } else if (alias[argv[1]]) {
                        stdout.write("Alias of " + alias[argv[1]]);
                    }
                } else {
                    stdout.write("You can use the following commands:");
                    //Hardcoded commands
                    for (var p in hardcodedMan) {
                        stdout.write("  " + p);
                    }
                    for (var p in programs) {
                        stdout.write("  " + p);
                    }
                    stdout.write("Use 'man <command>' to get more information");
                }
                break;
            case "install":
                function installProgramFiles(array) {
                    if (array.length == 0) {
                        _return();
                        return;
                    }
                    var x = array[0];
                    var file = fs.readFile(x);
                    if (file === false) {
                        stdout.write("File " + x + " does not exist.");
                        return;
                    }
                    if (file === "Locked") {
                        stdout.write("File " + x + " is locked by another program.");
                        return;
                    }
                    var content = "";
                    file.on("data", function (data) { content += data; });
                    file.on("end", function () { var program = eval(content); registerPrograms([program]); stdout.write("Program " + x + " sucessfully installed."); installProgramFiles(array.splice(1)); });
                }
                installProgramFiles(argv.splice(1));
                _background();
                break;
            case "install-lib":
                function installLibFiles(array) {
                    if (array.length == 0) {
                        _return();
                        return;
                    }
                    var x = array[0];
                    var file = fs.readFile(x);
                    if (file === false) {
                        stdout.write("File " + x + " does not exist.");
                        return;
                    }
                    if (file === "Locked") {
                        stdout.write("File " + x + " is locked by another program.");
                        return;
                    }
                    var content = "";
                    file.on("data", function (data) { content += data; });
                    file.on("end", function () { var program = eval(content); registerLibraries([program]); stdout.write("Library " + x + " sucessfully installed."); installLibFiles(array.splice(1)); });
                }
                installLibFiles(argv.splice(1));
                _background();
                break;
            default:
                if (programs[command]) {
                    var async = { return: _return, background: _background };
                    var include = function (x) { if (x == "fs") { return fs } return libraries[x].content };
                    programs[command].entryPoint(argv, stdin, stdout, include, async);
                } else {
                    stdout.write("Unknown command \"" + command + "\"");
                }
        }
        //Make sure non-async program returns
        if (returned == 0) {
            returned = 1;
            stdout.end();
        }
        return stdout;
    }

    function registerPrograms(packages) {
        packages.forEach(function (x) {
            if (programs[x.name]) {
                console.log("The program " + x.name + " is already installed");
                return;
            }
            if (x.dependencies) {
                x.dependencies.forEach(function (x) { if (!libraries[x]) { console.log("Error, the required dependency " + x + " is not installed."); return; } });
            }
            programs[x.name] = x;
            x.alias.forEach(function (y) {
                alias[y] = x.name;
            });
        });
    }

    function registerLibraries(packages) {
        packages.forEach(function (x) {
            if (libraries[x.name]) {
                console.log("The library " + x.name + " is already installed");
                return;
            }
            if (x.dependencies) {
                x.dependencies.forEach(function (x) { if (!libraries[x]) { console.log("Error, the required dependency " + x + " is not installed."); return; } });
            }
            libraries[x.name] = x;
        });
    }

    return {
        registerPrograms: registerPrograms,
        registerLibraries: registerLibraries,
        open: function () {
            //Stuff local to each console
            var fs = FS();
            return function (cmdhandler, w, manager, input, term) {
                cmdhandler.cd = fs.getCurrentPath;
                var currentStream = Stream();
                var stdin = currentStream;
                var pipedCommands = input.split("|");
                term.push(function (input, term) {
                    stdin.write(input);
                },
                    {
                        prompt: '',
                        name: input,
                        keydown: function (event) {
                            if ((event.which == 68 && event.ctrlKey)) {
                                if (handlers.ctrld) {
                                    handlers.ctrld();
                                };
                            }
                        }
                    });
                for (var i = 0; i < pipedCommands.length; i++) {
                    var command = pipedCommands[i];
                    var subcommands;
                    if (command.indexOf("<") != -1) {
                        subcommands = command.split("<");
                        var file = fs.readFile(subcommands[1].split(" ").filter(function (x) { return x != ""; })[0]);
                        if (file === false) {
                            term.echo(defaultColor("File " + subcommands[1] + " does not exist."));
                            term.pop();
                            return;
                        }
                        if (file === "Locked") {
                            term.echo(defaultColor("This file is locked by another program."));
                            term.pop();
                            return;
                        }
                        currentStream = executeCommand(subcommands[0], file, w, term, fs);
                    } else if (command.indexOf(">>") != -1) {
                        subcommands = command.split(">>");
                        var outputstream = executeCommand(subcommands[0], currentStream, w, term, fs);
                        var tee = StreamTee();
                        outputstream.pipe(tee);
                        var writestream = Stream();
                        tee.on1("data", function (x) { writestream.write(x + "\n"); });
                        tee.on1("end", writestream.end);
                        var consolestream = Stream();
                        handlers.ctrld = function () { writestream.end() };
                        tee.on2("end", consolestream.end);
                        if (fs.appendFile(subcommands[1].split(" ").filter(function (x) { return x != ""; })[0], writestream) === false) {
                            term.echo("This file is locked by another program.");
                            term.pop();
                            return;
                        }
                        currentStream = consolestream;
                    } else if (command.indexOf(">") != -1) {
                        subcommands = command.split(">");
                        var outputstream = executeCommand(subcommands[0], currentStream, w, term, fs);
                        var tee = StreamTee();
                        outputstream.pipe(tee);
                        var writestream = Stream();
                        tee.on1("data", function (x) { writestream.write(x + "\n"); });
                        tee.on1("end", writestream.end);
                        var consolestream = Stream();
                        handlers.ctrld = function () { writestream.end() };
                        tee.on2("end", consolestream.end);
                        if (fs.writeFile(subcommands[1].split(" ").filter(function (x) { return x != ""; })[0], writestream) === false) {
                            term.echo(defaultColor("This file is locked by another program."));
                            term.pop();
                            return;
                        }
                        currentStream = consolestream;
                    } else {
                        currentStream = executeCommand(pipedCommands[i], currentStream, w, term, fs);
                    }
                }
                currentStream.on("data", function (x) {
                    term.echo(outputColor(x));
                });
                currentStream.on("end", function (x) {
                    term.pop();
                });
            };
        }
    };
});