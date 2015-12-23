var CMD = function () {
    return function (w, manager, command, term) {
        if (command == 'cmd') {
            var rect = w.div.getBoundingClientRect();
            manager.Window(rect.left + 50, rect.top + 50);
        } else if (command == 'hello') {
            term.echo("world");
        } else if (command == 'quit') {
            setTimeout(manager.close(w.id), 0);
        } else if (command !== '') {
            try {
                var result = window.eval(command);
                if (result !== undefined) {
                    term.echo(new String(result));
                }
            } catch (e) {
                term.error(new String(e));
            }
        } else {
            term.echo('');
        }
    };
};