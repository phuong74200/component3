let scope = {
    test: function(dat) {
        setInterval(function() {
            dat.params.info = Math.random();
            dat.params.numb = Math.random();
        }, 500)
    }
}

let component = new Component(scope);