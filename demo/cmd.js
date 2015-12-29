var CMD = (function () {
    var programs = {};
    var envVariables = {};

    function executeCommand(input, stdin, w, term, fs) {
        var stdout = Stream();
        var argv = input.split(" ").filter(function (x) { return x != "" });
        var argc = argv.length;
        var command = argv[0];
        var returned = 0;
        var async = function () { returned = -1; };
        var _return = function () { if (returned == 0) { returned = 1; term.pop(); } };
        switch (command) {
            case "cmd":
                var rect = w.div.getBoundingClientRect();
                manager.Window(rect.left + 50, rect.top + 50);
                break;
            case "set":
                if (argc != 3) {
                    term.echo("Incorrect number of parameters.");
                    term.echo("You should use 'set variable value'");
                } else {
                    envVariables[argv[1]] = argv[2];
                    switch (argv[1]) {
                        case "wallpaper":
                            document.body.style["background-image"] = "url('" + argv[2] + "')";
                            document.body.style["background-size"] = "cover";
                            document.body.style["background-position"] = "center center";
                            break;
                        case "accentColor":
                            var stylesheet = document.styleSheets[0];
                            stylesheet.cssRules[2].style.backgroundColor = argv[2];
                            break;
                    }
                }
                break;
            case "get":
                if (argc != 2) {
                    term.echo("Incorrect number of parameters.");
                    term.echo("You should use 'get variable'");
                } else {
                    term.echo(envVariables[argv[1]]);
                }
                break;
            case "quit":
                setTimeout(manager.close(w.id), 0);
                break;
            default:
                if (programs[command]) {
                    programs[command].entryPoint(argv, stdin, stdout, fs, _return, async);
                } else {
                    term.echo("Unknown command \"" + command + "\"");
                }
        }
        _return();
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
                    programs[y] = x;
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
                    currentStream = executeCommand(pipedCommands[i], currentStream, w, term, fs);
                }
                currentStream.on("data", function (x) {
                    term.echo(x);
                });
                currentStream.on("end", function (x) {
                    term.echo(x);
                });
            };
        }
    };
})();