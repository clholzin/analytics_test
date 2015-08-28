/**
 * Created by Craig on 7/14/2015.
 * Update by Tom on 7/27/2015
 */
define(['jquery','underscore'], function ($,_){
    var App = app || {};
    App.serviceRoot = window.location.protocol + '//' + window.location.host;
    App.projectID = "DV3-5";//DV3-5
    var doc = $(document),
        colorpicker = '',
        clearColor = doc.has("table").find("button.clear"),
        mainBody = $('div.mainBody'),
        footer = $('div.footer');

    /** Updated Project Tpl Function**/
    App.Project =  function (id, foot, data) {
        var pickPage = id,
            pickfooter = foot,
            pageBody = mainBody,
            pageFooter = footer;
        pageBody.empty();
        pageFooter.empty();

        var pageData = _.template(pickPage);
        var footerData = _.template(pickfooter);

        pageBody.html(pageData({'combineData': data}));

        pageFooter.html(footerData);
        // SpinnerTpl($loadingWheel);
    };

    /** NEW reportTplConfig: to be used with reports 072815
     * see line 196
     **/
    App.reportTplConfig =  function  (selector) {
        /** NOTE: This must execute after Project Template function**/
        var id = $(selector).data('temp'),//Name of DIV
            tableName = $(selector).data('id'),//Name of Table to Export
            name = $(selector).data('name'),//File Name to Export As
            sheet = $(selector).data('sheet'),//Worksheet Name
            $export = doc.find('span.export-excel'),
            picker = $("input#picker"),
            tdColor = '#ede330',
            tempTable = doc.find('table');
        console.log('tableName ' + tableName);
        $export.attr('data-id', tableName);
        $export.attr('data-name', name);
        $export.attr('data-sheet', sheet);

        colorpicker = picker.kendoColorPicker({
            value: tdColor,
            buttons: false
        }).data("kendoColorPicker");
        doc.find('div.k-animation-container').css('left', '-10px');
        tempTable.addClass('table table-responsive').css('table-layout', 'fixed').wrap('<div class="wbsWrap"></div>');
        tempTable.find('tr').addClass('border-color');
        var tdTable = {"font-size": "1vw", "overflow": "hidden"};
        tempTable.find('td').addClass('single').css(tdTable);

        tdBkg = doc.has('table').find('td.single');
        tdBkg.hover(tdHover);
    };

    App.formatOneTotals =  function(hier, costs) {
        var newObj = '';
        var cost = [];
        var total = 0;
        var amounts = '';
        var parents = [];
        if (hier.length === 0) {
            return alert('No Heirarchy data');
        }
        if (costs.length === 0) {
            return alert('No SnapShot data');
        }
        $.each(hier, function (k, v) {
            if (k > 1) {
                newObj = $.grep(costs, function (item) {
                    return item.ObjectNumber === v.ObjectNumber
                });
            } else {
                newObj = costs;
            }
            var data = FilterChartData(newObj);

            total = data.totals.length > 0 ? data.totals[0].bcwsTotal : 0;
            if (total === 0) {
                amounts = {
                    "bcwsTotal": total,
                    "bcwpTotal": total,
                    "eacTotal": total,
                    "acwpTotal": total,
                    "eacCum": total,
                    "bac": total,
                    "tcpi": total,
                    "sv": total,
                    "cv": total,
                    "vac": total,
                    "spi": total,
                    "cpi": total

                };
            } else {
                var sv = parseFloat(data.totals[1].bcwpTotal) - parseFloat(data.totals[0].bcwsTotal);
                var cv = parseFloat(data.totals[1].bcwpTotal) - parseFloat(data.totals[3].acwpTotal);
                var vac = parseFloat(data.totals[5].bac) - parseFloat(data.totals[4].eacCum);
                var gaugeData = data.gauges;
                var spi = gaugeData[0].spi;
                var cpi = gaugeData[1].cpi;

                amounts = {
                    "bcwsTotal": data.totals[0].bcwsTotal,
                    "bcwpTotal": data.totals[1].bcwpTotal,
                    "eacTotal": data.totals[2].eacTotal,
                    "acwpTotal": data.totals[3].acwpTotal,
                    "eacCum": data.totals[4].eacCum,
                    "bac": data.totals[5].bac,
                    "tcpi": data.totals[6].tcpi,
                    "sv": sv,
                    "cv": cv,
                    "vac": vac,
                    "spi": spi,
                    "cpi": cpi
                };
            }
            cost.push({
                'parentNumber': v.ParentObjNum,
                'objNumber': v.ObjectNumber,
                'ExtID': v.ExtID,
                'Description': v.Description,
                'Unit': v.Unit,
                'Quantity': v.Quantity,
                'bcwsCost': total,
                'totals': amounts
            });
        });

        $.each(cost, function (key, value) {
            if (key > 1) {
                var indexof = _.findIndex(cost, function (search) {
                    return search.objNumber === value.parentNumber
                });
                console.log(indexof);
                if (indexof != -1) {
                    if (indexof > 1) {
                        parents.push(indexof);
                        cost[indexof].bcwsCost += parseFloat(value.bcwsCost);
                        cost[indexof].totals.bcwpTotal += parseFloat(value.totals.bcwpTotal);
                        cost[indexof].totals.acwpTotal += parseFloat(value.totals.acwpTotal);
                        cost[indexof].totals.eacCum += parseFloat(value.totals.eacCum);
                        cost[indexof].totals.bac += parseFloat(value.totals.bac);
                        cost[indexof].totals.sv += parseFloat(value.totals.sv);
                        cost[indexof].totals.cv += parseFloat(value.totals.cv);
                        cost[indexof].totals.vac += parseFloat(value.totals.vac);
                        /**cost[indexof].totals.spi = 0;
                         cost[indexof].totals.cpi = 0;**/
                        var oneHigher = (indexof - 1);
                        cost[oneHigher].bcwsCost += parseFloat(value.bcwsCost);
                        cost[oneHigher].totals.bcwpTotal += parseFloat(value.totals.bcwpTotal);
                        cost[oneHigher].totals.acwpTotal += parseFloat(value.totals.acwpTotal);
                        cost[oneHigher].totals.eacCum += parseFloat(value.totals.eacCum);
                        cost[oneHigher].totals.bac += parseFloat(value.totals.bac);
                        cost[oneHigher].totals.sv += parseFloat(value.totals.sv);
                        cost[oneHigher].totals.cv += parseFloat(value.totals.cv);
                        cost[oneHigher].totals.vac += parseFloat(value.totals.vac);
                        /** cost[oneHigher].totals.spi = 0;
                         cost[oneHigher].totals.cpi = 0;**/

                    }
                }
            }
        });
        cost[1].totals.spi = cost[0].totals.spi;
        cost[1].totals.cpi = cost[0].totals.cpi;
        $.each(parents, function (kk, vv) {
            var roundbcwpTotal = Math.ceil10(cost[vv].totals.bcwpTotal, -2);
            var roundbcwsTotal = Math.ceil10(cost[vv].bcwsCost, -2);
            var roundacwpTotal = Math.ceil10(cost[vv].totals.acwpTotal, -2);
            var spiTotal = (roundbcwpTotal / roundbcwsTotal);
            var cpiTotal = (roundbcwpTotal / roundacwpTotal);
            //  var tcpi = (bac - roundbcwpTotal)/(eacCum - roundacwpTotal);
            if (isNaN(spiTotal)) {
                spiTotal = 0;
            }
            if (isNaN(cpiTotal)) {
                cpiTotal = 0;
            }
            cost[vv].totals.spi = Math.ceil10(spiTotal, -2);
            cost[vv].totals.cpi = Math.ceil10(cpiTotal, -3);
        });

        return cost;
    };

    App.ExportTable = function(selector, DocName, fileName) {
        $(selector).table2excel({
            exclude: "",
            name: DocName,
            filename: fileName
        });
    };


    App.series = [
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

    App.addSpinner = function(selector) {
        $(selector).children().eq(0).wrap('<div></div>').parent().addClass('spinnerAdded');
    };

    /** New Function Spinner 072815**/
    App.SpinnerTpl =function (html, boolean) {
        var placeOnDom = $('#loadSpinner');
        if (boolean) {
            var loadingTpl = html;
            placeOnDom.removeClass('displayNone').html(loadingTpl).fadeIn('slow');
            return;
        } else {
            setTimeout(function () {
                placeOnDom.addClass('displayNone').fadeOut('slow').empty();
            }, 1000);
        }
    };

    App.displayTotals = function(data, name) {
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
        if (name != undefined) {
            $('span.project').text(name);
            $('span.user-name').text('N/A');
        }
    };

    App.showProgress = function(boolean) {
        var loadingTree = $(document).find(".treelist-loading");
        var loadingGauges = $(document).find(".gauge-loading");
        var loadingChart = $(document).find(".chart-loading");
        kendo.ui.progress(loadingTree, boolean);
        kendo.ui.progress(loadingGauges, boolean);
        kendo.ui.progress(loadingChart, boolean);
    };

    App.allNodes = function(currentNode, arr) {
        var compile = arr;
        var $next = currentNode.next();
        var $check = currentNode.hasClass('k-treelist-group');
        if (!$check) {
            compile.push(currentNode.index());
            if (currentNode.length == 0) {
                console.log('end');
            } else {
                if ($next.length != 0) {
                    if (!$next.hasClass('k-treelist-group')) {
                        return allNodes($next, compile);
                    }
                }
            }
        } else {
            if ($check) {
                console.log($next.length);
                if ($next.length == 0) {
                } else {
                    return allNodes($next, compile);
                }
            }
        }
        return compile;
    };

    App.createTooltip = function(data) {
        var spi = Number(data[0].spi);
        var cpi = Number(data[1].cpi);

        $("#rgauge").kendoTooltip({content: 'CPI - ' + cpi});
        $("#lgauge").kendoTooltip({content: 'SPI - ' + spi});
    };

    App.createGauge = function(data) {
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
                    position: "outside"
                },
                ranges: [
                    {
                        from: 0,
                        to: .1,
                        color: "#c20000"//red
                    },
                    {

                        from: .1,
                        to: .2,
                        color: "#ff7a00"//orange
                    },
                    {
                        from: .2,
                        to: .5,
                        color: "#ffc700"//yellow
                    },
                    {
                        from: 1.5,
                        to: 1.8,
                        color: "#ffc700"//yellow
                    },
                    {

                        from: 1.8,
                        to: 1.9,
                        color: "#ff7a00"//orange
                    },
                    {
                        from: 1.9,
                        to: 2,
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
                        to: .2,
                        color: "#c20000"//red
                    },
                    {

                        from: .2,
                        to: .5,
                        color: "#ff7a00"//orange
                    },
                    {
                        from: .5,
                        to: 1,
                        color: "#ffc700"//yellow
                    },
                    {
                        from: 4,
                        to: 4.5,
                        color: "#ffc700"//yellow
                    },
                    {

                        from: 4.5,
                        to: 4.8,
                        color: "#ff7a00"//orange
                    },
                    {
                        from: 4.8,
                        to: 5,
                        color: "#c20000"//red
                    }
                ]
            }

        });
    };

    App.createSplitters= function(){
        $("#vertical").kendoSplitter({
            orientation: "vertical",
            panes: [
                {collapsible: true},
                {collapsible: true, size: "70%"}
            ]
        });

        $("#horizontal").kendoSplitter({
            panes: [
                {collapsible: true},
                {collapsible: true, size: "70%"}
            ]
        });
    };

    App.refreshChart = function() {
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
    };

    App.tdHover = function(e) {
        /**nested inside getReport func**/
        e.preventDefault();
        if ($(this).hasClass('no-paint')) {
            return;
        }
        if ($(this).hasClass('over')) {
            $(this).removeClass('over');
        } else {
            $(this).addClass('over');
        }
    };

    App.hierEvent = function(selector) {
        /*********** New Hierarchy Button View Click Event ***************/
        selector.on('click', 'tr button.js-hier', function (e) {
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
            switch ($rowIndex) {
                case 0:
                case 1:
                    chartFiltered = FilterChartData(chartdata);
                    break;
                default:
                    if ($children) {
                        var allChildIndexes = allNodes($($trParent), collectIndexes);
                        console.log(JSON.stringify(allChildIndexes));
                        var Indexes = _.without(allChildIndexes, -1);
                        console.log(JSON.stringify(Indexes));
                        $.each(Indexes, function (key, value) {//[data-children="false"]
                            filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[value].ObjectNumber});
                        });
                        console.log('multiple ' + JSON.stringify(filteredSnapByIndex));
                        filteredSnapByParentId = FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = FilterChartData(filteredSnapByParentId);
                    } else {
                        filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[$rowIndex].ObjectNumber});
                        console.log('single ' + JSON.stringify(filteredSnapByIndex));
                        filteredSnapByParentId = FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = FilterChartData(filteredSnapByParentId);
                    }
                    break;
            }
            if (chartFiltered != undefined) {
                var chartTotalsFilteredBy = _.flatten(chartFiltered.totals);
                console.log(chartTotalsFilteredBy);
                displayTotals(chartTotalsFilteredBy);

                var chartFilteredByParentId = _.flatten(chartFiltered.graph);
                console.log(chartFilteredByParentId.length);
                $chartGraph.dataSource.data(chartFilteredByParentId);
                refreshChart();

                var gaugesData = _.flatten(chartFiltered.gauges);
                createGauge(gaugesData);
                createTooltip(gaugesData);
            }

        });
    };

    /**********Added Initilized Hiearchy expaneded**********/
    App.expandTreeList = function(selector) {
        selector.data("kendoTreeList").expand(".k-treelist-group");
        selector.data("kendoTreeList").expand(".k-alt");
    };

    /** New Function projectData 072815**/
    App.projectData = function() {
        var projectSource = $.ajax({
            url: serviceRoot + "/ProjectSet?$format=json",
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            //   projectSource = response.d.results[0];
            //   console.log(projectSource);
        }).error(function (err) {
            alert('error ' + err);
        }).done(function () {
            console.log('projectData complete ');
        });

        return projectSource;
    };

    /** New Function hierListData 072815**/
    App.hierListData = function() {
        var Source = $.ajax({
            url: serviceRoot + "/HierarchySet?$filter=Project eq '" + projectID + "'&$format=json",
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err);
        }).done(function () {
            console.log('HierarchySet complete ');
        });
        return Source;
    };

    /** New Function ChartData 072815**/
    App.ChartData = function() {
        var rawData = $.ajax({
            url: serviceRoot + "/SnapshotSet?$format=json",
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // rawData = response.d.results;
        }).error(function (err) {
            alert('error ' + err);
        }).done(function () {
            console.log('request complete: SnapShotData');
        });

        return rawData;
    };


    App.hierListInitialize = function(data) {
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
                {
                    field: "Project Hierachy",
                    width: 100,
                    "template": kendo.template("<button data-children='#=data.hasChildren#' data-objectNumber='#=data.ObjectNumber#' class='btn btn-default js-hier'>#=data.ExtID#</button>")
                },
                {
                    field: "",
                    width: 100,
                    "template": kendo.template("<button data-children='#=data.hasChildren#' data-objectNumber='#=data.ObjectNumber#' class='btn btn-default js-hier'>#=data.Description#</button>")
                }
            ]
        });
    };

    App.FilterByHierList = function(hierArray, data) {
        var findParentIds = '';
        var addValues = [];
        var sendData = '';
        if (_.isArray(hierArray)) {
            //  console.log('nodes used'+ hierArray);
            $.each(hierArray, function (k, v) {
                findParentIds = $.grep(data, function (item) {
                    return item.ObjectNumber === v.ObjectNumber;
                });
                addValues.push(findParentIds);
            });
            console.log('FilterByHierList length' + JSON.stringify(_.flatten(addValues).length));

        } else {
            return console.log('nothing in array');
        }
        sendData = _(addValues).chain()
            .flatten(addValues)
            .value();
        return sendData;
    };

    App.decimalAdjust = function(type, value, exp) {
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
    };

