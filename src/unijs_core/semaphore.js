var Semaphore=function(n){
    var value=0;
    var callbacks=[];
    if(n!=undefined){
        value=parseInt(n);
    }
    return {
      up:function(){
         if(value>0){
             var cb=callbacks.shift(); //Callbacks are stored in a FIFO queue
             if(cb){
                 cb(); // A down() might not had any callback
             }          
         }
         value++;
      },
      down:function(cb){
         if(value<0){
             callbacks.push(cb);        
         }
         value--;
      }  
    };
}