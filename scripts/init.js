require.config({
    baseUrl: "lib/plugins/aceeditor/scripts",
    paths: {
        "ace": "../vendor/ace/lib/ace",
        "ace/requirejs/text": "../vendor/text",
        "almond": "../vendor/almond",
        "coffee-script": "../vendor/coffee-script",
        "cs": "../vendor/cs",
        "underscore": "../vendor/underscore"
    }
});

require(["cs!main"]);
