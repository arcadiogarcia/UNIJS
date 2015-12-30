var WM = function () {
    var WM = {};
    var windows = [];
    var nextid = 0;
    var active;
    var isMouseDown = 0;
    window.addEventListener("mouseup", function (e) {
        isMouseDown = 0;
    });
    window.addEventListener("mousedown", function (e) {
        isMouseDown = 1;
    });
    function getWindowById(id) {
        return windows.filter(function (x) { return x.id == id; })[0];
    }
    function getTopZ(id) {
        if (windows.length == 0) {
            return 0;
        }
        return windows.reduce(function (x, y) { if (!y) { if (!x) { return { z: 0 }; } return x; } return x.z > y.z ? x : y; }).z + 1;
    }
    function moveForeground(w) {
        windows.filter(function (x) { return x.z > w.z; }).forEach(function (x) { x.z--; });
        w.z = getTopZ() + 1;
        w.div.style["z-index"] = w.z;
    }
    function titleBar(w) {
        var div = document.createElement('div');
        div.className = "titleBar";
        var but = document.createElement('div');
        but.className = "close";
        but.innerHTML = "X";
        but.addEventListener("click", function () {
            WM.close(w.id);
        });
        div.appendChild(but);
        var dragging = false, offsetx = 0, offsety = 0;
        div.addEventListener("mousedown", function (e) {
            var rect = w.div.getBoundingClientRect();
            offsetx = e.clientX - rect.left;
            offsety = e.clientY - rect.top;
            dragging = true;
            if (w.state == "snip") {
                offsetx=20;
                w.state="float";
                w.div.style.left = e.clientX - offsetx + "px";
                w.div.style.top = e.clientY - offsety + "px";
                w.div.style.width = w.lastFloat.width;
                w.div.style.height = w.lastFloat.height;
            }
        });
        w.div.addEventListener("mousedown", function (e) {
            moveForeground(w);
            active = w;
        });
        div.addEventListener("mouseup", function (e) {
            dragging = false;
            if (document.getElementById("highlightLeft").style.visibility == "visible") {
                snip("left");
            }
            if (document.getElementById("highlightRight").style.visibility == "visible") {
                snip("right");
            }
            if (document.getElementById("highlightTop").style.visibility == "visible") {
                snip("top");
            }
            if (document.getElementById("highlightBottom").style.visibility == "visible") {
                snip("bottom");
            }

            document.getElementById("highlightLeft").style.visibility = "hidden";
            document.getElementById("highlightRight").style.visibility = "hidden";
            document.getElementById("highlightTop").style.visibility = "hidden";
            document.getElementById("highlightBottom").style.visibility = "hidden";
            //Not sure why, but the timeout is necessary
            setTimeout(function () { w.textBox.click(); }, 0);
        });
        div.addEventListener("mouseout", function (e) {
            if (isMouseDown == 1) {
                w.div.style.left = e.clientX - offsetx + "px";
                w.div.style.top = e.clientY - offsety + "px";
            } else {
                dragging = false;
            }
        });
        document.body.addEventListener("mousemove", function (e) {
            if (dragging) {
                w.div.style.left = e.clientX - offsetx + "px";
                w.div.style.top = e.clientY - offsety + "px";
                var justOneSnipHint = 0;
                if (e.clientX <= 50 && justOneSnipHint == 0) {
                    document.getElementById("highlightLeft").style.visibility = "visible";
                    justOneSnipHint++;
                } else {
                    document.getElementById("highlightLeft").style.visibility = "hidden";
                }
                if (e.clientX >= window.innerWidth - 50 && justOneSnipHint == 0) {
                    document.getElementById("highlightRight").style.visibility = "visible";
                    justOneSnipHint++;
                } else {
                    document.getElementById("highlightRight").style.visibility = "hidden";
                }
                if (e.clientY <= 50 && justOneSnipHint == 0) {
                    document.getElementById("highlightTop").style.visibility = "visible";
                    justOneSnipHint++;
                } else {
                    document.getElementById("highlightTop").style.visibility = "hidden";
                }
                if (e.clientY >= window.innerHeight - 50 && justOneSnipHint == 0) {
                    document.getElementById("highlightBottom").style.visibility = "visible";
                    justOneSnipHint++;
                } else {
                    document.getElementById("highlightBottom").style.visibility = "hidden";
                }
            }
        });
        div.addEventListener("dragstart", function (e) {
            e.preventDefault();
            return false;
        });
        return div;
    }

    function snip(pos) {
        switch (pos) {
            case "left":
                if (active.state == "float") {
                    active.lastFloat = {
                        top: active.div.style.top,
                        left: active.div.style.left,
                        width: active.div.style.width,
                        height: active.div.style.height
                    };
                }
                active.state = "snip";
                active.div.style.top = "0px";
                active.div.style.left = "1px";
                active.div.style.width = "calc( 50% - 2px )";
                active.div.style.height = "calc( 100% - 2px )";
                break;
            case "right":
                if (active.state == "float") {
                    active.lastFloat = {
                        top: active.div.style.top,
                        left: active.div.style.left,
                        width: active.div.style.width,
                        height: active.div.style.height
                    };
                }
                active.state = "snip";
                active.div.style.top = "0px";
                active.div.style.left = "50%";
                active.div.style.width = "calc( 50% - 2px )";
                active.div.style.height = "calc( 100% - 2px )";
                break;
            case "top":
                if (active.state == "float") {
                    active.lastFloat = {
                        top: active.div.style.top,
                        left: active.div.style.left,
                        width: active.div.style.width,
                        height: active.div.style.height
                    };
                }
                active.state = "snip";
                active.div.style.top = "0px";
                active.div.style.left = "0px";
                active.div.style.width = "calc( 100% - 2px )";
                active.div.style.height = "50%";
                break;
            case "bottom":
                if (active.state == "float") {
                    active.lastFloat = {
                        top: active.div.style.top,
                        left: active.div.style.left,
                        width: active.div.style.width,
                        height: active.div.style.height
                    };
                }
                active.state = "snip";
                active.div.style.top = "50%";
                active.div.style.left = "0px";
                active.div.style.width = "calc( 100% - 2px )";
                active.div.style.height = "calc( 50% - 2px )";
                break;
        }
    }


    WM.Window = function (x, y) {
        var w = {};
        w.z = getTopZ();
        w.state = "float";
        w.id = nextid++;
        w.div = document.createElement('div');
        w.div.className = "window";
        w.div.classList.add("appear");
        w.div.style["z-index"] = w.z;
        if (x && y) {
            w.div.style.left = x + "px";
            w.div.style.top = y + "px";
        }
        w.titlebar = titleBar(w);
        w.div.appendChild(w.titlebar);
        document.body.appendChild(w.div);
        w.textBox = document.createElement('div');
        w.textBox.id = "term" + w.id;
        w.div.appendChild(w.textBox);
        active = w;
        windows.push(w);
        var cmdhandler={cd:function(){return "/"}};
        jQuery(function ($, undefined) {
            $('#term' + w.id).terminal(CMD.open().bind(this,cmdhandler,w,WM), {
                    greetings: 'UNIJS',
                    name: 'js_demo',
                    height: 200,
                    prompt: function(callback){
                        callback(cmdhandler.cd()+" > ");
                    },
                    exit:false,
                    keydown: function (event) {
                        if ((event.which == 9 && event.ctrlKey)) {
                            event.preventDefault();
                            var top = windows[(windows.indexOf(active) + 1) % windows.length];
                            moveForeground(top);
                            active = top;
                            top.div.classList.remove("gotop");
                            top.div.offsetWidth = top.div.offsetWidth;//Trigger a reflow, necessary for the animation
                            top.div.classList.add("gotop");
                            return false;
                        }
                        if ((event.which == 84 && event.ctrlKey)) {
                            var rect = active.div.getBoundingClientRect();
                            WM.Window(rect.left + 50, rect.top + 50);
                            return false;
                        }
                        if ((event.which == 37 && event.ctrlKey)) {
                            snip("left");
                            event.preventDefault();
                            return false;
                        }
                        if ((event.which == 38 && event.ctrlKey)) {
                            if (w.state == "maximized") {
                                snip("top");
                                event.preventDefault();
                                return false;
                            } else {
                                if (w.state == "float") {
                                    w.lastFloat = {
                                        top: active.div.style.top,
                                        left: active.div.style.left,
                                        width: active.div.style.width,
                                        height: active.div.style.height
                                    };
                                }
                                w.state = "maximized";
                                event.preventDefault();
                                event.preventDefault();
                                active.div.style.top = "0px";
                                active.div.style.left = "0px";
                                active.div.style.width = "calc( 100% - 2px )";
                                active.div.style.height = "calc( 100% - 2px )";
                                return false;
                            }

                        }
                        if ((event.which == 39 && event.ctrlKey)) {
                            snip("right");
                            event.preventDefault();
                            return false;
                        }
                        if ((event.which == 40 && event.ctrlKey)) {
                            if (w.state == "float") {
                                snip("bottom");
                                event.preventDefault();
                                return false;
                            }
                            w.state = "float";
                            event.preventDefault();
                            active.div.style.top = w.lastFloat.top;
                            active.div.style.left = w.lastFloat.left;
                            active.div.style.width = w.lastFloat.width;
                            active.div.style.height = w.lastFloat.height;
                            return false;
                        }
                    }
                });
        });
        w.textBox.className += " textBox";
        return w.id;
    };

    WM.close = function (id) {
        document.body.removeChild(getWindowById(id).div);
    }
    return WM;
}