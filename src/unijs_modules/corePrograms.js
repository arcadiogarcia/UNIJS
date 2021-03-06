var corePrograms = corePrograms || [];

corePrograms.push({
    name: "info",
    alias: [],
    man: "This command gives you info about the system.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        stdout.write("UNIJS 0.1");
        stdout.write("Running on:");
        stdout.write(navigator.userAgent);
    }
});

corePrograms.push({
    name: "echo",
    alias: [],
    man: "This command behaves like a parrot.\nExecute with no arguments to pipe the input to the output.\nExecute with arguments to print them in the output.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length > 1) {
            for (var i = 1; i < argv.length; i++) {
                stdout.write(argv[i]);
            }
        } else {
            stdin.on("data", function (data) { stdout.write(data) });
            stdin.on("end", function () { async.return() });
            async.background();
        }
    }
});

corePrograms.push({
    name: "js",
    alias: [],
    man: "Executes JavaScript code.\nExecute with no arguments to get a JS command line.\nYou can also execute js followed by the code.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length > 1) {
            argv.shift();
            stdout.write(eval(argv.join(" ")));
        } else {
            stdin.on("data", function (data) { stdout.write(eval(data)) });
            stdin.on("end", function () { async.return() });
            async.background();
        }
    }
});

corePrograms.push({
    name: "cat",
    alias: [],
    man: "Shows the content of a file.\n Execute 'cat <filename>'",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length == 2) {
            var fs=include("fs");
            var file = fs.readFile(argv[1]);
            file.on("data", function (data) { stdout.write(data) });
            file.on("end", function (x) {
                if(x=="NOTFOUND"){
                    stderr.write("File " + argv[1] + " does not exist.");
                }
                if(x=="LOCKED"){
                    stderr.write("This file is locked by another program.");
                }
                async.return();
            });
            async.background();
        } else {
            stderr.write("Incorrect number of arguments.");
        }
    }
});

corePrograms.push({
    name: "rm",
    alias: [],
    man: "Deletes a file.\n Execute 'rm <filename>'",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        var input= include("argv-parsing")(argv);
        if (input.args.length >0) {
            var fs=include("fs");
            if(input.flags["r"]){
                input.args.forEach(function(x){fs.deleteChild(x);});
            }else{
                input.args.forEach(function(x){fs.deleteFile(x);});
            }
        } else {
            stderr.write("You should specify something to delete.");
        }
    }
});

corePrograms.push({
    name: "caesar",
    alias: [],
    man: "Vini, vidi, encodi.\n Must be executed with one argument, 'caesar <n>' \n It will add n to the unicode code of each character in the input and print it to output.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length != 2) {

        } else {
            var n = parseInt(argv[1]);
            stdin.on("data", function (data) { stdout.write(data.split("").map(function (x) { return String.fromCharCode(x.charCodeAt(0) + n) }).join("")) });
            stdin.on("end", function () { async.return() });
            async.background();
        }
    }
});

corePrograms.push({
    name: "cd",
    alias: [],
    man: "Executed with no arguments, prints the current path.\nExecuted with one argument, navigates to that relative path.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length == 1) {
            stdout.write(fs.getCurrentPath());
        } else if (argv.length == 2) {
            var fs=include("fs");
            if (!fs.navigatePath(argv[1])) {
                stderr.write("The path is invalid or does not exist.");
            }
        } else {
            stderr.write("Wrong number of parameters");
        }
    }
});

corePrograms.push({
    name: "pwd",
    alias: [],
    man: "Returns the current path.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
         stdout.write(include('fs').getCurrentPath());
    }
});

corePrograms.push({
    name: "mkdir",
    alias: [],
    man: "Creates a folder in the current folder, the name must be specified in the first parameter.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length == 2) {
            var fs=include("fs");
            if (fs.createFolder(argv[1])) {

            } else {
                stderr.write("That folder already exists");
            }
        } else {
            stderr.write("Wrong number of parameters");
        }
    }
});

corePrograms.push({
    name: "ls",
    alias: ["dir"],
    man: "Shows the content of the current folder.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length == 1) {
            var fs=include("fs");
            fs.getChilds().map(function (x) { return x.name; }).forEach(stdout.write);
        } else {
            stderr.write("Wrong number of parameters");
        }
    }
});


