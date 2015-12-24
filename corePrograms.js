var corePrograms=[];
corePrograms.push({
    name:"info",
    alias:[],
    man:"This command gives you info about the system.",
    entryPoint:function(argv,stdin,stdout){
        stdout.end("System version");
    }
});