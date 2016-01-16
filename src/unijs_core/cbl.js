var CBL = (function () {
    return {
        first: function (cb, t) {
            var executed = false;
            function executeOnce() {
                if (executed==false) {
                    executed = true;
                    cb();
                }
            }
            setTimeout(executeOnce, t);
            return executeOnce;
        },
        last: function (cb, t) {
            var last=false;
            function executeLast() {
                if (last==false) {
                    last = true;
                }else{
                    cb();
                }
            }
            setTimeout(executeLast, t);
            return executeLast;
        }
    }
})();