corePrograms.push({
    name: "cp",
    alias: [],
    man: "Copies files or directories",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length == 3) {
            var fs=include("fs");
            var fslib=include("file-system");
            var t1=fs.getType(argv[1]),t2=fs.getType(argv[2]);
            if(t2=="file"&&t1=="folder"){
                stderr.write("You can't copy a folder inside a file.");
            }else if(t2==false&&t1=="folder"){
                stderr.write("Destination does not exist. Maybe you have not created the folder yet?");
            } else if(t2=="folder"&&t1=="folder"){
                var st=fslib.copyFolder(argv[1],argv[2],fs);
                var errors=false;
                st.on("data",function(x){
                    stderr.write(x);
                    errors=true;
                });
                st.on("end",function(x){
                    if(errors==false){
                        stderr.write("Folder copied successfully");
                    }
                    async.return();
                });
                async.background();
            }else if((t2=="file"|| t2==false)&&t1=="file"){
                fslib.copyFile(argv[1],argv[2],fs,function(x){
                    if(x==true) {
                        stderr.write("File copied successfully");
                    }else{
                        stderr.write("Error: "+x);
                    }
                    async.return();
                });
                async.background();
            }else if(t2=="folder"&&t1=="file"){
                fslib.copyFile(argv[1],argv[2]+"/"+argv[1].split("/").splice(-1, 1)[0],fs,function(x){
                    if(x==true) {
                        stderr.write("File copied successfully");
                    }else{
                        stderr.write("Error: "+x);
                    }
                    async.return();
                });
                async.background();
            }    
        } else {
            stderr.write("Wrong number of parameters");
        }
    }
});

corePrograms.push({
    name: "tree",
    alias: [],
    man: "Prints the structure of the current folder as a tree.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        function printTree(level, levelsfinished) {
            var tabs = "", i = 0;
            level = level || 0;
            levelsfinished = levelsfinished || 0;
            while (i++ < level - levelsfinished) {
                tabs += "│";
            }
            i = 0;
            while (i++ < levelsfinished) {
                tabs += " ";
            }
            var childs = fs.getChilds();
            for (i = 0; i < childs.length; i++) {
                if (i != childs.length - 1) {
                    stdout.write(tabs + "├── " + childs[i].name);
                } else {
                    levelsfinished += 1;
                    stdout.write(tabs + "└── " + childs[i].name);
                }
                if (childs[i].type == "folder") {
                    fs.navigateChild(childs[i].name);
                    printTree(level + 1, levelsfinished);
                    fs.navigateUp();
                }
            }
        }
        if (argv.length == 1) {
            var fs=include("fs");
            stdout.write(fs.getCurrentFolder());
            printTree();
        } else {
            stderr.write("Wrong number of parameters");
        }
    }
});

corePrograms.push({
    name: "wget",
    alias: [],
    man: "Retrieves content from the web.\n Execute 'curl <url>'",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        if (argv.length == 2) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.status == 200) {
                    stdout.write(this.responseText);
                    async.return();
                } else {
                    stderr.write("Error " + this.status);
                    stderr.write(this.responseText);
                    async.return();
                }
            }
            xhr.open("GET", argv[1]);
            xhr.send();
            async.background();
        } else {
            stderr.write("Wrong number of parameters");
        }
    }
});

