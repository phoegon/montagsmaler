Lines = new Meteor.Collection("lines");


if (Meteor.isClient) {
    var coordsRelativeToElement = function (element, event) {
        "use strict";
        var offset, x, y;
        offset = $(element).offset();
        x = event.pageX - offset.left;
        y = event.pageY - offset.top;
        return {
            x: x,
            y: y
        };
    };

    var oldCoord;

    Meteor.subscribe("lines");

    var redraw = function () {
        "use strict";
        var chart, line;

        chart = d3.select(".drawport svg");

        line = chart.selectAll("line")
            .data(Lines.find().fetch());

        line.exit().remove();
        line.enter().append("line");

        line.attr("x1", function (d) {
            return d.beginX;
        })
            .attr("y1", function (d) {
                return d.beginY;
            })
            .attr("x2", function (d) {
                return d.endX;
            })
            .attr("y2", function (d) {
                return d.endY;
            });

    };

    var drawLine = function (begin, end) {
        Lines.insert({
            beginX: begin.x,
            beginY: begin.y,
            endX: end.x,
            endY: end.y
        });
    }

    var startSession = function (coords) {
        Session.set("coords", coords);
        Session.set("started", true);
    }

    var endSession = function (coords) {
        if (Session.get("started")) {
            drawLine(Session.get("coords"), coords);

            Session.set("coords", null);
            Session.set("started", false);
        }
    }

    var continueSession = function (coords) {
        if (Session.get("started")) {
            drawLine(Session.get("coords"), coords);
            Session.set("coords", coords);
        }
    }

    Deps.autorun(redraw);

    Template.hello.greeting = function () {
        return "Code last updated " + new Date();
    };

    Template.hello.events({
        'click input': function () {
            Meteor.call('clearArea', function (err, response) {});
        }
    });

    Template.drawport.events({
        //'touchmove '
        'mousemove .drawport svg': function (event) {
            continueSession(coordsRelativeToElement(event.currentTarget, event));
        },
        //'touchstart
        'mousedown .drawport svg': function (event) {
            startSession(coordsRelativeToElement(event.currentTarget, event));
        },
        //'touchend '
        'mouseup .drawport svg': function (event) {
            endSession(coordsRelativeToElement(event.currentTarget, event));
        }
    });
    Template.drawport.rendered = function () {
        var width, height, chart;

        width = 420;
        height = 420;

        chart = d3.select(".drawport svg")
            .attr("width", width)
            .attr("height", height);

        redraw();
    }
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        Meteor.methods({
            clearArea: function () {
                Lines.remove({});
            }
        });
    });
}