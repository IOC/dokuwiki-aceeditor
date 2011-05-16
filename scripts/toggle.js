define(function() {
    return function(spec) {
        var that = {};
        var img_off, img_on;

        img_on = jQuery("<img>")
            .addClass("ace-toggle")
            .attr("src", DOKU_BASE + "lib/plugins/aceeditor/images/toggle_on.png")
            .insertAfter(jQuery("#size__ctl"))
            .click(spec.on_disable)
            .hide();

        img_off = jQuery("<img>")
            .addClass("ace-toggle")
            .attr("src", DOKU_BASE + "lib/plugins/aceeditor/images/toggle_off.png")
            .insertAfter(jQuery("#size__ctl"))
            .click(spec.on_enable);

        that.on = function() {
            img_on.show();
            img_off.hide();
        };

        that.off = function() {
            img_on.hide();
            img_off.show();
        };

        return that;
    };
});
