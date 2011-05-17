define(function() {
    return function() {
        var that = {};
        var element, wrapper;

        that.element = function() {
            return element.get(0);
        };

        that.hide = function() {
            wrapper.hide();
        };

        that.incr_height = function(value) {
            that.set_height(wrapper.height() + value);
        };

        that.on_resize = function() {
            element.css("width", wrapper.width() + "px");
        };

        that.set_height = function(value) {
            wrapper.css("height", value + "px");
            element.css("height", wrapper.height() + "px");
        };

        that.show = function() {
            wrapper.show();
            element.css("width", wrapper.width() + "px");
            element.css("height", wrapper.height() + "px");
        };

        wrapper = jQuery("<div>")
            .addClass("ace-doku")
            .insertBefore(jQuery("#wiki__text"))
            .hide();
        element = jQuery("<div>")
            .appendTo(wrapper);

        return that;
    };
});
