var stdlib = stdlib || [];


(function () { //Leaking stuff to the global scope is definitely not polite
    
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

    function copyFile(src, dst, fs,cb) {
        var file = fs.readFile(src);
        var tee = StreamTee();
        file.pipe(tee);
        var writeStream = Stream();
        tee.pipe1(writeStream);
        fs.writeFile(dst, writeStream);
        tee.on2("end", function (x) {
            if (x === "NOTFOUND" || x === "LOCKED") {
                fs.deleteFile(dst);
            }
            if(cb){
                cb(x||true);
            }
        });
    }

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
            
                var semaphore=Semaphore();
                var returnStream=Stream();
                semaphore.down(function(){returnStream.end();});
                copyFolderContents(srcpath, dstpath, fs);   
                semaphore.up();
                return returnStream;

                function copyFolderContents(src, dst, fs) {
                    fs.navigatePath(src);
                    var childs = fs.getChilds();
                    childs.filter(function (x) { return x.type == "file"; }).forEach(function (x) {
                        semaphore.down();
                        var file = fs.readFile(x.name);
                        var tee = StreamTee();
                        file.pipe(tee);
                        var writeStream = Stream();
                        tee.pipe1(writeStream);
                        fs.navigatePath(dst);
                        fs.writeFile(x.name, writeStream);
                        tee.on2("end", function (y) {
                            semaphore.up();
                            if (y === "NOTFOUND") {
                                returnStream.write("File " + x.name + " does not exist");
                                fs.deleteFile(dst);
                            }
                            if (y === "LOCKED") {
                                returnStream.write("File " + x.name + " is locked");
                                fs.deleteFile(dst);
                            }
                        });
                        fs.navigatePath(src);
                    });
                    childs.filter(function (x) { return x.type == "folder"; }).forEach(function (x) {
                        fs.createFolder(x.name);
                        copyFolderContents(src + "/" + x.name, dst + "/" + x.name, fs);
                        fs.navigatePath(src);
                    });
                    fs.navigatePath(originalpath);
                }
            },
            copyFile: copyFile,
            getFileContent: function (path, callback, fs) {
                var file = fs.readFile(path);
                var content = "";
                file.on("data", function (x) { content += x; });
                file.on("end", function (x) {
                    if (x === "NOTFOUND") {
                        callback(false);
                        return;
                    }
                    if (x === "LOCKED") {
                        callback(false);
                        return;
                    }
                    callback(content);
                });
            }
        }

    });

})();