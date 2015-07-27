/**
 * Created by Craig on 7/14/2015.
 * Update by Tom on 7/27/2015
 */
var serviceRoot = window.location.protocol +'//'+ window.location.host;
var projectID = "DV3-5";

var series = [
    {
        name: "BCWS",
        type: "line",
        field: "BCWS",
        categoryField: "Date",
       // aggregate: "sum",
        color: "#428bca",
        markers: {type: "circle"}
    },
    {
        name: "BCWP",
        type: "line",
        field: "BCWP",
        categoryField: "Date",
       // aggregate: "sum",
        color: "#5bc0de",
        markers: {type: "circle"}
    },
    {
        name: "EAC",
        type: "line",
        field: "EAC",
        categoryField: "Date",
       // aggregate: "sum",
        color: "#5cb85c",
        markers: {type: "circle"}
    },
    {
        name: "ACWP",
        type: "line",
        field: "ACWP",
        categoryField: "Date",
       // aggregate: "sum",
        color: "#f0ad4e",
        markers: {type: "circle"}
    }
];

function displayTotals(data,name) {
    var bcwsTotalCost = kendo.toString(data[0].bcwsTotal, "c");
    var bcwpTotalCost = kendo.toString(data[1].bcwpTotal, "c");
    var eacTotalCost = kendo.toString(data[2].eacTotal, "c");
    var acwpTotalCost = kendo.toString(data[3].acwpTotal, "c");
    var eacCum = kendo.toString(data[4].eacCum, "c");
    var bac = kendo.toString(data[5].bac, "c");
    var tcpi = kendo.toString(data[6].tcpi);
    $('button.total-bcws').text(bcwsTotalCost);//'&#163;'+
    $('button.total-bcwp').text(bcwpTotalCost);
    $('button.total-eac').text(eacTotalCost);
    $('button.total-acwp').text(acwpTotalCost);
    $('span.total-tcpi').text(tcpi);
    $('span.total-bac').text(bac);
    $('span.total-eacCum').text(eacCum);
    if(name != undefined){
        $('span.project').text(name);
        $('span.user-name').text('N/A');
    }
}

function showProgress(boolean){
    var loadingTree = $(document).find(".treelist-loading");
    var loadingGauges = $(document).find(".gauge-loading");
    var loadingChart = $(document).find(".chart-loading");
    kendo.ui.progress(loadingTree, boolean);
    kendo.ui.progress(loadingGauges, boolean);
    kendo.ui.progress(loadingChart, boolean);
}

function allNodes(currentNode,arr){
    var compile = arr;
    var $next = currentNode.next();
    var $check = currentNode.hasClass('k-treelist-group');
    if(!$check){
        compile.push(currentNode.index());
        if(currentNode.length == 0) {
            console.log('end');
        }else{
            if($next.length != 0) {
                if (!$next.hasClass('k-treelist-group')) {
                    return allNodes($next, compile);
                }
            }
        }
    } else {
        if($check) {
            console.log($next.length);
            if($next.length == 0){
            }else{
                return allNodes($next, compile);
            }
        }
    }
    return compile;
}

function createTooltip(data) {
    var spi = Number(data[0].spi);
    var cpi = Number(data[1].cpi);

    $("#rgauge").kendoTooltip({ content: 'CPI - ' + cpi });
    $("#lgauge").kendoTooltip({ content: 'SPI - ' + spi });
}

