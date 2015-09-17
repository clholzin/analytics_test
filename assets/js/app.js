/**
 * Created by Craig on 7/14/2015.
 * Update by Tom on 7/27/2015
 */
define(['jquery', 'underscore', 'moment', 'kendo', 'Blob', 'base64', 'jszip', 'FileSaver',
    'jquery.table2excel'], function ($, _, moment) {
    var App = App || {};
    App.projectID = "";
    App.HierarchySelectionID = '';
    App.SnapshotSelectionID = '';
    App.ChartType = '';
    App.reportData = "/DSN/PMR_01_SRV";
    App.serviceRoot = window.location.protocol + '//' + window.location.host + '/pmr01srv' + App.reportData;
    /*
     See function setProjectID for other API's
     * */
    App.urlProjectSet = "/ProjectSelectionSet?$format=json";
    //App.colorpicker = '';
    moment.locale('en');
    App.tdColor = '#ede330';
    App.series = [
        {
            name: "Planned (BCWS)",
            type: "line",
            field: "runningBCWS",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#000099",
            markers: {type: "circle"}
        },
        {
            name: "Earned (BCWP)",
            type: "line",
            field: "runningBCWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#009933",
            markers: {type: "circle"}
        },
        {
            name: "EAC",
            type: "line",
            dashType: "dash",
            field: "runningEAC",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#FF0000",
            markers: {type: "circle"}
        },
        {
            name: "Spend (ACWP)",
            type: "line",
            field: "runningACWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#FF0000",
            markers: {type: "circle"}
        }/*,
         {
         name: "baseline",
         type: "line",
         dashType:"dash",
         field: "baseLine",
         categoryField: "Date",
         // aggregate: "sum",
         color: "#FF0000",
         markers: {type: "circle"}
         }*/
    ];
    App.CpiSpiSeries = [
        {
            name: "CPI",
            type: "line",
            dashType: "dash",
            field: "CPI",
            categoryField: "Date",
            color: "#FF0000",
            markers: {type: "circle"}
        },
        {
            name: "SPI",
            type: "line",
            field: "SPI",
            categoryField: "Date",
            color: "#000099",
            markers: {type: "circle"}
        },
        {
            name: "Target CPI/SPI",
            type: "line",
            field: "baseLine",
            categoryField: "Date",
            color: "#00BF32",
            markers: {type: "circle"}
        }
    ];
    App.seriesSV = [
        {
            name: "Planned (BCWS)",
            type: "column",
            field: "runningBCWS",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#000099",
            markers: {type: "circle"}
        },
        {
            name: "Earned (BCWP)",
            type: "column",
            field: "runningBCWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#009933",
            markers: {type: "circle"}
        },
        {
            name: "EAC",
            type: "column",
            field: "runningEAC",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#9900FF",
            markers: {type: "circle"}
        },
        {
            name: "Spend (ACWP)",
            type: "column",
            field: "runningACWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#FF0000",
            markers: {type: "circle"}
        }/*,
         {
         name: "baseline",
         type: "line",
         dashType:"dash",
         field: "baseLine",
         categoryField: "Date",
         // aggregate: "sum",
         color: "#FF0000",
         markers: {type: "circle"}
         }*/
    ];
    App.seriesCombo = [
        {
            name: "Planned (BCWS)",
            type: "column",
            field: "BCWS",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#000099",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "Earned (BCWP)",
            type: "column",
            field: "BCWP",
            categoryField: "Date",
            color: "#009933",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "EAC",
            type: "column",
            field: "EAC",
            categoryField: "Date",
            color: "#9900FF",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "Spend (ACWP)",
            type: "column",
            field: "ACWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#FF0000",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "Planned (BCWS) [cum]",
            type: "line",
            field: "runningBCWS",
            categoryField: "Date",
            color: "#000099",
            markers: {type: "circle"},
            axis: "Cumulative"
        },
        {
            name: "Earned (BCWP) [cum]",
            type: "line",
            field: "runningBCWP",
            categoryField: "Date",
            color: "#009933",
            markers: {type: "circle"},
            axis: "Cumulative"
        },
        {
            name: "EAC [cum]",
            type: "line",
            field: "runningEAC",
            categoryField: "Date",
            color: "#9900FF",
            markers: {type: "circle"}
            ,
            axis: "Cumulative"
        },
        {
            name: "Spend (ACWP) [cum]",
            type: "line",
            field: "runningACWP",
            categoryField: "Date",
            color: "#FF0000",
            markers: {type: "circle"},
            axis: "Cumulative"
        }/*,
         {
         name: "baseline",
         type: "line",
         dashType:"dash",
         field: "baseLine",
         categoryField: "Date",
         // aggregate: "sum",
         color: "#FF0000",
         markers: {type: "circle"}
         }*/
    ];

    App.DataStore = {
        chart: {},
        filtered: [],
        chartTotals: [],
        rawChartdata: [],
        gaugesData: [],
        project: {},
        hierarchy: [],
        versions: [],
        versionSelection: '',
        hierarchyList: [],
        snapShotList: [],
        empty: function () {
            this.chart = {};
            this.filtered = [];
            this.chartTotals = [];
            this.rawChartdata = [];
            this.gaugesData = [];
            this.project = {};
            this.hierarchy = [];
            this.hierarchyList = {};
            this.snapShotList = [];
        },
        setData: function (cData, hData) {
            this.rawChartdata = _.first(cData).d.results;
            this.filtered = App.VersionFilter(this.versions, this.rawChartdata);
            console.log(this.filtered);
            var chartDataSource = App.FilterData(this.filtered, this.rawChartdata, this.versionSelection);
            var refined = App.FilterChartData(chartDataSource.graph);
            this.chart = App.AssignStore(refined.graph);
            this.chartTotals = refined.totals;
            this.gaugesData = refined.gauges;
            this.hierarchy = _.first(hData).d.results;
        }
    };


    App.unit = {
        _monthAttr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        get months() {
            return this._monthAttr;
        }
    };

    App.paint = {
        "trCssTransparent": {
            'color': 'black',
            'background-color': 'transparent'
        },
        "tdCssTransparent": {
            'color': 'black',
            'background-color': 'transparent'
        },
        "setTRHighlight": {
            'background-color': App.tdColor,
            'color': 'black'
        },
        "setHighlight": {
            'background-color': App.tdColor,
            'color': 'black'
        },
        "hoverHighlight": {
            'background-color': App.tdColor,
            'color': 'black'
        }
    };

    App.setVersion = function () {
        var versionData = this.VersionData();
        App.DataStore.versionSelection = '';
        $.when(versionData).done(function (vData) {
            App.DataStore.versions = vData.d.results;

            var defVersion = $.grep(App.DataStore.versions, function (item) {
                return item.Default === "X";
            });
            console.log(defVersion);
            if (defVersion.length > 1) {
                App.DataStore.versionSelection = _.first(defVersion).VersionSelection;
            } else {
                App.DataStore.versionSelection = defVersion.VersionSelection;
            }
            console.log('Version Selection: ' + App.DataStore.versionSelection);
        });
    };

    App.setHierarchyList = function () {
        var List = this.HierarchyListSet();
        App.HierarchySelectionID = '';
        $.when(List).done(function (lData) {
            App.DataStore.hierarchyList = lData.d.results;
            var defList = $.grep(App.DataStore.hierarchyList, function (item) {
                if (App.DataStore.hierarchyList.length === 1) {
                    return item;
                }
                return item.Default === "X";
            });
            console.log(defList);
            if (defList.length >= 1) {
                App.HierarchySelectionID = _.first(defList).HierarchySelection;
            }
            console.log('HierarchySelectionID Selection: ' + App.HierarchySelectionID);
        });
    };

    App.setSnapshotList = function () {
        var List = this.SnapshotListSet();
        App.SnapshotSelectionID = '';
        $.when(List).done(function (lData) {
            App.DataStore.snapShotList = lData.d.results;
            var defList = $.grep(App.DataStore.snapShotList, function (item) {
                return item.Default === "X";
            });
            console.log(defList);
            if (defList.length >= 1) {
                App.SnapshotSelectionID = _.first(defList).SnapshotSelection;
            }
            console.log('SnapshotSelectionID Selection: ' + App.SnapshotSelectionID);
        });
    };

    App.apiErrorHandler = function (target, loadingWheel, data) {
        /** Error handler **///(_.isUndefined(_.first(data))) ||
        if (_.isArray(data)) {
            if (_.isEmpty(data)) return;
            if (_.isUndefined(_.first(data))) {
                alert('Selection does not have Data, try again.');
                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                App.addSpinner(target, false);//bkg loading
                return true;
            }
        }
        /** Error handler **/
    };

    App.setProjectID = function (value) {
        this.projectID = value;
        this.urlVersionSet = "/VersionSelectionSet(ProjectSelection='" + this.projectID + "')?$format=json";
        this.urlSnapshotListSet = "/SnapshotSelectionSet(ProjectSelection='" + this.projectID + "')?$format=json";
    };

    App.setHierarchySelection = function (ChartType) {
        this.ChartType = ChartType;
        //HierarchySelectionSet(ChartType='SPA',ProjectSelection='PMR-T01')?$format=json
        this.urlHierarchyListSet = "/HierarchySelectionSet(ChartType='" + this.ChartType + "',ProjectSelection='" + this.projectID + "')?$format=json";
    };

    App.setDataSelection = function () {
        //SnapshotDataSet(ProjectSelection='PMR-T01',HierarchySelection='OB0000265594',SnapshotType='M')?$format=json
        this.urlSnapshotSet = "/SnapshotDataSet(ProjectSelection='" + this.projectID + "',HierarchySelection='" + this.HierarchySelectionID + "',SnapshotType='M')?$format=json";
        //HierarchyDataSet(ProjectSelection='PMR-T01',HierarchySelection='OB0000265594')?$format=json
        this.urlHierarchySet = "/HierarchyDataSet(ProjectSelection='" + this.projectID + "',HierarchySelection='" + this.HierarchySelectionID + "')?$format=json";
    };

    App.CheckProdId = function () {
        if (_.isEmpty(this.projectID) || _.isUndefined(this.projectID)) {
            alert('Please select a Project');
            return true;
        }
    };

    App.CheckHierarchyId = function () {

        if (_.isEmpty(this.HierarchySelectionID) || _.isUndefined(this.HierarchySelectionID)) {
            alert('Please select a Hierarchy');
            return true;
        }
    };

    App.ClearDataStore = function () {
        this.DataStore.empty();
    };

    App.UpdateHierarchy = function () {
        var $chartGraph = $("div#chart").data("kendoChart"),
            $treeList = $("div#treelist").data("kendoTreeList");
        $chartGraph.dataSource.options.data = [];
        $treeList.dataSource.options.data = [];
    };

    App.AssignStore = function (data) {
        // if(_.isEmpty(App.DataStore.chart)){
        return new kendo.data.DataSource({
            data: _.flatten(data),
            sort: {
                field: "Date",
                dir: "asc"
            },
            schema: {
                model: {
                    fields: {
                        Date: {type: "date"}
                    }
                }
            }
        });
        //  }
    };

    App.getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    App.getUsername = function () {
        var user = App.getCookie("DassianUser");
        if (user != "") {
            $("#userName").html("<p>Welcome " + decodeURI(user) + "</p>");
        } else {
            $("#userName").html("<p>Welcome</p>");
        }
    };

    /** Updated Project Tpl Function**/
    App.Project = function (id, foot, data) {
        var pageBody = $('div.mainBody'),
            pageFooter = $('div.footer');
        //  pageBody.empty();
        //  pageFooter.empty();
        var pageData = id;
        var footerData = foot;
        pageBody.html(pageData({'combineData': data}));
        pageFooter.html(footerData);
    };

    /*App.colorpicker = function(selector) {
     selector.kendoColorPicker({
     value: this.tdColor,
     buttons: false
     }).data("kendoColorPicker");
     };*/

    App.analyticsTplConfig = function (selector) {
        var name = $(selector).data('name'),//File Name to Export As
            $exportReportPDF = $(document).find('span.export-chart-pdf');
        $exportReportPDF.attr('data-id', name);
        //console.log($exportReportPDF);
    };

    App.reportTplConfig = function (selector) {
        /** NOTE: This must execute after Project Template function**/
        var id = $(selector).data('temp'),//Name of DIV
            self = this,
            tableName = $(selector).data('id'),//Name of Table to Export
            name = $(selector).data('name'),//File Name to Export As
            sheet = $(selector).data('sheet'),//Worksheet Name
            $export = $(document).find('span.export-excel'),
            $exportPDF = $(document).find('span.export-pdf'),
            $exportReportPDF = $(document).find('span.export-report-pdf'),
        //picker = $(document).find("input#picker"),
            tempTable = $(document).find('table');
        console.log('tableName ' + tableName);
        $export.attr('data-id', tableName);
        $export.attr('data-name', name);
        $export.attr('data-sheet', sheet);
        $exportPDF.attr('data-id', name);
        $exportReportPDF.attr('data-id', name);

        /*$(document).find('.selectpicker').selectpicker({
         container: 'body'
         });

         App.colorpicker(picker);
         App.picker = picker.data("kendoColorPicker");*/
        $(document).find('div.k-animation-container').css('left', '-10px');
        tempTable.addClass('table table-responsive').css('table-layout', 'fixed').wrap('<div class="wbsWrap"></div>');
        tempTable.find('tr').addClass('border-color');
        var tdTable = {"font-size": "0.7vmax", "overflow": "hidden"};
        tempTable.find('td').addClass('single').css(tdTable);

        //var tdBkg = $(document).has('table').find('td.single');
        //tdBkg.hover(self.tdHover);
       var getChildren = $(document).find('div.getChildren');
        getChildren.on('click', function (e) {
            e.preventDefault();
            var id = $(this).attr('data-id');
            $(document).find('.child'+id).toggleClass('hide').fadeIn('slow');
            if ($(e.currentTarget).hasClass('shown')) {
                $(e.currentTarget).find( "i.glyphicon").eq(0).toggleClass('glyphicon-plus glyphicon-minus');//.text('Expand');
            } else {
                $(e.currentTarget).find( "i.glyphicon" ).eq(0).toggleClass('glyphicon-plus glyphicon-minus');//.text('Collapse');
            }
            $(e.currentTarget).toggleClass('shown btn-primary btn-warning');

        });
    };

    App.convertArraytoObject = function (array) {
        var total = {};
        if (_.isArray(array)) {
            _.each(array, function (value) {
                for (prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        total[prop] = value[prop];
                    }

                }
            });
            return total
        }
    };

    App.ragSpi = function (spi) {
        var spiColour = "#0066CC";
        if (_.isNumber(spi)) {
            if (spi < 0.9) {
                spiColour = "#FF0000";//red
            } else if (spi > 0.9 && spi < 0.95) {
                spiColour = "#FF9933";//amber
            } else if (spi > 0.95 && spi < 1.2) {
                spiColour = "#009933";//green
            } else {
                spiColour = "#0066CC";//blue
            }
            return spiColour;
        }
        // return spiColour;
    };

    App.ragCpi = function (cpi) {
        var cpiColour = "#009933";
        if (_.isNumber(cpi)) {
            if (cpi < 0.9) {
                cpiColour = "#FF0000";//red
            } else if (cpi > 0.9 && cpi < 0.95) {
                cpiColour = "#FF9933";//amber
            } else if (cpi > 0.95 && cpi < 1.2) {
                cpiColour = "#009933";//green
            } else {
                cpiColour = "#0066CC";//blue
            }
            return cpiColour;
        }
        // return cpiColour;
    };

    App.formatOneTotals = function (hier, costs, dataType) {
        console.time('Format One Totals');
        if(_.isUndefined(dataType)){
            var Type = 'IntValProjCurr';
        }else{
                Type = dataType;
        }
        var newObj = '',
            hierarchy = '',
            cost = [],
            total = 0,
            amounts = '',
            parent = [],
            spiColour = "",
            cpiColour = "",
            curSPIColour = "",
            curCPIColour = "",
            com = {},
            self = this;
        if (hier.length === 0) {
            return alert('No Heirarchy data');
        }

        if (_.isEmpty(costs)) {
            return alert('No SnapShot data');
        }
        _.chain(hier).sortBy("SortOrder").each(function (v, k) {
            if (k != 0) {
                newObj = $.grep(costs, function (item) {
                    return item.ObjectNumber === v.ObjectNumber
                });
            } else {
                newObj = costs;
            }
            var data = App.FilterChartData(newObj, Type);
            if (_.isUndefined(data)) {
                var totals = undefined;
                var gauges = undefined;
            } else {
                totals = App.convertArraytoObject(data.totals);
                gauges = App.convertArraytoObject(data.gauges);
            }
            var total = !_.isUndefined(totals) && _.isObject(totals) ? totals : 0;
            var gauge = !_.isUndefined(gauges) && _.isObject(gauges) ? gauges : 0;
            //console.log(total);
            //console.log(gauges);
            if (total === 0) {
                amounts = {
                    CurrCV: total,
                    CurrCvCom: total,
                    CurrSV: total,
                    CurrSvCom: total,
                    ETC_CPI: total,
                    acwpCOM: total,
                    acwpGA: total,
                    acwpHrs: total,
                    acwpOH: total,
                    acwpTotal: total,
                    allbcwsCOM: total,
                    allbcwsGA: total,
                    allbcwsOH: total,
                    bac: total,
                    bcwpCOM: total,
                    bcwpGA: total,
                    bcwpHrs: total,
                    bcwpOH: total,
                    bcwpTotal: total,
                    bcwsAll: total,
                    bcwsCOM: total,
                    bcwsGA: total,
                    bcwsHrs: total,
                    bcwsOH: total,
                    bcwsTotal: total,
                    cpi: total,
                    cpiColour: "#FF0000",
                    curAcwpHrs: total,
                    curAcwpTotal: total,
                    curBcwpHrs: total,
                    curBcwpTotal: total,
                    curBcwsHrs: total,
                    curBcwsTotal: total,
                    curCPI: total,
                    curCPIColour: "#FF0000",
                    curSPI: total,
                    curSPIColour: "#FF0000",
                    curacwpCOM: total,
                    curacwpGA: total,
                    curacwpOH: total,
                    curbcwpCOM: total,
                    curbcwpGA: total,
                    curbcwpOH: total,
                    curbcwsCOM: total,
                    curbcwsGA: total,
                    curbcwsOH: total,
                    cv: total,
                    cvCom: total,
                    eacCOM: total,
                    eacCum: total,
                    eacHrs: total,
                    eacTotal: total,
                    spi: total,
                    spiColour: "#FF0000",
                    sv: total,
                    svCom: total,
                    tcpi: total,
                    vac: total,
                    checkRemove:true
                };

            } else {
                var spi = gauge.spi,
                    cpi = gauge.cpi,
                    curSPI = gauge.curSPI,
                    curCPI = gauge.curCPI;
                spiColour = App.ragSpi(spi);
                cpiColour = App.ragCpi(cpi);
                curSPIColour = App.ragSpi(curSPI);
                curCPIColour = App.ragCpi(curCPI);
                total['curSPI'] = curSPI;
                total['curCPI'] = curCPI;
                total['spi'] = spi;
                total['cpi'] = cpi;
                total['spiColour'] = spiColour;
                total['cpiColour'] = cpiColour;
                total['curSPIColour'] = curSPIColour;
                total['curCPIColour'] = curCPIColour;
                total['checkRemove'] = false;
                if (k === 0) {
                    com = total;
                    total.sv  = (total.sv - total.svCom);
                    total.cv  = (total.cv - total.cvCom);
                    total.CurrSV  = (total.CurrSV - total.CurrSvCom);
                    total.CurrCV  = (total.CurrCV - total.CurrCvCom);
                    //total.bac = (total.bac + )
                    com['bacAllBelow'] = _.isNaN(com.bac + com.allbcwsCOM) ? 0 : (com.bac + com.allbcwsCOM);
                    com['eacAllBelow'] = _.isNaN((com.eacTotal + com.eacCOM) + com.acwpOH) ? 0 : (com.eacTotal + com.eacCOM) + com.acwpCOM;
                    com['bcwsBelow'] = _.isNaN(com.bcwsTotal + com.bcwsCOM) ? 0 : (com.bcwsTotal + com.bcwsCOM);
                    com['bcwpBelow'] = _.isNaN(com.bcwpTotal + com.bcwpCOM) ? 0 : (com.bcwpTotal + com.bcwpCOM);
                    com['acwpBelow'] = _.isNaN(com.acwpTotal + com.acwpCOM) ? 0 : (com.acwpTotal + com.acwpCOM);
                    com['currbcwsBelow'] = _.isNaN(com.curBcwsTotal + com.curbcwsCOM) ? 0 : (com.curBcwsTotal + com.curbcwsCOM);
                    com['currbcwpBelow'] = _.isNaN(com.curBcwpTotal + com.curbcwpCOM) ? 0 : (com.curBcwpTotal + com.curbcwpCOM);
                    com['curracwsBelow'] = _.isNaN(com.curAcwpTotal + com.curacwpCOM) ? 0 : (com.curAcwpTotal + com.curacwpCOM);
                    com['CurrSVBelow'] =  _.isNaN(com.CurrSV + com.CurrSvCom) ? 0 : (com.CurrSV - com.CurrSvCom);
                    com['CurrCVBelow'] = _.isNaN(com.CurrCV + com.CurrCvCom) ? 0 : (com.CurrCV + com.CurrCvCom);
                    com['svBelow'] = _.isNaN(com.sv + com.svCom) ? 0 : (com.sv + com.svCom);
                    com['cvBelow'] = _.isNaN(com.cv + com.cvCom) ? 0 : (com.cv + com.cvCom);
                    com['vacBelow'] = _.isNaN(com.vac + com.vacCOM) ? 0 : (com.vac + com.vacCOM);


                } else {
                    console.log(total.allbcwsOH + ' - '+total.bcwsOH);

                    var bcwsAll = _.isNaN(total.bac - total.allbcwsOH) ? 0 : (total.bac - total.allbcwsOH),
                        bcwsTotal = _.isNaN(total.bcwsTotal - total.bcwsOH) ? 0 : (total.bcwsTotal - total.bcwsOH),
                        bcwpTotal = _.isNaN(total.bcwpTotal - total.bcwpOH) ? 0 : (total.bcwpTotal - total.bcwpOH),
                        acwpTotal = _.isNaN(total.acwpTotal - total.acwpOH) ? 0 : (total.acwpTotal - total.acwpOH),
                        curBcwsTotal = _.isNaN(total.curBcwsTotal - total.curbcwsOH) ? 0 : (total.curBcwsTotal - total.curbcwsOH),
                        curBcwpTotal = _.isNaN(total.curBcwpTotal - total.curbcwpOH) ? 0 : (total.curBcwpTotal - total.curbcwpOH),
                        curAcwpTotal = _.isNaN(total.curAcwpTotal - total.curacwpOH) ? 0 : (total.curAcwpTotal - total.curacwpOH);
                    if(total.eacTotal === 0){
                        var eacTotal = _.isNaN((total.eacTotal - total.eacOH) + acwpTotal) ? 0 : (total.eacTotal - total.eacOH) + acwpTotal;
                    }else{
                        eacTotal = _.isNaN((total.eacTotal) + acwpTotal) ? 0 : (total.eacTotal - total.eacOH);
                    }
                    var vac = _.isNaN(bcwsAll - eacTotal) ? 0 : (bcwsAll - eacTotal);

                    total.bac = bcwsAll;
                    total.eacTotal = eacTotal;
                    total.vac = vac;
                    total.bcwsTotal = bcwsTotal;
                    total.bcwpTotal = bcwpTotal;
                    total.acwpTotal = acwpTotal;
                    total.curBcwsTotal = curBcwsTotal;
                    total.curBcwpTotal = curBcwpTotal;
                    total.curAcwpTotal = curAcwpTotal;
                    var bac_BCWP = _.isNaN(bcwsAll - bcwpTotal) ? 0 : bcwsAll - bcwpTotal,
                        eacCum_ACWP = _.isNaN(bcwsAll - acwpTotal) ? 0 : bcwsAll - acwpTotal;
                    /*this order matters*/
                    var CurrSV = _.isNaN(curBcwpTotal - curBcwsTotal) ? 0 : (curBcwpTotal - curBcwsTotal);
                    var CurrCV = _.isNaN(curBcwpTotal - curAcwpTotal) ? 0 : (curBcwpTotal - curAcwpTotal);
                    var sv = _.isNaN(bcwpTotal - bcwsTotal) ? 0 : (bcwpTotal - bcwsTotal);
                    var cv = _.isNaN(bcwpTotal - acwpTotal) ? 0 : (bcwpTotal - acwpTotal);

                    total.sv = sv;
                    total.cv = cv;
                    total.CurrSV = CurrSV;
                    total.CurrCV = CurrCV;
                }
                console.log(total);
                amounts = total;


            }
            var findIndex = '';
            findIndex = _.findIndex(hier, {ParentObjNum : v.ObjectNumber});
            console.log('Find Index '+findIndex);
            if(findIndex  != -1){
                var typeCheck = 0;
            } else {
                typeCheck = 1;
            }
            cost.push({
                'ParentObjNum': v.ParentObjNum,
                'ObjectNumber': v.ObjectNumber,
                'ExtID': v.ExtID,
                'Type': v.Type,
                'Description': v.Description,
                'SortOrder': v.SortOrder,
                'bcwsCost': amounts.bcwsTotal,
                'totals': amounts,
                'isChild': typeCheck
            });

        });//end of each loop
        _.each(cost, function (value, index) {
            if (index != 0) {
                var indexof = _.findIndex(cost, function (search) {
                    return search.ObjectNumber === value.ParentObjNum
                });

                if (indexof != -1 && (indexof != 0)) {
                    //sub = (value.totals.curBcwsTotal - value.totals.curbcwsOH) - value.totals.curbcwsCOM,
                    cost[indexof].totals.bcwsTotal += parseFloat(value.totals.bcwsTotal);
                    cost[indexof].totals.bcwpTotal += parseFloat(value.totals.bcwpTotal);
                    cost[indexof].totals.acwpTotal += parseFloat(value.totals.acwpTotal);
                    cost[indexof].totals.eacTotal += parseFloat(value.totals.eacTotal);
                    cost[indexof].totals.curBcwsTotal += parseFloat(value.totals.curBcwsTotal);
                    cost[indexof].totals.curBcwpTotal += parseFloat(value.totals.curBcwpTotal);
                    cost[indexof].totals.curAcwpTotal += parseFloat(value.totals.curAcwpTotal);
                    cost[indexof].totals.curEacTotal += parseFloat(value.totals.curEacTotal);
                    cost[indexof].totals.eacCum += parseFloat(value.totals.eacCum);
                    cost[indexof].totals.bac += parseFloat(value.totals.bac);
                    cost[indexof].totals.sv += parseFloat(value.totals.sv);
                    cost[indexof].totals.cv += parseFloat(value.totals.cv);
                    cost[indexof].totals.CurrSV += parseFloat(value.totals.CurrSV);
                    cost[indexof].totals.CurrCV += parseFloat(value.totals.CurrCV);
                    cost[indexof].totals.vac += parseFloat(value.totals.vac);
                    cost[indexof].totals.ETC_CPI += parseFloat(value.totals.ETC_CPI);

                    var roundbcwsTotal = cost[indexof].totals.bcwsTotal;
                    var roundbcwpTotal = cost[indexof].totals.bcwpTotal;
                    var roundacwpTotal = cost[indexof].totals.acwpTotal;
                    var curBcwsTotal = cost[indexof].totals.curBcwsTotal;
                    var curBcwpTotal = cost[indexof].totals.curBcwpTotal;
                    var curAcwpTotal = cost[indexof].totals.curAcwpTotal;

                    var spiTotal = (roundbcwpTotal / roundbcwsTotal),
                        cpiTotal = (roundbcwpTotal / roundacwpTotal),
                        curSPITotal = (curBcwpTotal / curBcwsTotal),
                        curCPITotal = (curBcwpTotal / curAcwpTotal);
                    spiTotal = _.isNaN(spiTotal) ? 0 : spiTotal;
                    cpiTotal = _.isNaN(cpiTotal) ? 0 : cpiTotal;
                    curSPITotal = _.isNaN(curSPITotal) ? 0 : curSPITotal;
                    curCPITotal = _.isNaN(curCPITotal) ? 0 : curCPITotal;
                    cost[indexof].totals.spi = App.Math.ceil10(spiTotal, -2);
                    cost[indexof].totals.cpi = App.Math.ceil10(cpiTotal, -3);
                    cost[indexof].totals.curSPI = App.Math.ceil10(curSPITotal, -2);
                    cost[indexof].totals.curCPI = App.Math.ceil10(curCPITotal, -3);

                    spiColour = App.ragSpi(spiTotal);
                    cpiColour = App.ragCpi(cpiTotal);
                    curSPIColour = App.ragSpi(curSPITotal);
                    curCPIColour = App.ragCpi(curCPITotal);
                    cost[indexof].totals.spiColour = spiColour;
                    cost[indexof].totals.cpiColour = cpiColour;

                    cost[indexof].totals.curSPIColour = curSPIColour;
                    cost[indexof].totals.curCPIColour = curCPIColour;
                }
            }
        });

        _.each(cost, function (value, index) {
            _.each(value.totals, function (item, i) {
                if (_.isNumber(item)) {
                    if (i === 'spi' || i === 'cpi' || i === 'curSPI' || i === 'curCPI')return;
                    cost[index].totals[i] = item.toFixed(0);
                    //console.log(i+' ' +item);
                }
            });

        });

        hierarchy = $.grep(cost, function (item, i) {
            return item.checkRemove != true;
        });

        _.first(hierarchy).com = com;
        console.log(hierarchy[0].com);
        console.timeEnd('Format One Totals');
        return hierarchy;
    };

    App.formatThreeTotals = function (totals, chartData, rawData) {
        var rawSortedDate = _.sortBy(rawData, 'Date');
        if (_.isUndefined(totals)) {
            var total = undefined;
        } else {
            total = App.convertArraytoObject(totals);
        }
        var array = [],
            start = moment(_.first(rawSortedDate).Date).format('YYYY/MM'),
            end = moment(_.last(rawSortedDate).Date).format('YYYY/MM'),
            bcwsHrRate = parseFloat(total.bcwsTotal) / parseFloat(total.bcwsHrs),
            bcwpHrRate = parseFloat(total.bcwpTotal) / parseFloat(total.bcwpHrs),
            eacHrRate = parseFloat(total.eacTotal) / parseFloat(total.eacHrs),
            acwpHrRate = parseFloat(total.acwpTotal) / parseFloat(total.acwpHrs);
        array.push({
            "start": start,
            "end": end,
            "bcwsTotal": bcwsHrRate.toFixed(2) + ' Hourly Rate',
            "bcwsHrs": total.bcwsHrs.toFixed(2),
            "bcwpTotal": bcwpHrRate.toFixed(2) + ' Hourly Rate',
            "bcwpHrs": total.bcwpHrs.toFixed(2),
            "eacTotal": eacHrRate.toFixed(2) + ' Hourly Rate',
            "eacHrs": total.eacHrs.toFixed(2),
            "acwpTotal": acwpHrRate.toFixed(2) + ' Hourly Rate',
            "acwpHrs": total.acwpHrs.toFixed(2),
            "eacCum": total.eacCum.toFixed(2),
            "bac": total.bac.toFixed(2)
        });
        return array[0];
    };

    App.formatFourTotals = function (costs) {
        var master = [],
            year = '',
            monthTitle = '',
            month = '';
        if (_.isArray(costs)) {
            var length = Number(costs.length);
            console.time('formatFourTotals loop');
            console.log('costs length ' + length);
            var beginDate = moment(costs[0].Date).format('YY');
            console.log('beginDate ' + beginDate);
            var BCWS = $.grep(costs, function (item) {
                if (item.Type === 'BCWS') {
                    return item;
                }
            });
            var BCWP = $.grep(costs, function (item) {
                if (item.Type === 'BCWP') {
                    return item;
                }
            });
            var EAC = $.grep(costs, function (item) {
                if (item.Type === 'EAC') {
                    return item;
                }
            });
            var ACWP = $.grep(costs, function (item) {
                if (item.Type === 'ACWP') {
                    return item;
                }
            });
            console.time('BCWS loop');
            console.log('BCWS len ' + BCWS.length);
            $.each(BCWS, function (ka, va) {
                year = moment(va.Date).format('YY');
                month = moment(va.Date).format('M');
                monthTitle = moment(va.Date).format('MMM');
                if (_.isUndefined(master[year])) {
                    master[year] = {};
                }
                if (!_.has(master[year], 'bcws')) {
                    master[year].bcws = [];
                    master[year].bcws[month] = {};
                }
                if (_.has(master[year].bcws[month], 'Quantity')) {
                    master[year].bcws[month].Quantity += parseFloat(va.QuantityBCWS);
                    master[year].bcws[month].Total += parseFloat(va.BCWS);
                } else {
                    master[year].bcws[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(va.QuantityBCWS, -2),
                        "Total": App.Math.ceil10(va.BCWS, -2)
                    };
                }
            });
            console.timeEnd('BCWS loop');
            console.time('BCWP loop');
            console.log('BCWP len ' + BCWP.length);
            $.each(BCWP, function (kb, vb) {
                year = moment(vb.Date).format('YY');
                month = moment(vb.Date).format('M');
                monthTitle = moment(vb.Date).format('MMM');
                if (_.isUndefined(master[year])) {
                    master[year] = {};
                }
                if (!_.has(master[year], 'bcwp')) {
                    master[year].bcwp = [];
                    master[year].bcwp[month] = {};
                }
                if (_.has(master[year].bcwp[month], 'Quantity')) {
                    master[year].bcwp[month].Quantity += parseFloat(vb.QuantityBCWP);
                    master[year].bcwp[month].Total += parseFloat(vb.BCWP);
                } else {
                    master[year].bcwp[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(vb.QuantityBCWP, -2),
                        "Total": App.Math.ceil10(vb.BCWP, -2)
                    };
                }
            });
            console.timeEnd('BCWP loop');
            console.time('EAC loop');
            console.log('EAC len ' + EAC.length);
            $.each(EAC, function (kc, vc) {
                year = moment(vc.Date).format('YY');
                month = moment(vc.Date).format('M');
                monthTitle = moment(vc.Date).format('MMM');
                if (_.isUndefined(master[year])) {
                    master[year] = {};
                }
                if (!_.has(master[year], 'eac')) {
                    master[year].eac = [];
                    master[year].eac[month] = {};
                }
                if (_.has(master[year].eac[month], 'Quantity')) {
                    master[year].eac[month].Quantity += parseFloat(vc.QuantityEAC);
                    master[year].eac[month].Total += parseFloat(vc.EAC);
                } else {
                    //  console.log('hit else');
                    master[year].eac[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(vc.QuantityEAC, -2),
                        "Total": App.Math.ceil10(vc.EAC, -2)
                    };
                }
            });
            console.timeEnd('EAC loop');
            console.time('ACWP loop');
            console.log('ACWP len ' + ACWP.length);
            $.each(ACWP, function (kd, vd) {
                year = moment(vd.Date).format('YY');
                month = moment(vd.Date).format('M');
                monthTitle = moment(vd.Date).format('MMM');
                if (_.isUndefined(master[year])) {
                    master[year] = {};
                }
                if (!_.has(master[year], 'acwp')) {
                    master[year].acwp = [];
                    master[year].acwp[month] = {};
                }
                if (_.has(master[year].acwp[month], 'Quantity')) {
                    master[year].acwp[month].Quantity += parseFloat(vd.QuantityACWP);
                    master[year].acwp[month].Total += parseFloat(vd.ACWP);
                } else {
                    master[year].acwp[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(vd.QuantityACWP, -2),
                        "Total": App.Math.ceil10(vd.ACWP, -2)
                    };
                }
            });
            console.timeEnd('ACWP loop');
        }
        console.timeEnd('formatFourTotals loop');
        return master;
    };

    App.formatFiveTotals = function (totals, gauges) {
        if (_.isUndefined(totals) || _.isUndefined(gauges)) {
            var total = undefined;
            var gauge = undefined;
            console.log('missing data for formatFiveTotals');
            return;
        } else {
            total = App.convertArraytoObject(totals);
            gauge = App.convertArraytoObject(gauges);
        }
        var spi = gauge.spi,
            cpi = gauge.cpi,
            curSPI = gauge.curSPI,
            curCPI = gauge.curCPI,
            spiColour = App.ragSpi(spi),
            cpiColour = App.ragCpi(cpi),
            curSPIColour = App.ragSpi(curSPI),
            curCPIColour = App.ragCpi(curCPI);
        console.info('Info! curCPIColour', curCPIColour);
        console.info('Info! curSPIColour', curSPIColour);
        var amounts = {
            "bcwsTotal": total.bcwsTotal,
            "curBcwsTotal": total.curBcwsTotal,
            "bcwpTotal": total.bcwpTotal,
            "curBcwpTotal": total.curBcwpTotal,
            "eacTotal": total.eacTotal,
            "curEacTotal": total.curEacTotal,
            "acwpTotal": total.acwpTotal,
            "curAcwpTotal": total.curAcwpTotal,
            "eacCum": total.eacCum,
            "bac": total.bac,
            "tcpi": total.tcpi,
            "sv": total.sv,
            "cv": total.cv,
            "CurrSV": total.CurrSV,
            "CurrCV": total.CurrCV,
            "vac": total.vac,
            "curSPI": curSPI,
            "curCPI": curCPI,
            "spi": spi,
            "cpi": cpi,
            "ETC_CPI": total.ETC_CPI,
            "spiColour": spiColour,
            "cpiColour": cpiColour,
            "curSPIColour": curSPIColour,//"#009933"
            "curCPIColour": curCPIColour
        };

        _.each(amounts,function(value, i){
            if (_.isNumber(value)) {
                if (i === 'spi' || i === 'cpi' || i === 'curSPI' || i === 'curCPI')return;
                amounts[i] = value.toFixed(0);
                //console.log(i+' ' +item);
            }
      });
        return amounts;
    };

    App.ExportTable = function (selector, DocName, fileName) {
        $(selector).table2excel({
            exclude: ".hide",
            name: DocName,
            filename: fileName
        });
    };

    App.addSpinner = function (selector, boolean) {
        if (boolean === false) {
            $(selector).find('.spinnerAdded').children().eq(0).unwrap();
            return;
        }
        $(selector).children().eq(0).wrap('<div></div>').parent().addClass('spinnerAdded');
    };

    /** New Function Spinner 072815**/
    App.SpinnerTpl = function (html, boolean) {
        var placeOnDom = $('#loadSpinner');
        if (boolean) {
            var loadingTpl = html;
            placeOnDom.removeClass('displayNone').html(loadingTpl).fadeIn('slow');
            return;
        } else {
            //setTimeout(function () {
            placeOnDom.addClass('displayNone').fadeOut('slow').empty();
            // }, 1000);
        }
    };

    App.displayTotals = function (data, name) {
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

    App.showProgress = function (boolean) {
        var loadingTree = $(document).find(".treelist-loading");
        var loadingGauges = $(document).find(".gauge-loading");
        var loadingChart = $(document).find(".chart-loading");
        kendo.ui.progress(loadingTree, boolean);
        kendo.ui.progress(loadingGauges, boolean);
        kendo.ui.progress(loadingChart, boolean);
    };

    App.allNodes = function (currentNode, arr) {
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
                        return App.allNodes($next, compile);
                    }
                }
            }
        } else {
            if ($check) {
                console.log($next.length);
                if ($next.length == 0) {
                } else {
                    return App.allNodes($next, compile);
                }
            }
        }
        return compile;
    };

    App.createTooltip = function (data) {
        var spi = Number(data[0].spi);
        var cpi = Number(data[1].cpi);

        $("#rgauge").kendoTooltip({content: 'CPI - ' + cpi});
        $("#lgauge").kendoTooltip({content: 'SPI - ' + spi});
    };

    App.createGauge = function (data) {
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
                        to: 0.9,
                        color: "#FF0000"//red
                    },
                    {

                        from: 0.9,
                        to: 0.95,
                        color: "#FF9933"//amber
                    },
                    {
                        from: 0.95,
                        to: 1.2,
                        color: "#009933"//green
                    },
                    {
                        from: 1.2,
                        to: 2,
                        color: "#0066CC"//blue
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
                max: 3,
                labels: {
                    position: "outside"
                },
                ranges: [
                    {
                        from: 0,
                        to: 0.9,
                        color: "#FF0000"//red
                    },
                    {
                        from: 0.9,
                        to: 0.95,
                        color: "#FF9933"//amber
                    },
                    {
                        from: 0.95,
                        to: 1.2,
                        color: "#009933"//green
                    },
                    {
                        from: 1.2,
                        to: 3,
                        color: "#0066CC"//blue
                    }
                ]
            }

        });
    };

    App.createSplitters = function () {
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
                {collapsible: true, size: "75%"},
                {scrollable: false}
            ]
        });
    };

    App.createSplittersFT = function () {
        $("#vertical").kendoSplitter({
            orientation: "vertical",
            panes: [
                {collapsible: false, resizable: false, size: "34px"},
                {collapsible: false, resizable: false}
            ]
        });

        $("#horizontal").kendoSplitter({
            panes: [
                {collapsible: true, size: "275px"},
                {collapsible: true},
                {scrollable: true}
            ]
        });
    };

    App.refreshChart = function () {
        var chart = $("#chart").data("kendoChart"),
            series = '',
            ValueAxis = '',
            type = $("input[name=seriesType]:checked").val();
        //stack = $("#stack").prop("checked");
        if (type === 'combo') {
            series = App.seriesCombo;
            ValueAxis = [{
                name: "Cumulative",
                title: {text: "[Cum.]"},
                color: "#ec5e0a"
            },
                {
                    labels: {
                        format: "\u00a3{0}"
                    }
                }];
        } else {
            ValueAxis = [{
                //reverse: reverse,
                /** title: {
                        text: ' Total'
                    },**/
                labels: {
                    format: "\u00a3{0}"
                }
            }];
            series = App.series;
            for (var i = 0, length = series.length; i < length; i++) {
                //series[i].stack = stack;
                series[i].type = type;
            }
        }
        chart.setOptions({
            valueAxes: ValueAxis,
            series: series
        });
    };

    App.refreshHierarchy = function () {
        var chart = $("#treelist").data("kendoChart"),
            series = '',
            ValueAxis = '',
            type = $("input[name=seriesType]:checked").val();
        //stack = $("#stack").prop("checked");
        if (type === 'combo') {
            series = App.seriesCombo;
            ValueAxis = [{
                name: "Cumulative",
                title: {text: "[Cum.]"},
                color: "#ec5e0a"
            },
                {
                    name: "Total",
                    title: {text: ' Total'}
                }];
        } else {
            ValueAxis = [{
                title: {text: ' Total'}
            }];
            series = App.series;
            for (var i = 0, length = series.length; i < length; i++) {
                //series[i].stack = stack;
                series[i].type = type;
            }
        }
        chart.setOptions({
            valueAxes: ValueAxis,
            series: series
        });
    };

    App.tdHover = function (e) {
        /**nested inside getReport func**/
        e.preventDefault();
        if ($(e.currentTarget).hasClass('no-paint')) {
            return;
        }
        if ($(e.currentTarget).hasClass('over')) {
            $(e.currentTarget).removeClass('over');
        } else {
            $(e.currentTarget).addClass('over');
        }
    };

    App.hierEvent = function (selector) {
        /*********** New Hierarchy Button View Click Event ***************/
        selector.on('click', 'tr span.js-hier', function (e) {
            e.preventDefault();
            $('.noData').remove();
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


            $target.closest('tr').siblings().removeClass('k-state-selected');
            if ($target.hasClass('animated')) {
                $target.removeClass('fadeIn');
            }
            $target.closest('tr').addClass('k-state-selected');

            console.log($rowIndex);
            chartdata = $chartGraph.dataSource.options.data;
            /**Change Title**/
            //var extId = $treeList.dataSource.options.data[$rowIndex].ExtID;
            //var description = $treeList.dataSource.options.data[$rowIndex].Description;
            //$(document).find('.gaugeHeading').text(extId+'  '+description);
            //$(document).find('.gaugeHeading').text(description);
            /** end title change **/
            switch ($rowIndex) {
                case 0:
                    //  case 1:
                    chartFiltered = App.FilterChartData(chartdata);
                    break;
                default:
                    if ($children) {
                        var allChildIndexes = App.allNodes($($trParent), collectIndexes);
                        // console.log(JSON.stringify(allChildIndexes));
                        var Indexes = _.without(allChildIndexes, -1);
                        // console.log(JSON.stringify(Indexes));
                        $.each(Indexes, function (key, value) {//[data-children="false"]
                            filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[value].ObjectNumber});
                        });
                        // console.log('multiple ' + JSON.stringify(filteredSnapByIndex));
                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = App.FilterChartData(filteredSnapByParentId);
                    } else {
                        filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[$rowIndex].ObjectNumber});
                        // console.log('single ' + JSON.stringify(filteredSnapByIndex));
                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = App.FilterChartData(filteredSnapByParentId);
                    }
                    break;
            }
            if (!_.isUndefined(chartFiltered)) {
                var chartFilteredByParentId = _.flatten(chartFiltered.graph);
                console.log(chartFilteredByParentId.length);
                $chartGraph.dataSource.data(chartFilteredByParentId);
                App.refreshChart();

                $target.addClass('animated fadeIn').css('color', 'black');
            } else {
                $chartGraph.dataSource.data([]);
                App.refreshChart();
                $('<div class="noData"><p id="noDataMessage">No data available</p></div>').appendTo("#chart");
                $target.addClass('animated fadeIn').css('color', 'red');
            }
        });
    };

    /**********Added Initilized Hiearchy expaneded**********/
    App.expandTreeList = function (selector) {
        $(document).find(selector).data("kendoTreeList").expand(".k-treelist-group");
        // $(document).find(selector).data("kendoTreeList").expand(".k-alt");
    };

    /** New Function projectData 072815**/
    App.projectData = function () {
        var projectSource = $.ajax({
            url: this.serviceRoot + this.urlProjectSet,
            //url: "./assets/js/temp.json",
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            //   projectSource = response.d.results[0];
            //   console.log(projectSource);
        }).error(function (err) {
            alert('error ' + err);
        }).done(function (response) {
            console.log('projectData complete ');
        });

        return projectSource;
    };

    /** New Function hierListData 072815**/
