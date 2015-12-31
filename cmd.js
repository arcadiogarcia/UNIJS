var CMD_MODULE = (function () {
    var programs = {};
    var alias = {};
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
        }
    }

    var hardcodedMan = {
        "cmd": "Opens a new terminal",
        "set": "Sets a environment variable",
        "get": "Gets an environment variable",
        "quit": "Closes the terminal",
        "man": "Gives info about a command"
    };

    function executeCommand(input, stdin, w, term, fs) {
        var stdout = Stream();
        var argv = input.split(" ").filter(function (x) { return x != "" });
        var argc = argv.length;
        var command = argv[0];
        var returned = 0;
        var async = function () { returned = -1; };
        var _return = function () {returned = 1;stdout.end() };
        switch (command) {
            case "cmd":
                var rect = w.div.getBoundingClientRect();
                manager.Window(rect.left + 50, rect.top + 50);
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
            default:
                if (programs[command]) {
                    programs[command].entryPoint(argv, stdin, stdout, fs, _return, async);
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

    return {
        register: function (packages) {
            packages.forEach(function (x) {
                if (programs[x.name]) {
                    console.log("El programa " + x.name + " ya esta registrado");
                    return;
                }
                programs[x.name] = x;
                x.alias.forEach(function (y) {
                    alias[y] = x.name;
                });
            });
        },
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
                                //Already implemented in the library
                                // stdin.end();
                            }
                        }
                    });
                for (var i = 0; i < pipedCommands.length; i++) {
                    var command = pipedCommands[i];
                    var subcommands;
                    if (command.indexOf("<") != -1) {
                        subcommands = command.split("<");
                        var file=fs.readFile(subcommands[1].split(" ").filter(function(x){return x!="";})[0]);
                        if(file===false){
                            term.echo("File "+subcommands[1]+" does not exist.");
                            term.pop();
                            return;
                        }
                        currentStream = executeCommand(subcommands[0], file, w, term, fs);
                    } else if (command.indexOf(">>") != -1) {
                        subcommands = command.split(">>");
                        var appendStream = executeCommand(subcommands[0], currentStream, w, term, fs);
                        appendStream.unshift("\n");
                        fs.appendFile(subcommands[1].split(" ").filter(function(x){return x!="";})[0], appendStream);
                        currentStream = Stream();
                    } else if (command.indexOf(">") != -1) {
                        subcommands = command.split(">");
                        var writeStream = executeCommand(subcommands[0], currentStream, w, term, fs);
                        fs.writeFile(subcommands[1].split(" ").filter(function(x){return x!="";})[0], writeStream);
                        currentStream = Stream();
                    } else {
                        currentStream = executeCommand(pipedCommands[i], currentStream, w, term, fs);
                    }
                }
                currentStream.on("data", function (x) {
                    term.echo(x);
                });
                currentStream.on("end", function (x) {
                    term.pop();
                });
            };
        }
    };
});