// Decimal round
    App.Math.round10 = function (value, exp) {
        return decimalAdjust('round', value, exp);
    };

// Decimal floor
    App.Math.floor10 = function (value, exp) {
        return decimalAdjust('floor', value, exp);
    };

// Decimal ceil
    App.Math.ceil10 = function (value, exp) {
        return decimalAdjust('ceil', value, exp);
    };

    App.FilterChartData = function(results) {
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
            console.log("etcTotal: " + etcTotal);
            // master.totals.push({"etcTotal": etcTotal});//.toFixed(2)
            // master.graph.push(ETCdata);//add array to master array
        }
        console.log('Before Decimal Rounding bcwpTotal ' + bcwpTotal + '  bcwsTotal ' + bcwsTotal + ' acwpTotal ' + acwpTotal + ' etcTotal ' + etcTotal);
        var roundbcwpTotal = Math.ceil10(bcwpTotal, -2);
        var roundbcwsTotal = Math.ceil10(bcwsTotal, -2);
        var roundacwpTotal = Math.ceil10(acwpTotal, -2);
        var roundetcTotal = Math.ceil10(etcTotal, -2);
        console.log('After Decimal Rounding roundbcwpTotal ' + roundbcwpTotal + '  roundbcwsTotal ' + roundbcwsTotal + ' roundacwpTotal ' + roundacwpTotal + ' roundetcTotal ' + roundetcTotal);

        var eacCum = (Math.ceil10(acwpTotal, 0) + Math.ceil10(etcTotal, 0));
        master.totals.push({"eacCum": Math.ceil10(eacCum, -2)});

        var bac = roundbcwsTotal;
        master.totals.push({"bac": Math.ceil10(bac, -2)});

        var tcpi = (bac - roundbcwpTotal) / (eacCum - roundacwpTotal);
        master.totals.push({"tcpi": Math.ceil10(tcpi, -2)});

        _.flatten(master.totals);


        var spiTotal = (roundbcwpTotal / roundbcwsTotal);
        var cpiTotal = (roundbcwpTotal / roundacwpTotal);
        console.log('Before Check ' + Math.ceil10(spiTotal, -2) + '  ' + Math.ceil10(cpiTotal, -3));
        if (isNaN(spiTotal)) {
            spiTotal = 0;
        }
        if (isNaN(cpiTotal)) {
            cpiTotal = 0;
        }
        console.log('After Check ' + Math.ceil10(spiTotal, -2) + '  ' + Math.ceil10(cpiTotal, -3));
        master.gauges.push({'spi': Math.ceil10(spiTotal, -1)});//master.gauges[0].spi
        master.gauges.push({'cpi': Math.ceil10(cpiTotal, -3)});//master.gauges[1].cpi
        _.flatten(master.graph);
        _.flatten(master.gauges);

        return master;
    };

    App.createChart = function(dataSource, series) {
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
    };

});