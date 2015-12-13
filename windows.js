var WM = function () {
	var WM = {};
	var windows = [];
	var nextid = 0;
	function getWindowById(id) {
		return windows.filter(function (x) { return x.id == id; })[0];
	}
	function titleBar(w) {
		var div = document.createElement('div');
		div.style.position = "absolute";
		div.style.display = "block";
		div.style["background-color"] = "grey";
		div.style.width = "100%";
		div.style.height = "30px";
		div.style.top = "0px";
		div.style.left = "0px";
		var dragging = false,offsetx=0,offsety=0;
		div.addEventListener("mousedown", function (e) {
			var rect = w.div.getBoundingClientRect();
			offsetx=e.clientX-rect.left;
			offsety=e.clientY-rect.top;
			dragging = true;
		});
		div.addEventListener("mouseup", function (e) {
			dragging = false;
		});
		div.addEventListener("mouseout", function (e) {
			dragging = false;
		});
		div.addEventListener("mousemove", function (e) {
			if (dragging) {
				w.div.style.left = e.clientX-offsetx + "px";
				w.div.style.top = e.clientY-offsety + "px";
			}
		});
		return div;
	}
	WM.Window = function () {
		var w = {};
		w.id = nextid++;
		w.div = document.createElement('div');
		w.div.style.position = "absolute";
		w.div.style.display = "block";
		w.div.style["background-color"] = "red";
		w.div.style.width = "400px";
		w.div.style.height = "100px";
		w.div.style.top = "50px";
		w.div.style.left = "200px";
		w.titlebar = titleBar(w);
		w.div.appendChild(w.titlebar);
		document.body.appendChild(w.div);
		return w.id;
	};
	return WM;
}