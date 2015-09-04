/**
 * Created by craig on 8/3/2015.
 */
requirejs.config({
    baseUrl: "assets",
    waitSeconds: 0,
    paths: {
        jquery: "js/jquery.min",
            text: "js/text",
            tpl: "js/underscore-tpl",
        kendo:"js/kendo.all.min",
        base64:"js/base64",
        Blob:"js/Blob",
        bootstrap:"js/bootstrap.min",
        domReady:"js/domReady",
        FileSaver:"js/FileSaver",
        uglify:"js/uglify",
        typedArrays:"js/typedArrays",
        "jquery.table2excel":"js/jquery.table2excel",
        jszip:"js/jszip.min",
        moment:"js/moment",
        underscore:"js/underscore",
        "en-GB":"js/cultures/kendo.culture.en-GB.min",
        app:"js/app",
        events:"js/events",
        requireLib :'js/require',
        "bootstrap-select" :'js/bootstrap-select'
    },
    shim: {
        "jquery": {
            exports: "$"
        },
        "jszip": {
            exports: "jszip"
        },
        underscore: {
            deps: ["jquery"],
            exports: "_"
        },
        moment: {
            exports: "moment"
        },
        bootstrap: {
            deps: ["jquery"],
            exports: "bootstrap"
        },
        kendo: {
            deps: ["jquery"],
            exports: "kendo"
        },
        app:{
            deps:["jquery","underscore","kendo"]
        },
        events:{
            deps:["jquery","underscore","app"]
        },
        "jquery.table2excel":{
            deps:["jquery","base64","Blob","FileSaver","typedArrays"]
        },
        tpl: ["text"]
    }
});
//load the main app and events files
requirejs(['events']);

/**
define(['jquery','underscore','kendo','FileSaver',
    'Blob','base64','jszip','jquery.table2excel','app','events'], function ($,_) {

});**/