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

    function executeCommand(input, stdin, stderr, w, fs, wm) {
        var stdout = Stream();
        var argv = input.split(" ").filter(function (x) { return x != "" });
        var argc = argv.length;
        var command = argv[0];
        var returned = 0;
        var _background = function () { returned = -1; };
        var _return = function () { returned = 1; stdout.end() };
        switch (command) {
            case "cmd":
                if (argc == 1) {
                    var rect;
                    if (w) {
                        rect = w.div.getBoundingClientRect();
                    } else {
                        rect = { left: 50, top: 50 };
                    }
                    manager.Window(rect.left + 50, rect.top + 50);

                } else if (argc == 2) {
                    var file = fs.readFile(argv[1]);
                    if (file === false) {
                        stderr.write("File " + argv[1] + " does not exist.");
                        return;
                    }
                    if (file === "Locked") {
                        stderr.write("This file is locked by another program.");
                        return;
                    }
                    var initscript = [];
                    file.on("data", initscript.push.bind(initscript));
                    file.on("end", function () {
                        //Execute all instructions async one by one until the array is empty
                        
                        executeInstruction(initscript.map(function (x) { return inputHandler.bind(this, x.trim()); }));
                        function executeInstruction(array) {
                            if (array.length == 0) {
                                _return();
                                return;
                            }
                            var i = array.shift();
                            var thisstdout = i(fs, stdin, wm, w);
                            thisstdout.stdout.on("data", stdout.write);
                            thisstdout.stderr.on("data", stderr.write);
                            thisstdout.stdout.on("end", function () { executeInstruction(array) });
                        }
                    });
                    _background();
                } else {
                    stderr.write("Wrong number of parameters");
                }
                break;
            case "browser":
                if (argc != 2) {
                    stderr.write("Wrong number of parameters");
                } else {
                    var rect;
                    if (w) {
                        rect = w.div.getBoundingClientRect();
                    } else {
                        rect = { left: 50, top: 50 };
                    }
                    manager.GraphicWindow(rect.left + 50, rect.top + 50, argv[1]);
                }
                break;
            case "ace":
                var rect;
                if (w) {
                    rect = w.div.getBoundingClientRect();
                } else {
                    rect = { left: 50, top: 50 };
                }
                manager.GraphicWindow(rect.left + 50, rect.top + 50, "editor/editor.html", false, { fs: fs });
                break;
            case "set":
                if (argc != 3) {
                    stderr.write("Incorrect number of parameters.");
                    stderr.write("You should use 'set variable value'");
                } else {
                    setEnvVar(argv[1], argv[2]);
                    localStorage.envVariables = JSON.stringify(envVariables);
                }
                break;
            case "get":
                if (argc != 2) {
                    stderr.write("Incorrect number of parameters.");
                    stderr.write("You should use 'get variable'");
                } else {
                    stdout.write(envVariables[argv[1]]);
                }
                break;
            case "quit":
                if (w) {
                    setTimeout(manager.close(w.id), 0);
                }
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
                var ended = true;// Only used for async form stdin
                function installProgramFiles(array) {
                    if (array.length == 0) {
                        if (ended == true) {
                            _return();
                        }
                        return;
                    }
                    var x = array.shift().trim();
                    var file = fs.readFile(x);
                    if (file === false) {
                        stderr.write("File " + x + " does not exist.");
                        return;
                    }
                    if (file === "Locked") {
                        stderr.write("File " + x + " is locked by another program.");
                        return;
                    }
                    var content = "";
                    file.on("data", function (data) { content += data; });
                    file.on("end", function () { var program = eval(content); registerPrograms([program]); stdout.write("Program " + x + " sucessfully installed."); installProgramFiles(array); });
                }
                if (argv.length > 1) {
                    installProgramFiles(argv.splice(1));
                } else {
                    ended = false;
                    var array_programs = [];
                    stdin.on("data", function (x) {
                        array_programs.push(x);
                        if (array_programs.length == 1) {
                            installProgramFiles(array_programs);
                        }
                    });
                    stdin.on("end", function () {
                        ended = true;
                    });
                }
                _background();
                break;
            case "install-lib":
                var ended = true;// Only used for async form stdin
                function installLibraryFiles(array) {
                    if (array.length == 0) {
                        if (ended == true) {
                            _return();
                        }
                        return;
                    }
                    var x = array.shift().trim();
                    var file = fs.readFile(x);
                    if (file === false) {
                        stderr.write("File " + x + " does not exist.");
                        return;
                    }
                    if (file === "Locked") {
                        stderr.write("File " + x + " is locked by another program.");
                        return;
                    }
                    var content = "";
                    file.on("data", function (data) { content += data; });
                    file.on("end", function () { var program = eval(content); registerLibraries([program]); stdout.write("Program " + x + " sucessfully installed."); installLibraryFiles(array); });
                }
                if (argv.length > 1) {
                    installLibraryFiles(argv.splice(1));
                } else {
                    ended = false;
                    var array_programs = [];
                    stdin.on("data", function (x) {
                        array_programs.push(x);
                        if (array_programs.length == 1) {
                            installLibraryFiles(array_programs);
                        }
                    });
                    stdin.on("end", function () {
                        ended = true;
                    });
                }
                _background();
                break;
            case "install-app":
                var ended = true;// Only used for async form stdin
                function installAppFiles(array) {
                    if (array.length == 0) {
                        if (ended == true) {
                            _return();
                        }
                        return;
                    }
                    var x = array.shift().trim();
                    var file = fs.readFile(x);
                    if (file === false) {
                        stderr.write("File " + x + " does not exist.");
                        return;
                    }
                    if (file === "Locked") {
                        stderr.write("File " + x + " is locked by another program.");
                        return;
                    }
                    var content = "";
                    file.on("data", function (data) { content += data; });
                    file.on("end", function () { var program = eval(content); registerApps([program]); stdout.write("App " + x + " sucessfully installed."); installAppFiles(array); });
                }
                if (argv.length > 1) {
                    installAppFiles(argv.splice(1));
                } else {
                    ended = false;
                    var array_programs = [];
                    stdin.on("data", function (x) {
                        array_programs.push(x);
                        if (array_programs.length == 1) {
                            installAppFiles(array_programs);
                        }
                    });
                    stdin.on("end", function () {
                        ended = true;
                    });
                }
                _background();
                break;
            default:
                if (programs[command]) {
                    var program = programs[command];
                    if (program.isApp) {
                        var path = fs.getCurrentPath();
                        fs.navigatePath("usr/app/" + program.name + "/payload");
                         var rect;
                            if (w) {
                                rect = w.div.getBoundingClientRect();
                            } else {
                                rect = { left: 50, top: 50 };
                            }
                        manager.GraphicWindow(rect.left + 50, rect.top + 50, "fileSystem//usr/app/" + program.name + "/payload/"+program.entryPoint, false, { fs: fs });
                        // libraries["file-system"].content.getFileContent(program.entryPoint, function (content) {
                        //     fs.navigatePath(path);
                        //     if(content==false){
                        //         stderr.write("Error executing the app, can't open the entry point.");
                        //         _return();
                        //         return;
                        //     }
                        //     var rect;
                        //     if (w) {
                        //         rect = w.div.getBoundingClientRect();
                        //     } else {
                        //         rect = { left: 50, top: 50 };
                        //     }
                        //     manager.GraphicWindow(rect.left + 50, rect.top + 50, content, true, { fs: fs });
                        //     _return();
                        // },fs);
                        _background();
                    } else {
                        var async = { return: _return, background: _background };
                        var include = function (x) { if (x == "fs") { return fs } return libraries[x].content };
                        program.entryPoint(argv, stdin, stdout, stderr, include, async);
                    }
                } else {
                    stderr.write("Unknown command \"" + command + "\"");
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

            var fs = FS();
            var sFile = Stream();
            fs.writeFile("/usr/bin/" + x.name, sFile);
            var fileContent = JSON.stringify(x);
            fileContent = fileContent.slice(0, fileContent.length - 1);
            fileContent = "(" + fileContent + ",entryPoint:" + x.entryPoint.toString() + "});"
            sFile.write(fileContent);
            sFile.end();

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

            var fs = FS();
            var sFile = Stream();
            fs.writeFile("/usr/lib/" + x.name, sFile);
            var fileContent = JSONtoJS(serialize(x))
            sFile.write(fileContent);
            sFile.end();

        });
    }

    function registerApps(packages) {
        packages.forEach(function (x) {
            var fs = FS();
            var path = fs.getCurrentPath();
            if (programs[x.name]) {
                console.log("The program " + x.name + " is already installed");
                return;
            }
            if (x.dependencies) {
                x.dependencies.forEach(function (x) { if (!libraries[x]) { console.log("Error, the required dependency " + x + " is not installed."); return; } });
            }
            programs[x.name] = x;
            programs[x.name].isApp = true;
            if (x.alias) {
                x.alias.forEach(function (y) {
                    alias[y] = x.name;
                });
            }

            var fs = FS();
            var sFile = Stream();
            fs.navigatePath("/usr/app/");
            fs.createFolder(x.name);
            fs.navigatePath(x.name);
            fs.writeFile("manifest.app.njs", sFile);
            var fileContent = JSON.stringify(x);
            sFile.write(fileContent);
            sFile.end();
            fs.createFolder("payload");
            fs.navigatePath(path);
            libraries["file-system"].content.copyFolder(x.payload, "/usr/app/" + x.name + "/payload", fs);
        });
    }

    function termInputHandler(fs, cmdhandler, w, manager, input, term) {
        cmdhandler.cd = fs.getCurrentPath;
        var currentStream = Stream();
        var stdin = currentStream;

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
        var result = inputHandler(input, fs, stdin, manager, w);
        result.stdout.on("data", function (x) {
            term.echo(outputColor(x));
        });
        result.stdout.on("end", function (x) {
            term.pop();
        });
        result.stderr.on("data", function (x) {
            term.echo(defaultColor(x));
        });
        result.stderr.on("end", function (x) {
            term.pop();
        });
    }

    function inputHandler(input, fs, stdin, manager, w) {
        var stderr = Stream();
        var pipedCommands = input.split("|");
        var currentStream = stdin;
        for (var i = 0; i < pipedCommands.length; i++) {
            var command = pipedCommands[i];
            var subcommands;
            if (command.indexOf("<") != -1) {
                subcommands = command.split("<");
                var file = fs.readFile(subcommands[1].split(" ").filter(function (x) { return x != ""; })[0]);
                if (file === false) {
                    stderr.write("File " + subcommands[1] + " does not exist.");
                    stderr.end();
                    return;
                }
                if (file === "Locked") {
                    stderr.write("This file is locked by another program.");
                    stderr.end();
                    return;
                }
                currentStream = executeCommand(subcommands[0], file, stderr, w, fs, manager);
            } else if (command.indexOf(">>") != -1) {
                subcommands = command.split(">>");
                var outputstream = executeCommand(subcommands[0], currentStream, stderr, w, fs, manager);
                var tee = StreamTee();
                outputstream.pipe(tee);
                var writestream = Stream();
                tee.on1("data", function (x) { writestream.write(x + "\n"); });
                tee.on1("end", writestream.end);
                var consolestream = Stream();
                handlers.ctrld = function () { writestream.end() };
                tee.on2("end", consolestream.end);
                if (fs.appendFile(subcommands[1].split(" ").filter(function (x) { return x != ""; })[0], writestream) === false) {
                    stderr.write("This file is locked by another program.");
                    stderr.end();
                    return;
                }
                currentStream = consolestream;
            } else if (command.indexOf(">") != -1) {
                subcommands = command.split(">");
                var outputstream = executeCommand(subcommands[0], currentStream, stderr, w, fs, manager);
                var tee = StreamTee();
                outputstream.pipe(tee);
                var writestream = Stream();
                tee.on1("data", function (x) { writestream.write(x + "\n"); });
                tee.on1("end", writestream.end);
                var consolestream = Stream();
                handlers.ctrld = function () { writestream.end() };
                tee.on2("end", consolestream.end);
                if (fs.writeFile(subcommands[1].split(" ").filter(function (x) { return x != ""; })[0], writestream) === false) {
                    stderr.write("This file is locked by another program.");
                    stderr.end();
                    return;
                }
                currentStream = consolestream;
            } else {
                currentStream = executeCommand(pipedCommands[i], currentStream, stderr, w, fs, manager);
            }
        }
        return { stdout: currentStream, stderr: stderr };
    }

    return {
        registerPrograms: registerPrograms,
        registerLibraries: registerLibraries,
        open: function () {
            //Stuff local to each console
            var fs = FS();
            return termInputHandler.bind(this, fs);
        },
        executeCommand: function (input, stdin, WM, w) {
            //Stuff local to each console
            var fs = FS();
            return inputHandler(input, fs, stdin, WM, w);
        }
    };
});