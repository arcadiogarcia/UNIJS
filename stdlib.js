var stdlib = stdlib || [];

stdlib.push({
    name: "argv-parsing",
    dependencies: [],
    content: function (argv) {
        argv=argv.splice(1);//Remove the executable name
        var args = [], flags = {};
        for (var i = 0; i < argv.length; i++) {
            var arg = argv[i];
            if (arg[0] == "-") { // A flag is specified
                if (arg.indexOf("=")!=-1) { // The last flag did not have any value
                    var parts=arg.slice(1).split("=");
                    flags[parts[0]] = parts[1]; //Default to true
                }
                flags[arg.slice(1)] = true; //Defaults to true 
            } else { // A regular argument is especified
                args.push(arg);
            }
        }
        
        return { args: args, flags: flags };
    }
});