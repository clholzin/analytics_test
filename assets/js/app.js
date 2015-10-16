/**
 * Created by Craig on 7/14/2015.
 * Update by Tom on 7/27/2015
 */
define(['jquery', 'underscore', 'moment',
    'tpl!templates/home.html',
    'tpl!templates/analytics/projectAnalyticsFT.html',
    'tpl!templates/analytics/earnedSchedule.html',
    'tpl!templates/analytics/scheduleVAR.html',
    'tpl!templates/analytics/spa.html',
    'tpl!templates/analytics/spiCPI.html',
    'tpl!templates/footers/reportsFooter.html',
    'tpl!templates/footers/blankFooter.html',
    'tpl!templates/footers/analyticsFooterA.html',
    'tpl!templates/footers/analyticsFooterB.html',
    'tpl!templates/spinner.html',

    'tpl!templates/reports/cpr1.html',
    'tpl!templates/reports/cpr2.html',
    'tpl!templates/reports/cpr3.html',
    'tpl!templates/reports/cpr4.html',
    'tpl!templates/reports/cpr5.html',
    'tpl!templates/reports/cprTWBS.html',
    'tpl!templates/reports/cprTOBS.html',
    'tpl!templates/reports/foo.html', 'kendo', 'Blob', 'base64', 'jszip', 'FileSaver',
    'jquery.table2excel'], function ($, _, moment, homeTpl, projectAnalyticsFTTpl, earnedScheduleTpl, scheduleTpl, spaTpl, spiCPITpl,
                                     reportFooterTpl, blankFooterTpl, analyticsFooterATpl, analyticsFooterBTpl,
                                     spinnerTpl, cpr1, cpr2, cpr3, cpr4a, cpr4b, cpr5, cprTWBS, cprTOBS, fooTpl) {
    var App = App || {};
    App.projectID = "";
    App.HierarchySelectionID = '';
    App.SnapshotSelectionID = '';
    App.ChartType = '';
    App.SnapshotType = '';
    /**
     * CONSTANTS
     *
     * **/
    App.dataType = 'Quantity';
    App.periodsBack = 6;
    App.cpr3DHours = 'X';
    App.cpr3DExt = '';
    App.Math = {};
    var loadingWheel = spinnerTpl;
    var doc = $(document);
    var bkgChange = $('.bkgChange');
    moment.locale('en');
    App.tdColor = '#ede330';
    App.reportData = "/DSN/PMR_01_SRV";
    App.serviceRoot = window.location.protocol + '//' + window.location.host + '/pmr01srv' + App.reportData;
    App.urlProjectSet = "/ProjectSelectionSet?$format=json";
    //App.colorpicker = '';

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
            color: "#000000",
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
    App.seriesES = [{
        name: "ES",
        type: "column",
        field: "ES",
        categoryField: "Date",
        color: "#000099",
        markers: {type: "circle"}
    }];
    App.seriesSV = [{
        name: "SV",
        type: "column",
        field: "SV",
        categoryField: "Date",
        color: "#009933",
        markers: {type: "circle"}
    }];
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
        spiCpiChart: {},
        filtered: [],
        chartTotals: [],
        rawspiCpiChartdata: [],
        rawChartdata: [],
        gaugesData: [],
        project: {},
        hierarchy: [],
        hierarchySv: [],
        versions: [],
        versionSelection: '',
        hierarchyList: [],
        snapShotList: [],
        clearChartData: function () {
            this.chart = {};
            this.filtered = [];
            this.chartTotals = [];
            this.rawChartdata = [];
            this.gaugesData = [];
            this.project = {};
            this.hierarchy = [];

            //  this.hierarchyList = {};
            //this.snapShotList = [];
        },
        setData: function (Data, hData) {
            if (!_.isEmpty(Data) || !_.isUndefined(_.first(Data))) {
                this.rawChartdata = _.isArray(Data) ? _.first(Data).d.results : Data.d.results;
            }
            this.filtered = App.VersionFilter(this.versions, this.rawChartdata);
            ////console.log(this.filtered);
            var chartDataSource = App.FilterData(this.filtered, this.rawChartdata, this.versionSelection);
            var refined = App.FilterChartData(chartDataSource.graph, App.dataType);
            this.chart = App.AssignStore(refined.graph);
            this.chartTotals = refined.totals;
            this.gaugesData = refined.gauges;
            if (_.isEmpty(hData)) {
                this.hierarchy = [];
            } else {
                this.hierarchy = _.isArray(hData) ? _.first(hData).d.results : hData.d.results;
            }

        },
        setSpiCpiData: function (Data, hData) {
            if (_.isEmpty(Data)) {
                this.rawspiCpiChartdata = [];
            } else {
                this.rawspiCpiChartdata = _.isArray(Data) ? _.first(Data).d.results : Data.d.results;
            }

            var cpiSpiTrendData = App.cpiSpiTrend(this.rawspiCpiChartdata, App.dataType);
            this.spiCpiChart = App.AssignStore(cpiSpiTrendData);
            this.hierarchySv = _.isArray(hData) ? _.first(hData).d.results : hData.d.results;
        },
        clearSpiCpiData: function () {
            this.rawspiCpiChartdata = [];
            this.spiCpiChart = [];
            this.hierarchySv = [];
        },
    };

    App.State = {
        alternativeOption: '',
        defaultSelection: '',
        text: 'Toggle Hierarchy'
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

    App.parseHeaderDates = function(headerInfo) {
        headerInfo.ReportStartDate = moment(headerInfo.ReportStartDate).format('DD/MM/YYYY');
        headerInfo.ReportEndDate = moment(headerInfo.ReportEndDate).format('DD/MM/YYYY');
        return headerInfo;
    }

    /** This is the event now rolled into a function call for the event
     * Doing this way allows us to add and trigger the function independently of its event delegation
     * @param e
     */
    App.getAnalytics = function (e) {
        e.preventDefault();
        if (App.CheckProdId()) {
            return;
        }
        if(App.SnapshotType === ''){
            App.SnapshotType = 'W';
        }
        console.log('SnapshotType : '+App.SnapshotType);
        App.addSpinner(e.currentTarget);//bkg loading
        App.SpinnerTpl(loadingWheel, 1);
        var self = $(this),
            combineData = [],
            chartData = [],
            esData = [],
            svData = [],
            hier = '',
            ESData = '',
            SVData = '',
            hierData = [],
            vData = [],
            version = '',
            chartDataSource = '',
            tplId = '',tplFooter='',
            id = self.data('temp'),//Name of DIV
            name = self.data('name');//File Name to Export As
        /* this is to reset global dataType upon entry*/
        console.log(id);
        App.dataType = 'Quantity';
        App.setHierarchySelection(id.toUpperCase());
        var hierarchyListPromise = App.setHierarchyList(e);
        App.HierarchySelectionID = '';
        App.setProjectID();
        var promise = App.setSnapshotList(e);
        $.when(hierarchyListPromise,promise).done(function (l,p) {
            console.log('HierarchySelectionID Selection: ' + App.HierarchySelectionID);

            App.setDataSelection();
            /**GET REPORT TPL ON THE FLY**/
            var retrieveTpl = 'tpl!templates/analytics/' + id + '.html';
            requirejs([retrieveTpl], function (tempTpl) {
                tplId = tempTpl;
                switch (name) {
                    case 'projectAnalytics':
                        tplFooter = analyticsFooterATpl;
                        break;
                    default:
                        tplFooter = analyticsFooterBTpl;
                        break;
                }
                combineData[0] = App.ParseSnapShotDates(App.DataStore.snapShotList);
                combineData[1] = App.DataStore.hierarchyList;
                combineData[2] = App.DataStore.versions;
                App.Project(tplId, tplFooter, combineData);
                //$("#hChange").val(App.projectID);
                switch (name) {
                    case 'earnedSchedule':
                        App.createSplittersFT();
                        esData = App.ESSet();
                        hierData = App.HierarchySet();//always get hierarchy Data for now
                        $.when(hierData, esData).done(function (hData, eData) {
                            if (App.apiErrorHandler(e.currentTarget, loadingWheel, eData)) {
                                return;
                            }
                            hier = _.isArray(hData) ? _.first(hData).d.results : hData.d.results;
                            ESData = _.isArray(eData) ? _.first(eData).d.results : eData.d.results;
                            var filteredEs = App.ESfilter(ESData, App.dataType, hier);
                            // var dataStore = App.AssignStore(filteredEs);

                            App.createES_Chart(filteredEs, true, App.dataType);

                            App.analyticsTplConfig(self);
                            //_.debounce(App.expandTreeList(hierarchyList), 500);
                            _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                        });
                        break;
                    case 'scheduleVAR':
                        App.createSplittersFT();
                        App.setDataSelection();
                        svData = App.SVSet();
                        hierData = App.HierarchySet();//always get hierarchy Data for now
                        $.when(hierData, svData).done(function (hData, sData) {
                            if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                                return;
                            }
                            hier = _.isArray(hData) ? _.first(hData).d.results : hData.d.results;
                            SVData = _.isArray(sData) ? _.first(sData).d.results : sData.d.results;
                            var filteredSv = App.SVfilter(SVData, App.dataType, hier);
                            //var dataStoreSv = App.AssignStore(filteredSv);

                            App.createSV_Chart(filteredSv, false, App.dataType);

                            App.analyticsTplConfig(self);
                            //_.debounce(App.expandTreeList(hierarchyList), 500);
                            _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                        });
                        break;
                    case 'spiCPI':
                        App.createSplittersFT();
                        svData = App.SVSet();// get SnapShot Cost Data
                        hierData = App.HierarchySet();//get hierarchy Data
                        $.when(hierData, svData).done(function (hData, sData) {
                            if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                                return;
                            }
                            App.DataStore.setSpiCpiData(sData, hData);


                            App.hierListInitialize(App.DataStore.hierarchySv);
                            App.create_SPICPI_Chart(App.DataStore.spiCpiChart, App.CpiSpiSeries, false, App.dataType);

                            //var projectName = App.DataStore.hierarchySv[0].ExtID;
                            //$(document).bind("kendo:skinChange", App.create_SPICPI_Chart);
                            //$(".chart-type-chooser").bind("change", App.refreshChart);
                            var hierarchyList = $("div#treelist");
                            App.hierSpiCpiEvent(hierarchyList, App.dataType);//event for changing chart data
                            App.analyticsTplConfig(self);
                            $('#cpiSpiChange').val(App.HierarchySelectionID);
                            _.debounce(App.expandTreeList(hierarchyList), 500);
                            _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                        });
                        break;
                    case 'spa':
                        App.createSplittersFT();
                        if (_.isEmpty(App.DataStore.chart)) {
                            chartData = App.SnapshotSet();// get SnapShot Cost Data
                        }
                        hierData = App.HierarchySet();//get hierarchy Data
                        $.when(hierData, chartData).done(function (hData, cData) {

                            if (App.apiErrorHandler(e.currentTarget, loadingWheel, cData)) {
                                return;
                            }

                            if (!_.isEmpty(cData)) {
                                App.DataStore.setData(cData, hData);
                            } else {
                                App.DataStore.hierarchy = _.isArray(hData) ? _.first(hData).d.results : hData.d.results;
                            }

                            App.hierListInitialize(App.DataStore.hierarchy);
                            App.createChart(App.DataStore.chart, App.series, false, App.dataType);
                            //var projectName = App.DataStore.hierarchy[0].ExtID;
                            //$(document).bind("kendo:skinChange", App.createChart);
                            //$(".chart-type-chooser").bind("change", App.refreshChart);
                            var hierarchyList = $("div#treelist");
                            App.hierEvent(hierarchyList, App.dataType, false);//event for changing chart data
                            App.analyticsTplConfig(self);
                            $('#hChange').val(App.HierarchySelectionID);
                            _.debounce(App.expandTreeList(hierarchyList), 500);
                            _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                        });

                        break;
                    default:
                        console.log('hit default');
                        break;
                }
            });
        });//when hierarchy default found
    };

    /**
     *
     * @param e
     */
    App.getReports = function (e) {
        e.preventDefault();
        if (App.CheckProdId()) {
            return;
        }
        if(App.SnapshotType === ''){
            App.SnapshotType = 'M';
        }
        console.log('SnapshotType : '+App.SnapshotType);
        /* this is to reset global dataType upon entry*/
        ;
        App.addSpinner(e.currentTarget);//bkg loading
        App.SpinnerTpl(loadingWheel, 1);
        var combineData = [],
            self = $(e.currentTarget),
            id = self.data('temp'),
            sheet = self.data('sheet'),//Worksheet Name
            tplId = '', tplFooter = '',
            version = '', projectData = '', hierData = '', svData = '', cprHeaderData = '', cpr5Data = '', vData = '', hier = '', costs = '', chartData = '',
            totals = '', gauges = '', chartDataSource = '', currentVersion = [], chartTotals = '', trendData = '',LastSnap='',
            retrieveTpl = 'tpl!templates/reports/' + id + '.html';
        console.log(id);
        App.dataType = 'Quantity';//set or reset upon entry as default
        App.setHierarchySelection(id.toUpperCase());
        var hierarchyListPromise = App.setHierarchyList(e);
        App.HierarchySelectionID = '';
        App.setProjectID();
        var promise = App.setSnapshotList(e);
        $.when(hierarchyListPromise,promise).done(function (l,p) {

            console.log('HierarchySelection Selection: ' + App.HierarchySelectionID);
            //App.periodsBack = 6;reset to default incase trend report selected
            App.setDataSelection();//Set URLS for the blow requests

            requirejs([retrieveTpl], function (tempTpl) {
                /*********   Data Processing  *************/
                hierData = App.HierarchySet();//always get hierarchy Data for now
                projectData = App.projectData();//always get project Data for now
                if (_.isEmpty(App.DataStore.chart)) {
                    console.log('hit empty DataStore.chart request');
                    chartData = App.SnapshotSet();// get SnapShot Cost Data
                }
                $.when(projectData, hierData, chartData).done(function (pData, hData, cData) {//holds on for async data calls
                    /** Error handler **/
                    if (App.apiErrorHandler(self, loadingWheel, cData)) {
                        return;
                    }
                    /** Error handler **/
                    if (!_.isEmpty(cData)) {
                        App.DataStore.setData(cData, hData);//adds data to data store
                    }

                    App.DataStore.project = _.isArray(pData) ? _.first(pData).d.results : pData.d.results;
                    App.DataStore.hierarchy = _.isArray(hData) ? _.first(hData).d.results : hData.d.results;
                    hier = App.DataStore.hierarchy;
                    costs = App.DataStore.chart.options.data;
                    switch (sheet) {
                        case 'CPR-1':
                            console.log('hit 1');
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(cprHeaderData).done(function (cHData) {

                                // var data = App.FilterChartData(costs, App.dataType);
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, cHData)) {
                                    combineData[2] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[2] = App.parseHeaderDates(headerInfo);
                                }

                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');

                                $('#cprHierarchyToggle')
                                    .attr('data-hierarchy', App.State.alternativeOption)
                                    .attr('data-default', App.State.defaultSelection);

                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                            break;
                        case 'CPR-2':
                            console.log('hit 2');
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(cprHeaderData).done(function (cHData) {
                                combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                if (App.apiErrorHandler(self, loadingWheel, cHData)) {
                                    combineData[2] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[2] = App.parseHeaderDates(headerInfo);
                                }
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                $('#cprHierarchyToggle')
                                    .attr('data-hierarchy', App.State.alternativeOption)
                                    .attr('data-default', App.State.defaultSelection);
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                            break;
                        case 'CPR-3':
                            console.log('hit 3');
                            var cpr3Data = App.CPR3DetailSet();
                            cprHeaderData = App.CPRHeaderSet();
                            var savedDefaultSnapShot = App.SnapshotSelectionID;
                            App.SnapshotSelectionID = App.DataStore.snapShotList[1].SnapshotSelection;
                            App.setDataSelection();
                            var lastSnapShot = App.SnapshotSet();
                            $.when(cpr3Data, cprHeaderData, lastSnapShot).done(function (threeData, cHData, lastSnap) {
                                if (App.apiErrorHandler(self, loadingWheel, lastSnap)) {
                                    LastDataSource = {"graph":[]};
                                }else{
                                    LastSnap = _.isArray(lastSnap) ? _.first(lastSnap).d.results : lastSnap.d.results
                                var filtered = App.VersionFilter(App.DataStore.versions, LastSnap);
                                var LastDataSource = App.FilterData(filtered, LastSnap, App.DataStore.versionSelection);
                                 }
                                var SnapShot = {};
                                SnapShot.first = costs;
                                SnapShot.last = LastDataSource.graph;

                                combineData[0] = App.formatThreeTotals(SnapShot, App.dataType);

                                if (App.apiErrorHandler(self, loadingWheel, cHData)) {
                                    combineData[1] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[1] = App.parseHeaderDates(headerInfo);
                                }

                                if (App.apiErrorHandler(self, loadingWheel, threeData)) {
                                    combineData[2] = [];
                                } else {
                                    combineData[2] = _.isArray(threeData) ? _.first(threeData).d.results : threeData.d.results;
                                }
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);

                                /**Set BAck to original*/
                                App.SnapshotSelectionID = savedDefaultSnapShot;
                                App.setDataSelection();
                            });
                            break;
                        case 'CPR-4':
                            console.log('hit 4');
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(cprHeaderData).done(function (cHData) {

                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatFourTotals(costs);
                                combineData[2] = {"months": App.unit.months};
                                if (App.apiErrorHandler(self, loadingWheel, cHData)) {
                                    combineData[3] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[3] = App.parseHeaderDates(headerInfo);
                                }
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                            break;
                        case 'CPR-5':
                            console.log('hit 5');
                            cpr5Data = App.CPR5DetailSet();
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(cpr5Data, cprHeaderData).done(function (fiveData, cHData) {
                                var data = App.FilterChartData(costs, App.dataType);
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatFiveTotals(data);
                                if (App.apiErrorHandler(self, loadingWheel, fiveData)) {
                                    combineData[2] = [];
                                }else{
                                    combineData[2] = _.isArray(fiveData) ? _.first(fiveData).d.results[0] : fiveData.d.results[0];
                                }
                                if (App.apiErrorHandler(self, loadingWheel, cHData)) {
                                    combineData[3] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[3] = App.parseHeaderDates(headerInfo);
                                }
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                            break;
                        case 'CPR-TWBS':
                            console.log('hit TWBS');
                            App.DataStore.clearSpiCpiData();//clear out data sv request data stored
                            svData = App.SVSet();
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(svData, cprHeaderData).done(function (sData, cHData) {
                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                                    return;
                                }
                                App.DataStore.setSpiCpiData(sData, hData);
                                combineData[0] = App.DataStore.project;
                                chartTotals = App.formatOneTotals(App.DataStore.hierarchySv, costs, App.dataType);//Return Totals for format one
                                trendData = App.cpiSpiTrend(App.DataStore.rawspiCpiChartdata, App.dataType);
                                combineData[1] = App.setTrendToChartData(chartTotals, trendData);
                                if (App.apiErrorHandler(self, loadingWheel, cHData)) {
                                    combineData[2] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[2] = App.parseHeaderDates(headerInfo);
                                }
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                $('#cprHierarchyToggle')
                                    .attr('data-hierarchy', App.State.alternativeOption)
                                    .attr('data-default', App.State.defaultSelection);
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                            break;
                        case 'CPR-TOBS':
                            console.log('hit TOBS');
                            App.DataStore.clearSpiCpiData();//clear out data sv request data stored
                            svData = App.SVSet();
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(svData, cprHeaderData).done(function (sData, cHData) {
                                if (App.apiErrorHandler(self, loadingWheel, sData)) {
                                    return;
                                }
                                App.DataStore.setSpiCpiData(sData, hData);
                                combineData[0] = App.DataStore.project;
                                chartTotals = App.formatOneTotals(App.DataStore.hierarchySv, costs, App.dataType);//Return Totals for format one
                                trendData = App.cpiSpiTrend(App.DataStore.rawspiCpiChartdata, App.dataType);
                                combineData[1] = App.setTrendToChartData(chartTotals, trendData);

                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, cHData)) {
                                    combineData[2] = [];
                                } else {
                                    var headerInfo = _.isArray(cHData) ? _.first(cHData).d.results[0] : cHData.d.results[0];
                                    combineData[2] = App.parseHeaderDates(headerInfo);
                                }
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                $('#cprHierarchyToggle')
                                    .attr('data-hierarchy', App.State.alternativeOption)
                                    .attr('data-default', App.State.defaultSelection);
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                            break;
                        case 'FOO_REPORT':
                            console.log('hit FOO');
                            var group = {};
                            var array = [];
                            var deferred = $.Deferred();
                            _.each(App.DataStore.hierarchyList, function (item, key, list) {
                                App.HierarchySelectionID = item.HierarchySelection;
                                App.setDataSelection();
                                array[key] = {};
                                array[key].data = App.HierarchySet();
                                array[key].name = item.ExtID;
                            });
                            var count = 0;
                            _.each(array, function (value, key) {
                                $.when(value.data).done(function (data) {
                                    group[_.first(data.d.results).HierarchySelection] = [];
                                    group[_.first(data.d.results).HierarchySelection].push(data.d.results);
                                    count += 1;
                                    if (count === array.length) {
                                        deferred.resolve(group);
                                    }
                                });
                            });

                            $.when(deferred).done(function (data) {

                                var merged = data;//.concat(hierListTwo.d.results);
                                var processedFoo = App.FooFilter(merged, costs, App.dataType);
                                combineData[0] = App.DataStore.project;
                                combineData[1] = processedFoo;
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);

                            });
                            break;
                        default:
                            console.log('hit default');
                            break;
                    }
                });//end of when clause
                /*********   End Data Processing  *********/
            });//end of template require
        });//when hierarchy default found
    };

    /**
     *
     * @param value
     */
    App.setProjectID = function (value) {
        if(value === '' || value === undefined){

        }else{
            this.projectID = value;
        }

        this.urlVersionSet = "/VersionSelectionSet(ProjectSelection='" + this.projectID + "')?$format=json";
        this.urlSnapshotListSet = "/SnapshotSelectionSet(ProjectSelection='" + this.projectID + ",SnapshotType='" + this.SnapshotType + "')?$format=json";
    };

    /**
     *
     * @param ChartType
     */
    App.setHierarchySelection = function (ChartType) {
        this.ChartType = ChartType;
        this.urlHierarchyListSet = "/HierarchySelectionSet(ChartType='" + this.ChartType + "',ProjectSelection='" + this.projectID + "')?$format=json";
    };

    /**
     * Set URLs
     */
    App.setDataSelection = function () {
        this.urlSnapshotSet = "/SnapshotDataSet(ProjectSelection='" + this.projectID +
            "',HierarchySelection='" + this.HierarchySelectionID +
            "',PlanVersionSelection='" + this.DataStore.versions.setBaseline +
            "',EACVersionSelection='" + this.DataStore.versions.setEac +
            "',SnapshotDate='" + this.SnapshotSelectionID +
            "',SnapshotType='" + this.SnapshotType + "')?$format=json";

        this.urlHierarchySet = "/HierarchyDataSet(ProjectSelection='" + this.projectID +
            "',HierarchySelection='" + this.HierarchySelectionID +
            "')?$format=json";

        this.urlESSet = "/EarnedScheduleDataSet(ProjectSelection='" + this.projectID +
            "',HierarchySelection='" + this.HierarchySelectionID +
            "',PlanVersionSelection='" + this.DataStore.versions.setBaseline +
            "',SnapshotType='" + this.SnapshotType + "',SnapshotDate='" + this.SnapshotSelectionID + "')?$format=json";
//',PeriodsBack='"+this.periodsBack+

        this.urlSVSet = "/BcwsBcwpAcwpDataSet(ProjectSelection='" + this.projectID +
            "',HierarchySelection='" + this.HierarchySelectionID +
            "',PlanVersionSelection='" + this.DataStore.versions.setBaseline +
            "',EACVersionSelection='" + this.DataStore.versions.setEac +
            "',SnapshotType='" + this.SnapshotType + "',SnapshotDate='" + this.SnapshotSelectionID + "')?$format=json";
//',PeriodsBack='"+this.periodsBack+
        this.urlCPR5Set = "/CPR5DetailSet(ProjectSelection='" + this.projectID +
            "',HierarchySelection='" + this.HierarchySelectionID +
            "',SnapshotSelection='" + this.SnapshotSelectionID +
            "',SnapshotType='" + this.SnapshotType + "',ExternalCost='')?$format=json";

        this.urlCPR3Set = "/CPR3DetailSet(ProjectSelection='" + this.projectID +
            "',HierarchySelection='" + this.HierarchySelectionID +
            "',PlanVersionSelection='" + this.DataStore.versions.setBaseline +
            "',SnapshotSelection='" + this.SnapshotSelectionID +
            "',SnapshotType='" + this.SnapshotType + "',Hours='" + App.cpr3DHours + "',ExternalCost='" + App.cpr3DExt + "')?$format=json";

        this.urlCPRHSet = "/CPRHeaderSet(ProjectSelection='" + this.projectID +
            "',SnapshotType='" + this.SnapshotType + "',SnapshotSelection='" + this.SnapshotSelectionID +
            "')?$format=json";
    };

    /**
     *  Request Version Data and set to DateStore
     */
    App.setVersion = function () {
        var versionData = this.VersionData();
        App.DataStore.versionSelection = '';
        $.when(versionData).done(function (vData) {

            App.DataStore.versions = _.isArray(vData) ? _first(vData).d.results : vData.d.results;
            var defVersion = $.grep(App.DataStore.versions, function (item) {
                return item.Default === "X";
            });
            App.DataStore.versionSelection = defVersion
            App.DataStore.versions.baseline = _.where(App.DataStore.versions, {'Type': 'P'});
            App.DataStore.versions.eac = _.where(App.DataStore.versions, {'Type': 'E'});
            App.DataStore.versions.setBaseline = _.first(App.DataStore.versionSelection).VersionSelection;
            App.DataStore.versions.setEac = _.last(App.DataStore.versionSelection).VersionSelection;
            //  console.log(_.first(App.DataStore.versionSelection).VersionSelection + ' - '+_.last(App.DataStore.versionSelection).VersionSelection);
        });
    };

    /**
     * None
     */
    App.setHierarchyList = function (e) {
        var defer = new $.Deferred();
        var List = this.HierarchyListSet();
        App.HierarchySelectionID = '';
        $.when(List).done(function (lData) {
            if (App.apiErrorHandler(e.currentTarget, loadingWheel, lData)) {
                return;
            }
            App.DataStore.hierarchyList = _.isArray(lData) ? _.first(lData).d.results : lData.d.results;
            var defList = $.grep(App.DataStore.hierarchyList, function (item) {
                if (App.DataStore.hierarchyList.length === 1) {
                    return item;
                }
                return item.Default === "X";
            });
            // console.log(defList);
            if (!_.isEmpty(defList) || defList.length >= 1) {
                App.HierarchySelectionID = _.first(defList).HierarchySelection;
                App.State.alternativeOption = _.chain(App.DataStore.hierarchyList).filter(function (item) {
                    return item.HierarchyDescription === 'ESO';
                }).pluck('HierarchySelection').first().value();
                App.State.defaultSelection = App.HierarchySelectionID;
            }
            defer.resolve('complete');


          /*  App.DataStore.hierarchyList = _.isArray(lData) ? _first(lData).d.results : lData.d.results;
            var defList = $.grep(App.DataStore.hierarchyList, function (item) {
                if (App.DataStore.hierarchyList.length === 1) {
                    return item;
                }
                return item.Default === "X";
            });
            //            console.log(defList);
            if (defList.length >= 1) {
                App.HierarchySelectionID = _.first(defList).HierarchySelection;
            }
           */ //            console.log('HierarchySelectionID Selection: ' + App.HierarchySelectionID);
        });
        return defer.promise();
    };

    /**
     * None
     */
    App.setSnapshotList = function (e) {
        var defer = new $.Deferred();
        var List = this.SnapshotListSetRequest();
       // App.SnapshotSelectionID = '';
        $.when(List).done(function (lData) {
            if (App.apiErrorHandler(e.currentTarget, loadingWheel, lData)) {
                App.SnapshotType = 'M';
                return alert('No Data for Selection, try again.');
            }
            if(_.isUndefined(lData)){
                App.DataStore.snapShotList = [];
                return;
            }
            App.DataStore.snapShotList = _.isArray(lData) ? _first(lData).d.results : lData.d.results;
            var defList = $.grep(App.DataStore.snapShotList, function (item) {
                return item.Default === "X";
            });
            //            console.log(defList);
            if (defList.length >= 1 && App.SnapshotSelectionID === '') {
                App.SnapshotSelectionID = _.first(defList).SnapshotSelection;
            }
            defer.resolve('complete');
            //            console.log('SnapshotSelectionID Selection: ' + App.SnapshotSelectionID);
        });
        return defer.promise();
    };

    /**
     *
     * @param target
     * @param loadingWheel
     * @param data
     * @returns {boolean}
     */
    App.apiErrorHandler = function (target, loadingWheel, data) {
        /** Error handler **///(_.isUndefined(_.first(data))) ||
        if (_.isArray(data) && _.isUndefined(_.first(data))) {
            //alert('Selection does not have Data, try again.');
            _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
            App.addSpinner(target, false);//bkg loading
            return true;
        }
        if (_.isEmpty(data)) {
            App.SpinnerTpl(loadingWheel, 0);//bkg loading
            App.addSpinner(target, false);//bkg loading
            return true;
        }
        return false;
        /** Error handler **/
    };

    /**
     *
     * @param selector
     * @param boolean
     */
    App.addSpinner = function (selector, boolean) {
        if (_.isBoolean(boolean) && boolean === false) {
            $(selector).find('.spinnerAdded').removeClass('spinnerAdded');//children().eq(0).removeClass('spinnerAdded')

        } else {
            $(selector).children().eq(0).addClass('spinnerAdded');//.parent()
        }

    };

    /**
     *
     * @param html
     * @param boolean
     * @constructor
     */
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

    /**
     * None
     */
    App.CheckProdId = function () {
        if (_.isEmpty(this.projectID) || _.isUndefined(this.projectID)) {
            alert('Please select a Project');
            return true;
        }
    };

    /**
     * None
     */
    App.CheckHierarchyId = function () {
        if (_.isEmpty(this.HierarchySelectionID) || _.isUndefined(this.HierarchySelectionID)) {
            alert('Please select a Hierarchy');
            return true;
        }
    };

    /**
     * None
     */
    App.ClearDataStore = function () {
        this.DataStore.clearChartData();
    };


    /**
     *
     * @param data
     * @returns {kendo.data.DataSource}
     * @constructor
     */
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

    /**
     *
     * @param cname
     * @returns {*}
     */
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

    /**
     * Cookie Func
     */
    App.getUsername = function () {
        var user = App.getCookie("DassianUser");
        if (user != "") {
            $("#userName").html("<p>Welcome " + decodeURI(user) + "</p>");
        } else {
            $("#userName").html("<p>Welcome</p>");
        }
    };

    /**
     *
     * @param id
     * @param foot
     * @param data
     * @constructor
     */
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

    /**
     *
     * @param selector
     */
    App.analyticsTplConfig = function (selector) {
        var name = $(selector).data('name'),//File Name to Export As
            $exportReportPDF = $(document).find('span.export-chart-pdf');
        $exportReportPDF.attr('data-id', name),
            $baseline = $(document).find('select#baseline'),
            $eac = $(document).find('select#eac'),
            $snapshot = $(document).find('select#snapshot');

        $(document).find('#hChange').val(App.HierarchySelectionID);

        $(document).find('#periodBack').val(App.periodsBack);
        var baselineVal = this.DataStore.versions.setBaseline;
        var eacVal = this.DataStore.versions.setEac;
        var snapVal = this.SnapshotSelectionID;
        $baseline.val(baselineVal);
        $eac.val(eacVal);
        $snapshot.val(snapVal);
        var $weeklyBtn = $('li#switchWeeklyButton');
        var $monthlyBtn = $('li#switchMonthlyButton');
        if(App.SnapshotType === 'M'){
            /*show weekly*/
            $weeklyBtn.show();
            $monthlyBtn.hide();
            $('#weekMonth').html('(Monthly)');
        }else{
            /*show Monthly*/
            $weeklyBtn.hide();
            $monthlyBtn.show();
            $('#weekMonth').html('(Weekly)');
        }
        ////console.log($exportReportPDF);
    };


    App.ParseSnapShotDates = function(data){
        var change = _.map(data,function(item,key){
                            return {
                                Default: item.Default,
                                ProjectSelection: item.ProjectSelection,
                                SnapshotSelection: item.SnapshotSelection,
                                formatDate : moment(item.SnapshotSelection).format('DD/MM/YYYY'),
                                SnapshotType: item.SnapshotType
                            }
                        });
        return change;

    };
    /**
     *
     * @param selector
     */
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
        //        console.log('tableName ' + tableName);
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
            $(document).find('.child' + id).toggleClass('hide').fadeIn('slow');
            $(e.currentTarget).find("i.glyphicon").eq(0).toggleClass('glyphicon-minus glyphicon-plus');
        });
    };

    /**
     *
     * @param array
     * @returns {{}}
     */
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

    /**
     *
     * @param spi
     * @returns {string}
     */
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

    /**
     *
     * @param cpi
     * @returns {string}
     */
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

    /**
     *
     * @param hier
     * @param costs
     * @param dataType
     * @returns {string}
     */
    App.formatOneTotals = function (hier, costs, dataType) {

        if (_.isUndefined(dataType)) {
            var Type = 'Quantity';
        } else {
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
                    hasData: false
                };

            } else {
                var spi = gauge.spi,
                    cpi = gauge.cpi,
                    curSPI = gauge.curSPI,
                    curCPI = gauge.curCPI,
                    spiColour = App.ragSpi(spi),
                    cpiColour = App.ragCpi(cpi),
                    curSPIColour = App.ragSpi(curSPI),
                    curCPIColour = App.ragCpi(curCPI);
                total['curSPI'] = curSPI;
                total['curCPI'] = curCPI;
                total['spi'] = spi;
                total['cpi'] = cpi;
                total['spiColour'] = spiColour;
                total['cpiColour'] = cpiColour;
                total['curSPIColour'] = curSPIColour;
                total['curCPIColour'] = curCPIColour;
                total['hasData'] = true;

                if (k === 0) {
                    com = total;
                    total.sv = (total.sv - total.svCom);
                    total.cv = (total.cv - total.cvCom);
                    total.CurrSV = (total.CurrSV - total.CurrSvCom);
                    total.CurrCV = (total.CurrCV - total.CurrCvCom);
                    total.vac = _.isNaN(total.bac - total.eacTotal) ? 0 : (total.bac - total.eacTotal);
                    var mR_Ub = (com.bcwsUB + com.bcwsMR);

                    com['bacAllSubBelow'] = _.isNaN(((com.bac + com.allbcwsCOM) + com.bcwsUB)) ? 0 : ((com.bac + com.allbcwsCOM) + com.bcwsUB);
                    com['bacAllBelow'] = _.isNaN(((com.bac + com.allbcwsCOM) + mR_Ub)) ? 0 : ((com.bac + com.allbcwsCOM) + mR_Ub);
                    com['eacAllBelow'] = _.isNaN((com.eacTotal + com.eacCOM) + com.acwpOH) ? 0 : (com.eacTotal + com.eacCOM) + com.acwpCOM;
                    com['bcwsBelow'] = _.isNaN(com.bcwsTotal + com.bcwsCOM) ? 0 : (com.bcwsTotal + com.bcwsCOM);
                    com['bcwpBelow'] = _.isNaN(com.bcwpTotal + com.bcwpCOM) ? 0 : (com.bcwpTotal + com.bcwpCOM);
                    com['acwpBelow'] = _.isNaN(com.acwpTotal + com.acwpCOM) ? 0 : (com.acwpTotal + com.acwpCOM);
                    com['currbcwsBelow'] = _.isNaN(com.curBcwsTotal + com.curbcwsCOM) ? 0 : (com.curBcwsTotal + com.curbcwsCOM);
                    com['currbcwpBelow'] = _.isNaN(com.curBcwpTotal + com.curbcwpCOM) ? 0 : (com.curBcwpTotal + com.curbcwpCOM);
                    com['curracwsBelow'] = _.isNaN(com.curAcwpTotal + com.curacwpCOM) ? 0 : (com.curAcwpTotal + com.curacwpCOM);
                    com['CurrSVBelow'] = _.isNaN(com.CurrSV + (com.CurrSvCom)) ? 0 : (com.CurrSV + com.CurrSvCom);
                    com['CurrCVBelow'] = _.isNaN(com.CurrCV + (com.CurrCvCom)) ? 0 : (com.CurrCV + com.CurrCvCom);
                    com['svBelow'] = _.isNaN(com.sv + (com.svCom)) ? 0 : (com.sv + com.svCom);
                    com['cvBelow'] = _.isNaN(com.cv + (com.cvCom)) ? 0 : (com.cv + com.cvCom);
                    com['vacBelow'] = _.isNaN(((com.vac + com.vacCOM) + com.bcwsUB)) ? 0 : ((com.vac + com.vacCOM) + com.bcwsUB);
                } else {
                    var bcwsAll = _.isNaN(total.bac - total.allbcwsOH) ? 0 : (total.bac - total.allbcwsOH),
                        eacTotal = _.isNaN(total.eacTotal - total.eacOH) ? 0 : (total.eacTotal - total.eacOH),
                        bcwsTotal = _.isNaN(total.bcwsTotal - total.bcwsOH) ? 0 : (total.bcwsTotal - total.bcwsOH),
                        bcwpTotal = _.isNaN(total.bcwpTotal - total.bcwpOH) ? 0 : (total.bcwpTotal - total.bcwpOH),
                        acwpTotal = _.isNaN(total.acwpTotal - total.acwpOH) ? 0 : (total.acwpTotal - total.acwpOH),
                        curBcwsTotal = _.isNaN(total.curBcwsTotal - total.curbcwsOH) ? 0 : (total.curBcwsTotal - total.curbcwsOH),
                        curBcwpTotal = _.isNaN((total.curBcwpTotal - total.curbcwpOH)) ? 0 : ((total.curBcwpTotal - total.curbcwpOH)),
                        curAcwpTotal = _.isNaN(total.curAcwpTotal - total.curacwpOH) ? 0 : (total.curAcwpTotal - total.curacwpOH);

                    //   var eacTotal = _.isNaN((total.eacTotal  + acwpTotal)- total.eacOH) ? 0 : (total.eacTotal + acwpTotal)- total.eacOH;

                    var vac = _.isNaN(total.bac - total.eacTotal) ? 0 : (total.bac - total.eacTotal);
                    total.vac = (vac - total.vacOH);
                    total.bac = bcwsAll;
                    total.eacTotal = eacTotal;
                    total.bcwsTotal = bcwsTotal;
                    total.bcwpTotal = bcwpTotal;
                    total.acwpTotal = acwpTotal;
                    total.curBcwsTotal = curBcwsTotal;
                    total.curBcwpTotal = curBcwpTotal;
                    total.curAcwpTotal = curAcwpTotal;
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
                ////    console.log(total);
                amounts = total;
            }
            var findIndex = '';
            findIndex = _.findIndex(hier, {ParentObjNum: v.ObjectNumber});
            if (findIndex != -1) {
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
                'isChild': typeCheck,
                'hasData': amounts.hasData
            });

        });//end of each loop
        _.each(cost, function (value, index) {
            if (index != 0) {
                var indexof = _.findIndex(cost, function (search) {
                    return search.ObjectNumber === value.ParentObjNum
                });

                if (indexof != -1 && (indexof != 0)) {
                    cost[indexof]['hasData'] = true;
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
                    if (spiTotal === Infinity)spiTotal = 0;
                    if (cpiTotal === Infinity)cpiTotal = 0;
                    if (curSPITotal === Infinity)curSPITotal = 0;
                    if (curCPITotal === Infinity)curCPITotal = 0;
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
                    if (i === 'spi' || i === 'cpi' || i === 'curSPI' || i === 'curCPI' || i === 'ETC_CPI')return;
                    cost[index].totals[i] = item.toFixed(0);
                }
            });
        });

        hierarchy = $.grep(cost, function (item, i) {
            return item.hasData === true;
        });

        _.first(hierarchy).com = com;

        return hierarchy;
    };

    /**
     *
     * @param chartData
     * @param dataType
     * @returns {{}}
     */
    App.formatThreeTotals = function (chartData, dataType) {

        var refinedFirst = App.FilterChartData(chartData.first, dataType);
        var rawSortedDataFirst = _.chain(refinedFirst.graph).flatten().sortBy('Date').filter(function(item,k){
                                                return moment(item.Date).set('day', 1).unix() >= moment(item.SnapshotDate).set('day', 1).add(1,'m').unix();
                                            }).value();
        if (_.isUndefined(refinedFirst.totals)) {
            var totalFirst = undefined;
            return;
        } else {
            totalFirst = App.convertArraytoObject(refinedFirst.totals);
        }

        var currentSnapShot = _.first(rawSortedDataFirst).SnapshotDate;
        if(!_.isEmpty(chartData.last)){
            var refinedLast = App.FilterChartData(chartData.last, dataType);
            var rawSortedDataLast = _.chain(refinedLast.graph).flatten().sortBy('Date').filter(function(item,k){
                return moment(item.Date).set('day', 1).unix() >= moment(currentSnapShot).set('day', 1).add(1,'m').unix();
            }).value();

            if (_.isUndefined(refinedLast.totals)) {
                var totalLast = undefined;
                return;
            } else {
                totalLast = App.convertArraytoObject(refinedLast.totals);
            }
        }else{
                totalLast = {};
           _.each(totalFirst,function(item, k,list){
                    totalLast[k] = 0;
                });
            var copy = JSON.parse(JSON.stringify(rawSortedDataFirst));
            rawSortedDataLast = $.grep(copy,function(item){
                                    item[dataType] = 0;
                                    return item
                            });
           /* _.each(rawSortedDataLast,function(item, k,list){
                rawSortedDataLast[k] = item;
                rawSortedDataLast[k][dataType] = 0;
            });*/

        }

        var obj = {}, forcast = {},
            start = moment(_.first(rawSortedDataFirst).Date).format('YYYY/MM'),
            end = moment(_.last(rawSortedDataFirst).Date).format('YYYY/MM'),
            snapShotDate = moment(_.first(rawSortedDataFirst).snapShotDate);
        forcast.current = {};
        forcast.past = {};


        var dataCurrent = $.grep(rawSortedDataFirst, function (value) {
            if (value.Type === 'BCWS') {
                return value.PeriodType === 'F';
            }
        });
        _.each(dataCurrent, function (value, index) {
            var month = moment(value.Date).format('MM');
            var targetYear = moment(value.SnapshotDate).format('YY');
            var targetYearAdd = moment(value.SnapshotDate).add(1, 'y').format('YY');
            var valueYear = moment(value.Date).format('YY');

            var unit = App.unit.months[month - 1];
            if (targetYear === valueYear || targetYearAdd === valueYear) {
                var keys = _.keys(forcast.current);
                if (keys.length >= 7)return;
                if (!_.has(forcast.current, unit)) {
                    forcast.current[unit] = {};
                    forcast.current[unit].data = [];
                    forcast.current[unit].total = 0;
                    forcast.current[unit].order = _.keys(forcast.current).length;
                    forcast.current[unit].month = unit;
                }
                forcast.current[unit].data.push(value);
            }
        });
        _.each(forcast.current, function (value, index) {
            var sum = 0;
            _.each(value.data, function (item, key) {
                sum += parseFloat(item[dataType]);
            });
            value.total = sum.toFixed(0);
        });


        var dataAfter = $.grep(rawSortedDataLast, function (value) {
            if (value.Type === 'BCWS') {
                return value.PeriodType === 'F';
            }
        });
        _.each(dataAfter, function (value, index) {
            var month = moment(value.Date).format('MM');
            var targetYear = moment(value.SnapshotDate).format('YY');
            var targetYearPlus = moment(value.SnapshotDate).add(1, 'y').format('YY');
            var valueYear = moment(value.Date).format('YY');

            var unit = App.unit.months[month - 1];
            if (targetYear === valueYear || targetYearPlus === valueYear) {
                var keys = _.keys(forcast.past);
                if (keys.length >= 7)return;
                if (!_.has(forcast.past, unit)) {
                    forcast.past[unit] = {};
                    forcast.past[unit].data = [];
                    forcast.past[unit].total = 0;
                    forcast.past[unit].order = _.keys(forcast.past).length;
                    forcast.past[unit].month = unit;
                }
                forcast.past[unit].data.push(value);
            }
        });

        _.each(forcast.past, function (value, index) {
            var sum = 0;
            _.each(value.data, function (item, key) {
                sum += parseFloat(item[dataType]);
            });
            value.total = sum.toFixed(0);
        });
        obj = totalFirst;
        obj.start = start,
            obj.end = end,
            obj.forcast = forcast;

        var uB_mR = _.isNaN(obj.bcwsUB + obj.bcwsMR) ? 0 : (obj.bcwsUB + obj.bcwsMR);
        var puB_pMr = _.isNaN(totalLast.bcwsUB + totalLast.bcwsMR) ? 0 : (totalLast.bcwsUB + totalLast.bcwsMR);

        var roundBcwsTotal = App.Math.round10(totalLast.bcwsTotal,0);
        var roundBcwsTotalCOM = App.Math.round10(totalLast.bcwsCOM,0);
        var roundAllbcwsCOM = App.Math.round10(totalLast.allbcwsCOM,0);
        obj.bcwsFP = _.isNaN(roundBcwsTotal + roundBcwsTotalCOM) ? 0 : (roundBcwsTotal + roundBcwsTotalCOM);
        obj.curBcwsTotalFP = _.isNaN((totalLast.curBcwsTotal + roundAllbcwsCOM)+totalLast.curbcwsOH) ? 0 : ((totalLast.curBcwsTotal + roundAllbcwsCOM)+totalLast.curbcwsOH);
        obj.bcwsTotalFP = _.isNaN((totalLast.bac + totalLast.allbcwsCOM) + totalLast.bcwsUB) ? 0 : ((totalLast.bac + totalLast.allbcwsCOM) + totalLast.bcwsUB);
        obj.bcwsUBFP = totalLast.bcwsUB;

        obj.bcwsTotal = _.isNaN((obj.bcwsTotal + obj.bcwsCOM) - uB_mR) ? 0 : ((obj.bcwsTotal + obj.bcwsCOM) - uB_mR);
        obj.subBAC = _.isNaN((obj.bac + obj.allbcwsCOM) + obj.bcwsUB) ? 0 : ((obj.bac + obj.allbcwsCOM) + obj.bcwsUB);
        obj.totalBAC = _.isNaN((obj.bac + uB_mR) + obj.allbcwsCOM) ? 0 : ((obj.bac + obj.allbcwsCOM) +uB_mR);


        /*   var dataCurrentPeriod = $.grep(rawSortedData,function(value){
         if(value.Type === 'BCWS' && value.TransactionType === 'KPPS'){
         return value.PeriodType === 'C';
         }
         });
         var sum = 0;
         _.each(dataCurrentPeriod,function(value,index,list){
         sum += parseFloat(list[index][dataType]);
         });
         obj.bcwsFP = sum;*/

        _.each(obj, function (value, key) {
            if (key === 'start' || key === 'end' || key === 'forcast')return;
            obj[key] = Number(value).toFixed(0);
        });
        return obj;
    };

    /**
     *
     * @param costs
     * @param dataType
     * @returns {Array}
     */
    App.formatFourTotals = function (costs, dataType) {
        if (_.isUndefined(dataType)) {
            var Type = 'Quantity';
        } else {
            Type = dataType;
        }
        var master = [],
            year = '',
            monthTitle = '',
            month = '';
        if (_.isArray(costs)) {
            var length = Number(costs.length);

            //            console.log('costs length ' + length);
            var beginDate = moment(costs[0].Date).format('YY');
            //            console.log('beginDate ' + beginDate);
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

            //            console.log('BCWS len ' + BCWS.length);
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
                    master[year].bcws[month].Quantity += parseFloat(va[Type]);
                    master[year].bcws[month].Total += parseFloat(va.IntValProjCurr);
                } else {
                    master[year].bcws[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(va[Type], 0),
                        "Total": App.Math.ceil10(va.IntValProjCurr, 0)
                    };
                }
            });


            //            console.log('BCWP len ' + BCWP.length);
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
                    master[year].bcwp[month].Quantity += parseFloat(vb[Type]);
                    master[year].bcwp[month].Total += parseFloat(vb.IntValProjCurr);
                } else {
                    master[year].bcwp[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(vb[Type], 0),
                        "Total": App.Math.ceil10(vb.IntValProjCurr, 0)
                    };
                }
            });


            //            console.log('EAC len ' + EAC.length);
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
                    master[year].eac[month].Quantity += parseFloat(vc[Type]);
                    master[year].eac[month].Total += parseFloat(vc.IntValProjCurr);
                } else {
                    ////  console.log('hit else');
                    master[year].eac[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(vc[Type], 0),
                        "Total": App.Math.ceil10(vc.IntValProjCurr, 0)
                    };
                }
            });


            //            console.log('ACWP len ' + ACWP.length);
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
                    master[year].acwp[month].Quantity += parseFloat(vd[Type]);
                    master[year].acwp[month].Total += parseFloat(vd.IntValProjCurr);
                } else {
                    master[year].acwp[month] = {
                        "Month": monthTitle,
                        "Quantity": App.Math.ceil10(vd[Type], 0),
                        "Total": App.Math.ceil10(vd.IntValProjCurr, 0)
                    };
                }
            });

        }

        return master;
    };

    /**
     *
     * @param data
     * @returns {{bcwsTotal: (number|*|bcwsTotal), curBcwsTotal: (number|*|curBcwsTotal), bcwpTotal: (number|*|bcwpTotal), curBcwpTotal: (number|*|curBcwpTotal), eacTotal: (number|*|eacTotal), curEacTotal: *, acwpTotal: (number|*|acwpTotal), curAcwpTotal: (number|*|curAcwpTotal), eacCum: *, bac: (number|*|bcwsAll), tcpi: *, sv: (number|*|sv), cv: (number|*|cv), CurrSV: (number|*|CurrSV), CurrCV: (number|*|CurrCV), vac: (number|*), curSPI: *, curCPI: *, spi: *, cpi: *, ETC_CPI: *, spiColour: string, cpiColour: string, curSPIColour: string, curCPIColour: string}}
     */
    App.formatFiveTotals = function (data) {
        if (_.isUndefined(data.totals) || _.isUndefined(data.gauges)) {
            var total = undefined;
            var gauge = undefined;
            //            console.log('missing data for formatFiveTotals');
            return;
        } else {
            total = App.convertArraytoObject(data.totals);
            gauge = App.convertArraytoObject(data.gauges);
        }
        var spi = gauge.spi,
            cpi = gauge.cpi,
            curSPI = gauge.curSPI,
            curCPI = gauge.curCPI,
            spiColour = App.ragSpi(spi),
            cpiColour = App.ragCpi(cpi),
            curSPIColour = App.ragSpi(curSPI),
            curCPIColour = App.ragCpi(curCPI);


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
            "BAC_TCPI": total.BAC_TCPI,
            "EAC_TCPI": total.EAC_TCPI,
            "spiColour": spiColour,
            "cpiColour": cpiColour,
            "curSPIColour": curSPIColour,//"#009933"
            "curCPIColour": curCPIColour
        };
        _.each(amounts, function (value, i) {
            if (_.isNumber(value)) {
                if (i === 'spi' || i === 'cpi' || i === 'curSPI' || i === 'curCPI' || i === 'EAC_TCPI' || i === 'BAC_TCPI')return;
                amounts[i] = value.toFixed(0);
                ////console.log(i+' ' +item);
            }
        });
        return amounts;
    };

    /**
     *
     * @param selector
     * @param DocName
     * @param fileName
     * @constructor
     */
    App.ExportTable = function (selector, DocName, fileName) {
        $(selector).table2excel({
            exclude: ".hide",
            name: DocName,
            filename: fileName
        });
    };

    /**
     *
     * @param data
     * @param name
     */
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

    /**
     *
     * @param boolean
     */
    App.showProgress = function (boolean) {
        var loadingTree = $(document).find(".treelist-loading");
        var loadingGauges = $(document).find(".gauge-loading");
        var loadingChart = $(document).find(".chart-loading");
        kendo.ui.progress(loadingTree, boolean);
        kendo.ui.progress(loadingGauges, boolean);
        kendo.ui.progress(loadingChart, boolean);
    };

    /**
     *
     * @param currentNode
     * @param arr
     * @returns {*}
     */
    App.allNodes = function (currentNode, arr) {
        var compile = arr;
        var $next = currentNode.next();
        var $check = currentNode.hasClass('k-treelist-group');
        if (!$check) {
            compile.push(currentNode.index());
            if (currentNode.length == 0) {
                //                console.log('end');
            } else {
                if ($next.length != 0) {
                    if (!$next.hasClass('k-treelist-group')) {
                        return App.allNodes($next, compile);
                    }
                }
            }
        } else {
            if ($check) {
                //                console.log($next.length);
                if ($next.length == 0) {
                } else {
                    return App.allNodes($next, compile);
                }
            }
        }
        return compile;
    };

    /**
     *
     * @param data
     */
    App.createTooltip = function (data) {
        var spi = Number(data[0].spi);
        var cpi = Number(data[1].cpi);

        $("#rgauge").kendoTooltip({content: 'CPI - ' + cpi});
        $("#lgauge").kendoTooltip({content: 'SPI - ' + spi});
    };

    /**
     *
     * @param data
     */
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

    /**
     * KendoUI
     */
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

    /**
     * KendoUI
     */
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

    /* This is old, need to updated with $("#chart").data("kendoChart").refresh() instead*/
    App.refreshChart = function () {
        var chart = $("#chart").data("kendoChart"),
            series = '',
            ValueAxis = '',
            type = $("input[name=seriesType]:checked").val();
        if (dataType === 'Quantity') {
            var dataType = "{0}hrs";
            var dataTypeTitle = "Hours";
        } else {
            var dataType = "\u00a3{0}";
            var dataTypeTitle = "\u00a3";
        }
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
                title: {
                    text: dataTypeTitle
                },
                labels: {
                    format: "{0}"
                }
            }];
            series = App.series;
            for (var i = 0, length = series.length; i < length; i++) {
                //series[i].stack = stack;
                series[i].type = type;
            }
        }
        chart.setOptions({
            //     valueAxes: ValueAxis,
            series: series
        });
    };

    /**
     * KendoUI
     */
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

    /**
     *
     * @param e
     */
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

    /**
     *
     * @param selector
     * @param type
     * @param material
     */
    App.hierEvent = function (selector, type, material) {
        /*********** New Hierarchy Button View Click Event ***************/

        selector.on('click', 'tr span.js-hier', function (e) {
            e.preventDefault();
            $('.noData').remove();
            var chartdata = App.DataStore.chart.options.data,
                filteredSnapByParentId = '',
                filteredSnapByIndex = [],
                collectIndexes = [],
                chartFiltered = '';
            //            console.log('hit selected row');
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
            //            console.log($rowIndex);

            /**Change Title**/
            //var extId = $treeList.dataSource.options.data[$rowIndex].ExtID;
            //var description = $treeList.dataSource.options.data[$rowIndex].Description;
            //$(document).find('.gaugeHeading').text(extId+'  '+description);
            //$(document).find('.gaugeHeading').text(description);
            /** end title change **/
            switch ($rowIndex) {
                case 0:
                    if (!_.isUndefined(material) && material) {
                        chartdata = _.filter(chartdata, function (item) {
                            return item.TransactionType === 'KPPP';
                        });//filter data
                    }
                    chartFiltered = App.FilterChartData(chartdata, type);
                    break;
                default:
                    if ($children) {
                        var allChildIndexes = App.allNodes($($trParent), collectIndexes);

                        var Indexes = _.without(allChildIndexes, -1);

                        $.each(Indexes, function (key, value) {//[data-children="false"]
                            filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[value].ObjectNumber});
                        });

                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        if (!_.isUndefined(material) && material) {
                            filteredSnapByParentId = _.filter(filteredSnapByParentId, function (item) {
                                return item.TransactionType === 'KPPP';
                            });//filter data
                        }
                        chartFiltered = App.FilterChartData(filteredSnapByParentId, type);

                    } else {
                        filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[$rowIndex].ObjectNumber});

                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        if (!_.isUndefined(material) && material) {
                            filteredSnapByParentId = _.filter(filteredSnapByParentId, function (item) {
                                return item.TransactionType === 'KPPP';
                            });//filter data
                        }
                        chartFiltered = App.FilterChartData(filteredSnapByParentId, type);

                    }
                    break;
            }
            if (!_.isUndefined(chartFiltered)) {
                $chartGraph.dataSource.data(_.flatten(chartFiltered.graph));
                $chartGraph.refresh();
                $target.addClass('animated fadeIn');
            } else {
                $chartGraph.dataSource.data([]);
                $chartGraph.refresh();
                // App.refreshChart();
                $('<div class="noData"><p id="noDataMessage">No data available</p></div>').appendTo("#chart");
                $target.addClass('animated fadeIn').css('color', 'red');
            }
        });
    };

    /**
     *
     * @param selector
     * @param dataType
     */
    App.hierSpiCpiEvent = function (selector, dataType) {
        /*********** New Hierarchy Button View Click Event ***************/

        selector.on('click', 'tr span.js-hier', function (e) {
            e.preventDefault();
            $('.noData').remove();
            var chartdata = App.DataStore.rawspiCpiChartdata,
                filteredSnapByParentId = '',
                filteredSnapByIndex = [],
                collectIndexes = [],
                chartFiltered = '';
            //            console.log('hit selected row');
            var $target = $(e.currentTarget),
                $treeList = $("div#treelist").data("kendoTreeList"),
                $chartGraph = $("div#chart").data("kendoChart"),
                $trParent = $target.parent().parent(),
                $rowIndex = $trParent.index(),
            //  $objectNumber = $treeList.dataSource.options.data[$rowIndex].ObjectNumber,//data-objectNumber='#=data.ObjectNumber#'
                $children = $target.data('children');

            $target.closest('tr').siblings().removeClass('k-state-selected');
            if ($target.hasClass('animated')) {
                $target.removeClass('fadeIn');
            }
            $target.closest('tr').addClass('k-state-selected');
            //            console.log($rowIndex);
            switch ($rowIndex) {
                case 0:
                    //  case 1:
                    chartFiltered = App.cpiSpiTrend(chartdata, dataType);
                    break;
                default:
                    if ($children) {

                        filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[$rowIndex].ObjectNumber});

                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = App.cpiSpiTrend(filteredSnapByParentId, dataType);
                    }
                    break;
            }
            if (_.isUndefined(chartFiltered) || _.isEmpty(chartFiltered)) {
                $chartGraph.dataSource.data([]);
                $chartGraph.refresh();
                // App.refreshChart();
                $('<div class="noData"><p id="noDataMessage">No data available</p></div>').appendTo("#chart");
                $target.addClass('animated fadeIn').css('color', 'red');
            } else {
                //var cpiSpiTrendData = App.cpiSpiTrend(chartFiltered);
                //                console.log(chartFiltered.length);
                $chartGraph.dataSource.data(chartFiltered);
                $chartGraph.refresh();
                // $("div#treelist").off('click');//remove event listener from obj
                $target.addClass('animated fadeIn');
            }

        });//when request is done

    };

    /**
     *
     * @param selector
     */
    App.expandTreeList = function (selector) {
        $(document).find(selector).data("kendoTreeList").expand(".k-treelist-group");
        // $(document).find(selector).data("kendoTreeList").expand(".k-alt");
    };

    /**
     *
     * @returns {*}
     */
    App.projectData = function () {
        var projectSource = $.ajax({
            url: this.serviceRoot + this.urlProjectSet,
            //url: "./assets/js/temp.json",
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            //   projectSource = response.d.results[0];
            ////   console.log(projectSource);
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function (response) {
            //            console.log('projectData complete ');
        });

        return projectSource;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.HierarchyListSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlHierarchyListSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('HierarchyListSet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.HierarchySet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlHierarchySet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('HierarchySet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.CPR5DetailSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlCPR5Set,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('CPR5DetailSet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.CPR3DetailSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlCPR3Set,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('CPR3DetailSet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.ESSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlESSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('ESSet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.CPRHeaderSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlCPRHSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('CPRHSet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.SVSet = function () {
        var Source = $.ajax({
            url: this.serviceRoot + this.urlSVSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // hierSource = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('SVSet complete ');
        });
        return Source;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.SnapshotListSetRequest = function () {
        var rawData = $.ajax({
            url: this.serviceRoot + this.urlSnapshotListSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // rawData = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('request complete: SnapshotListSet');
        });
        return rawData;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.SnapshotSet = function () {
        var rawData = $.ajax({
            url: this.serviceRoot + this.urlSnapshotSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // rawData = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('request complete: SnapShotData');
        });
        return rawData;
    };

    /**
     *
     * @returns {*}
     * @constructor
     */
    App.VersionData = function () {
        var rawData = $.ajax({
            url: this.serviceRoot + this.urlVersionSet,
            method: "GET",
            dataType: 'json',
            async: true
        }).success(function (response) {
            // rawData = response.d.results;
        }).error(function (err) {
            alert('error ' + err.statusText);
            App.SpinnerTpl(loadingWheel, 0);
        }).done(function () {
            //            console.log('request complete: VersionData');
        });
        return rawData;
    };

    /**
     *
     * @param data
     */
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

    /**
     *
     * @param hierArray
     * @param data
     * @returns {string}
     * @constructor
     */
    App.FilterByHierList = function (hierArray, data) {
        var findParentIds = '';
        var addValues = [];
        var sendData = '';
        if (_.isArray(hierArray) && !_.isEmpty(hierArray)) {
            ////  console.log('nodes used'+ hierArray);
            _.each(hierArray, function (v, k) {
                findParentIds = _.chain(data)
                    .filter(function (item) {
                        return _.contains(item, v.ObjectNumber);
                    }).value();
                addValues.push(findParentIds);
            });
            ////console.log('FilterByHierList length' + JSON.stringify(_.flatten(addValues).length));

        } else {
            //return console.log('nothing in array');
        }
        sendData = _.flatten(addValues);
        return sendData;
    };

    /**
     *
     * @param versions
     * @param results
     * @returns {*}
     * @constructor
     */
    App.VersionFilter = function (versions, results) {

        var master = {};
        master.versions = [];
        master.category = [];
        master.array = '';
        var dateCheck = '';
        var dateCheckAfter = '';
        var data = results;
        var pmbFutureTotal = 0;
        if (_.isEmpty(data)) {
            //            console.log('No Data to filter series.');
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
                /**   if(value.Version ==='PMB' && value.PeriodType === 'F'){
                    pmbFutureTotal += value.IntValProjCurr;
                }**/
                return value.Version === verSelection;
                //  value type = �01 and period type = �F�
            });//filter data
        });
        ////console.log('hit end of each');

        if (_.isArray(master.versions)) {

            _.each(master.versions, function (costs, index) {
                if (_.isEmpty(costs.Data)) return;
                var data = _.map(costs.Data, function (value) {

                    return {
                        "Quantity": value.Quantity,
                        "TransactionType": value.TransactionType,
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

        return master.category;

    };

    /**
     *
     * @param version
     * @param raw
     * @param defaultVersion
     * @returns {{}}
     * @constructor
     */
    App.FilterData = function (version, raw, defaultVersion) {
        var master = {};
        master.graph = [];
        // master.totals = [];
        //  master.gauges = [];
        master.raw = {};
        //        console.log(defaultVersion);
        var dateCheck = '';
        var dateCheckBefore = '';
        var data = version;
        if (data.length === 0) {
            //            console.log('No Data to filter series.');
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
                            ////console.log(value);
                            /*dateCheck =  moment(value.Date).isSame(value.SnapshotDate);
                             dateCheckBefore =  moment(value.Date).isAfter(value.SnapshotDate);*/
                            return {
                                "BCWS": value.IntValProjCurr,
                                "Quantity": value.Quantity,
                                "TransactionType": value.TransactionType,
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
                                "TransactionType": value.TransactionType,
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
                    //  obj.ACWP = _.isEmpty(obj.ACWP) ? master.raw.ACWP : obj.ACWP;
                    obj.ETC = $.grep(costs, function (item) {
                        //ValueType = 01 04
                        return item.ValueType === '01';
                    });//filter data


                    if (_.isArray(obj.EAC) && (!_.isEmpty(obj.EAC))) {
                      //  var firstDate = _.chain(obj.EAC).sortBy('Date').first().value();
                        //                        console.log(firstDate.Date);
                        var EACdata = _.chain(obj.EAC).sortBy("Date").map(function (value) {
                            return {
                                "EAC": value.IntValProjCurr,
                                "Quantity": value.Quantity,
                                "TransactionType": value.TransactionType,
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
                                "TransactionType": value.TransactionType,
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
        //        console.log(master);
        return master;

    };

    /**
     *
     * @param results
     * @param type
     * @returns {{}}
     * @constructor
     */
    App.FilterChartData = function (results, type) {
        if (_.isUndefined(type) || type === 'Quantity') {
            var dataType = type;
        } else if (type === 'Costs') {
            dataType = 'IntValProjCurr';
        } else {
            dataType = type;
        }
        var master = {};
        master.graph = [];
        master.totals = [];
        master.gauges = [];
        var dateCheck = '';
        var dateCheckBefore = '';
        ////console.log(results);
        var data = _.flatten(results);
        if (data.length === 0) {

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

        var runningTotalBCWS = 0, bcwsTotal = 0, bcwsHrs = 0, bcwsAll = 0, curBcwsTotal = 0,
            curBcwsHrs = 0, bcwsCOM = 0, curbcwsCOM = 0, allbcwsCOM = 0, bcwsUB = 0, bcwsMR = 0,
            curbcwsGA = 0, bcwsGA = 0, allbcwsGA = 0, allbcwsOH = 0, bcwsOH = 0, curbcwsOH = 0;
        if (_.isArray(BCWS) && !_.isEmpty(BCWS)) {

            var BCWSdata = _.chain(BCWS).sortBy('Date').map(function (value) {
                runningTotalBCWS += parseFloat(value[dataType]);
                bcwsAll += parseFloat(value[dataType]);
                bcwsHrs += parseFloat(value.Quantity);
                if (value.CostType === "COM" && value.Overhead === "X") {
                    allbcwsCOM += parseFloat(value[dataType]);
                }
                if (value.CostType === "OH" && value.Overhead === "X") {
                    allbcwsOH += parseFloat(value[dataType]);
                }
                if (value.CostType === "GA" && value.Overhead === "X") {
                    allbcwsGA += parseFloat(value[dataType]);
                }
                if (value.CostType === "UB") {
                    bcwsUB += parseFloat(value[dataType]);
                }
                if (value.CostType === "MR") {
                    bcwsMR += parseFloat(value[dataType]);
                }
                if (value.PeriodType === "C" || value.PeriodType === "P") {
                    bcwsTotal += parseFloat(value[dataType]);

                    if (value.CostType === "GA" && value.Overhead === "X") {
                        bcwsGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM" && value.Overhead === "X") {
                        bcwsCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH" && value.Overhead === "X") {
                        bcwsOH += parseFloat(value[dataType]);
                    }

                }
                //if(moment(value.Date).isBefore(value.SnapshotDate, 'day')){
                if (value.PeriodType == "C") {
                    curBcwsTotal += parseFloat(value[dataType]);
                    curBcwsHrs += parseFloat(value.Quantity);
                    if (value.CostType === "GA" && value.Overhead === "X") {
                        curbcwsGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM" && value.Overhead === "X") {
                        curbcwsCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH" && value.Overhead === "X") {
                        curbcwsOH += parseFloat(value[dataType]);
                    }

                }
                return {
                    "BCWS": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "TransactionType": value.TransactionType,
                    "runningBCWS": runningTotalBCWS,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "BCWS",
                    "Date": value.Date,
                    "SnapshotDate":value.SnapshotDate,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value();//convert IntValProjCurr key for Chart Series
            var uB_mR = (bcwsUB + bcwsMR);
            master.totals.push({
                "bcwsAll": ((bcwsAll + allbcwsCOM) - uB_mR),
                "bcwsTotal": (bcwsTotal - bcwsCOM),// - uB_mR
                "bcwsHrs": bcwsHrs,
                "curBcwsTotal": (curBcwsTotal - curbcwsCOM),// - uB_mR
                "curBcwsHrs": curBcwsHrs,
                "allbcwsCOM": allbcwsCOM,
                "bcwsCOM": bcwsCOM,
                "curbcwsCOM": curbcwsCOM,
                "allbcwsGA": allbcwsGA,
                "bcwsGA": bcwsGA,
                "curbcwsGA": curbcwsGA,
                "allbcwsOH": allbcwsOH,
                "bcwsOH": bcwsOH,
                "curbcwsOH": curbcwsOH,
                "bcwsUB": bcwsUB,
                "bcwsMR": bcwsMR
            });//
            master.graph.push(BCWSdata);//add array to master array
        } else {
            master.totals.push({
                "bcwsAll": 0.00,
                "bcwsTotal": 0.00,
                "bcwsHrs": 0.00,
                "curBcwsTotal": 0.00,
                "curBcwsHrs": 0.00
            });//.toFixed(2)
        }

        var runningTotalBCWP = 0, bcwpTotal = 0, bcwpHrs = 0, curBcwpTotal = 0, bcwpUB = 0, bcwpMR = 0, curbcwpUB = 0, curbcwpMR = 0,
            curBcwpHrs = 0, bcwpCOM = 0, curbcwpCOM = 0, bcwpGA = 0, curbcwpGA = 0, bcwpOH = 0, curbcwpOH = 0;
        if (_.isArray(BCWP) && !_.isEmpty(BCWP)) {
            var BCWPdata = _.chain(BCWP).sortBy('Date').map(function (value) {
                runningTotalBCWP += parseFloat(value[dataType]);
                bcwpHrs += parseFloat(value.Quantity);
                if (value.CostType === "UB") {
                    bcwpUB += parseFloat(value[dataType]);
                }
                if (value.CostType === "MR") {
                    bcwpMR += parseFloat(value[dataType]);
                }
                if (value.PeriodType === "C" || value.PeriodType === "P") {
                    bcwpTotal += parseFloat(value[dataType]);
                    bcwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "COM" && value.Overhead === "X") {
                        bcwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH" && value.Overhead === "X") {
                        bcwpOH += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "GA" && value.Overhead === "X") {
                        bcwpGA += parseFloat(value[dataType]);
                    }

                }
                if (value.PeriodType === "C") {
                    curBcwpTotal += parseFloat(value[dataType]);
                    curBcwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "GA" && value.Overhead === "X") {
                        curbcwpGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM" && value.Overhead === "X") {
                        curbcwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH" && value.Overhead === "X") {
                        curbcwpOH += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "UB") {
                        curbcwpUB += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "MR") {
                        curbcwpMR += parseFloat(value[dataType]);
                    }
                }
                return {
                    "BCWP": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "TransactionType": value.TransactionType,
                    "runningBCWP": runningTotalBCWP,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "BCWP",
                    "Date": value.Date,
                    "SnapshotDate":value.SnapshotDate,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value();//convert IntValProjCurr key for Chart Series
            var uBp_mRp = _.isNaN(curbcwpUB + curbcwpMR) ? 0 : (curbcwpUB + curbcwpMR);
            var cuBp_cmRp = _.isNaN(curbcwpUB + curbcwpMR) ? 0 : (curbcwpUB + curbcwpMR);
            var curBcwP = _.isNaN((curBcwpTotal - curbcwpCOM) - cuBp_cmRp) ? curBcwpTotal : ((curBcwpTotal - curbcwpCOM) - cuBp_cmRp);
            master.totals.push({
                "bcwpTotal": ((bcwpTotal - bcwpCOM) - uBp_mRp),
                "bcwpHrs": bcwpHrs,
                "curBcwpTotal": curBcwP,
                "curBcwpHrs": curBcwpHrs,
                "bcwpCOM": bcwpCOM,
                "bcwpGA": bcwpGA,
                "bcwpOH": bcwpOH,
                "curbcwpCOM": curbcwpCOM,
                "curbcwpGA": curbcwpGA,
                "curbcwpOH": curbcwpOH,
                "bcwpUB": bcwpUB,
                "bcwpMR": bcwpMR,
                "curbcwpUB": curbcwpUB,
                "curbcwpMR": curbcwpMR
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
                acwpHrs += parseFloat(value.Quantity);
                if (value.PeriodType === "C" || value.PeriodType === "P") {
                    acwpTotal += parseFloat(value[dataType]);
                    if (value.CostType === "COM" && value.Overhead === "X") {
                        acwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH" && value.Overhead === "X") {
                        acwpOH += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "GA" && value.Overhead === "X") {
                        acwpGA += parseFloat(value[dataType]);
                    }
                }
                if (value.PeriodType === "C") {
                    curAcwpTotal += parseFloat(value[dataType]);
                    curAcwpHrs += parseFloat(value.Quantity);
                    if (value.CostType === "GA" && value.Overhead === "X") {
                        curacwpGA += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "COM" && value.Overhead === "X") {
                        curacwpCOM += parseFloat(value[dataType]);
                    }
                    if (value.CostType === "OH" && value.Overhead === "X") {
                        curacwpOH += parseFloat(value[dataType]);
                    }
                }
                return {
                    "ACWP": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "TransactionType": value.TransactionType,
                    "runningACWP": runningTotalACWP,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "ACWP",
                    "Date": value.Date,
                    "SnapshotDate":value.SnapshotDate,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType
                }
            }).value();//convert IntValProjCurr key for Chart Series
            master.totals.push({
                "acwpTotal": acwpTotal - acwpOH,
                "acwpHrs": acwpHrs,
                "curAcwpTotal": curAcwpTotal - curacwpCOM,
                "curAcwpHrs": curAcwpHrs,
                "acwpCOM": acwpCOM,
                "acwpGA": acwpGA,
                "acwpOH": acwpOH,
                "curacwpCOM": curacwpCOM,
                "curacwpGA": curacwpGA,
                "curacwpOH": curacwpOH
            });
            master.graph.push(ACWPdata);//add array to master array
        } else {
            master.totals.push({"acwpTotal": 0.00, "acwpHrs": 0.00, "curAcwpTotal": 0.00, "curAcwpHrs": 0.00});//.toFixed(2)
        }

        var runningTotalEAC = 0, eacTotal = 0, eacHrs = 0, eacCOM = 0, eacGA = 0, eacOH = 0;
        if (_.isArray(EAC) && !_.isEmpty(EAC)) {
            var firstSnapshot = _.chain(EAC).sortBy('Date').first().value();
            var len = EAC.length, editedbaseLine = [];
            ////console.log('EAC First Date '+firstDate.Date);
            var EACdata = _.chain(EAC).sortBy('Date').map(function (value, index) {
                if(_.has(value, "parseRemove") && value.parseRemove)return;
                runningTotalEAC += parseFloat(value[dataType]);
                eacHrs += parseFloat(value.Quantity);
                eacTotal += parseFloat(value[dataType]);
                if (value.CostType === "COM" && value.Overhead === "X") {
                    eacCOM += parseFloat(value[dataType]);
                }
                if (value.CostType === "GA" && value.Overhead === "X") {
                    eacGA += parseFloat(value[dataType]);
                }
                if (value.CostType === "OH" && value.Overhead === "X") {
                    eacOH += parseFloat(value[dataType]);
                }

              /*  if (index === 0) {

                    editedbaseLine.push({
                        "Date": firstSnapshot.Date,
                        "baseLine": 0,
                        "Type": "baseline"
                    });
                }
                if (len - 1 === index) {
                    ////  console.log(key + '--------' + value.Date);
                    editedbaseLine.push({
                        "Date": value.Date,
                        "baseLine": eacTotal,
                        "Type": "baseline"
                    });
                }*/
                return {
                    "EAC": value.IntValProjCurr,
                    "Quantity": value.Quantity,
                    "TransactionType": value.TransactionType,
                    "runningEAC": runningTotalEAC,
                    "IntValProjCurr": value.IntValProjCurr,
                    "ExtValProjCurr": value.ExtValProjCurr,
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type": "EAC",
                    "Date": value.Date,
                    "SnapshotDate":value.SnapshotDate,
                    "PeriodType": value.PeriodType,
                    "Overhead": value.Overhead,
                    "CostType": value.CostType,
                    "parseRemove":false
                }
            }).value(); //convert IntValProjCurr key for Chart Series
            _.chain(EACdata).sortBy('Date').each(function (item,k) {
               if (moment(item.SnapshotDate).unix() > moment(item.Date).unix()) {//&& item.ValueType === '04'
                    item.runningEAC = null;
                }
            });
            if(_.isEmpty(ACWP)){
                EACdata.unshift({ // add this to the beginning of the EAC array if ACWP is empty
                    "Date":firstSnapshot.SnapshotDate,
                    "runningEAC": 0,
                    "TransactionType": 'KPPP',
                    "parseRemove":true
                })
            }
            master.graph.push(EACdata);//add array to master array
            master.graph.push(editedbaseLine);//add array to master array

            master.totals.push({
                "eacTotal": eacTotal - eacCOM,
                "eacHrs": eacHrs,
                "eacCOM": eacCOM,
                "eacGA": eacGA,
                "eacOH": eacOH
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

        var roundbcwsAll = App.Math.ceil10((bcwsAll - uB_mR), -2),
            roundbcwsTotal = App.Math.ceil10((bcwsTotal - uB_mR), -2),
            roundbcwpTotal = App.Math.ceil10(bcwpTotal, -2),
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

            roundcurBcwsTotal = App.Math.ceil10((curBcwsTotal - uB_mR), -2),
            roundcurBcwpTotal = App.Math.ceil10(curBcwpTotal, -2),
            roundcurAcwpTotal = App.Math.ceil10(curAcwpTotal, -2),
            roundetcTotal = App.Math.ceil10(etcTotal, -2);


        var eacCum = _.isNaN(eacTotal-eacCOM) ? 0 : eacTotal-eacCOM;

        master.totals.push({"eacCum": App.Math.ceil10(eacCum, -2)});

        var bacCalc = _.isNaN(roundbcwsAll - allbcwsCOM) ? 0 : (roundbcwsAll - allbcwsCOM);
        var bac = App.Math.ceil10(bacCalc, -2);
        master.totals.push({"bac": bac});


        var vac = _.isNaN(bac - eacCum) ? 0 : (bac - eacCum);
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
        var sv = _.isNaN(bcwpTotal - roundbcwsTotal) ? 0 : bcwpTotal - roundbcwsTotal;
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



        var bac_BCWP = _.isNaN(bac - roundbcwpTotal) ? 0 : bac - roundbcwpTotal;
        var eacCum_ACWP = _.isNaN(etcTotal - acwpTotal) ? 0 : etcTotal - acwpTotal;

        var tcpi = _.isNaN(bac_BCWP / eacCum_ACWP) ? 0 : bac_BCWP / eacCum_ACWP;
        if (tcpi === Infinity)tcpi = 0;
        master.totals.push({"tcpi": App.Math.ceil10(tcpi, -2)});

        var spiTotal = _.isNaN(roundbcwpTotal / roundbcwsTotal) ? 0 : (roundbcwpTotal / roundbcwsTotal),
            cpiTotal = _.isNaN(roundbcwpTotal / roundacwpTotal) ? 0 : (roundbcwpTotal / roundacwpTotal),
            curSPITotal = _.isNaN(curBcwpTotal / curBcwsTotal) ? 0 : (curBcwpTotal / curBcwsTotal),
            curCPITotal = _.isNaN(curBcwpTotal / curAcwpTotal) ? 0 : (curBcwpTotal / curAcwpTotal);
        if (spiTotal === Infinity)spiTotal = 0;
        if (cpiTotal === Infinity)cpiTotal = 0;
        if (curSPITotal === Infinity)curSPITotal = 0;
        if (curCPITotal === Infinity)curCPITotal = 0;
        master.gauges.push({'spi': App.Math.ceil10(spiTotal, -2), 'curSPI': App.Math.ceil10(curSPITotal, -2)});//master.gauges[0].spi
        master.gauges.push({'cpi': App.Math.ceil10(cpiTotal, -3), 'curCPI': App.Math.ceil10(curCPITotal, -3)});//master.gauges[1].cpi




        var ETC_CPI = _.isNaN(( cpiTotal / (bac - roundbcwsTotal))) ? 0 : (cpiTotal / (bac - roundbcwsTotal));
        if (ETC_CPI === Infinity)ETC_CPI = 0;
        master.totals.push({"ETC_CPI": App.Math.ceil10(ETC_CPI, 0)});

        /*var curEAC_CPI = _.isNaN((curCPITotal / (bac - curBcwsTotal))) ? 0 : (curCPITotal / (bac - curBcwsTotal));
        if (curEAC_CPI === Infinity)curEAC_CPI = 0;
        master.totals.push({"curEAC_CPI": App.Math.ceil10(curEAC_CPI, 0)});

        var curBAC_CPI = _.isNaN((curSPITotal / (bac - curBcwsTotal))) ? 0 : (curSPITotal / (bac - curBcwsTotal));
        if (curBAC_CPI === Infinity)curBAC_CPI = 0;
        master.totals.push({"curBAC_CPI": App.Math.ceil10(curBAC_CPI, 0)});*/


        /**
         * roundetcTotal  = EAC - ACWP CUM
         */
        var EAC_TCPI = _.isNaN(((bac - (roundbcwpTotal-bcwpCOM)) / ((eacTotal-eacCOM) - roundacwpTotal))) ? 0 : ((bac - (roundbcwpTotal-bcwpCOM)) / ((eacTotal-eacCOM) - roundacwpTotal));
        if (EAC_TCPI === Infinity)EAC_TCPI = 0;
        master.totals.push({"EAC_TCPI": App.Math.ceil10(EAC_TCPI, 0)});

        var BAC_TCPI = _.isNaN(((bac - (roundbcwpTotal-bcwpCOM)) / (bac - roundacwpTotal))) ? 0 : ((bac - (roundbcwpTotal-bcwpCOM)) / (bac - roundacwpTotal));
        if (BAC_TCPI === Infinity)BAC_TCPI = 0;
        master.totals.push({"BAC_TCPI": App.Math.ceil10(BAC_TCPI, 0)});

        _.flatten(master.totals);
        _.flatten(master.graph);
        _.flatten(master.gauges);

        return master;
    };

    /**
     *
     * @param chartData
     * @param trendData
     * @returns {*}
     */
    App.setTrendToChartData = function (chartData, trendData) {
        var check = [], saveEach = [], parent = [], trend = trendData;
        _.each(chartData, function (value, key) {
            check = _.filter(trendData, function (item) {
                return item.ObjectNumber === value.ObjectNumber;
            });

            if(!_.isEmpty(check) && check.length < 6){
                var len = check.length;// 1 2 3 4 5
                var howManyToAdd = _.isNaN(( 6 - len)) ? 0 : ( 6 - len);
                var copy = [];//JSON.parse(JSON.stringify(check));
                var sterilizedObject = {
                    ACWP: 0,
                    BCWP: 0,
                    BCWS: 0,
                    CPI: "",
                    CPIColour: "",
                    Date: "",
                    ObjectNumber: _.first(check).ObjectNumber,
                    SPI: "",
                    SPIColour: "",
                    SnapshotDate: "",
                    isBlank : true
                };
                for(var i = 0; i < howManyToAdd; i++){
                    check.unshift(sterilizedObject);
                }
                //check.concat(copy);
            }

            if (!_.isEmpty(check)) {
                saveEach.push(check);
            }
            chartData[key]['trend'] = check;

        });
        _.each(saveEach, function (value, key) {
            //if(saveEach.length > 1 && key != 0){
            _.each(value, function (v, k) {
                parent = _.first(chartData)['trend'];
                if (_.isUndefined(parent[k])) {
                    parent[k] = {};
                    parent[k]['SPI'] = 0;
                    parent[k]['CPI'] = 0;
                    parent[k].BCWP = 0;
                    parent[k].BCWS = 0;
                    parent[k].ACWP = 0;
                }
                parent[k].BCWP += Number(v.BCWP);
                parent[k].BCWS += Number(v.BCWS);
                parent[k].ACWP += Number(v.ACWP);
                if(!_.isUndefined(v.isBlank) && v.isBlank){
                    parent[k].SPIColour = "";
                    parent[k].CPIColour = "";
                    parent[k].SPI = "";
                    parent[k].CPI = "";
                }else{
                    var spi = _.isNaN(parent[k].BCWP / parent[k].BCWS) ? 0 : (parent[k].BCWP / parent[k].BCWS);
                    var cpi = _.isNaN(parent[k].BCWP / parent[k].ACWP) ? 0 : (parent[k].BCWP / parent[k].ACWP);

                    parent[k].SPI = App.Math.ceil10(spi, -2);
                    parent[k].CPI = App.Math.ceil10(cpi, -3);
                    parent[k].SPIColour = App.ragSpi(spi);
                    parent[k].CPIColour = App.ragCpi(cpi);
                    parent[k].SnapshotDate = v.SnapshotDate;
                }

            });
            // }
        });

        return chartData;
    }

    /**
     *
     * @param costs
     * @param dataType
     * @returns {*}
     */
    App.cpiSpiTrend = function (costs, dataType) {
        var Type = '';
        if (dataType === 'Quantity') {
            Type = 'H';
        } else if (dataType === 'IntValProjCurr') {
            Type = 'I';
        } else {
            Type = 'M';
        }

        var master,
            values = _.chain(costs)
            .sortBy('SnapshotDate')
            .sortBy('ObjectNumber')
            .where({'RecordType': Type})
            .value();

        master = _.map(values, function (item, index) {
            var bcwsCost = Number(item.BCWS),
                bcwpCost = Number(item.BCWP),
                acwpCost = Number(item.ACWP),
                spiTotal = _.isNaN(bcwpCost / bcwsCost) ? 0 : (bcwpCost / bcwsCost),
                cpiTotal = _.isNaN(bcwpCost / acwpCost) ? 0 : (bcwpCost / acwpCost);
            /*if (_.isNaN(spiTotal)) spiTotal = 0;
            if (_.isNaN(cpiTotal)) cpiTotal = 0;*/
            if (spiTotal === Infinity) spiTotal = 0;
            if (cpiTotal === Infinity) cpiTotal = 0;
            return {
                "CPI": App.Math.ceil10(cpiTotal, -3),
                "SPI": App.Math.ceil10(spiTotal, -2),
                "SPIColour": App.ragSpi(spiTotal),
                "CPIColour": App.ragCpi(cpiTotal),
                "BCWS": bcwsCost,
                "BCWP": bcwpCost,
                "ACWP": acwpCost,
                "ObjectNumber": item.ObjectNumber,
                "RecordType": item.RecordType,
                "Date": new Date(item.SnapshotDate),
                "SnapshotDate": moment(item.SnapshotDate).format('MM/YYYY'),
                "baseLine": 1
            };
        });
        //        console.log(master);
        return master;
    };

    /**
     *
     * @param costs
     * @param dataType
     * @param hier
     * @returns {Array}
     * @constructor
     */
    App.SVfilter = function (costs, dataType, hier) {
        if (dataType === 'Quantity') {
            var dataType = 'H';
        } else if (dataType === 'IntValProjCurr') {
            dataType = 'I';
        } else {
            dataType = 'M';
        }

        var master,
            spiTotal,
            cpiTotal,
            parsedName,
            values = _.chain(costs)
                .sortBy('SnapshotDate')
                .sortBy('ObjectNumber')
                .where({'RecordType': dataType})
                .value();

        var master = [];
        var uniquObjs = _.chain(values)
            .uniq(function (item) {
                return item.SnapshotDate;
            }).pluck('SnapshotDate')
              .value();

        var data = _.map(values, function (item, index) {
            var bcwsCost = Number(item.BCWS),
                bcwpCost = Number(item.BCWP),
                acwpCost = Number(item.ACWP);
            if (_.isNaN(bcwsCost)) bcwsCost = 0;
            if (_.isNaN(bcwpCost)) bcwpCost = 0;
            if (_.isNaN(acwpCost)) acwpCost = 0;

            var SV = _.isNaN(bcwpCost - bcwsCost) ? 0 : bcwpCost - bcwsCost;
            var hierarchyTitle = _.chain(hier).filter(function (value) {
                return value.ObjectNumber === item.ObjectNumber;
            }).pluck('Description').first().value();

            var titleSplit = _.last(hierarchyTitle.split('-'));
            return {
                "SV": App.Math.ceil10(SV, -0),
                "title": titleSplit.trim(),
                "BCWS": bcwsCost,
                "BCWP": bcwpCost,
                "ACWP": acwpCost,
                "ObjectNumber": item.ObjectNumber,
                "Date":new Date(item.SnapshotDate),
                "SnapshotDate": item.SnapshotDate
            };
        });

        var chartColour = ['#003366', '#336699', '#003399', '#000099', '#006699', '#0066CC', '#009999', '#0099FF', '#00FFFF', '#3366FF', '#66FFFF', '#E6E6F5'];
        _.each(uniquObjs, function (value, key) {
            if(App.SnapshotType === 'W'){
                 parsedName = moment(value).weeks() +'/'+moment(value).format('YYYY');
            }else{
                parsedName = moment(value).format('MM/YYYY');
            }
            master.push({
                name: parsedName,
                type: "column",
                field: "SV",
                categoryField: "title",
                color: chartColour[key],
                markers: {type: "circle"},
                data: []
            });
            master[key].data = _.where(data, {'SnapshotDate': value});
        });
        /* var copy = [];
         _.each(master,function(v,i){
         var copyNew = _.map(v.data,function(item){

         return {
         "SV":item.SV / 2,
         "BCWS": item.BCWS,
         "BCWP": item.BCWP,
         "ACWP": item.ACWP,
         "ObjectNumber": item.ObjectNumber+1,
         "Date": item.Date,
         "SnapshotDate": item.SnapshotDate
         };

         });
         master[i].data.push(_.first(copyNew));

         });*/

        return master;
    };

    /**
     *
     * @param costs
     * @param dataType
     * @param hier
     * @returns {Array}
     * @constructor
     */
    App.ESfilter = function (costs, dataType, hier) {
        if (dataType === 'Quantity') {
            var dataType = 'H';
        } else if (dataType === 'IntValProjCurr') {
            dataType = 'I';
        } else {
            dataType = 'M';
        }
        /*  var b = uniquObjs.slice();
         uniquObjs.push(b[0]);
         uniquObjs.push(b[0]);
         _.flatten(uniquObjs);*/
        var master = [];
        var uniquObjs = _.chain(costs)
            .sortBy('SnapshotDate')
            .uniq(function (item) {
                return item.SnapshotDate;
            })
            .pluck('SnapshotDate')
            .value();
        var chartColour = ['#0000cc', '#cc0000', '#00cc00', '#0000ff', '#ff0000', '#00ff00'];
        //var colors = ['#ddddd','#dsdsds'];
        _.each(uniquObjs, function (value, key) {
            if(App.SnapshotType === 'W'){
                parsedName = moment(value).isoWeeks() +'/'+moment(value).format('YYYY');
            }else{
                parsedName = moment(value).format('MM/YYYY');
            }
            master.push({
                name: parsedName,
                type: "column",
                field: "ES",
                categoryField: "title",
                color: chartColour[key],
                markers: {type: "circle"},
                data: []
            });

            master[key].data = _.chain(costs)
                .sortBy('SnapshotDate')
                .where({'RecordType': dataType, 'SnapshotDate': value})
                .map(function (item) {
                    var hierarchyTitle = _.chain(hier).filter(function (value) {
                        return value.ObjectNumber === item.ObjectNumber;
                    }).pluck('Description').first().value();
                    var titleSplit = _.last(hierarchyTitle.split('-'));
                    return {
                        "ProjectSelection": item.ProjectSelection,
                        "title": titleSplit.trim(),
                        "HierarchySelection": item.HierarchySelection,
                        "ObjectNumber": item.ObjectNumber,
                        "PlanVersionSelection": item.PlanVersionSelection,
                        "FundApproved": item.FundApproved,
                        "SnapshotType": item.SnapshotType,
                        "Date": new Date(item.SnapshotDate),
                        "RecordType": item.RecordType,
                        "ES": item.ES
                    };
                }).value();

        });


        /* var copy = [];
         _.each(master,function(v,i){
         var copyNew = _.map(v.data,function(item){

         return {
         Date:item.Date,
         ES:item.ES / 2,
         FundApproved:item.FundApproved,
         HierarchySelection:item.HierarchySelection,
         ObjectNumber:item.ObjectNumber+'22222',
         PlanVersionSelection:item.PlanVersionSelection,
         ProjectSelection:item.ProjectSelection,
         RecordType:item.RecordType,
         SnapshotType:item.SnapshotType
         };
         });
         master[i].data.push(_.first(copyNew));

         });*/


        // master = master.concat(copy);

        return master;
    };

    /**
     *
     * @param hierarchyFoo
     * @param cost
     * @param type
     * @returns {{}}
     * @constructor
     */
    App.FooFilter = function (hierarchyFoo, cost, type) {
        if (_.isUndefined(type) || type === 'Quantity') {
            var dataType = type;
        } else {
            dataType = 'IntValProjCurr';
        }
        var master = {};
        master.dates = [];
        master.merged = [];
        if (_.isEmpty(hierarchyFoo)) {
            return;
        }
        if (_.isEmpty(cost)) {
            return;
        }

        var firstArrayId = _.first(App.DataStore.hierarchyList).HierarchySelection;
        var lastArrayId = _.last(App.DataStore.hierarchyList).HierarchySelection;

        master.first = _.chain(_.first(hierarchyFoo[firstArrayId])).where({"ReportingLevel": "R"}).value();
        master.title = _.first(_.first(hierarchyFoo[firstArrayId]));

        var eacData = _.filter(cost, function (item) {
            if (item.ValueType === '01') {
                return item.Type === 'EAC';
            }
        });
        var dates = _.chain(eacData).uniq(false, function (item, k, v) {
            return moment(item.Date).unix();
        }).value();

        var hierDefault = _.first(hierarchyFoo[firstArrayId]);
        master.default = _.map(hierDefault, function (item, key) {
            var objResults = [], final = [], isEmpty = false;
            objResults = _.filter(eacData, function (value) {
                return value.ObjectNumber === item.ObjectNumber;
            });
            if (_.isEmpty(objResults)) {
                isEmpty = true;
            }
            _.each(dates, function (v, k) {
                var total = 0;
                var data = _.filter(objResults, function (value) {
                    return moment(value.Date).unix() === moment(v.Date).unix();
                });
                if (_.isEmpty(data)) {
                    return final[k] = total;
                }
                _.each(data, function (vv, kk) {
                    total += parseFloat(vv[dataType]);
                });
                final[k] = total;
            });

            return {
                Description: item.Description,
                ExtID: item.ExtID,
                HierarchySelection: item.HierarchySelection,
                ObjectNumber: item.ObjectNumber,
                ParentObjNum: item.ParentObjNum,
                ProjectSelection: item.ProjectSelection,
                ReportingLevel: item.ReportingLevel,
                SortOrder: key,
                Type: item.Type,
                Total: final,
                checkEmpty: isEmpty
            }
        });

        var hierCopy = _.first(hierarchyFoo[lastArrayId]);
        master.obs = _.map(hierCopy, function (item, key) {
            var objResults = [], final = [], isEmpty = false;
            objResults = _.filter(eacData, function (value) {
                return value.ObjectNumber === item.ObjectNumber;
            });
            if (_.isEmpty(objResults)) {
                isEmpty = true;
            }
            _.each(dates, function (v, k) {
                var total = 0;
                var data = _.filter(objResults, function (value) {
                    return moment(value.Date).unix() === moment(v.Date).unix();
                });
                if (_.isEmpty(data)) {
                    return final[k] = total;
                }
                _.each(data, function (vv, kk) {
                    total += parseFloat(vv[dataType]);
                });
                final[k] = total;
            });

            return {
                Description: item.Description,
                ExtID: item.ExtID,
                HierarchySelection: item.HierarchySelection,
                ObjectNumber: item.ObjectNumber,
                ParentObjNum: item.ParentObjNum,
                ProjectSelection: item.ProjectSelection,
                ReportingLevel: item.ReportingLevel,
                SortOrder: key,
                Type: item.Type,
                Total: final,
                checkEmpty: isEmpty
            }
        });


        master.dates = _.map(dates, function (item) {
            return {
                "Date": moment(item.Date).format('MM/YYYY')
            }
        });

        _.each(master.obs, function (item, i, list) {
            var array = [];
            if (!item.checkEmpty) {
                var index = _.findIndex(list, function (search) {
                    return search.ObjectNumber === item.ParentObjNum;
                });
                master.obs[index].checkEmpty = item.checkEmpty;
                _.each(item.Total, function (value, key) {
                    master.obs[index].Total[key] += parseFloat(value);
                });
            }
        });
        _.each(master.default, function (item, i, list) {
            var array = [];
            if (!item.checkEmpty) {
                var index = _.findIndex(list, function (search) {
                    return search.ObjectNumber === item.ParentObjNum;
                });
                master.default[index].checkEmpty = item.checkEmpty;
                _.each(item.Total, function (value, key) {
                    master.default[index].Total[key] += parseFloat(value);
                });
            }
        });
        var copydefault = master.default.slice();
        var copyobs = master.obs.slice();
        master.default = [];
        master.obs = [];
        master.obs = _.filter(copyobs, function (item, index) {
            if (item.ReportingLevel === 'R' && !item.checkEmpty) {
                _.each(item.Total, function (value, key) {
                    item.Total[key] = value.toFixed(0);
                });
                return item;
            }
        });
        master.default = _.filter(copydefault, function (item, index) {
            if (item.ReportingLevel === 'R' && !item.checkEmpty) {
                _.each(item.Total, function (value, key) {
                    item.Total[key] = value.toFixed(0);
                });
                return item;
            }
        });
        //  var copydefault = master.default.slice();

        /*  master.default = _.filter(master.default,function(item,i){
         if(item.ReportingLevel === 'R') {
         if(!item.checkEmpty)return item;
         }
         });*/
        //  var copyobs = master.obs.slice();

        /* master.obs = _.filter(master.obs,function(item,i){
         if(item.ReportingLevel === 'R') {
         if(!item.checkEmpty)return item;
         }
         });*/
        /* all rolled up with reporting level */

        return master;
    };

    /**
     *
     * @param dataSource
     * @param series
     * @param reverse
     * @param type
     */
    App.create_SPICPI_Chart = function (dataSource, series, reverse, type) {
        var tootipFormat ='',categoryFormat = '',dataType='',weeksMonths ='';
        if (_.isUndefined(reverse)) {
            reverse = false;
        }

        if (type === 'Quantity') {
            var dataType = "{0}hrs";
            var dataTypeTitle = "Hours";
        } else {
            dataType = "\u00a3{0}";
            dataTypeTitle = "\u00a3";
        }

        if(App.SnapshotType === 'W'){
            tootipFormat = kendo.template("<div>#: kendo.toString(weekYear( new Date(category)))# # function weekYear( date) {var d = new Date(+date);d.setHours(0,0,0);d.setDate(d.getDate()+4-(d.getDay()||7));return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)} #/#: kendo.toString(new Date(category), 'yyyy') #</div>" +
                " # for (var i = 0; i < points.length; i++) {" +
                " #<div style='padding:3px 0 0 0; text-align:left;'>#: points[i].series.name# : #: kendo.format('" + dataType +
                "', points[i].value) #</div># } #");
            categoryFormat = kendo.template("#: kendo.toString(weekYearc( new Date(value)))#/#: kendo.toString(new Date(value), 'yyyy') # # function weekYearc( date) {var d = new Date(+date);d.setHours(0,0,0);d.setDate(d.getDate()+4-(d.getDay()||7));return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)} #");
            weeksMonths = 'weeks';
        }else{
            tootipFormat = kendo.template("<div>#: kendo.toString(new Date(category), 'MM/yyyy') #</div>" +
                " # for (var i = 0; i < points.length; i++) {" +
                " #<div style='padding:3px 0 0 0; text-align:left;'>#: points[i].series.name# : #: kendo.format('" + dataType +
                "', points[i].value) #</div># } #");
            categoryFormat = kendo.template("#: kendo.toString(new Date(value), 'MM/yyyy') #");
            weeksMonths = 'months';
        }

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
                baseUnit: weeksMonths,
                //baseUnitStep: "fit",
                //title: { text: "Date" },
                field: "Date",
                labels: {
                    rotation: -60,
                    //format: "Year: {0}",
                    dateFormats: {
                        weeks: "M-yyyy",//"M-d",
                        months: "M-yyyy"
                    },
                    template: categoryFormat
                },
                autoBaseUnitSteps: {
                    days: [],
                    weeks: [1],
                    months: [1],
                    years: []
                },
                maxDateGroups: 45,
                crosshair: {
                    tooltip: {
                        //format: "M-yyyy",
                        visible: false
                    },
                    visible: false
                },
                /*tooltip: {
                 format: "M-yyyy",
                 visible: true
                 },*/
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
                    title: {
                        text: dataTypeTitle
                    },
                    labels: {
                        format: "{0}"
                    }
                }
            ],
            tooltip: {
                visible: true,
                shared: true,
                sharedTemplate:tootipFormat
                //template: "#= kendo.format('{0}',value) #"
                //format:kendo.format("{0}")
                //kendo.format("{0:c}", 99)
            }
        });
    };

    /**
     *
     * @param series
     * @param reverse
     * @param type
     */
    App.createES_Chart = function (series, reverse, type) {
        var dataTypeTitle='';
        if (_.isUndefined(reverse)) {
            reverse = false;
        }

        if (type === 'Quantity') {
            dataType = "{0}hrs";
        } else {
            dataType = "\u00a3{0}";
        }

        if(App.SnapshotType === 'W'){
            dataTypeTitle = "Weeks";
        }else{
            dataTypeTitle = "Months";
        }

        $("#chart").kendoChart({
            pdf: {
                fileName: "SnapShot Costs Export.pdf",
                proxyURL: this.serviceRoot + "/kendo-ui/service/export"
            },
            //dataSource: dataSource,
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
                majorGridLines: {
                    visible: false
                },
                line: {
                    visible: false
                }
            },
            valueAxis: [
                {
                    reverse: reverse,
                    title: {
                        text: dataTypeTitle
                    },
                    labels: {
                        format: "{0}"
                    },
                    line: {
                        visible: false
                    }
                }
            ],
            tooltip: {
                visible: true,
                shared: true,
                sharedTemplate: kendo.template("<div>#: category #</div>" +
                    " # for (var i = 0; i < points.length; i++) {" +
                    " #<div style='padding:3px 0 0 0; text-align:left;'>#: points[i].series.name# : #: kendo.format('{0}', points[i].value) #</div># } #")
                //template: "#= kendo.format('{0}',value) #"
                //format:kendo.format("{0}")
                //kendo.format("{0:c}", 99)
            }
        });
    };

    /**
     *
     * @param series
     * @param reverse
     * @param type
     */
    App.createSV_Chart = function (series, reverse, type) {
        var dataTypeTitle='';
        if (_.isUndefined(reverse)) {
            reverse = false;
        }

        if (type === 'Quantity') {
            dataType = "{0}hrs";
            dataTypeTitle = "Hours";
        } else {
            dataType = "\u00a3{0}";
            dataTypeTitle = "\u00a3";
        }

        $("#chart").kendoChart({
            pdf: {
                fileName: "SnapShot Costs Export.pdf",
                proxyURL: this.serviceRoot + "/kendo-ui/service/export"
            },
            //dataSource: dataSource,
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
                majorGridLines: {
                    visible: false
                },
                line: {
                    visible: false
                }
            },
            valueAxis: [
                {
                    reverse: reverse,
                    title: {
                        text: dataTypeTitle
                    },
                    labels: {
                        format: "{0}"
                    },
                    line: {
                        visible: false
                    }
                }
            ],
            tooltip: {
                visible: true,
                shared: true,
                sharedTemplate: kendo.template("<div>#: category #</div>" +
                    " # for (var i = 0; i < points.length; i++) {" +
                    " #<div style='padding:3px 0 0 0; text-align:left;'>#: points[i].series.name# : #: kendo.format('{0}', points[i].value) #</div># } #")
                //template: "#= kendo.format('{0}',value) #"
                //format:kendo.format("{0}")
                //kendo.format("{0:c}", 99)
            }
        });
    };


    /**
     *
     * @param dataSource
     * @param series
     * @param reverse
     * @param dataType
     */
    App.createChart = function (dataSource, series, reverse, Dtype) {
        var tootipFormat ='',categoryFormat = '',dataType='',weeksMonths ='',dataTypeTitle='';
        if (_.isUndefined(reverse)) {
            var reverse = false;
        }
        if (Dtype === 'Quantity') {
            dataType = "{0}hrs";
            dataTypeTitle = "Hours";
        } else {
            dataType = "\u00a3{0}";
            dataTypeTitle = "\u00a3";
        }

        if(App.SnapshotType === 'W'){
            tootipFormat = kendo.template("<div>#: kendo.toString(weekYear( new Date(category)))# # function weekYear( date) {var d = new Date(+date);d.setHours(0,0,0);d.setDate(d.getDate()+4-(d.getDay()||7));return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)} #/#: kendo.toString(new Date(category), 'yyyy') #</div>" +
                " # for (var i = 0; i < points.length; i++) {" +
                " #<div style='padding:3px 0 0 0; text-align:left;'>#: points[i].series.name# : #: kendo.format('" + dataType +
                "', points[i].value.toFixed(0)) #</div># } #");
            categoryFormat = kendo.template("#: kendo.toString(weekYearc( new Date(value)))#/#: kendo.toString(new Date(value), 'yyyy') # # function weekYearc( date) {var d = new Date(+date);d.setHours(0,0,0);d.setDate(d.getDate()+4-(d.getDay()||7));return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)} #");
            weeksMonths = 'weeks';
        }else{
            tootipFormat = kendo.template("<div>#: kendo.toString(new Date(category), 'MM/yyyy') #</div>" +
                " # for (var i = 0; i < points.length; i++) {" +
                " #<div style='padding:3px 0 0 0; text-align:left;'>#: points[i].series.name# : #: kendo.format('" + dataType +
                "', points[i].value.toFixed(0)) #</div># } #");
            categoryFormat = kendo.template("#: kendo.toString(new Date(value), 'MM/yyyy') #");
            weeksMonths = 'months';
        }

        $("#chart").kendoChart({
            pdf: {
                fileName: "SnapShot Costs Export.pdf",
                proxyURL: this.serviceRoot + "/kendo-ui/service/export",
                paperSize: 'auto',
                landscape: true
            },
            dataSource: dataSource,
            chartArea: {
                // width: 200,
                //height: 475
            },
           // moment : require('moment'),
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
                    visible: true
                }
            },
            series: series,
            categoryAxis: {
                baseUnit: weeksMonths,
                //baseUnitStep: "fit",
                //title: { text: "Date" },
                field: "Date",
                labels: {
                    rotation: -60,
                    //format: "Year: {0}",
                    dateFormats: {
                        weeks: "M-yyyy",//"M-d",
                        months: "M-yyyy"
                    },
                    template: categoryFormat
                },
                autoBaseUnitSteps: {
                    days: [],
                    weeks: [1],
                    months: [1],
                    years: []
                },
                maxDateGroups: 45,
                crosshair: {
                    tooltip: {
                        //format: "M-yyyy",
                        visible: false
                    },
                    visible: false
                },
                /*tooltip: {
                 format: "M-yyyy",
                 visible: true
                 },*/
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
                    title: {
                        text: dataTypeTitle
                    },
                    labels: {
                        format: "{0}"
                    }
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
                sharedTemplate:tootipFormat
            }
        });
    };

    /**
     *
     * @param type
     * @param value
     * @param exp
     * @returns {*}
     */
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

    /**
     *
     * @param value
     * @param exp
     * @returns {*}
     */
// Decimal round
    App.Math.round10 = function (value, exp) {
        return App.decimalAdjust('round', value, exp);
    };

    /**
     *
     * @param value
     * @param exp
     * @returns {*}
     */
// Decimal floor
    App.Math.floor10 = function (value, exp) {
        return App.decimalAdjust('floor', value, exp);
    };

    /**
     *
     * @param value
     * @param exp
     * @returns {*}
     */
// Decimal ceil
    App.Math.ceil10 = function (value, exp) {
        return App.decimalAdjust('ceil', value, exp);
    };

    Date.prototype.getWeekNumber = function(date) {
     var d = new Date(+date);
         d.setHours(0,0,0);
         d.setDate(d.getDate()+4-(d.getDay()||7));
         return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
    };


    /**
     *
     * @returns {Array.<T>}
     */
    Array.prototype.clone = function () {
        return this.slice(0);
    };

    return App;
});