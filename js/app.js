
function formatDate(d) {

  if (isNaN(d.getDate())) {
    debugger;
  }

  return d.getDate() + '/' + (d.getMonth() + 1) + '/' + (d.getYear() + 1900);
}

var tools = {
  'Inspector':          'DEVTOOLS_INSPECTOR_OPENED_PER_USER_FLAG',
  'Web Console':        'DEVTOOLS_WEBCONSOLE_OPENED_PER_USER_FLAG',
  'Net Monitor':        'DEVTOOLS_NETMONITOR_OPENED_PER_USER_FLAG',
  'Responsive Design':  'DEVTOOLS_RESPONSIVE_OPENED_PER_USER_FLAG',
  'Style Editor':       'DEVTOOLS_STYLEEDITOR_OPENED_PER_USER_FLAG',
  'Debugger':           'DEVTOOLS_JSDEBUGGER_OPENED_PER_USER_FLAG',
  'Tilt':               'DEVTOOLS_TILT_OPENED_PER_USER_FLAG',
  'Profiler':           'DEVTOOLS_JSPROFILER_OPENED_PER_USER_FLAG',
  'Paint Flashing':     'DEVTOOLS_PAINTFLASHING_OPENED_PER_USER_FLAG',
  'Scratchpad':         'DEVTOOLS_SCRATCHPAD_OPENED_PER_USER_FLAG',
  'Command Line':       'DEVTOOLS_DEVELOPERTOOLBAR_OPENED_PER_USER_FLAG',
  'Options':            'DEVTOOLS_OPTIONS_OPENED_PER_USER_FLAG',
  'Layout View':        'DEVTOOLS_LAYOUTVIEW_OPENED_PER_USER_FLAG',
  'Fonts':              'DEVTOOLS_FONTINSPECTOR_OPENED_PER_USER_FLAG',
  'Computed View':      'DEVTOOLS_COMPUTEDVIEW_OPENED_PER_USER_FLAG'
};

function fetchChannel(targetVersions, channel, finish) {
  Telemetry.init(function() {
    var devtoolsData = new DevtoolsTelemetry(Telemetry);
    var totals = [];
    var _i = 0, limit = (_.size(tools) * _.size(targetVersions));
    _.each(tools, function(tool, label) {
      _.each(targetVersions, function(i) {
        var version = channel+'/'+i;
        devtoolsData.getUsageGraph(version, tool, function(err, result) {
          _i++;
          var _r = {
            // tool: tool,
            label: label,
            yes: result.yes,
            no: result.no,
            total: result.total,
            version: i
          };
          
          totals.push(_r);
          // console.log(_i, limit);
          if (_i === limit) {
            // sum up totals for each channels / tool combination
            finish(totals);
          }
        });
      });
    });
  });
}

$(function() {
  var channels = {
    'aurora'  : [28],
    'nightly'  : [29],
  };

  var chart_struct = {
    datasets: [],
    labels: []
  };

  var r = [], _i = 0;
  var chart_columns = [];

  _.each(channels, function(versions, channel) {
    fetchChannel(versions, channel, function(data) {

      // create the chart data structure.
      // debugger;
      if (chart_columns.length === 0) {
        chart_columns = _.map(data, function(item) {
          return item.label;
        });
        console.log(chart_columns);
        chart_struct["labels"] = chart_columns;
      }

      var _str_columns = _.keys(data[0]).join(',')+"\n";

      var _str_data = _.map(data, function(row) {
        return _.values(row).join(',');
      }).join("\n");

      $('pre#output').append(_str_columns+_str_data+"\n");

      chart_data = _.map(data, function(row) {
        return row.yes;
      });

      var color = "rgba(110,110,110,0.5)";

      if (channel === 'aurora') {
        color = "rgba(220,220,220,0.5)"
      }

      chart_struct.datasets.push({
        fillColor: color,
        strokeColor: color,
        data: chart_data
      });

      if (chart_struct.datasets.length === _.size(channels)) {

        var ctx = $("#data-chart").get(0).getContext("2d");
        var _chart = new Chart(ctx).Bar(chart_struct);
      }
    });
  });
});