corePrograms.push({
    name: "tutorial",
    alias: [],
    man: "Teaches the basics of UNIJS",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        var fs=include("fs");
        var messages={0:[
                        "Welcome to UNIJS, I will be your guide.",
            "I will teach you how to use UNIJS, until you become a command line ninja.",
            "You can progress in this tutorial running 'tutorial next'",
            "You can read again the last message running 'tutorial'",
            "And you can go back here running 'tutorial reset'",
            "Are you ready? Run 'tutorial next' to begin your training."
        ],
        1:[
                        "Nice, you are ready to learn about programs.",
                        "You can execute programs typing their name in the terminal.",
                        "For example, 'info' will give you information about the system"
        ],
        2:[
                        "Some programs also accept several parameters after their name",
                        "For example, executing 'echo Hello World' will print Hello World",
                        "(Executing 'echo' without parameters will keep printing everything you type until you press Ctrl+D)",
        ],
        3:[
                        "Now check out the 'caesar' program",
                        "It implements the caesar encryption algorithm, it simply replaces every character with the one found <n> positions later in the Unicode table.",
                        "Try executing 'caesar <n>', it will print everything you type encoded.",
                        "(Remember Ctrl+D will close the program)"
        ],
        4:[
                        "Now that you know how to use programs, the next step is to combine them to be able to do even more things.",
                        "For example, lets say you want to send the information about your system to a friend, but you want to send it encoded so no one will be able to read it.",
                        "You have two programs that solve different parts of the problem, so why not combine them?",
                        "The pipe operand ( | ) allows you to do that, redirect the output of a program as the input of the next one.",
                        "You can execute 'info | caesar <n>' to get the information encoded.",
                        
        ],
        5:[
                        "Neat, right?",
                        "Another example you can try is this one",
                        "'caesar 5 | caesar -5'",
                        "It will print the same text you type in, why?",
                        "The first command will encrypt the text, but the next one will desencrypt it.",
                        
        ],
        6:[
                        "Now let's see what we have in the filesystem.",
                        "As you can see in the prompt, you are in the "+fs.getCurrentPath()+" folder",
                        "At the top of the filesystem ther is a root (/) folder, and it can contain folders, that can contain folders, that can contain folders... you get the idea. And of course, you can place your files on any folder.",
                        "You can inspect your current folder with the 'ls' command"
        ],
        7:[
                        "We should try to create a file!",
                        "You can redirect the console output to a file using >",
                        "For example, 'echo 1234 > a.txt'",
                        "You can also use >> when you want to append to the current file, instead of overwriting it."
        ],
        8:[
                        "Nice! Now you can use < to use a file as the input for a command.",
                        "For example, 'caesar 1 < a.txt' should encode the file you just created.",
        ],
        9:[
                        "Of course, folders are not enough",
                        "You can also create folders using 'mkdir'",
                        "For example 'mkdir documents'"
        ],
        10:[
                        "Now, you can use 'cd' to navigate to the directory you just created.",
                        "You can use 'cd name' to navigate to a child of the current folder.",
                        "You can also use 'cd path' to navigate to the current path."
        ],
        11:[
                        "Finally, try creating a file in the subfolder.",
                        "Then, execute 'cd ..' to go back to the parent folder.",
                        "And execute 'tree' to see the folder structure in a fancy way."
        ],
        12:[
                        "Of course, the command line is not the best solution for everything.",
                        "That is why you can execute web apps inside UNIJS.",
                        "But first of all, meet the web browser.",
                        "Executing 'browser http://uni.js.org' will open UNIJS website."
        ],
        13:[
                        "That is nice for browsing the web, but for real apps we need more features, like offline support and file system access.",
                        "Maybe you have heard of the Ace text editor, a code editor for the web.",
                        "UNIJS includes it as an app, with file system support, just try executing 'ace'",
        ],
        14:[
                        "One command that is always hand is 'man':",
                        "Executing 'man' will give you a list of the installed programs.",
                        "Executing 'man name' will give you detailed information about that program."
        ],
        15:[
                        "Thats all for now! You already know how to use UNIJS, the only question now is:",
                        "What do you want to do now?"
        ]};
        function printMessageSlow(id) {
            var counter=0;
            var message=messages[id];
            setInterval(function(){
                if(counter<message.length){
                    stdout.write(message[counter++]);
                }else{
                     async.return();
                }
            },600);
            async.background();
        }


        var file = fs.readFile("/etc/tutorial/state.data");
        var content = "";
        file.on("data", function (x) {
            content += x;
        });
        file.on("end", function (x) {
            if (x == "NOTFOUND") {
                fs.createFile("/etc/tutorial/state.data", 0);
                printMessageSlow(0);
                async.return();
                return;
            }
            if (x == "LOCKED") {
                stderr.write("Error, maybe there is another instance of this program running?");
                async.return();
                return;
            }
            if (argv.length == 2) {
                if (argv[1] == "next") {
                    content = +(content) + 1;
                }
                if (argv[1] == "reset") {
                    content = 0;
                }
                var wStream = Stream();
                fs.writeFile("/etc/tutorial/state.data", wStream);
                wStream.write(content);
                wStream.end();
            }
            printMessageSlow(+content);//Cast file content to a number
        });
        async();
        
    }
});

corePrograms.push({
    name: "unifold",
    alias: [],
    man: "Generates an empty app that you can use as a template.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
            var input= include("argv-parsing")(argv);
            if(input.args.length>0){
                var names=input.args;
                var fs= include('fs');
                var content;
                if(input.flags.g && input.flags.l){
                    stderr.write("A graphical app can't be a library!"); 
                    return;
                }else if(input.flags.g){
                    names.forEach(function(x){        
                            content='({name: "'+x+'", dependencies: [], payload:"'+x+'", entryPoint:"index.html"})';                  
                            fs.createFile(x+".app.njs", content);
                            fs.createFolder(x);
                            fs.navigatePath(x);
                            content='<html><body style="background:white">Hello World</body></html>';                  
                            fs.createFile("index.html", content);
                            fs.navigateUp();
                            stdout.write("File "+x+".app.njs created successfully.");
                    });      
                }else if(input.flags.l){
                     names.forEach(function(x){        
                            content='({name: "'+x+'", dependencies: [], content: function () {return "Hello world! I\'m '+x+'.";}})';               
                            fs.createFile(x+".lib.njs", content);
                            stdout.write("File "+x+".lib.njs created successfully.");
                    });             
                }else{
                    names.forEach(function(x){        
                            content='({name: "'+x+'", alias: [], dependencies:[], man: "A program called '+x+'", entryPoint: function (argv, stdin, stdout, stderr, include, async) { stdout.write("Hello world! I\'m '+x+'.");}})';               
                            fs.createFile(x+".njs", content);
                            stdout.write("File "+x+".njs created successfully.");
                    });   
                }
                stdout.write("Now you can edit the files (with ace for example).");
                stdout.write("To install them, just run 'install name.njs'");
            }else{
                stdout.write("A great piece of software starts with a great name, you should specify one."); 
            }

    }            
});


corePrograms.push({
    name: "reset",
    alias: [],
    man: "This command resets UNIJS.",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
        localStorage.clear();
        location=location; //F5
    }
});

corePrograms.push({
    name: "uniq",
    alias: [],
    man: "This program deletes duplicated lines",
    entryPoint: function (argv, stdin, stdout, stderr, include, async) {
            var h={};
            stdin.on("data", function (data) { if(h[data]){}else{h[data]=true;stdout.write(data);} });
            stdin.on("end", function () { async.return() });
            async.background();
    }
});