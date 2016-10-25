!function() {
    var req = new XMLHttpRequest();
    req.onload = function() {
        if (this.status != 200) {
            alert(this.status);
            return;
        }
        var sources = JSON.parse(this.response);
        sources.map(function(src) {
            var script = document.createElement("script");
            script.async = false;
            script.src = src;
            document.head.appendChild(script);
        });
    };
    req.open("GET", "sources.json", true);
    req.send(null);
}();