function createGauge(data) {
    if (data.length === 0) {
        return alert('Gauge Data error: No Data.');
    }
    var spi = Number(data[0].spi);
    var cpi = Number(data[1].cpi);
    if (!_.isNumber(spi)) {
        spi = 0;
    }
    if (!_.isNumber(spi)) {
        cpi = 0;
    }
    //master.gauges[0].spi master.gauges[1].cpi
    $("#lgauge").kendoRadialGauge({
        /**pointer: {
        value: $("#gauge-value").val()
    },**/
        pointer: {
            value: spi
        },
        scale: {
            minorUnit: 5,
            startAngle: -30,
            endAngle: 210,
            min: 0,
            max: 2,
            labels: {
                position:  "outside"
            },
            ranges: [
                {
                    from: 0,
                    to:.1,
                    color: "#c20000"//red
                },
                {

                    from:.1,
                    to:.2,
                    color: "#ff7a00"//orange
                },
                {
                    from:.2,
                    to:.5,
                    color: "#ffc700"//yellow
                },
                {
                    from: 1.5,
                    to:1.8,
                    color: "#ffc700"//yellow
                },
                {

                    from:1.8,
                    to:1.9,
                    color: "#ff7a00"//orange
                },
                {
                    from:1.9,
                    to:2,
                    color: "#c20000"//red
                }
            ]
        }
    });

    $("#rgauge").kendoRadialGauge({
        /**pointer: {
        value: $("#gauge-value-bottom").val()
    },**/
        pointer: {
            value: cpi
        },
        scale: {
            minorUnit: 15,
            startAngle: -30,
            endAngle: 210,
            min: 0,
            max: 5,
            labels: {
                position: "outside"
            },
            ranges: [
                {
                    from: 0,
                    to:.2,
                    color: "#c20000"//red
                },
                {

                    from:.2,
                    to:.5,
                    color: "#ff7a00"//orange
                },
                {
                    from:.5,
                    to:1,
                    color: "#ffc700"//yellow
                },
                {
                    from:4,
                    to:4.5,
                    color: "#ffc700"//yellow
                },
                {

                    from:4.5,
                    to:4.8,
                    color: "#ff7a00"//orange
                },
                {
                    from:4.8,
                    to:5,
                    color: "#c20000"//red
                }
            ]
        }

    });
}

function createSplitters() {
    $("#vertical").kendoSplitter({
        orientation: "vertical",
        panes: [
            { collapsible: true },
            { collapsible: true, size: "70%" }
        ]
    });

    $("#horizontal").kendoSplitter({
        panes: [
            { collapsible: true },
            { collapsible: true, size: "70%" }
        ]
    });
}

function refreshChart() {
    var chart = $("#chart").data("kendoChart"),
        type = $("input[name=seriesType]:checked").val()//,
    //stack = $("#stack").prop("checked");

    for (var i = 0, length = series.length; i < length; i++) {
        //series[i].stack = stack;
        series[i].type = type;
    }
    chart.setOptions({
        series: series
    });
}

function tdHover (e){
    /**nested inside getReport func**/
    e.preventDefault();
    if($(this).hasClass('no-paint')){
        return;
    }
    if($(this).hasClass('over')) {
        $(this).removeClass('over');
    }else{
        $(this).addClass('over');
    }
}

function hierEvent(selector){
    /*********** New Hierarchy Button View Click Event ***************/
    selector.on('click','tr button.js-hier',function(e){
        e.preventDefault();
        var chartdata = '',
            filteredSnapByParentId = '',
            filteredSnapByIndex = [],
            collectIndexes = [],
            chartFiltered = '';
        console.log('hit selected row');
        var $target = $(e.currentTarget),
            $treeList = $("div#treelist").data("kendoTreeList"),
            $chartGraph = $("div#chart").data("kendoChart"),
            $trParent = $target.parent().parent(),
            $rowIndex = $trParent.index(),
            $objectNumber = $target.data('objectNumber'),//data-objectNumber='#=data.ObjectNumber#'
            $children = $target.data('children');
        console.log($rowIndex);
        chartdata = $chartGraph.dataSource.options.data;
        /**Change Title**/
        var extId = $treeList.dataSource.options.data[$rowIndex].ExtID;
        var description = $treeList.dataSource.options.data[$rowIndex].Description;
        //$(document).find('.gaugeHeading').text(extId+'  '+description);
        $(document).find('.gaugeHeading').text(description);
        /** end title change **/
        switch($rowIndex){
            case 0:
            case 1:
                chartFiltered =  FilterChartData(chartdata);
                break;
            default:
                if($children){
                    var allChildIndexes = allNodes($($trParent),collectIndexes);
                    console.log(JSON.stringify(allChildIndexes));
                    var Indexes = _.without(allChildIndexes,-1);
                    console.log(JSON.stringify(Indexes));
                    $.each(Indexes,function(key,value){//[data-children="false"]
                        filteredSnapByIndex.push({'ObjectNumber':$treeList.dataSource.options.data[value].ObjectNumber});
                    });
                    console.log('multiple '+JSON.stringify(filteredSnapByIndex));
                    filteredSnapByParentId = FilterByHierList(filteredSnapByIndex,chartdata);
                    chartFiltered =  FilterChartData(filteredSnapByParentId);
                }else{
                    filteredSnapByIndex.push({'ObjectNumber':$treeList.dataSource.options.data[$rowIndex].ObjectNumber});
                    console.log('single '+JSON.stringify(filteredSnapByIndex));
                    filteredSnapByParentId = FilterByHierList(filteredSnapByIndex,chartdata);
                    chartFiltered =  FilterChartData(filteredSnapByParentId);
                }
                break;
        }
        if(chartFiltered != undefined){
            var chartTotalsFilteredBy =  _.flatten(chartFiltered.totals);
            console.log(chartTotalsFilteredBy);
            displayTotals(chartTotalsFilteredBy);

            var chartFilteredByParentId =  _.flatten(chartFiltered.graph);
            console.log(chartFilteredByParentId.length);
            $chartGraph.dataSource.data(chartFilteredByParentId);
            refreshChart();

            var gaugesData = _.flatten(chartFiltered.gauges);
            createGauge(gaugesData);
            createTooltip(gaugesData);
        }

    });
}

