var CMD = (function () {
    var programs = {};
    var envVariables = {};

    function executeCommand(input, stdin, w, term) {
        var stdout = Stream();
        var argv = input.split(" ").filter(function (x) { return x != "" });
        var argc = argv.length;
        var command = argv[0];
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
                    programs[command].entryPoint(argv, stdin, stdout, function () { term.pop(); });
                } else {
                    term.echo("Unknown command \"" + command + "\"");
                }
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
                    programs[y] = x;
                });
            });
        },
        open: function () {
            return function (w, manager, input, term) {
                var currentStream = Stream();
                var stdin=currentStream;
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
                    currentStream = executeCommand(pipedCommands[i], currentStream, w, term);
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