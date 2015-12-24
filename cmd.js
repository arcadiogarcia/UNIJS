var CMD = (function () {
    var programs = {};
    var envVariables = {};
    return {
        register:function(packages){
            packages.forEach(function(x){
                if(programs[x.name]){
                    console.log("El programa "+x.name+" ya esta registrado");
                    return;
                }
                programs[x.name]=x;
                x.alias.forEach(function(y){
                   programs[y]=x; 
                });
            });
        },
        open: function () {
            return function (w, manager, input, term) {
                var stdin = Stream();
                var stdout = Stream();
                stdout.on("data", function (x) {
                    term.echo(x);
                });
                stdout.on("end", function (x) {
                    term.echo(x);
                });
                var argv = input.split(" ").filter(function (x) { return x != " " });
                var argc = argv.length;
                var command = argv[0];
                if (programs[command]) {
                    programs[command].entryPoint(argv, stdin, stdout);
                } else {
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
                    }
                }
            };
        }
    };
})();