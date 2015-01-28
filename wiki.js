function Wiki() {
    var iframe = document.createElement("iframe");
    iframe.resize = true;
    iframe.src = "http://rogalik.tatrix.org/wiki";
    this.panel = new Panel("wiki", "Wiki", [iframe])
}
