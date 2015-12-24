var Stream= function(){
  var handlers={};
  return {
      on:function(action,callback){
          handlers[action]=callback;
      },
      write:function(data){
          handlers["data"](data);
      },
      end:function(data){
          handlers["end"](data);
      },
      pipe:function(stream){
          handlers["data"]=stream.write;
          handlers["end"]=stream.end;
      }
  };  
};