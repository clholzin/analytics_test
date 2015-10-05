define(['jquery', 'underscore', 'domReady', 'app',
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
    'tpl!templates/reports/foo.html',

    'moment', 'kendo', 'FileSaver', 'en-GB', 'bootstrap-select',
    'Blob', 'base64', 'jszip',
    'jquery.table2excel', 'bootstrap'], function ($, _, domReady, App,
                                                  homeTpl, projectAnalyticsFTTpl, earnedScheduleTpl, scheduleTpl, spaTpl, spiCPITpl,
                                                  reportFooterTpl, blankFooterTpl, analyticsFooterATpl, analyticsFooterBTpl,
                                                  spinnerTpl, cpr1, cpr2, cpr3, cpr4a, cpr4b, cpr5, cprTWBS, cprTOBS,fooTpl, moment) {

    domReady(function () {
        kendo.culture('en-GB');
        var doc = $(document),
            bkgChange = $('.bkgChange'),
            mainBody = $('div.mainBody'),
            footer = $('div.footer'),
            tplFooter = '',
            tplId = '',
            loadingWheel = spinnerTpl,
            combineData = [];
        console.log(App.serviceRoot);

        /** ON LOAD **/
        App.SpinnerTpl(loadingWheel, 1);//Add spinner on load
        App.getUsername();

        var hierarchySets = App.projectData();
        $.when(hierarchySets).done(function (hData) {
            if (_.isObject(hData)) {
                combineData.push(hData.d.results);
                console.log(combineData);
            } else {
                combineData.push(_.first(hData).d.results);
            }
            mainBody.html(homeTpl({'combineData': combineData}));
            footer.html(blankFooterTpl);
            if (combineData[0].length > 1) {
                doc.find('.menuItem').addClass('menu-disabled');
            } else {
                var project = _.first(combineData[0]);
                App.setProjectID(project.ProjectSelection);
                App.setVersion();
                App.setSnapshotList();
            }
            App.SpinnerTpl(loadingWheel, 0);//remove spinner after load + 1 sec
        });
        /** END ON LOAD **/

        /** Updated Code to allow for Selects to work inside Bootstrap Dropdown **/
        /*doc.on('click','.dropdown',function(e){
         e.stopPropagation();
         });*/

        doc.on('change', '#projectSets', function (e) {
            e.preventDefault();
            var value = $("#projectSets").val();
            console.log(value);
            if (_.isEmpty(value)) {
                doc.find('.menuItem').addClass('menu-disabled');
                value = undefined;
                App.setProjectID(value);
            } else {
                App.setProjectID(value);
                App.setVersion();
                if (!_.isEmpty(App.projectID) || !_.isUndefined(App.projectID)) {
                    doc.find('.menuItem').removeClass('menu-disabled');
                }
                App.ClearDataStore();
            }
            console.log('Project ID: ' + App.projectID);
            console.log('Project URLs: ' + App.urlSnapshotSet + '  ' + App.urlHierarchySet + '  ' + App.urlHierarchySelectionSet);
        });

        doc.on('click', 'body', function (e) {
            var target = $(e.target);
            if (target.parents('.bootstrap-select').length) {
                e.stopPropagation();
                $('.bootstrap-select.open').removeClass('open');
            }
        });
            /* SPA change hierarchy event */
        doc.on('change', '#hChange', function (e) {
            e.preventDefault();
            var  self = $(this),
                Hier = self.val(),
                chartType = self.find(':selected').attr('data-chartType'),
                selectedTitle = self.find(':selected').attr('data-title'),
                $hierarchyList = $("div#treelist"),
                $chart = $("div#chart"),
                $treeList = $hierarchyList.data("kendoTreeList"),
                $chartGraph = $chart.data("kendoChart");
            console.log(Hier + ' ' + chartType);
            if (Hier === '') {
                self.val(App.HierarchySelectionID);
                return;
            } else {
                App.HierarchySelectionID = Hier;
                if (App.CheckHierarchyId()) {
                    return;
                } else {
                   App.ClearDataStore();
                    App.setHierarchySelection(chartType.toUpperCase());
                    self.val(App.HierarchySelectionID);
                }
            }
            App.SpinnerTpl(loadingWheel, 1);
            App.dataType = 'Quantity';
            App.setDataSelection();
            var hierData = App.HierarchySet();
            var chartData = App.SnapshotSet();
            $.when(hierData,chartData).done(function (hData,cData) {
                /** Error handler **/
                if (App.apiErrorHandler(e.currentTarget, loadingWheel, cData)) {
                    return;
                }

                 App.DataStore.setData(cData, hData);

                $treeList.destroy();
                $hierarchyList.empty();
                $chartGraph.destroy();
                $chart.empty()
                $hierarchyList.off()

                App.createChart(App.DataStore.chart, App.series, false, App.dataType);
                //$chartGraph.dataSource.data(App.DataStore.chart.options.data);
                App.hierListInitialize(App.DataStore.hierarchy);
                /** Clear Hierarchy and Chart **/
                $(document).bind("kendo:skinChange", App.createChart);
                $(".chart-type-chooser").bind("change", App.refreshChart);

                $('#dataType').val(App.dataType);
                $('.costType').hide();
                App.hierEvent($hierarchyList, App.dataType, false);//event for changing chart data
                App.analyticsTplConfig(self);
                _.debounce(App.expandTreeList($hierarchyList), 500);
                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
            });
        });
        /* CPI SPI change hierarchy event */
        doc.on('change', '#cpiSpiChange', function (e) {
            e.preventDefault();
            var  self = $(this),
                Hier = self.val(),
                chartType = self.find(':selected').attr('data-chartType'),
                selectedTitle = self.find(':selected').attr('data-title'),
                $hierarchyList = $("div#treelist"),
                $treeList = $hierarchyList.data("kendoTreeList"),
                $chartGraph = doc.find("div#chart").data("kendoChart");
            $hierarchyList.off()
            console.log(Hier + ' ' + chartType);
            if (Hier === '') {
                self.val(App.HierarchySelectionID);
                return;
            } else {
                console.log('hit HierarchySelectionID is differnt');
                App.HierarchySelectionID = Hier;
                if (App.CheckHierarchyId()) {
                    return;
                } else {
                    App.DataStore.clearSpiCpiData();//clears cpiSpi data from storage
                    App.setHierarchySelection(chartType.toUpperCase());
                    self.val(App.HierarchySelectionID);
                    App.dataType = 'Quantity';
                }
            }
            App.SpinnerTpl(loadingWheel,1);
            App.setDataSelection();
            var svData = App.SVSet();// get SnapShot Cost Data
            var hierData = App.HierarchySet();//get hierarchy Data

            $.when(hierData, svData).done(function (hData, sData) {
                if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                    return;
                }
                App.DataStore.setSpiCpiData(sData,hData);

                doc.find("div#chart").empty();
                $hierarchyList.empty();
                $treeList.destroy();
                $chartGraph.destroy();
                $hierarchyList.off();

                App.create_SPICPI_Chart(App.DataStore.spiCpiChart, App.CpiSpiSeries, false,App.dataType);
                App.hierListInitialize(App.DataStore.hierarchySv);
                /** Clear Hierarchy and Chart **/
                $('.dataTypeAnalytics').val('Quantity');
                $('.costType').hide();
               App.hierSpiCpiEvent($hierarchyList,App.dataType);//event for changing chart data
                App.analyticsTplConfig(self);
                _.debounce(App.expandTreeList($hierarchyList), 500);
                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
            });
        });
        /** Updated Code from 100 to 267 - 072815**/
        doc.on('click', '.homeTpl', function (e) {
            e.preventDefault();
            var combineData = [];
            var hierarchySets = App.projectData();
            $.when(hierarchySets).done(function (hData) {
                combineData.push(hData.d.results);

                App.SpinnerTpl(loadingWheel, 1);
                var id = $(this).data('temp'),
                    name = $(this).data('name');
                bkgChange.attr('id', 'indexBG');
                App.Project(homeTpl, blankFooterTpl, combineData);
                $("#projectSets").val(App.projectID);
                App.SpinnerTpl(loadingWheel, 0);
            });
        });

        doc.on('click', '.getAnalytics', function (e) {
            e.preventDefault();
            if (App.CheckProdId()) {
                return;
            }
            App.addSpinner(e.currentTarget);//bkg loading
            App.SpinnerTpl(loadingWheel, 1);
            var self = $(this),
                combineData = [],
                chartData = [],
                esData = [],
                svData = [],
                hierData = [],
                vData = [],
                version = '',
                chartDataSource = '',
                id = self.data('temp'),//Name of DIV
                name = self.data('name');//File Name to Export As
            /* this is to reset global dataType upon entry*/
            console.log(id);
            App.dataType = 'Quantity';

            App.setHierarchySelection(id.toUpperCase());
            var List = App.HierarchyListSet();
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
                    combineData[0] = App.DataStore.snapShotList;
                    combineData[1] = App.DataStore.hierarchyList;
                    combineData[2] = App.DataStore.versions;
                    App.Project(tplId, tplFooter, combineData);
                    //$("#hChange").val(App.projectID);
                    switch (name) {
                        case 'earnedSchedule':
                            App.createSplittersFT();
                            esData = App.ESSet();
                            $.when(esData).done(function (eData) {

                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, eData)) {
                                    return;
                                }
                                var filteredEs = App.ESfilter(eData.d.results,App.dataType);
                               // var dataStore = App.AssignStore(filteredEs);

                                App.createES_SV_Chart(filteredEs, true, App.dataType);

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
                                App.DataStore.setSpiCpiData(sData,hData);


                                App.hierListInitialize(App.DataStore.hierarchySv);
                                App.create_SPICPI_Chart(App.DataStore.spiCpiChart, App.CpiSpiSeries, false,App.dataType);

                                //var projectName = App.DataStore.hierarchySv[0].ExtID;
                                //$(document).bind("kendo:skinChange", App.create_SPICPI_Chart);
                                //$(".chart-type-chooser").bind("change", App.refreshChart);
                                var hierarchyList = $("div#treelist");
                                App.hierSpiCpiEvent(hierarchyList,App.dataType);//event for changing chart data
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
                                }else{
                                    App.DataStore.hierarchy = _.first(hData).d.results;
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
                        case 'scheduleVAR':
                            App.createSplittersFT();
                            App.setDataSelection();
                            var svData = App.SVSet();
                            $.when(svData).done(function (sData) {

                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                                    return;
                                }
                                var filteredSv = App.SVfilter(sData.d.results,App.dataType);
                                //var dataStoreSv = App.AssignStore(filteredSv);

                                App.createES_SV_Chart(filteredSv, false, App.dataType);

                                App.analyticsTplConfig(self);
                                //_.debounce(App.expandTreeList(hierarchyList), 500);
                                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                            });
                            break;
                        default:
                            console.log('hit default');
                            break;
                    }
                });
            });//when hierarchy default found
        });

        doc.on('click', '.getReport', function (e) {
            e.preventDefault();
            if (App.CheckProdId()) {
                return;
            }
            /* this is to reset global dataType upon entry*/
            ;
            App.addSpinner(e.currentTarget);//bkg loading
            App.SpinnerTpl(loadingWheel, 1);
            var combineData = [],
                self = $(this),
                id = self.data('temp'),
                sheet = self.data('sheet'),//Worksheet Name
                version = '', projectData = '', hierData = '', svData='', cprHeaderData = '', cpr5Data ='', vData = '', hier = '', costs = '', chartData = '',
                totals = '', gauges = '', chartDataSource = '', currentVersion = [],chartTotals = '', trendData = '',
                retrieveTpl = 'tpl!templates/reports/' + id + '.html';
            console.log(id);
            App.dataType = 'Quantity';//set or reset upon entry as default
            App.setHierarchySelection(id.toUpperCase());
            var List = App.HierarchyListSet();
            App.HierarchySelectionID = '';
            $.when(List).done(function (lData) {
                App.DataStore.hierarchyList = lData.d.results;
                var defList = $.grep(App.DataStore.hierarchyList, function (item) {
                    if (App.DataStore.hierarchyList.length === 1) {
                        return item;
                    }
                    return item.Default === "X";
                });
               // console.log(defList);
                if (defList.length >= 1) {
                    App.HierarchySelectionID = _.first(defList).HierarchySelection;
                }
                console.log('HierarchySelection Selection: ' + App.HierarchySelectionID);

                App.setDataSelection();
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
                        if (App.apiErrorHandler(e.currentTarget, loadingWheel, cData)) {
                            return;
                        }
                        /** Error handler **/
                        if (!_.isEmpty(cData)) {
                            App.DataStore.setData(cData, hData);//adds data to data store
                        }
                        App.DataStore.project = _.first(pData).d.results;
                        App.DataStore.hierarchy = _.first(hData).d.results;
                        hier = App.DataStore.hierarchy;
                        costs = App.DataStore.chart.options.data;
                        switch (sheet) {
                            case 'CPR-1':
                                console.log('hit 1');
                                cprHeaderData = App.CPRHeaderSet();
                                $.when(cprHeaderData).done(function (cHData) {
                                    var data = App.FilterChartData(costs, App.dataType);
                                    combineData[0] = App.DataStore.project;
                                    combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                    combineData[2] = cHData.d.results[0];
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
                            case 'CPR-2':
                                console.log('hit 2');
                                cprHeaderData = App.CPRHeaderSet();
                                $.when(cprHeaderData).done(function (cHData) {
                                    combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                    combineData[2] = cHData.d.results[0];
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
                            case 'CPR-3':
                                console.log('hit 3');
                                cprHeaderData = App.CPRHeaderSet();
                                $.when(cprHeaderData).done(function (cHData) {
                                    combineData[0] = App.formatThreeTotals(costs, App.dataType);
                                    combineData[1] = cHData.d.results[0];
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
                            case 'CPR-4':
                                console.log('hit 4');
                                cprHeaderData = App.CPRHeaderSet();
                                $.when(cprHeaderData).done(function (cHData) {
                                    combineData[0] = App.DataStore.project;
                                    combineData[1] = App.formatFourTotals(costs);
                                    combineData[2] = {"months": App.unit.months};
                                    combineData[3] = cHData.d.results[0];
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
                                $.when(cpr5Data).done(function (fiveData) {
                                    var data = App.FilterChartData(costs, App.dataType);
                                    cprHeaderData = App.CPRHeaderSet();
                                    $.when(cprHeaderData).done(function (cHData) {
                                        combineData[0] = App.DataStore.project;
                                        combineData[1] = App.formatFiveTotals(data);
                                        combineData[2] = fiveData.d.results[0];
                                        combineData[3] = cHData.d.results[0];
                                        /*********   Template Processing  *********/
                                        tplId = tempTpl;
                                        tplFooter = reportFooterTpl;
                                        App.Project(tplId, tplFooter, combineData);
                                        bkgChange.attr('id', 'cprBG');
                                        App.reportTplConfig(self);
                                        /*********   End Template Processing  *****/
                                        App.SpinnerTpl(loadingWheel, 0);
                                    });
                                });
                                break;
                            case 'CPR-TWBS':
                                console.log('hit TW');
                                App.DataStore.clearSpiCpiData();//clear out data sv request data stored
                                svData = App.SVSet();
                                $.when(svData).done(function (sData) {
                                    App.DataStore.setSpiCpiData(sData,hData);
                                    cprHeaderData = App.CPRHeaderSet();
                                    $.when(cprHeaderData).done(function (cHData) {
                                        combineData[0] = App.DataStore.project;
                                        chartTotals = App.formatOneTotals(App.DataStore.hierarchySv, costs, App.dataType);//Return Totals for format one
                                        trendData = App.cpiSpiTrend(App.DataStore.rawspiCpiChartdata, App.dataType);
                                        combineData[1] = App.setTrendToChartData(chartTotals, trendData);
                                        combineData[2] = cHData.d.results[0];
                                        /*********   Template Processing  *********/
                                        tplId = tempTpl;
                                        tplFooter = reportFooterTpl;
                                        App.Project(tplId, tplFooter, combineData);
                                        bkgChange.attr('id', 'cprBG');
                                        App.reportTplConfig(self);
                                        /*********   End Template Processing  *****/
                                        App.SpinnerTpl(loadingWheel, 0);
                                    });
                                });
                                break;
                            case 'CPR-TOBS':
                                console.log('hit TO');
                                App.DataStore.clearSpiCpiData();//clear out data sv request data stored
                                svData = App.SVSet();
                                $.when(svData).done(function (sData) {
                                    App.DataStore.setSpiCpiData(sData,hData);
                                    cprHeaderData = App.CPRHeaderSet();
                                    $.when(cprHeaderData).done(function (cHData) {
                                        combineData[0] = App.DataStore.project;
                                        chartTotals = App.formatOneTotals(App.DataStore.hierarchySv, costs, App.dataType);//Return Totals for format one
                                        trendData = App.cpiSpiTrend(App.DataStore.rawspiCpiChartdata, App.dataType);
                                        combineData[1] = App.setTrendToChartData(chartTotals, trendData);
                                        combineData[2] = cHData.d.results[0];
                                        /*********   Template Processing  *********/
                                        tplId = tempTpl;
                                        tplFooter = reportFooterTpl;
                                        App.Project(tplId, tplFooter, combineData);
                                        bkgChange.attr('id', 'cprBG');
                                        App.reportTplConfig(self);
                                        /*********   End Template Processing  *****/
                                        App.SpinnerTpl(loadingWheel, 0);
                                    });
                                });
                                break;
                            case 'FOO_REPORT':
                                console.log('hit FOO');
                                    var group = {};
                                    var array = [];
                                    var deferred = $.Deferred();
                                    _.each(App.DataStore.hierarchyList,function(item,key,list){
                                        App.HierarchySelectionID = item.HierarchySelection;
                                        App.setDataSelection();
                                        array[key] = {};
                                        array[key].data = App.HierarchySet();
                                        array[key].name = item.ExtID;
                                    });
                                    var count = 0;
                                    _.each(array,function(value,key){
                                        $.when(value.data).done(function(data) {
                                           group[_.first(data.d.results).HierarchySelection] = [];
                                            group[_.first(data.d.results).HierarchySelection].push(data.d.results);
                                            count += 1;
                                            if(count === array.length){
                                                deferred.resolve(group);
                                            }
                                        });
                                    });

                                $.when(deferred).done(function (data) {
                                    var merged = data;//.concat(hierListTwo.d.results);
                                    var processedFoo = App.FooFilter(merged,costs,App.dataType);
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
        });

        doc.on('change', '.dataType', function (e) {
            e.preventDefault();
            App.SpinnerTpl(loadingWheel, 1);
            var self = $(this).find(':selected'),
                dataType = self.val(),
                logic = self.attr('data-sheet'),
                reportType = self.attr('data-temp'),
                chartTotals = '',
                trendData = '',
                material = 0;
            console.log('type: ' + dataType + ' and Report: ' + reportType);

            App.dataType = dataType;
            if (dataType === 'Quantity') {
                $('.costType').hide();
            } else if (dataType === 'Costs') {
                dataType = 'IntValProjCurr';
                //$('.costType').show();
                //App.SpinnerTpl(loadingWheel, 0);
                //return;
            } else {
            }

            var retrieveTpl = 'tpl!templates/reports/' + reportType + '.html';
            var hier = App.DataStore.hierarchy;
            var costs = App.DataStore.chart.options.data;
            if (dataType === 'Material') {
                costs = $.grep(costs, function (item) {
                    return item.TransactionType === 'KPPP';
                });//filter data
                dataType = 'IntValProjCurr';
                material = 1;
            }
            requirejs([retrieveTpl], function (tempTpl) {
                switch (logic) {
                    case 'CPR-1':
                        console.log('hit 1');
                        cprHeaderData = App.CPRHeaderSet();
                        $.when(cprHeaderData).done(function (cHData) {
                            //var data = App.FilterChartData(costs, App.dataType);
                            combineData[0] = App.DataStore.project;
                            combineData[1] = App.formatOneTotals(hier, costs, dataType);//Return Totals for format one
                            combineData[2] = cHData.d.results[0];
                            /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            //bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                            if (material) {
                                $('#units').html('&pound;');
                                $('#cpr1Title').html('CPR FORMAT 1 - WBS (MATERIAL)');
                                $('.dataType').val('Material');
                            } else {
                                if (dataType === 'Quantity') {
                                    $('.costType').hide();
                                    $('#units').html('HRS');
                                    $('#cpr1Title').html('CPR FORMAT 1 - WBS (MANHOURS)');
                                } else {
                                    //$('.costType').show();
                                    $('#units').html('&pound;');
                                    $('#cpr1Title').html('CPR FORMAT 1 - WBS (TOTAL COST)');
                                    $('#dataType').val('Costs');
                                }
                            }
                            /*********   End Template Processing  *****/
                            App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    case 'CPR-2':
                        console.log('hit 2');
                        cprHeaderData = App.CPRHeaderSet();
                        $.when(cprHeaderData).done(function (cHData) {
                            //var data = App.FilterChartData(costs, App.dataType);
                            combineData[0] = App.DataStore.project;
                            combineData[1] = App.formatOneTotals(hier, costs, dataType);//Return Totals for format one
                            combineData[2] = cHData.d.results[0];
                            /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            //bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                            if (material) {
                                $('#units').html('&pound;');
                                $('#cpr2Title').html('CPR FORMAT 2 - OBS (MATERIAL)');
                                $('#dataType').val('Material');
                            } else {
                                if (dataType === 'Quantity') {
                                    $('.costType').hide();
                                    $('#units').text('HRS');
                                    $('#cpr2Title').text('CPR FORMAT 2 - OBS (MANHOURS)');
                                } else {
                                    //$('.costType').show();
                                    $('#units').html('&pound;');
                                    $('#cpr2Title').text('CPR FORMAT 2 - OBS (TOTAL COST)');
                                    $('#dataType').val('Costs');
                                }
                            }
                            /*********   End Template Processing  *****/
                            App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    case 'CPR-3':
                        console.log('hit 3');
                        cprHeaderData = App.CPRHeaderSet();
                        $.when(cprHeaderData).done(function (cHData) {
                            combineData[0] = App.formatThreeTotals(costs,dataType);
                            combineData[1] = cHData.d.results[0];
                            /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                            if (material) {
                                $('#units').html('&pound;');
                                $('#cpr3Title').html('CPR FORMAT 3 - OBS (MATERIAL)');
                                $('#dataType').val('Material');
                            } else {
                                if (dataType === 'Quantity') {
                                    $('.costType').hide();
                                    $('#units').text('HRS');
                                    $('#cpr3Title').text('CPR FORMAT 3 - OBS (MANHOURS)');
                                } else {
                                    //$('.costType').show();
                                    $('#units').html('&pound;');
                                    $('#cpr3Title').text('CPR FORMAT 3 - OBS (TOTAL COST)');
                                    $('#dataType').val('Costs');
                                }
                            }
                            /*********   End Template Processing  *****/
                            App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    case 'CPR-4':
                        console.log('hit 4');
                        cprHeaderData = App.CPRHeaderSet();
                        $.when(cprHeaderData).done(function (cHData) {
                            //var data = App.FilterChartData(costs, App.dataType);
                            combineData[0] = App.DataStore.project;
                            combineData[1] = App.formatFourTotals(costs, dataType);
                            combineData[2] = {"months": App.unit.months};
                            combineData[3] = cHData.d.results[0];
                            /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            //bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                            if (material) {
                                $('#units').html('&pound;');
                                $('#cpr4Title').html('CPR FORMAT 4 - STAFFING/FORECAST (MATERIAL)');
                                $('#dataType').val('Material');
                            } else {
                                if (dataType === 'Quantity') {
                                    $('.costType').hide();
                                    $('#units').text('HRS');
                                    $('#cpr4Title').text('CPR FORMAT 4 - STAFFING/FORECAST (MANHOURS)');
                                } else {
                                    //$('.costType').show();
                                    $('#units').text('&pound;');
                                    $('#cpr4Title').text('CPR FORMAT 4 - STAFFING/FORECAST (TOTAL COST)');
                                    $('#dataType').val('Costs');
                                }
                            }
                            /*********   End Template Processing  *****/
                            App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    case 'CPR-5':
                        console.log('hit 5');
                        var cpr5Data = App.CPR5DetailSet();
                        $.when(cpr5Data).done(function(fiveData){
                            var data = App.FilterChartData(costs, dataType);
                            cprHeaderData = App.CPRHeaderSet();
                            $.when(cprHeaderData).done(function (cHData) {
                                //var data = App.FilterChartData(costs, App.dataType);
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatFiveTotals(data);
                                combineData[2] = _.first(fiveData.d.results);
                                combineData[3] = cHData.d.results[0];
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                //bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                if (material) {
                                    $('#units').html('&pound;');
                                    $('#cpr5Title').html('CPR FORMAT 5 - VAR (MATERIAL)');
                                    $('#dataType').val('Material');
                                } else {
                                    if (dataType === 'Quantity') {
                                        $('.costType').hide();
                                        $('#units').text('HRS');
                                        $('#cpr5Title').text('CPR FORMAT 5 - VAR (MANHOURS)');
                                    } else {
                                        //$('.costType').show();
                                        $('#units').html('&pound;');
                                        $('#cpr5Title').text('CPR FORMAT 5 - VAR (TOTAL COST)');
                                        $('#dataType').val('Costs');
                                        /*if (dataType === 'IntValProjCurr') {
                                         $('.costType').val('IntValProjCurr');
                                         } else {
                                         $('.costType').val('ExtValProjCurr');
                                         }*/
                                    }
                                }
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                            });
                        });
                        break;
                    case 'CPR-TWBS':
                        console.log('hit TW');
                        cprHeaderData = App.CPRHeaderSet();
                        $.when(cprHeaderData).done(function (cHData) {
                            //var data = App.FilterChartData(costs, App.dataType);
                            combineData[0] = App.DataStore.project;
                            chartTotals = App.formatOneTotals(App.DataStore.hierarchySv, costs, dataType);//Return Totals for format one
                            trendData = App.cpiSpiTrend(App.DataStore.rawspiCpiChartdata,dataType);
                            combineData[1] = App.setTrendToChartData(chartTotals,trendData);
                            combineData[2] = cHData.d.results[0];
                            /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            //bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                            if (material) {
                                $('#units').html('&pound;');
                                $('#cprTWTitle').html('CPR FORMAT TREND - WBS (MATERIAL)');
                                $('.dataType').val('Material');
                            } else {
                                if (dataType === 'Quantity') {
                                    $('.costType').hide();
                                    $('#units').text('HRS');
                                    $('#cprTWTitle').text('CPR FORMAT TREND - WBS (MANHOURS)');
                                } else {
                                    //$('.costType').show();
                                    $('#units').html('&pound;');
                                    $('#cprTWTitle').text('CPR FORMAT TREND - WBS (TOTAL COST)');
                                    $('.dataType').val('Costs');
                                    /*if (dataType === 'IntValProjCurr') {
                                     $('.costType').val('IntValProjCurr');
                                     } else {
                                     $('.costType').val('ExtValProjCurr');
                                     }*/
                                }
                            }
                            /*********   End Template Processing  *****/
                            App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    case 'CPR-TOBS':
                        console.log('hit TO');
                        cprHeaderData = App.CPRHeaderSet();
                        $.when(cprHeaderData).done(function (cHData) {
                            //var data = App.FilterChartData(costs, App.dataType);
                            combineData[0] = App.DataStore.project;
                            chartTotals = App.formatOneTotals(App.DataStore.hierarchySv, costs, dataType);//Return Totals for format one
                            trendData = App.cpiSpiTrend(App.DataStore.rawspiCpiChartdata,dataType);
                            combineData[1] = App.setTrendToChartData(chartTotals,trendData);
                            combineData[2] = cHData.d.results[0];
                            /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            //bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                            if (material) {
                                $('#units').html('&pound;');
                                $('#cprTOTitle').html('CPR FORMAT TREND - OBS (MATERIAL)');
                                $('#dataType').val('Material');
                            } else {
                                if (dataType === 'Quantity') {
                                    $('.costType').hide();
                                    $('#units').text('HRS');
                                    $('#cprTOTitle').text('CPR FORMAT TREND - OBS (MANHOURS)');
                                } else {
                                    //$('.costType').show();
                                    $('#units').html('&pound;');
                                    $('#cprTOTitle').text('CPR FORMAT TREND - OBS (TOTAL COST)');
                                    $('#dataType').val('Costs');
                                    /*if (dataType === 'IntValProjCurr') {
                                     $('.costType').val('IntValProjCurr');
                                     } else {
                                     $('.costType').val('ExtValProjCurr');
                                     }*/
                                }
                            }
                            /*********   End Template Processing  *****/
                            App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    case 'FOO_REPORT':
                        console.log('hit FOO');
                        var group = {},
                            array = [];
                        var deferred = $.Deferred();
                        _.each(App.DataStore.hierarchyList,function(item,key,list){
                            App.HierarchySelectionID = item.HierarchySelection;
                            App.setDataSelection();
                            array[key] = {};
                            array[key].data = App.HierarchySet();
                            array[key].name = item.ExtID;
                        });
                        var count = 0;
                        _.each(array,function(value,key){
                            $.when(value.data).done(function(data) {
                                group[_.first(data.d.results).HierarchySelection] = [];
                                group[_.first(data.d.results).HierarchySelection].push(data.d.results);
                                count += 1;
                                if(count === array.length){
                                    deferred.resolve(group);
                                }
                            });
                        });

                        $.when(deferred).done(function (data) {
                                var merged = data;
                                var processedFoo = App.FooFilter(merged,costs,App.dataType);
                                combineData[0] = App.DataStore.project;
                                combineData[1] = processedFoo;
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);

                                if (material) {
                                    $('#dataType').val('Material');
                                } else  if (dataType === 'Quantity') {
                                        $('#dataType').val('Quantity');
                                    } else {
                                        $('#dataType').val('Costs');

                                    }
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                        });
                        break;
                    default:
                        console.log('hit default');
                        break;
                }
            });
        });

        doc.on('change', '.dataTypeAnalytics', function (e) {
            e.preventDefault();

            App.SpinnerTpl(loadingWheel, 1);
            var self = $(this).find(':selected'),
                dataType = self.val(),
                $chartGraph = doc.find("div#chart"),
                logic = self.attr('data-name'),
                combineData = [],
                hier = '',
                costs = '',
                material = 0,
                reportType = self.attr('data-temp');
                $("div#treelist").off();
                App.dataType = dataType;

            if (App.dataType === 'Quantity') {
                $('.costType').hide();
            } else if (App.dataType === 'Costs') {
                App.dataType = 'IntValProjCurr';
                //$('.costType').show();
            } else {
            }

            var retrieveTpl = 'tpl!templates/analytics/' + reportType + '.html';
            /* send hierarchy list to template*/
            combineData[0] = App.DataStore.snapShotList;
            combineData[1] = App.DataStore.hierarchyList;
            combineData[2] = App.DataStore.versions;
            switch (logic) {
                case 'projectAnalytics':
                    tplFooter = analyticsFooterATpl;
                    break;
                default:
                    tplFooter = analyticsFooterBTpl;
                    break;
            }
            requirejs([retrieveTpl], function (tempTpl) {
                tplId = tempTpl;
                App.Project(tplId, tplFooter, combineData);
            switch (logic) {
                case 'spa':
                     App.createSplittersFT();
                     costs = App.DataStore.chart.options.data;
                     hier = App.DataStore.hierarchy;
                    if (App.dataType === 'Material') {
                        costs = $.grep(costs, function (item) {
                            return item.TransactionType === 'KPPP';
                        });//filter data
                        App.dataType = 'IntValProjCurr';
                        material = 1;
                    }

                     App.hierListInitialize(hier);
                    var refined = App.FilterChartData(costs, App.dataType);
                    App.createChart(App.AssignStore(refined.graph), App.series, false, App.dataType);
                    hierarchyList = $("div#treelist");
                    App.hierEvent(hierarchyList, App.dataType,material);//event for changing chart data
                    App.analyticsTplConfig(self);
                    if (App.dataType === 'Quantity') {
                        $('.costType').hide();
                        $('.dataTypeAnalytics').val('Quantity');
                    }else if (material) {
                        $('.dataTypeAnalytics').val('Material');
                    } else {
                        //$('.costType').show();
                        $('.dataTypeAnalytics').val('Costs');
                        /*if (App.dataType === 'IntValProjCurr') {
                         $('.costType').val('IntValProjCurr');
                         } else {
                         $('.costType').val('ExtValProjCurr');
                         }*/
                    }
                    $('#hChange').val(App.HierarchySelectionID);
                    _.debounce(App.expandTreeList(hierarchyList), 500);
                    _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                    break;
                case 'earnedSchedule':
                    App.setDataSelection();
                    esData = App.ESSet();
                    $.when(esData).done(function (eData) {
                        App.createSplittersFT();
                        if (App.apiErrorHandler(e.currentTarget, loadingWheel, eData)) {
                            return;
                        }
                        var filteredEs = App.ESfilter(eData.d.results, App.dataType);
                        //var dataStore = App.AssignStore(filteredEs);

                        App.createES_SV_Chart(filteredEs, true, App.dataType);

                        App.analyticsTplConfig(self);
                        console.info("Selected Type " + dataType);
                        if (App.dataType === 'Quantity') {
                            $('.costType').hide();
                            $('.dataTypeAnalytics').val('Quantity');
                        }else if (App.dataType === 'Material') {
                            $('.dataTypeAnalytics').val('Material');
                        } else {
                            //$('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            /*if (App.dataType === 'IntValProjCurr') {
                             $('.costType').val('IntValProjCurr');
                             } else {
                             $('.costType').val('ExtValProjCurr');
                             }*/
                        }
                        _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                    });

                    break;
                case 'scheduleVAR':
                    App.setDataSelection();
                    var svData = App.SVSet();
                    $.when(svData).done(function (sData) {
                        App.createSplittersFT();
                        if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                            return;
                        }
                        var filteredSv = App.SVfilter(sData.d.results,App.dataType);
                       // var dataStoreSv = App.AssignStore(filteredSv);

                        App.createES_SV_Chart(filteredSv, false, App.dataType);


                        App.analyticsTplConfig(self);
                        if (App.dataType === 'Quantity') {
                            $('.costType').hide();
                            $('.dataTypeAnalytics').val('Quantity');
                        }else if (App.dataType === 'Material') {
                            $('.dataTypeAnalytics').val('Material');
                        } else {
                            //$('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            /*if (App.dataType === 'IntValProjCurr') {
                             $('.costType').val('IntValProjCurr');
                             } else {
                             $('.costType').val('ExtValProjCurr');
                             }*/
                        }
                        _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                    });
                    break;
                case 'spiCPI':
                        hier = App.DataStore.hierarchySv;
                        costs = App.DataStore.rawspiCpiChartdata;
                        App.createSplittersFT();
                        App.hierListInitialize(hier);
                        var cpiSpiTrendData = App.cpiSpiTrend(costs, App.dataType);
                        var cpiSpiTrend = App.AssignStore(cpiSpiTrendData);
                        App.create_SPICPI_Chart(cpiSpiTrend, App.CpiSpiSeries, false,App.dataType);
                        var projectName = App.DataStore.hierarchySv[0].ExtID;

                        var hierarchyList = $("div#treelist");
                        App.hierSpiCpiEvent(hierarchyList,App.dataType);//event for changing chart data
                        App.analyticsTplConfig(self);
                        console.log("Selected Type " + App.dataType);
                        if (App.dataType === 'Quantity') {
                            $('.costType').hide();
                            $('.dataTypeAnalytics').val('Quantity');
                        }else if (App.dataType === 'Material') {
                            $('.dataTypeAnalytics').val('Material');
                        } else {
                            //$('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            /*if (App.dataType === 'IntValProjCurr') {
                             $('.costType').val('IntValProjCurr');
                             } else {
                             $('.costType').val('ExtValProjCurr');
                             }*/
                        }
                        $('#cpiSpiChange').val(App.HierarchySelectionID);
                        _.debounce(App.expandTreeList(hierarchyList), 500);
                        _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                    break;
                default:
                    console.log('hit default');
                    break;
            }
            });
        });


        doc.on('click', 'span.export-excel', function (e) {
            e.preventDefault();
            var tableName = $(this).data('id'),
                sheet = $(this).data('sheet'),
                name = $(this).data('name');

            App.ExportTable('#' + tableName, sheet, name);
        });

        doc.on('click', 'span.export-chart-pdf', function (e) {
            e.preventDefault();
            var fileName = $(this).data('id');
            kendo.drawing.drawDOM($('#chart')).then(function (group) {
                kendo.drawing.pdf.saveAs(group, fileName + ".pdf");
            });
        });

        doc.on('click', 'span.export-report-pdf', function (e) {
            e.preventDefault();
            var fileName = $(this).data('id');
            kendo.drawing.drawDOM($('.exportTable')).then(function (group) {
                kendo.drawing.pdf.saveAs(group, fileName + ".pdf");
            });
        });

        doc.on('click', 'a#clearRAG', function (e) {
            e.preventDefault();
            doc.find('.rag').each(function (key, value) {
                $(this).css('background-color', '');
            });
            $('#applyRAGButton').show();
            $('#clearRAGButton').hide();
        });

        doc.on('click', 'a#applyRAG', function (e) {
            e.preventDefault();
            doc.find('.rag').each(function (key, value) {
                var ragColour = $(this).data('colour');
                $(this).css('background-color', ragColour);
            });
            $('#applyRAGButton').hide();
            $('#clearRAGButton').show();
        });
        /*
         doc.on('click','a#clearPicker',function(e){
         e.preventDefault();
         doc.find('tr').removeClass('isTrColor');
         doc.find('td').each(function(i,v) {
         if(!$(this).hasClass('no-paint')){
         $(this).css(App.paint.tdCssTransparent).removeClass('tdpainted');
         }
         });
         });

         doc.on('dblclick','tr:has(td)',function(e){
         e.preventDefault();
         console.log('hit '+ e.target.nodeName);
         App.paint.setTRHighlight['background-color'] = App.picker.value();//colorpicker.value();
         var self = $(this);
         var trNearby = $(self),
         currentTr = $(e.currentTarget),
         trChild = trNearby.children('td');
         if(trNearby.hasClass('isTrColor')){
         trChild.each(function(){
         if(!$(this).hasClass('tdpainted')){
         if(!$(this).hasClass('no-paint')) {
         $(this).css(App.paint.trCssTransparent).blur();
         }
         }
         });
         if(!currentTr.hasClass('tdpainted')) {
         currentTr.css(App.paint.trCssTransparent).blur();
         }
         // currentTr.css(trCssTransparent);
         trNearby.removeClass('isTrColor').blur();
         } else {
         trNearby.addClass('isTrColor').blur();
         trChild.each(function(){
         if(!$(this).hasClass('tdpainted')) {
         if(!$(this).hasClass('no-paint')) {
         $(this).css(App.paint.setTRHighlight);
         }
         }
         });
         if(!currentTr.hasClass('tdpainted')) {
         currentTr.css(App.paint.trCssTransparent);
         }
         }

         });

         doc.on('click','td.single',function(e){
         e.preventDefault();
         console.log('hit '+ e.target.nodeName);
         var target = $(e.currentTarget);
         App.paint.setHighlight['background-color'] = App.picker.value();// colorpicker.value();
         if(target.hasClass('tdpainted')){
         if(target.parent().hasClass('isTrColor')){
         target.css(App.paint.tdCssTransparent).removeClass('tdpainted');
         return;
         }
         target.css(App.paint.tdCssTransparent).removeClass('tdpainted');
         } else {
         if(!target.hasClass('no-paint')) {
         if(target.parent().hasClass('isTrColor')){
         target.css(App.paint.setHighlight).addClass('tdpainted');
         return;
         }
         target.css(App.paint.setHighlight).addClass('tdpainted');
         } else {
         alert('Can not paint this section.');
         }
         }
         });*/
    });//end dom ready
});