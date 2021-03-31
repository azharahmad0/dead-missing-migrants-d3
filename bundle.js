(function (React$1, ReactDOM, d3, topojson) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React$1);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  var jsonUrl =
    'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

  var useWorldAtlas = function () {
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];
    React$1.useEffect(function () {
      d3.json(jsonUrl).then(function (topology) {
        var ref = topology.objects;
        var countries = ref.countries;
        var land = ref.land;
        setData({
          land: topojson.feature(topology, land),
          interiors: topojson.mesh(topology, countries, function (a, b) { return a !== b; }),
        });
      });
    }, []);
    return data;
  };

  var csvUrl = 'https://gist.githubusercontent.com/azharahmad0/d48240378dce38bf7fc0047e4f18a4de/raw/missing_migrants.csv';

  var row = function (d) {
    d.coords = d['Location Coordinates'].split(",").map(function (d) { return +d; }).reverse();
    d["Total Dead and Missing"] = +d["Total Dead and Missing"];
    d['Reported Date'] = new Date(d['Reported Date']);
  	return d;
  };

  var useData = function () {
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];
    React$1.useEffect(function () {
      d3.csv(csvUrl, row).then(setData);
    }, []);
    //console.log(data);
    return data;
  };

  var projection = d3.geoNaturalEarth1();
  var path = d3.geoPath(projection);
  var graticule = d3.geoGraticule();

  var Marks$1 = function (ref) {
    var ref_worldAtlas = ref.worldAtlas;
    var land = ref_worldAtlas.land;
    var interiors = ref_worldAtlas.interiors;
    var data = ref.data;
    var sizeScale = ref.sizeScale;
    var sizeValue = ref.sizeValue;

    return (
      React__default['default'].createElement( 'g', { className: "marks" },
        React$1.useMemo(
          function () { return (
            React__default['default'].createElement( React__default['default'].Fragment, null,
              React__default['default'].createElement( 'path', { className: "sphere", d: path({ type: 'Sphere' }) }),
              React__default['default'].createElement( 'path', { className: "graticules", d: path(graticule()) }),
              land.features.map(function (feature) { return (
                React__default['default'].createElement( 'path', { className: "land", d: path(feature) })
              ); }),
              React__default['default'].createElement( 'path', { className: "interiors", d: path(interiors) })
            )
          ); },
          [path, graticule, land, interiors]
        ),
        data.map(function (d) {
          var ref = projection([
            d.coords[0],
            d.coords[1] ]);
          var x = ref[0];
          var y = ref[1];
          return (
            React__default['default'].createElement( 'circle', {
              cx: x, cy: y, r: sizeScale(sizeValue(d)) })
          );
        })
      )
    );
  };

  var sizeValue = function (d) { return d['Total Dead and Missing']; };
  var maxRadius = 15;

  var BubbleMap = function (ref) {
    var data = ref.data;
    var filteredData = ref.filteredData;
    var worldAtlas = ref.worldAtlas;

    var sizeScale = React$1.useMemo(
      function () { return d3.scaleSqrt()
          .domain([0, d3.max(data, sizeValue)])
          .range([0, maxRadius]); },
      [data, sizeValue, maxRadius]
    );

    return (
      React__default['default'].createElement( Marks$1, {
        worldAtlas: worldAtlas, data: filteredData, sizeScale: sizeScale, sizeValue: sizeValue })
    );
  };

  var AxisBottom = function (ref) {
      var xScale = ref.xScale;
      var innerHeight = ref.innerHeight;
      var tickFormat = ref.tickFormat;
      var tickOffset = ref.tickOffset; if ( tickOffset === void 0 ) tickOffset = 3;

      return xScale.ticks().map(function (tickValue) { return (
      React.createElement( 'g', {
        className: "tick", key: tickValue, transform: ("translate(" + (xScale(tickValue)) + ",0)") },
        React.createElement( 'line', { y2: innerHeight }),
        React.createElement( 'text', {
          style: { textAnchor: 'middle' }, dy: ".71em", y: innerHeight + tickOffset },
          tickFormat(tickValue)
        )
      )
    ); });
  };

  var AxisLeft = function (ref) {
      var yScale = ref.yScale;
      var innerWidth = ref.innerWidth;
      var tickOffset = ref.tickOffset; if ( tickOffset === void 0 ) tickOffset = 3;

      return yScale.ticks().map(function (tickValue) { return (
      React.createElement( 'g', {
        className: "tick", transform: ("translate(0," + (yScale(tickValue)) + ")") },
        React.createElement( 'line', { x2: innerWidth }),
        React.createElement( 'text', {
          key: tickValue, style: { textAnchor: 'end' }, x: -tickOffset, dy: ".32em" },
          tickValue
        )
      )
    ); });
  };

  var Marks = function (ref) {
      var binnedData = ref.binnedData;
      var xScale = ref.xScale;
      var yScale = ref.yScale;
      var tooltipFormat = ref.tooltipFormat;
      var innerHeight = ref.innerHeight;

      return binnedData.map(function (d) { return (
      React.createElement( 'rect', {
        className: "mark", x: xScale(d.x0), y: yScale(d.y), width: xScale(d.x1) - xScale(d.x0), height: innerHeight - yScale(d.y) },
        React.createElement( 'title', null, tooltipFormat(d.y) )
      )
    ); });
  };

  var margin = { top: 0, right: 30, bottom: 20, left: 45 };
  var xAxisLabelOffset = 54;
  var yAxisLabelOffset = 30;
  var xAxisTickFormat = d3.timeFormat('%m/%d/%Y');

  var xAxisLabel = 'Time';

  var yValue = function (d) { return d['Total Dead and Missing']; };
  var yAxisLabel = 'Total Dead and Missing';

  var DateHistogram = function (ref) {
    var data = ref.data;
    var width = ref.width;
    var height = ref.height;
    var setBrushExtent = ref.setBrushExtent;
    var xValue = ref.xValue;

    var innerHeight = height - margin.top - margin.bottom;
    var innerWidth = width - margin.left - margin.right;

    var xScale = React$1.useMemo(
      function () { return d3.scaleTime()
          .domain(d3.extent(data, xValue))
          .range([0, innerWidth])
          .nice(); },
      [data, xValue, innerWidth]
    );

    var binnedData = React$1.useMemo(function () {
      var ref = xScale.domain();
      var start = ref[0];
      var stop = ref[1];
      return d3.histogram()
        .value(xValue)
        .domain(xScale.domain())
        .thresholds(d3.timeMonths(start, stop))(data)
        .map(function (array) { return ({
          y: d3.sum(array, yValue),
          x0: array.x0,
          x1: array.x1
        }); });
    }, [xValue, yValue, xScale, data]);

    var yScale = React$1.useMemo(
      function () { return d3.scaleLinear()
          .domain([0, d3.max(binnedData, function (d) { return d.y; })])
          .range([innerHeight, 0]); },
      [binnedData, innerHeight]
    );

    var brushRef = React$1.useRef();

    React$1.useEffect(function () {
      var brush = d3.brushX().extent([[0, 0], [innerWidth, innerHeight]]);
      brush(d3.select(brushRef.current));
      brush.on('brush end', function () {
        setBrushExtent(d3.event.selection && d3.event.selection.map(xScale.invert));
      });
    }, [innerWidth, innerHeight]);

    return (
      React.createElement( React.Fragment, null,
        React.createElement( 'rect', { width: width, height: height, fill: "white" }),
        React.createElement( 'g', { transform: ("translate(" + (margin.left) + "," + (margin.top) + ")") },
          React.createElement( AxisBottom, {
            xScale: xScale, innerHeight: innerHeight, tickFormat: xAxisTickFormat, tickOffset: 5 }),
          React.createElement( 'text', {
            className: "axis-label", textAnchor: "middle", transform: ("translate(" + (-yAxisLabelOffset) + "," + (innerHeight /
              2) + ") rotate(-90)") },
            yAxisLabel
          ),
          React.createElement( AxisLeft, { yScale: yScale, innerWidth: innerWidth, tickOffset: 5 }),
          React.createElement( 'text', {
            className: "axis-label", x: innerWidth / 2, y: innerHeight + xAxisLabelOffset, textAnchor: "middle" },
            xAxisLabel
          ),
          React.createElement( Marks, {
            binnedData: binnedData, xScale: xScale, yScale: yScale, tooltipFormat: function (d) { return d; }, circleRadius: 2, innerHeight: innerHeight }),
          React.createElement( 'g', { ref: brushRef })
        )
      )
    );
  };

  var width = 960;
  var height = 500;
  var dateHistogramSize = 0.2;

  var xValue = function (d) { return d['Reported Date']; };

  var App = function () {
    var worldAtlas = useWorldAtlas();
    var data = useData();
    var ref = React$1.useState();
    var brushExtent = ref[0];
    var setBrushExtent = ref[1];

    if (!worldAtlas || !data) {
      return React__default['default'].createElement( 'pre', null, "Loading..." );
    }

    // will return unfiltered dataset if brushExtent is null/ showing by the brushExtent ? filterfunc... : data;
    var filteredData = brushExtent
      ? data.filter(function (d) {
          var date = xValue(d);
          return date
            ? date > brushExtent[0] && date < brushExtent[1]
            : null; // only returns dates within the brushExtent date range
        })
      : data;

    return (
      React__default['default'].createElement( 'svg', { width: width, height: height },
        React__default['default'].createElement( BubbleMap, {
          data: data, filteredData: filteredData, worldAtlas: worldAtlas }),
        React__default['default'].createElement( 'g', {
          transform: ("translate(0, " + (height - dateHistogramSize * height) + ")") },
          React__default['default'].createElement( DateHistogram, {
            data: data, width: width, height: dateHistogramSize * height, setBrushExtent: setBrushExtent, xValue: xValue })
        )
      )
    );
  };
  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ), rootElement);

}(React, ReactDOM, d3, topojson));
//# sourceMappingURL=bundle.js.map