/**********Added Initilized Hiearchy expaneded**********/
function expandTreeList(selector){
    selector.data("kendoTreeList").expand(".k-treelist-group");
    selector.data("kendoTreeList").expand(".k-alt");
}

function projectData() {
    var projectSource = '';
    $.ajax({
        url: serviceRoot + "/ProjectSet?$format=json",
        method: "GET",
        dataType: 'json',
        async: false
    }).success(function (response) {
        projectSource = response.d.results[0];
        console.log(projectSource);
    }).error(function (err) {
        alert('error ' + err);
    }).done(function () {
        console.log('projectData complete ');
    });
    return projectSource;
}


function hierListData() {
    var hierSource = '';
    $.ajax({
        url: serviceRoot + "/HierarchySet?$filter=Project eq '" + projectID + "'&$format=json",
        method: "GET",
        dataType: 'json',
        async: false
    }).success(function (response) {
        hierSource = response.d.results;
    }).error(function (err) {
        alert('error ' + err);
    }).done(function () {
        console.log('HierarchySet complete ');

    });
    return hierSource;
}

function ChartData() {
    var rawData ='';
    $.ajax({
        url: serviceRoot + "/SnapshotSet?$format=json",
        method: "GET",
        dataType: 'json',
        async: false
    }).success(function (response) {
        rawData = response.d.results;
    }).error(function (err) {
        alert('error ' + err);
    }).done(function () {
        console.log('request complete: SnapShotData');
    });

    return rawData;
}

function hierListInitialize(data) {
    $(document).find("#treelist").kendoTreeList({
        dataSource: {
            data: data,
            schema: {
                parse: function (response) {
                    var items = [];
                    $.each(response, function (index, value) {
                        var item = {
                            "parentId": String(value.ParentObjNum).substr(2),
                            "ParentObjNum": String(value.ParentObjNum).substr(2),
                            "id": String(value.ObjectNumber).substr(2),
                            "ObjectNumber": String(value.ObjectNumber).substr(2),
                            "Type": value.Type,
                            "ExtID": value.ExtID,
                            "Description": value.Description,
                            "Project": value.Project,
                            "SortOrder": value.SortOrder
                        };
                        items.push(item);
                    });
                    return items;
                },
                schema: {
                    model: {
                        //id: "id"
                        expanded: true
                    }
                }
            },
            dataBound: function (e) {
                /** Does Not work Yet ***
                 var tv = $("#treelist").data("kendoTreeView");
                 if (tv != null) {
            tv.expand(".k-item");
        }**/
            }
        },
        //height: '250',
        resizable: true,
        //filterable: true,
        //sortable: true,
        header: false,
        columns: [
            {field: "Project Hierachy", width: 100,"template":kendo.template("<button data-children='#=data.hasChildren#' data-objectNumber='#=data.ObjectNumber#' class='btn btn-default js-hier'>#=data.ExtID#</button>")},
            {field:"",width:100,"template":kendo.template("<button data-children='#=data.hasChildren#' data-objectNumber='#=data.ObjectNumber#' class='btn btn-default js-hier'>#=data.Description#</button>")}
        ]
    });
}

