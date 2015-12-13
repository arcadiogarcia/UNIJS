var WM = function () {
	var WM = {};
	var windows = [];
	var nextid = 0;
	var active;
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
		console.log(w.z);
	}
	function titleBar(w) {
		var div = document.createElement('div');
		div.className = "titleBar";
		var but = document.createElement('div');
		but.className="close";
		but.innerHTML="X";
		but.addEventListener("click",function(){
			WM.close(w.id);
		});
		div.appendChild(but);
		var dragging = false, offsetx = 0, offsety = 0;
		div.addEventListener("mousedown", function (e) {
			var rect = w.div.getBoundingClientRect();
			offsetx = e.clientX - rect.left;
			offsety = e.clientY - rect.top;
			dragging = true;
		});
		w.div.addEventListener("mousedown", function (e) {
			moveForeground(w);
			active=w;
		});
		div.addEventListener("mouseup", function (e) {
			dragging = false;
			//Not sure why, but the timeout is necessary
			setTimeout(function(){w.textBox.click();},0);
		});
		div.addEventListener("mouseout", function (e) {
			if (dragging) {
				w.div.style.left = e.clientX - offsetx + "px";
				w.div.style.top = e.clientY - offsety + "px";
			}
		});
		document.body.addEventListener("mousemove", function (e) {
			if (dragging) {
				w.div.style.left = e.clientX - offsetx + "px";
				w.div.style.top = e.clientY - offsety + "px";
			}
		});
		div.addEventListener("dragstart", function (e) {
			e.preventDefault();
			return false;
		});
		return div;
	}

	//Only works on ff
	window.addEventListener("keydown",function (event) {
		if ((event.which == 9 && event.ctrlKey)){
			event.preventDefault();
			var top=windows[(windows.indexOf(active)+1)%windows.length];
			moveForeground(top);
			active=top;
			return false;
		}
		if ((event.which == 84 && event.ctrlKey)){
			WM.Window();
			return false;
		}
		if ((event.which == 37 && event.ctrlKey)){
			event.preventDefault();
			active.div.style.top="0px";
			active.div.style.left="0px";
			active.div.style.width="50%";
			active.div.style.height="100%";
			return false;
		}
		if ((event.which == 39 && event.ctrlKey)){
			event.preventDefault();
			active.div.style.top="0px";
			active.div.style.right="0px";
			active.div.style.width="50%";
			active.div.style.height="100%";
			return false;
		}
		return  true;
	});

	WM.Window = function (x,y) {
		var w = {};
		w.z = getTopZ();
		console.log(w.z);
		w.id = nextid++;
		w.div = document.createElement('div');
		w.div.className="window";
		w.div.style["z-index"] = w.z;
		if(x&&y){
			w.div.style.left=x+"px";
			w.div.style.top=y+"px";
		}
		w.titlebar = titleBar(w);
		w.div.appendChild(w.titlebar);
		document.body.appendChild(w.div);
		w.textBox = document.createElement('div');
		w.textBox.id="term"+w.id;
		w.div.appendChild(w.textBox);
		active=w;
		windows.push(w);
		jQuery(function($, undefined) {
    $('#term'+w.id).terminal(function(command, term) {
        if (command == 'cmd') {
			var rect = w.div.getBoundingClientRect();
			manager.Window(rect.left+50, rect.top+50);
		}else if (command == 'quit') {
			setTimeout(WM.close(w.id),0);
		}else if (command !== '') {
            try {
                var result = window.eval(command);
                if (result !== undefined) {
                    term.echo(new String(result));
                }
            } catch(e) {
                term.error(new String(e));
            }
        } else {
           term.echo('');
        }
    }, {
        greetings: 'Javascript Interpreter',
        name: 'js_demo',
        height: 200,
        prompt: 'js> '});
});
		w.textBox.className+=" textBox";
		return w.id;
	};
	
	WM.close=function(id){
		document.body.removeChild(getWindowById(id).div);
	}
	return WM;
}