(function () {
    // zingmp3 list quick download
    let index = 0;
    let downloader = setInterval(function () {
        let elm = document.getElementsByClassName("level-item")[index];
        if (!elm) return clearInterval(downloader);
        if (btn = elm.getElementsByClassName("icon ic-more")) {
            if (btn[0]) {
                btn[0].click();
                setTimeout(function () {
                    document.getElementsByClassName("icon ic-download")[0].click();
                    setTimeout(function () {
                        document.getElementsByClassName("zm-btn active is-outlined button")[1].click()
                    }, 45)
                }, 45)
            };
        }
        index++;
    }, 100);
})();