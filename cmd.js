var CMD = (function () {
    var envVariables = {};
    return {
        open: function () {
            return function (w, manager, input, term) {
                var argv = input.split(" ").filter(function (x) { return x != " " });
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
                    case "hello":
                        term.echo("world");
                        break;
                    case "quit":
                        setTimeout(manager.close(w.id), 0);
                        break;
                    default:
                        try {
                            var result = window.eval(input);
                            if (result !== undefined) {
                                term.echo(new String(result));
                            }
                        } catch (e) {
                            term.error(new String(e));
                        }
                        break;
                }
            };
        }
    };
})();