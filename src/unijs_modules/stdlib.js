var stdlib = stdlib || [];

stdlib.push({
    name: "argv-parsing",
    dependencies: [],
    content: function (argv) {
        argv = argv.splice(1);//Remove the executable name
        var args = [], flags = {};
        for (var i = 0; i < argv.length; i++) {
            var arg = argv[i];
            if (arg[0] == "-") { // A flag is specified
                if (arg.indexOf("=") != -1) { // The last flag did not have any value
                    var parts = arg.slice(1).split("=");
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

stdlib.push({
    name: "file-system",
    dependencies: [],
    content: {
        copyFolder: function (src, dst, fs) {
            var originalpath = fs.getCurrentPath();

            fs.navigatePath(src);
            var srcpath = fs.getCurrentPath(); //Get absolute src
            
            fs.navigatePath(originalpath);
            fs.navigatePath(dst);
            var dstpath = fs.getCurrentPath();//Get absolute dst
            
            var issues = [];
            copyFolderContents(srcpath, dstpath, fs);
            return { error: issues.length > 0, issues: issues };

            function copyFolderContents(src, dst, fs) {
                fs.navigatePath(src);
                var childs = fs.getChilds();
                childs.filter(function (x) { return x.type == "file"; }).forEach(function (x) {
                    var file = fs.readFile(x.name);
                    if (file == false) {
                        issues.push("File " + x.name + " does not exist");
                    } else if (file == "Locked") {
                        issues.push("File " + x.name + " is locked");
                    } else {
                        fs.navigatePath(dst);
                        fs.writeFile(x.name, file);
                        fs.navigatePath(src);
                    }
                });
                childs.filter(function (x) { return x.type == "folder"; }).forEach(function (x) {
                    fs.createFolder(x.name);
                    copyFolderContents(src + "/" + x.name, dst + "/" + x.name, fs);
                    fs.navigatePath(src);
                });
                fs.navigatePath(originalpath);
            }
        },
        copyFile: function (src, dst, fs) {
            var file = fs.readFile(src);
            if (file == false) {
                return false;
            } else if (file == "Locked") {
                return false;
            } else {
                fs.writeFile(dst, file);
            }
        }
    }
});