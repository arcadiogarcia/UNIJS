var corePrograms = corePrograms || [];

corePrograms.push({
    name: "info",
    alias: [],
    man: "This command gives you info about the system.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        stdout.write("UNIJS 0.1");
        stdout.write("Running on:");
        stdout.write(navigator.userAgent);
        _return();
    }
});

corePrograms.push({
    name: "echo",
    alias: [],
    man: "This command behaves like a parrot.\nExecute with no arguments to pipe the input to the output.\nExecute with arguments to print them in the output.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length > 1) {
            for (var i = 1; i < argv.length; i++) {
                stdout.write(argv[i]);
            }
            _return();
        } else {
            stdin.on("data", function (data) { stdout.write(data) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "js",
    alias: [],
    man: "Executes JavaScript code.\nExecute with no arguments to get a JS command line.\nYou can also execute js followed by the code.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length > 1) {
            argv.shift();
            stdout.write(eval(argv.join(" ")));
            _return();
        } else {
            stdin.on("data", function (data) { stdout.write(eval(data)) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "cat",
    alias: [],
    man: "Shows the content of a file.\n Execute 'cat <filename>'",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 2) {
            var file = fs.readFile(argv[1]);
            if (file === false) {
                stdout.write("File " + argv[1] + " does not exist.");
                _return();
                return;
            }
            if (file === "Locked") {
                stdout.write("This file is locked by another program.");
                _return();
                return;
            }
            file.on("data", function (data) { stdout.write(data) });
            file.on("end", function () { _return() });
            async();
        } else {
            stdout.write("Incorrect number of arguments.");
            _return();
        }
    }
});

corePrograms.push({
    name: "caesar",
    alias: [],
    man: "Vini, vidi, encodi.\n Must be executed with one argument, 'caesar <n>' \n It will add n to the unicode code of each character in the input and print it to output.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length != 2) {
            _return();
        } else {
            var n = parseInt(argv[1]);
            stdin.on("data", function (data) { stdout.write(data.split("").map(function (x) { return String.fromCharCode(x.charCodeAt(0) + n) }).join("")) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "cd",
    alias: [],
    man: "Executed with no arguments, prints the current path.\nExecuted with one argument, navigates to that relative path.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 1) {
            stdout.write(fs.getCurrentPath());
        } else if (argv.length == 2) {
            if (!fs.navigatePath(argv[1])) {
                stdout.write("The path is invalid or does not exist.");
            }
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "mkdir",
    alias: [],
    man: "Creates a folder in the current folder, the name must be specified in the first parameter.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 2) {
            if (fs.createFolder(argv[1])) {

            } else {
                stdout.write("That folder already exists");
            }
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "ls",
    alias: ["dir"],
    man: "Shows the content of the current folder.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 1) {
            fs.getChilds().map(function (x) { return x.name; }).forEach(stdout.write);
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "tree",
    alias: [],
    man: "Prints the structure of the current folder as a tree.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
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
            stdout.write(fs.getCurrentFolder());
            printTree();
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "wget",
    alias: [],
    man: "Retrieves content from the web.\n Execute 'curl <url>'",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 2) {
            var xhr = XMLHttpRequest();
            xhr.onload = function () {
                if (this.status == 200) {
                    stdout.write(this.responseText);
                    _return();
                } else {
                    stdout.write("Error " + this.status);
                    stdout.write(this.responseText);
                    _return();
                }
            }
            xhr.open("GET", argv[1]);
            xhr.send();
            async();
        } else {
            stdout.write("Wrong number of parameters");
            _return();
        }
    }
});

corePrograms.push({
    name: "tutorial",
    alias: [],
    man: "Teaches the basics of UNIJS",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
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
                        "One command that is always hand is 'man':",
                        "Executing 'man' will give you a list of the installed programs.",
                        "Executing 'man name' will give you detailed information about that program."
        ],
        13:[
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
                     _return()
                }
            },600);
            async();
        }


        var file = fs.readFile("/etc/tutorial/state.data");
        if (file === "Locked") {
            stdout.write("Error, maybe there is another instance of this program running?");
            _return();
            return;
        }
        if (file === false) {
            fs.createFile("/etc/tutorial/state.data", 0);
            printMessageSlow(0);
        }else{
            var content="";
            file.on("data",function(x){
                content+=x;
            });
            file.on("end",function(x){
                if(argv.length==2){
                    if(argv[1]=="next"){
                        content = +(content)+1;
                    }
                    if(argv[1]=="reset"){
                        content = 0;
                    }
                    var wStream=Stream();
                    fs.writeFile("/etc/tutorial/state.data", wStream);
                    wStream.write(content);
                    wStream.end();
                }         
                printMessageSlow(+content);//Cast file content to a number
            });
            async();
        }
    }
});