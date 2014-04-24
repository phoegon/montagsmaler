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

    Deps.autorun(function () {
        "use strict";
        var data, width, height, x, chart, bar;

        data = [4, 8, 15, 16, 23, 42];
        width = 420;
        height = 420;

        chart = d3.select(".drawport svg")
            .attr("width", width)
            .attr("height", height);

        bar = chart.selectAll("g")
            .data(Lines.find().fetch())
            .enter().append("g");

        bar.append("line")
            .attr("x1", function (d) {
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

    });
    Template.hello.greeting = function () {
        return "Code last updated " + new Date();
    };

    Template.drawport.events({
        'mousemove .drawport': function (event) {
            // template data, if any, is available in 'this'
            var coords, oldCoords;
            oldCoords = Session.get("coords");

            coords = coordsRelativeToElement(event.currentTarget, event);

            if (oldCoords) {
                Lines.insert({
                    beginX: oldCoords.x,
                    beginY: oldCoords.y,
                    endX: coords.x,
                    endY: coords.y,
                });
            }
            Session.set("coords", coords);


        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}