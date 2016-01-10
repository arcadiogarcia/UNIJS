var stdlib = stdlib || [];

stdlib.push({
    name: "",
    dependencies:[],
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        stdout.write("UNIJS 0.1");
        stdout.write("Running on:");
        stdout.write(navigator.userAgent);
        _return();
    }
});