//urlHierarchyListSet
    App.HierarchyListSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlHierarchyListSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err);
        }).done(function () {
            console.log('HierarchyListSet complete ');
        });
        return Source;
    };

    App.HierarchySet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlHierarchySet,
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
    App.SnapshotListSet = function () {
        var rawData = $.ajax({
            url: this.serviceRoot + this.urlSnapshotListSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // rawData = response.d.results;
        }).error(function (err) {
            alert('error ' + err);
        }).done(function () {
            console.log('request complete: SnapshotListSet');
        });
        return rawData;
    };

    App.SnapshotSet = function () {
        var rawData = $.ajax({
            url: this.serviceRoot + this.urlSnapshotSet,
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

    App.VersionData = function () {
        var rawData = $.ajax({
            url: this.serviceRoot + this.urlVersionSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // rawData = response.d.results;
        }).error(function (err) {
            alert('error ' + err);
        }).done(function () {
            console.log('request complete: VersionData');
        });
        return rawData;
    };


    App.hierListInitialize = function (data) {
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
                                "ProjectSelection": value.ProjectSelection,
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
                }
            },
            //height: '250',
            resizable: true,
            //filterable: true,
            //sortable: true,
            scrollable: true,
            header: false,
            columns: [
                {
                    field: "Project Hierachy",
                    width: 150,
                    "template": kendo.template("<span data-children='#=data.hasChildren#' data-objectNumber='#=data.ObjectNumber#' class='js-hier'><div class='#=data.Type#'></div> #=data.Description#</span>")
                }/*,
                 {
                 field: "",
                 width: 100,
                 "template": kendo.template("<span data-children='#=data.hasChildren#' data-objectNumber='#=data.ObjectNumber#' class='js-hier'>#=data.ExtID# - #=data.Description#</span>")
                 }*/
            ]
        });

        $('table[role="treegrid"] tr:first').addClass('k-state-selected');
    };

    App.FilterByHierList = function (hierArray, data) {
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
        sendData = _.chain(addValues)
            .flatten(addValues)
            .value();
        return sendData;
    };

    App.decimalAdjust = function (type, value, exp) {
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

    App.Math = {};
// Decimal round
    App.Math.round10 = function (value, exp) {
        return App.decimalAdjust('round', value, exp);
    };

// Decimal floor
    App.Math.floor10 = function (value, exp) {
        return App.decimalAdjust('floor', value, exp);
    };

// Decimal ceil
    App.Math.ceil10 = function (value, exp) {
        return App.decimalAdjust('ceil', value, exp);
    };

    App.cpiSpiTrend = function (costs) {
        var master,
            spiTotal,
            cpiTotal;
        var bcws = _.chain(costs)
            .sortBy('Date')
            .where({"Type": "BCWS"})
            .value();

        var bcwp = _.chain(costs)
            .sortBy('Date')
            .where({"Type": "BCWP"})
            .value();

        var acwp = _.chain(costs)
            .sortBy('Date')
            .where({"Type": "ACWP"})
            .value();

        console.log("BCWS length " + bcws.length);
        console.log("BCWP length " + bcwp.length);
        console.log("ACWP length " + acwp.length);

        master = _.map(acwp, function (item, index) {
            if (!_.isUndefined(bcws[index]) || (!_.isEmpty(bcws[index]))) {
                var bcwsCost = bcws[index].IntValProjCurr;
            }
            if (!_.isUndefined(bcwp[index]) || (!_.isEmpty(bcwp[index]))) {
                var bcwpCost = bcwp[index].IntValProjCurr;
            }
            if (!_.isUndefined(acwp[index]) || (!_.isEmpty(acwp[index]))) {
                var acwpCost = acwp[index].IntValProjCurr;
            }
            //console.log(index+' bcwsCost '+bcwsCost+' bcwpCost '+bcwpCost+' acwpCost '+acwpCost);
            if (bcwsCost < 0) bcwsCost = 0;
            if (bcwpCost < 0) bcwpCost = 0;
            if (acwpCost < 0) acwpCost = 0;
            //  console.log(parseFloat(bcwp[index].IntValProjCurr).toFixed(2));
            spiTotal = (bcwpCost / bcwsCost);
            cpiTotal = (bcwpCost / acwpCost);
            if (index === 0 || index === acwp.length - 1) {
                return {"CPI": cpiTotal, "SPI": spiTotal, "Date": new Date(acwp[index].Date), "baseline": 1};
            }
            return {"CPI": cpiTotal, "SPI": spiTotal, "Date": new Date(acwp[index].Date)};
        });
        // console.log(master);
        return master;


    };


    App.VersionFilter = function (versions, results) {
        // console.log(versions);
        console.time('VersionFilter');
        var master = {};
        master.versions = [];
        master.category = [];
        master.array = '';
        var dateCheck = '';
        var dateCheckAfter = '';
        var data = results;

        if (_.isEmpty(data)) {
            console.log('No Data to filter series.');
            return {};//if empty data set - return empty object
        }
        if (data.length > 2) {
            master.array = _.reject(versions, function (num) {
                return num % 2 == 0;
            });//returns odds in the array
        } else {
            master.array = versions;
        }
        _.each(versions, function (item, index) {
            var verSelection = item.VersionSelection;
            master.versions[index] = {};
            master.versions[index]['Type'] = item.Type;
            master.versions[index]['VersionSelection'] = item.VersionSelection;
            master.versions[index]['Default'] = item.Default;
            master.versions[index]['Data'] = $.grep(data, function (value, index) {
                return value.Version === verSelection;

            });//filter data
        });
        //console.log('hit end of each');
        // console.log( master.versions);
        if (_.isArray(master.versions)) {
            // console.log('hit entry  '+ master.versions.length);
            _.each(master.versions, function (costs, index) {
                if (_.isEmpty(costs.Data)) return;
                var data = _.map(costs.Data,function (value) {
                    return {
                        "Quantity": value.Quantity,
                        "IntValProjCurr": value.IntValProjCurr,
                        "ExtValProjCurr": value.ExtValProjCurr,
                        "ObjectNumber": value.ObjectNumber,
                        "ProjectSelection": value.ProjectSelection,
                        "Version": value.Version,
                        "ValueType": value.ValueType,
                        "Date": value.Date,
                        "PeriodType": value.PeriodType,
                        "Overhead": value.Overhead,
                        "CostType": value.CostType,
                        "SnapshotDate": value.SnapshotDate
                    }
                });
                master.category.push({
                    "Version": costs.VersionSelection,
                    "Type": costs.Type,
                    "Default": costs.Default,
                    "data": data
                });//add array to master array
            });
        }
        console.timeEnd('VersionFilter');
        return master.category;

    };

    App.FilterData = function (version, raw, defaultVersion) {
        var master = {};
        master.graph = [];
        // master.totals = [];
        //  master.gauges = [];
        master.raw = {};
        console.log(defaultVersion);
        var dateCheck = '';
        var dateCheckBefore = '';
        var data = version;
        if (data.length === 0) {
            console.log('No Data to filter series.');
            return;
        }
        master.raw.ACWP = $.grep(raw, function (item) {
            if (item.Version === '000') {
                return item;
            }
        });//filter data
        _.each(data, function (value, index) {
            if (_.isEmpty(value))return;
            var costs = value.data;
            master[value.Version] = {};
            var obj = master[value.Version];

            obj.BCWS = '';
            obj.BCWP = '';
            obj.EAC = '';
            obj.ACWP = '';
            obj.ETC = '';
            if (!_.isEmpty(costs)) {

                if (value.Type === 'P' && value.Default === 'X') {// || index === 0
                    obj.BCWS = $.grep(costs, function (item) {
                        return item.ValueType === '01';
                    });//filter data
                    obj.BCWP = $.grep(costs, function (item) {
                        return item.ValueType === 'P2';
                    });//filter data


                    if (_.isArray(obj.BCWS) && (!_.isEmpty(obj.BCWS))) {
                        var BCWSdata = _.chain(obj.BCWS).sortBy("Date").map(function (value) {
                            //console.log(value);
                            /*dateCheck =  moment(value.Date).isSame(value.SnapshotDate);
                             dateCheckBefore =  moment(value.Date).isAfter(value.SnapshotDate);*/
                            return {
                                "BCWS": value.IntValProjCurr,
                                "Quantity": value.Quantity,
                                "IntValProjCurr": value.IntValProjCurr,
                                "ExtValProjCurr": value.ExtValProjCurr,
                                "ObjectNumber": value.ObjectNumber,
                                "Version": value.Version,
                                "ValueType": value.ValueType,
                                "Type": "BCWS",
                                "Date": value.Date,
                                "PeriodType": value.PeriodType,
                                "Overhead": value.Overhead,
                                "CostType": value.CostType,
                                "SnapshotDate": value.SnapshotDate
                            }
                        }).value();//convert IntValProjCurr key for Chart Series
                        master.graph.push(BCWSdata);//add array to master array
                    }

                    if (_.isArray(obj.BCWP) && (!_.isEmpty(obj.BCWP))) {
                        var runningTotalBCWP = 0;
                        var BCWPdata = _.chain(obj.BCWP).sortBy("Date").map(function (value) {
                            // runningTotalBCWP += parseFloat(value.IntValProjCurr);
                            /* dateCheck =  moment(value.Date).isSame(value.SnapshotDate);
                             dateCheckBefore =  moment(value.Date).isBefore(value.SnapshotDate);*/
                            return {
                                "BCWP": value.IntValProjCurr,
                                "Quantity": value.Quantity,
                                "IntValProjCurr": value.IntValProjCurr,
                                "ExtValProjCurr": value.ExtValProjCurr,
                                "ObjectNumber": value.ObjectNumber,
                                "Version": value.Version,
                                "ValueType": value.ValueType,
                                "Type": "BCWP",
                                "Date": value.Date,
                                "PeriodType": value.PeriodType,
                                "Overhead": value.Overhead,
                                "CostType": value.CostType,
                                "SnapshotDate": value.SnapshotDate
                            }
                        }).value();//convert IntValProjCurr key for Chart Series

                        master.graph.push(BCWPdata);//add array to master array
                    }


                }//type == p

                if (value.Type === 'E' && value.Default === 'X') {//|| index === 2
                    obj.EAC = $.grep(costs, function (item) {
                        return item;
                    });//filter data
                    obj.ACWP = $.grep(costs, function (item) {
                        //ValueType = 01 04
                        return item.ValueType === '04';
                    });//filter data
                    obj.ACWP = _.isEmpty(obj.ACWP) ? master.raw.ACWP : obj.ACWP;
                    obj.ETC = $.grep(costs, function (item) {
                        //ValueType = 01 04
                        return item.ValueType === '01';
                    });//filter data


                    if (_.isArray(obj.EAC) && (!_.isEmpty(obj.EAC))) {
                        var firstDate = _.chain(obj.EAC).sortBy('Date').first().value();
                        console.log(firstDate.Date);
                        var EACdata = _.chain(obj.EAC).sortBy("Date").map(function (value) {
                            return {
                                "EAC": value.IntValProjCurr,
                                "Quantity": value.Quantity,
                                "IntValProjCurr": value.IntValProjCurr,
                                "ExtValProjCurr": value.ExtValProjCurr,
                                "ObjectNumber": value.ObjectNumber,
                                "Version": value.Version,
                                "ValueType": value.ValueType,
                                "Type": "EAC",
                                "Date": value.Date,
                                "PeriodType": value.PeriodType,
                                "Overhead": value.Overhead,
                                "CostType": value.CostType,
                                "SnapshotDate": value.SnapshotDate
                            }
                        }).value(); //convert IntValProjCurr key for Chart Series
                        master.graph.push(EACdata);//add array to master array
                    }
                    if (_.isArray(obj.ACWP) && (!_.isEmpty(obj.ACWP))) {
                        var ACWPdata = _.chain(obj.ACWP).sortBy("Date").map(function (value) {
                            return {
                                "ACWP": value.IntValProjCurr,
                                "Quantity": value.Quantity,
                                "IntValProjCurr": value.IntValProjCurr,
                                "ExtValProjCurr": value.ExtValProjCurr,
                                "ObjectNumber": value.ObjectNumber,
                                "Version": value.Version,
                                "ValueType": value.ValueType,
                                "Type": "ACWP",
                                "Date": value.Date,
                                "PeriodType": value.PeriodType,
                                "Overhead": value.Overhead,
                                "CostType": value.CostType,
                                "SnapshotDate": value.SnapshotDate
                            }
                        }).value();//convert IntValProjCurr key for Chart Series

                        master.graph.push(ACWPdata);//add array to master array
                    }
                    if (_.isArray(obj.ETC) && (!_.isEmpty(obj.ETC))) {
                        var ETCdata = _.chain(obj.ETC).sortBy("Date").map(function (value) {
                            // dateCheck =  moment(value.Date).isBefore(value.SnapshotDate);
                            return {"ETC": value.IntValProjCurr};
                        });//not used for chart, just calculations

                    }


                }//type == e

            }

        });//end of each versions
        console.log(master);
        return master;

    };

    App.FilterChartData = function (results, type) {
        console.log(type);
        if(_.isUndefined(type)){
           var dataType = 'IntValProjCurr';
        }else{
            var dataType = type;
        }
        var master = {};
        master.graph = [];
        master.totals = [];
        master.gauges = [];
        var dateCheck = '';
        var dateCheckBefore = '';
        //console.log(results);
        var data = _.flatten(results);
        if (data.length === 0) {
            console.log('No Data to filter series.');
            return;
        }
        var BCWS = $.grep(data, function (item) {
            return item.Type === 'BCWS';
        });//filter data
        var BCWP = $.grep(data, function (item) {
            return item.Type === 'BCWP';
        });//filter data
        var EAC = $.grep(data, function (item) {
            return item.Type === 'EAC';
        });//filter data
        var ACWP = $.grep(data, function (item) {
            return item.Type === 'ACWP';
        });//filter data
        var ETC = $.grep(EAC, function (item) {
            if (item.ValueType === '01') {
                return item;
            }
        });//filter data
        var baseLine = $.grep(data, function (item) {
            if (item.Type === 'baseLine') {
                return item;
            }
        });//filter data
        master.graph.push(baseLine);//add array to master array

        var runningTotalBCWS = 0, bcwsTotal = 0, bcwsAll = 0, bcwsHrs = 0, curBcwsTotal = 0,
            curBcwsHrs = 0, bcwsCOM = 0, curbcwsCOM = 0, allbcwsCOM = 0,
            curbcwsGA = 0, bcwsGA = 0, allbcwsGA = 0, allbcwsOH = 0, bcwsOH = 0, curbcwsOH = 0;
        if (_.isArray(BCWS) && !_.isEmpty(BCWS)) {

            var BCWSdata = _.chain(BCWS).sortBy('Date').map(function (value) {
                //runningTotalBCWS += parseFloat(value.[dataType]);
                runningTotalBCWS += parseFloat(value[dataType]);
                bcwsAll += parseFloat(value[dataType]);
                bcwsHrs += parseFloat(value.Quantity);
                if (value.CostType === "COM") {
                    allbcwsCOM += parseFloat(value[dataType]);
                }
                if (value.CostType === "OH") {
                    allbcwsOH += parseFloat(value[dataType]);
                }
                if (value.CostType === "GA") {
                    allbcwsGA += parseFloat(value[dataType]);
                }

                if (value.PeriodType === "C" || value.PeriodType === "P") {
                    bcwsTotal += parseFloat(value[dataType]);

                    if (value.CostType === "GA") {
                        bcwsGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM") {
                        bcwsCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH") {
                        bcwsOH += parseFloat(value[dataType]);
                    }
                }
                //if(moment(value.Date).isBefore(value.SnapshotDate, 'day')){
                if (value.PeriodType == "C") {
                    curBcwsTotal += parseFloat(value[dataType]);
                    curBcwsHrs += parseFloat(value.Quantity);
                    if (value.CostType === "GA") {
                        curbcwsGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM") {
                        curbcwsCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH") {
                        curbcwsOH += parseFloat(value[dataType]);
                    }
                }
                return {
                    "BCWS": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "runningBCWS": runningTotalBCWS,
                    "runningHrsBCWS":bcwsAll,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "BCWS",
                    "Date": value.Date,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value();//convert IntValProjCurr key for Chart Series
            master.totals.push({
                "bcwsAll": (bcwsAll + allbcwsCOM),
                "bcwsTotal": (bcwsTotal - bcwsCOM),
                "bcwsHrs": bcwsHrs,
                "curBcwsTotal": (curBcwsTotal - curbcwsCOM),
                "curBcwsHrs": curBcwsHrs,
                "allbcwsCOM": allbcwsCOM,
                "bcwsCOM": bcwsCOM,
                "curbcwsCOM": curbcwsCOM,
                "allbcwsGA": allbcwsGA,
                "bcwsGA": bcwsGA,
                "curbcwsGA": curbcwsGA,
                "allbcwsOH": allbcwsOH,
                "bcwsOH": bcwsOH,
                "curbcwsOH": curbcwsOH
            });//
            master.graph.push(BCWSdata);//add array to master array
        } else {
            master.totals.push({"bcwsAll": 0.00, "bcwsTotal": 0.00, "bcwsHrs": 0.00, "curBcwsHrs": 0.00});//.toFixed(2)
        }

        var runningTotalBCWP = 0, bcwpTotal = 0, bcwpHrs = 0, curBcwpTotal = 0,
            curBcwpHrs = 0, bcwpCOM = 0, curbcwpCOM = 0, bcwpGA = 0, curbcwpGA = 0, bcwpOH = 0, curbcwpOH = 0;
        if (_.isArray(BCWP) && !_.isEmpty(BCWP)) {
            var BCWPdata = _.chain(BCWP).sortBy('Date').map(function (value) {
                runningTotalBCWP += parseFloat(value.IntValProjCurr);
                if (value.PeriodType === "C" || value.PeriodType === "P") {
                    bcwpTotal += parseFloat(value[dataType]);
                    bcwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "COM") {
                        bcwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH") {
                        bcwpOH += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "GA") {
                        bcwpGA += parseFloat(value[dataType]);
                    }
                }
                if (value.PeriodType === "C") {
                    curBcwpTotal += parseFloat(value[dataType]);
                    curBcwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "GA") {
                        curbcwpGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM") {
                        curbcwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH") {
                        curbcwpOH += parseFloat(value[dataType]);
                    }
                }
                return {
                    "BCWP": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "runningBCWP": runningTotalBCWP,
                    "runningHrsBCWP":bcwpHrs,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "BCWP",
                    "Date": value.Date,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value();//convert IntValProjCurr key for Chart Series

            master.totals.push({
                "bcwpTotal": App.Math.ceil10(bcwpTotal - bcwpCOM, -2),
                "bcwpHrs": App.Math.ceil10(bcwpHrs, -2),
                "curBcwpTotal": App.Math.ceil10(curBcwpTotal - curbcwpCOM, -2),
                "curBcwpHrs": App.Math.ceil10(curBcwpHrs, -2),
                "bcwpCOM": App.Math.ceil10(bcwpCOM, -2),
                "bcwpGA": App.Math.ceil10(bcwpGA, -2),
                "bcwpOH": App.Math.ceil10(bcwpOH, -2),
                "curbcwpCOM": App.Math.ceil10(curbcwpCOM, -2),
                "curbcwpGA": App.Math.ceil10(curbcwpGA, -2),
                "curbcwpOH": App.Math.ceil10(curbcwpOH, -2)
            });//.toFixed(2)
            master.graph.push(BCWPdata);//add array to master array
        } else {
            master.totals.push({"bcwpTotal": 0.00, "bcwpHrs": 0.00, "curBcwpTotal": 0.00, "curBcwpHrs": 0.00});//.toFixed(2)
        }

        var runningTotalACWP = 0, acwpTotal = 0, acwpHrs = 0, curAcwpTotal = 0,
            curAcwpHrs = 0, acwpCOM = 0, curacwpCOM = 0, acwpGA = 0, curacwpGA = 0, acwpOH = 0, curacwpOH = 0;
        if (_.isArray(ACWP) && !_.isEmpty(ACWP)) {

            var ACWPdata = _.chain(ACWP).sortBy('Date').map(function (value) {
                runningTotalACWP += parseFloat(value[dataType]);
                if (value.PeriodType === "C" || value.PeriodType === "P") {
                    acwpTotal += parseFloat(value[dataType]);
                    acwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "COM") {
                        acwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH") {
                        acwpOH += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "GA") {
                        acwpGA += parseFloat(value[dataType]);
                    }
                }
                if (value.PeriodType === "C") {
                    curAcwpTotal += parseFloat(value[dataType]);
                    curAcwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "GA") {
                        curacwpGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM") {
                        curacwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH") {
                        curacwpOH += parseFloat(value[dataType]);
                    }
                }
                return {
                    "ACWP": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "runningACWP": runningTotalACWP,
                    "runningHrsACWP":acwpHrs,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "ACWP",
                    "Date": value.Date,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value();//convert IntValProjCurr key for Chart Series
            master.totals.push({
                "acwpTotal": App.Math.ceil10(acwpTotal - acwpOH, -2),
                "acwpHrs": App.Math.ceil10(acwpHrs, -2),
                "curAcwpTotal": App.Math.ceil10(curAcwpTotal - curacwpCOM, -2),
                "curAcwpHrs": App.Math.ceil10(curAcwpHrs, -2),
                "acwpCOM": App.Math.ceil10(acwpCOM, -2),
                "acwpGA": App.Math.ceil10(acwpGA, -2),
                "acwpOH": App.Math.ceil10(acwpOH, -2),
                "curacwpCOM": App.Math.ceil10(curacwpCOM, -2),
                "curacwpGA": App.Math.ceil10(curacwpGA, -2),
                "curacwpOH": App.Math.ceil10(curacwpOH, -2)
            });
            master.graph.push(ACWPdata);//add array to master array
        } else {
            master.totals.push({"acwpTotal": 0.00, "acwpHrs": 0.00, "curAcwpTotal": 0.00, "curAcwpHrs": 0.00});//.toFixed(2)
        }

        var runningTotalEAC = 0, eacTotal = 0, eacHrs = 0, eacCOM = 0, eacGA = 0, eacOH = 0;
        if (_.isArray(EAC) && !_.isEmpty(EAC)) {
            var firstDate = _.chain(EAC).sortBy('Date').first().value();
            var len = EAC.length, editedbaseLine = [];
            console.log('EAC First Date '+firstDate.Date);
            var EACdata = _.chain(EAC).sortBy('Date').map(function (value, index) {
                runningTotalEAC += parseFloat(value[dataType]);
                eacTotal += parseFloat(value[dataType]);
                eacHrs += parseFloat(value.Quantity);
                if (value.CostType === "COM") {
                    eacCOM += parseFloat(value[dataType]);
                }
                if (value.CostType === "GA") {
                    eacGA += parseFloat(value[dataType]);
                }
                if (value.CostType === "OH") {
                    eacOH += parseFloat(value[dataType]);
                }
                if (index === 0) {
                    // console.log(key + '--------' +value.Date);
                    editedbaseLine.push({
                        "Date": firstDate.Date,
                        "baseLine": 0,
                        "Type": "baseline"
                    });
                }
                if (len - 1 === index) {
                    //  console.log(key + '--------' + value.Date);
                    editedbaseLine.push({
                        "Date": value.Date,
                        "baseLine": eacTotal,
                        "Type": "baseline"
                    });
                }
                return {
                    "EAC": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "runningEAC": runningTotalEAC,
                    "runningHrsEAC":eacHrs,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "EAC",
                    "Date": value.Date,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value(); //convert IntValProjCurr key for Chart Series
            master.graph.push(EACdata);//add array to master array
            master.graph.push(editedbaseLine);//add array to master array

            master.totals.push({
                "eacTotal": App.Math.ceil10(eacTotal - eacCOM, -2),
                "eacHrs": App.Math.ceil10(eacHrs, -2),
                "eacCOM": App.Math.ceil10(eacCOM, -2),
                "eacGA": App.Math.ceil10(eacGA, -2),
                "eacOH": App.Math.ceil10(eacOH, -2)
            });//.toFixed(2)
        } else {
            master.totals.push({"eacTotal": 0.00, "eacHrs": 0.00, "eacCOM": 0.00, "eacOH": 0.00, "eacGA": 0.00});//.toFixed(2)
        }


        if (_.isArray(ETC) && !_.isEmpty(ETC)) {
            var etcTotal = 0;
            _.chain(ETC).sortBy('Date').each(function (value) {
                //var etccost = App.Math.ceil10(value.ETC, -2);
                if (value.PeriodType === "F" && value.Overhead === "") {
                    etcTotal += parseFloat(value[dataType]);
                }
                // dateCheck =  moment(value.Date).isBefore(value.SnapshotDate);
            });//not used for chart, just calculations
        }

        var roundbcwpTotal = App.Math.ceil10(bcwpTotal, -2),
            roundbcwsAll = App.Math.ceil10(bcwsAll, -2),
            roundbcwsTotal = App.Math.ceil10(bcwsTotal, -2),
            roundacwpTotal = App.Math.ceil10(acwpTotal, -2),


            roundbcwsCOM = App.Math.ceil10(bcwsCOM, -2),
            roundbcwpCOM = App.Math.ceil10(bcwpCOM, -2),
            roundacwpCOM = App.Math.ceil10(acwpCOM, -2),
            roundeacCOM = App.Math.ceil10(eacCOM, -2),

            roundCurbcwsCOM = App.Math.ceil10(curbcwsCOM, -2),
            roundCurbcwpCOM = App.Math.ceil10(curbcwpCOM, -2),
            roundCuracwpCOM = App.Math.ceil10(curacwpCOM, -2),

            roundbcwsOH = App.Math.ceil10(bcwsOH, -2),
            roundbcwpOH = App.Math.ceil10(bcwpOH, -2),
            roundacwpOH = App.Math.ceil10(acwpOH, -2),
            roundeacOH = App.Math.ceil10(eacOH, -2),

            roundCurbcwsOH = App.Math.ceil10(curbcwsOH, -2),
            roundCurbcwpOH = App.Math.ceil10(curbcwpOH, -2),
            roundCuracwpOH = App.Math.ceil10(curacwpOH, -2),

            roundbcwsGA = App.Math.ceil10(bcwsGA, -2),
            roundbcwpGA = App.Math.ceil10(bcwpGA, -2),
            roundacwpGA = App.Math.ceil10(acwpGA, -2),
            roundeacGA = App.Math.ceil10(eacGA, -2),

            roundCurbcwsGA = App.Math.ceil10(curbcwsGA, -2),
            roundCurbcwpGA = App.Math.ceil10(curbcwpGA, -2),
            roundCuracwpGA = App.Math.ceil10(curacwpGA, -2),

            roundcurBcwsTotal = App.Math.ceil10(curBcwsTotal, -2),
            roundcurBcwpTotal = App.Math.ceil10(curBcwpTotal, -2),
            roundcurAcwpTotal = App.Math.ceil10(curAcwpTotal, -2),
            roundetcTotal = App.Math.ceil10(eacTotal - eacCOM, -2);


        var eacCum = _.isNaN(roundacwpTotal + roundetcTotal) ? 0 : roundacwpTotal + roundetcTotal;
        // console.log(roundacwpTotal+' '+roundetcTotal+' '+(parseFloat(roundacwpTotal) + parseFloat(roundetcTotal)));
        master.totals.push({"eacCum": App.Math.ceil10(eacCum, -2)});

        var bacCalc = (roundbcwsAll - allbcwsCOM);
        var bac = App.Math.ceil10(bacCalc,-2);
        master.totals.push({"bac": bac});

        var bac_BCWP = _.isNaN(bac - roundbcwpTotal) ? 0 : bac - roundbcwpTotal;
        var eacCum_ACWP = _.isNaN(bac - roundacwpTotal) ? 0 : bac - roundacwpTotal;

        var tcpi = _.isNaN(bac_BCWP / eacCum_ACWP) ? 0 : bac_BCWP / eacCum_ACWP;
        master.totals.push({"tcpi": App.Math.ceil10(tcpi, -2)});

        var vac = _.isNaN(bac - roundetcTotal) ? 0 : bac - roundetcTotal;
        master.totals.push({"vac": App.Math.ceil10(vac, -2)});
        var vacOH = _.isNaN(allbcwsOH - eacOH) ? 0 : allbcwsOH - eacOH;
        master.totals.push({"vacOH": App.Math.ceil10(vacOH, -2)});
        var vacCOM = _.isNaN(allbcwsCOM - eacCOM) ? 0 : allbcwsCOM - eacCOM;
        master.totals.push({"vacCOM": App.Math.ceil10(vacCOM, -2)});
        var vacGA = _.isNaN(allbcwsGA - eacGA) ? 0 : allbcwsGA - eacGA;
        master.totals.push({"vacGA": App.Math.ceil10(vacGA, -2)});

        var CurrSV = _.isNaN(roundcurBcwpTotal - roundcurBcwsTotal) ? 0 : roundcurBcwpTotal - roundcurBcwsTotal;
        master.totals.push({"CurrSV": App.Math.ceil10(CurrSV, -2)});
        var CurrCV = _.isNaN(roundcurBcwpTotal - roundcurAcwpTotal) ? 0 : roundcurBcwpTotal - roundcurAcwpTotal;
        master.totals.push({"CurrCV": App.Math.ceil10(CurrCV, -2)});
        var sv = _.isNaN(bcwpTotal - bcwsTotal) ? 0 : bcwpTotal - bcwsTotal;
        master.totals.push({"sv": App.Math.ceil10(sv, -2)});
        var cv = _.isNaN(bcwpTotal - acwpTotal) ? 0 : bcwpTotal - acwpTotal;
        master.totals.push({"cv": App.Math.ceil10(cv, -2)});

        var svCom = _.isNaN(roundbcwpCOM - roundbcwsCOM) ? 0 : roundbcwpCOM - roundbcwsCOM;
        master.totals.push({"svCom": App.Math.ceil10(svCom, -2)});
        var cvCom = _.isNaN(roundbcwpCOM - roundacwpCOM) ? 0 : roundbcwpCOM - roundacwpCOM;
        master.totals.push({"cvCom": App.Math.ceil10(cvCom, -2)});
        var CurrSvCom = _.isNaN(roundCurbcwpCOM - roundCurbcwsCOM) ? 0 : roundCurbcwpCOM - roundCurbcwsCOM;
        master.totals.push({"CurrSvCom": App.Math.ceil10(CurrSvCom, -2)});
        var CurrCvCom = _.isNaN(roundCurbcwpCOM - roundCuracwpCOM) ? 0 : roundCurbcwpCOM - roundCuracwpCOM;
        master.totals.push({"CurrCvCom": App.Math.ceil10(CurrCvCom, -2)});

        var svOH = _.isNaN(roundbcwpOH - roundbcwsOH) ? 0 : roundbcwpOH - roundbcwsOH;
        master.totals.push({"svOH": App.Math.ceil10(svOH, -2)});
        var cvOH = _.isNaN(roundbcwpOH - roundacwpOH) ? 0 : roundbcwpOH - roundacwpOH;
        master.totals.push({"cvOH": App.Math.ceil10(cvOH, -2)});
        var CurrSvOH = _.isNaN(roundCurbcwpOH - roundCurbcwsOH) ? 0 : roundCurbcwpOH - roundCurbcwsOH;
        master.totals.push({"CurrSvOH": App.Math.ceil10(CurrSvOH, -2)});
        var CurrCvOH = _.isNaN(roundCurbcwpOH - roundCuracwpOH) ? 0 : roundCurbcwpOH - roundCuracwpOH;
        master.totals.push({"CurrCvOH": App.Math.ceil10(CurrCvOH, -2)});

        var svGA = _.isNaN(roundbcwpGA - roundbcwsGA) ? 0 : roundbcwpGA - roundbcwsGA;
        master.totals.push({"svGA": App.Math.ceil10(svGA, -2)});
        var cvGA = _.isNaN(roundbcwpOH - roundacwpGA) ? 0 : roundbcwpGA - roundacwpGA;
        master.totals.push({"cvGA": App.Math.ceil10(cvGA, -2)});
        var CurrSvGA = _.isNaN(roundCurbcwpGA - roundCurbcwsGA) ? 0 : roundCurbcwpGA - roundCurbcwsGA;
        master.totals.push({"CurrSvGA": App.Math.ceil10(CurrSvGA, -2)});
        var CurrCvGA = _.isNaN(roundCurbcwpOH - roundCuracwpGA) ? 0 : roundCurbcwpGA - roundCuracwpGA;
        master.totals.push({"CurrCvGA": App.Math.ceil10(CurrCvGA, -2)});

        var spiTotal = _.isNaN(roundbcwpTotal / roundbcwsTotal) ? 0 : (roundbcwpTotal / roundbcwsTotal),
            cpiTotal = _.isNaN(roundbcwpTotal / roundacwpTotal) ? 0 : (roundbcwpTotal / roundacwpTotal),
            curSPITotal = _.isNaN(curBcwpTotal / curBcwsTotal) ? 0 : (curBcwpTotal / curBcwsTotal),
            curCPITotal = _.isNaN(curBcwpTotal / curAcwpTotal) ? 0 : (curBcwpTotal / curAcwpTotal);
        // console.log('Before Check ' + App.Math.ceil10(spiTotal, -2) + '  ' + App.Math.ceil10(cpiTotal, -3));

        // console.log('After Check ' + App.Math.ceil10(spiTotal, -2) + '  ' + App.Math.ceil10(cpiTotal, -3));
        master.gauges.push({'spi': App.Math.ceil10(spiTotal, -2), 'curSPI': App.Math.ceil10(curSPITotal, -2)});//master.gauges[0].spi
        master.gauges.push({'cpi': App.Math.ceil10(cpiTotal, -3), 'curCPI': App.Math.ceil10(curCPITotal, -3)});//master.gauges[1].cpi

        var ETC_CPI = _.isNaN(App.Math.ceil10(cpiTotal, -3) / eacCum_ACWP) ? 0 : (App.Math.ceil10(cpiTotal, -3) / eacCum_ACWP);
        master.totals.push({"ETC_CPI": App.Math.ceil10(ETC_CPI, -2)});

        _.flatten(master.totals);
        _.flatten(master.graph);
        _.flatten(master.gauges);
        // console.log(master.totals);
        return master;
    };

    App.createSpiCpiChart = function (dataSource, series) {
        $("#chart").kendoChart({
            pdf: {
                fileName: "SnapShot Costs Export.pdf",
                proxyURL: this.serviceRoot + "/kendo-ui/service/export"
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
                highlight: {visible: false},
                markers: {
                    size: 5
                }
            },
            series: series,
            categoryAxis: {
                baseUnit: "fit",
                //title: { text: "Date" },
                field: "Date",
                labels: {
                    rotation: -60,
                    dateFormats: {
                        days: "M/YYYY"
                    }
                },
                autoBaseUnitSteps: {
                    months: [1]
                },
                //maxDateGroups: 45,
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
            valueAxis: [
                {
                    labels: {
                        format: "{0}"//\u00a3
                    }//title: {text: ' Total'},
                }
            ],
            tooltip: {
                visible: true,
                shared: true,
                template: "#= kendo.format('{0:C}',value) #"
            }
        });
    };

    App.createChart = function (dataSource, series, reverse) {
        $("#chart").kendoChart({
            pdf: {
                fileName: "SnapShot Costs Export.pdf",
                proxyURL: this.serviceRoot + "/kendo-ui/service/export"
            },
            dataSource: dataSource,
            chartArea: {
                // width: 200,
                //height: 475
            },
            legend: {
                position: "bottom",
                align: "center"
            },
            seriesDefaults: {
                type: "line",
                style: "smooth",
                highlight: {visible: false},
                markers: {
                    size: 5
                },
                tooltip: {
                    visible: true,
                    format: "({0:M-yy})"
                }
            },
            series: series,
            categoryAxis: {
                baseUnit: "fit",
                baseUnitStep: "auto",
                //title: { text: "Date" },
                field: "Date",
                labels: {
                    rotation: -60,
                    //format: "Year: {0}",
                    dateFormats: {
                        // months: "MMM-yy"
                        months: "M-yyyy"
                    }
                },
                autoBaseUnitSteps: {
                    days: [],
                    weeks: [],
                    years: []
                },
                maxDateGroups: 45,
                crosshair: {
                    tooltip: {
                        format: "{0:MM-yyyy}",
                        visible: false
                    },
                    visible: false
                },
                line: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                }
            },
            valueAxis: [
                {
                    reverse: reverse,
                    labels: {
                        format: "\u00a3{0}"
                    }//title: {text: ' Total'},
                }
            ],
            tooltip: {
                visible: true,
                shared: true,
                padding: 10,
                margin: 20,
                color: "black",
                background: "#FFFFFF",
                border: {
                    width: 2,
                    color: "black"
                },
                template: "#= kendo.format('{0:C}',value) #"
                // template: "#: value.x # - #: value.y # (#: value.size #)"
            }
        });
    };


    return App;
});