function FilterByHierList(hierArray,data){
    var findParentIds = '';
    var addValues = [];
    var sendData = '';
    if(_.isArray(hierArray)){
        //  console.log('nodes used'+ hierArray);
        $.each(hierArray,function(k,v){
            findParentIds = $.grep(data,function(item){
                return item.ObjectNumber === v.ObjectNumber;
            });
            addValues.push(findParentIds);
        });
        console.log('FilterByHierList length'+ JSON.stringify(_.flatten(addValues).length));

    }else{
        return console.log('nothing in array');
    }
    sendData = _(addValues).chain()
        .flatten(addValues)
        .value();
    return sendData;
}

function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

// Decimal round
Math.round10 = function(value, exp) {
    return decimalAdjust('round', value, exp);
};

// Decimal floor
Math.floor10 = function(value, exp) {
    return decimalAdjust('floor', value, exp);
};

// Decimal ceil
Math.ceil10 = function(value, exp) {
    return decimalAdjust('ceil', value, exp);
};

function FilterChartData(results) {
    //  console.log('FilterChartData '+JSON.stringify(results));
    var master = {};
    master.graph = [];
    master.totals = [];
    master.gauges = [];
    var data = _.flatten(results);
    if (data.length === 0) {
        console.log('No Data to filter series.');
    }
    var BCWS = $.grep(data, function (item) {
        if (item.Version === 'D02') {
            return item.ValueType === '01';
        }
    });//filter data
    var BCWP = $.grep(data, function (item) {
        if (item.Version === 'D02') {
            return item.ValueType === 'P2';
        }
    });//filter data
    var EAC = $.grep(data, function (item) {
        if (item.Version === 'EA1') {
            return item;
        }
    });//filter data
    var ACWP = $.grep(data, function (item) {
        if (item.Version === '000') {
            return item;
        }
    });//filter data
    var ETC = $.grep(data, function (item) {
        if (item.Version === 'EA1') {
            return item.ValueType === '01';
        }
    });//filter data


    if (BCWS != undefined || '') {
        var BCWSdata = _.map(_.where(BCWS), function (value) {
            return {
                "BCWS": Number(value.IntValProjCurr),
                "IntValProjCurr": Number(value.IntValProjCurr),
                "ObjectNumber": value.ObjectNumber,
                "Version": value.Version,
                "ValueType": value.ValueType,
                "Date": value.Date
            }
        });//convert IntValProjCurr key for Chart Series
        var bcwsTotal = 0;
        $.each(BCWSdata, function (key, value) {
            bcwsTotal += parseFloat(value.BCWS);
        });
        master.totals.push({"bcwsTotal": bcwsTotal});//.toFixed(2)
        master.graph.push(BCWSdata);//add array to master array
    }
    if (BCWP != undefined || '') {
        var BCWPdata = _.map(_.where(BCWP), function (value) {
            return {
                "BCWP": Number(value.IntValProjCurr),
                "IntValProjCurr": Number(value.IntValProjCurr),
                "ObjectNumber": value.ObjectNumber,
                "Version": value.Version,
                "ValueType": value.ValueType,
                "Date": value.Date
            }
        });//convert IntValProjCurr key for Chart Series
        var bcwpTotal = 0;
        $.each(BCWPdata, function (key, value) {
            bcwpTotal += parseFloat(value.BCWP);
        });
        master.totals.push({"bcwpTotal": bcwpTotal});//.toFixed(2)
        master.graph.push(BCWPdata);//add array to master array
    }
    if (EAC != undefined || '') {
        var EACdata = _.map(_.where(EAC), function (value) {
            return {
                "EAC": Number(value.IntValProjCurr),
                "IntValProjCurr": Number(value.IntValProjCurr),
                "ObjectNumber": value.ObjectNumber,
                "Version": value.Version,
                "ValueType": value.ValueType,
                "Date": value.Date
            }
        });//convert IntValProjCurr key for Chart Series
        var eacTotal = 0;
        $.each(EACdata, function (key, value) {
            eacTotal += parseFloat(value.EAC);
        });
        master.totals.push({"eacTotal": eacTotal});//.toFixed(2)
        master.graph.push(EACdata);//add array to master array
    }
    if (ACWP != undefined || '') {
        var ACWPdata = _.map(_.where(ACWP), function (value) {
            return {
                "ACWP": Number(value.IntValProjCurr),
                "IntValProjCurr": Number(value.IntValProjCurr),
                "ObjectNumber": value.ObjectNumber,
                "Version": value.Version,
                "ValueType": value.ValueType,
                "Date": value.Date
            }
        });//convert IntValProjCurr key for Chart Series
        var acwpTotal = 0;
        $.each(ACWPdata, function (key, value) {
            acwpTotal += parseFloat(value.ACWP);
        });
        master.totals.push({"acwpTotal": acwpTotal});//.toFixed(2)
        master.graph.push(ACWPdata);//add array to master array
    }
    if (ETC != undefined || '') {
        var ETCdata = _.map(_.where(ETC), function (value) {
            return {"ETC": Number(value.IntValProjCurr)}
        });//convert IntValProjCurr key for Chart Series
        var etcTotal = 0;
        $.each(ETCdata, function (key, value) {
            etcTotal += parseFloat(value.ETC);
        });
        console.log("etcTotal: "+ etcTotal);
        // master.totals.push({"etcTotal": etcTotal});//.toFixed(2)
        // master.graph.push(ETCdata);//add array to master array
    }
    console.log('Before Decimal Rounding bcwpTotal '+bcwpTotal + '  bcwsTotal ' + bcwsTotal + ' acwpTotal '+ acwpTotal + ' etcTotal '+etcTotal);
    var roundbcwpTotal = Math.ceil10(bcwpTotal,-2);
    var roundbcwsTotal = Math.ceil10(bcwsTotal,-2);
    var roundacwpTotal = Math.ceil10(acwpTotal,-2);
    var roundetcTotal = Math.ceil10(etcTotal,-2);
    console.log('After Decimal Rounding roundbcwpTotal '+roundbcwpTotal + '  roundbcwsTotal ' + roundbcwsTotal + ' roundacwpTotal '+ roundacwpTotal + ' roundetcTotal '+roundetcTotal);

    var eacCum = (Math.ceil10(acwpTotal,0) + Math.ceil10(etcTotal,0));
    master.totals.push({"eacCum": Math.ceil10(eacCum,-2)});

    var bac = roundbcwsTotal;
    master.totals.push({"bac": Math.ceil10(bac,-2)});

    var tcpi = (bac - roundbcwpTotal)/(eacCum - roundacwpTotal);
    master.totals.push({"tcpi": Math.ceil10(tcpi,-2)});

    _.flatten(master.totals);


    var spiTotal = (roundbcwpTotal / roundbcwsTotal);
    var cpiTotal = (roundbcwpTotal / roundacwpTotal);
    console.log('Before Check '+Math.ceil10(spiTotal,-2) + '  ' + Math.ceil10(cpiTotal,-3));
    if(isNaN(spiTotal)){
        spiTotal = 0;
    }
    if(isNaN(cpiTotal)){
        cpiTotal = 0;
    }
    console.log('After Check '+Math.ceil10(spiTotal,-2) + '  ' + Math.ceil10(cpiTotal,-3));
    master.gauges.push({'spi': Math.ceil10(spiTotal,-1)});//master.gauges[0].spi
    master.gauges.push({'cpi': Math.ceil10(cpiTotal,-3)});//master.gauges[1].cpi
    _.flatten(master.graph);
    _.flatten(master.gauges);

    return master;
}

function createChart(dataSource, series) {
    $("#chart").kendoChart({
        pdf: {
            fileName: "SnapShot Costs Export.pdf",
            proxyURL: serviceRoot + "/kendo-ui/service/export"
        },
        dataSource: dataSource,
        chartArea: {
            // width: 200,
            //height: 475
        },
        legend: {
            position: "bottom"
        },
        seriesDefaults: {
            type: "line",
            style: "smooth",
            markers: {
                size: 5
            }
        },
        series: series,
        categoryAxis: {
            baseUnit: "fit",
            title: {
                text: "Date"
            },
            field: "Date",
            labels: {
                rotation: -60,
                dateFormats: {
                    days: "M/YYYY"
                }
            },
            maxDateGroups: 45,
            crosshair: {
                visible: false
            },
            line: {
                visible: false
            },
            majorGridLines: {
                visible: false
            }
        },
        valueAxis: {
            title: {text: ' Total'}
        },
        tooltip: {
            visible: true,
            shared: true,
            template: "#= kendo.format('{0:C}',value) #"
        }
    });
}