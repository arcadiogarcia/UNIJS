var Lock = function (serialized) {
    var state = 0;
    var n = 0;

    if (serialized) {
        var old = JSON.parse(serialized);
        state = old.state;
        n = old.n;
    }

    //0-No lock, 1- SLOCK, 2-XLOCK
    return {
        getState: function () { return state },
        slock: function () {
            switch (state) {
                case 0:
                    state = 1;
                    n = 1;
                    return true;
                case 1:
                    n++;
                    return true;
                case 2:
                    return false;
            }
        },
        xlock: function () {
            switch (state) {
                case 0:
                    state = 2;
                    n = 1;
                    return true;
                case 1:
                    return false;
                case 2:
                    return false;
            }
        },
        sunlock: function () {
            switch (state) {
                case 0:
                    return false;
                case 1:
                    n--;
                    if (n == 0) {
                        state = 0;
                    }
                    return true;
                case 2:
                    return false;
            }
        },
        xunlock: function () {
            switch (state) {
                case 0:
                    return false;
                case 1:
                    return false;
                case 2:
                    n--;
                    if (n == 0) {
                        state = 0;
                    }
                    return true;
            }
        },
        toString: function () {
            return JSON.stringify({ state: state, n: n });
        }
    }
}