function serialize(x) {
    var functionCatalog = [];
    var serialized= JSON.stringify(x, function (k, v) {
        if (typeof (v) === 'function') {
            return '$F'+ (functionCatalog.push(v) - 1) + 'F$';
        }
        return v;
    });
    return serialized.replace(/"\$F(\d+)F\$"/g, function (match, n) {
        n=parseInt(n);
        return functionCatalog[n].toString();
    });
}


function JSONtoJS(x){
    return "("+x+")";
}