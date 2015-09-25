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

    'moment', 'kendo', 'FileSaver', 'en-GB', 'bootstrap-select',
    'Blob', 'base64', 'jszip',
    'jquery.table2excel', 'bootstrap'], function ($, _, domReady, App,
                                                  homeTpl, projectAnalyticsFTTpl, earnedScheduleTpl, scheduleTpl, spaTpl, spiCPITpl,
                                                  reportFooterTpl, blankFooterTpl, analyticsFooterATpl, analyticsFooterBTpl,
                                                  spinnerTpl, cpr1, cpr2, cpr3, cpr4a, cpr4b, cpr5, cprTWBS, cprTOBS, moment) {

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
            var selected = $(this),
                Hier = selected.val(),
                chartType = selected.find(':selected').attr('data-chartType'),
                selectedTitle = selected.find(':selected').attr('data-title'),
                hierarchyList = doc.find("div#treelist"),
                chartDataSource,
                self = $(this),
                $treeList = doc.find("div#treelist").data("kendoTreeList"),
                $chartGraph = doc.find("div#chart").data("kendoChart");
            console.log(Hier + ' ' + chartType);
            if (App.HierarchySelectionID === Hier) {
                console.log('hit HierarchySelectionID is same');
                alert('Your selection ' + selectedTitle + ' is the same as the default');
                return;
            } else {
                console.log('hit HierarchySelectionID is differnt');
                App.HierarchySelectionID = Hier;
                if (App.CheckHierarchyId()) {
                    return;
                } else {
                    App.ClearDataStore();
                    App.setHierarchySelection(chartType.toUpperCase());
                    selected.val(App.HierarchySelectionID);
                }
            }
            App.setVersion();
            App.SpinnerTpl(loadingWheel, 1);
            var hierData = App.HierarchySet();
            var chartData = App.SnapshotSet();
            $.when(hierData, chartData).done(function (hData, cData) {
                /** Error handler **/
                if (App.apiErrorHandler(e.currentTarget, loadingWheel, chartData)) {
                    return;
                }
                /** Error handler **/

                /**
                 * New Global Datastore set function
                 **/

                App.DataStore.setData(cData, hData);

                /** Clear Hierarchy and Chart **/
                /**/
                if (!_.isUndefined($treeList)) {
                }
                $treeList.destroy();
                $chartGraph.destroy();
                doc.find("div#chart").empty();
                hierarchyList.empty();
                //  hierarchyList.off('click');


                // $chartGraph.dataSource = App.DataStore.chart;
                if (chartType.toUpperCase() === 'SPICPI') {
                    var cpiSpiTrendData = App.cpiSpiTrend(App.DataStore.chart.options.data, 'Quantity');
                    var cpiSpiTrend = App.AssignStore(cpiSpiTrendData);
                    App.createSpiCpiChart(cpiSpiTrend, App.CpiSpiSeries, false);
                } else {
                    var refined = App.FilterChartData(App.DataStore.chart.options.data, 'Quantity');
                    App.DataStore.chart = App.AssignStore(refined.graph);
                    App.createChart(App.DataStore.chart, App.series, false, 'Quantity');
                }

                App.hierListInitialize(App.DataStore.hierarchy);
                /** Clear Hierarchy and Chart **/
                $(document).bind("kendo:skinChange", App.createChart);
                $(".chart-type-chooser").bind("change", App.refreshChart);

                $('.dataTypeAnalytics').val('Quantity');
                $('.costType').hide();
                /*App.refreshChart();*/
                // App.hierEvent(hierarchyList,'Quantity',chartType.toUpperCase());//event for changing chart data
                App.analyticsTplConfig(self);
                _.debounce(App.expandTreeList(hierarchyList), 500);
                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
            });
        });
        /* CPI SPI change hierarchy event */
        doc.on('change', '#cpiSpiChange', function (e) {
            e.preventDefault();
            var selected = $(this),
                Hier = selected.val(),
                chartType = selected.find(':selected').attr('data-chartType'),
                selectedTitle = selected.find(':selected').attr('data-title'),
                hierarchyList = doc.find("div#treelist"),
                chartDataSource,
                self = $(this),
                $treeList = doc.find("div#treelist").data("kendoTreeList"),
                $chartGraph = doc.find("div#chart").data("kendoChart");
            App.dataType = 'Quantity';
            console.log(Hier + ' ' + chartType);
            if (App.HierarchySelectionID === Hier) {
                console.log('hit HierarchySelectionID is same');
                alert('Your selection ' + selectedTitle + ' is the same as the default');
                return;
            } else {
                console.log('hit HierarchySelectionID is differnt');
                App.HierarchySelectionID = Hier;
                if (App.CheckHierarchyId()) {
                    return;
                } else {
                    App.DataStore.clearSpiCpiData();//clears cpiSpi data from storage
                    App.setHierarchySelection(chartType.toUpperCase());
                    selected.val(App.HierarchySelectionID);
                }
            }
          //  App.setVersion();

                App.setDataSelection();
                var svData = App.SVSet();// get SnapShot Cost Data
                var hierData = App.HierarchySet();//get hierarchy Data

            $.when(hierData, svData).done(function (hData, sData) {
                if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                    return;
                }
                App.DataStore.setSpiCpiData(sData,hData);

               $treeList.destroy();
               $chartGraph.destroy();
                doc.find("div#chart").empty();
                hierarchyList.empty();
                //  hierarchyList.off('click');

                App.createSpiCpiChart(App.DataStore.spiCpiChart, App.CpiSpiSeries, false,App.dataType);
                App.hierListInitialize(App.DataStore.hierarchySv);
                /** Clear Hierarchy and Chart **/
                $(document).bind("kendo:skinChange", App.createSpiCpiChart);
                $(".chart-type-chooser").bind("change", App.refreshChart);

                $('.dataTypeAnalytics').val('Quantity');
                $('.costType').hide();
                /*App.refreshChart();*/
                // App.hierEvent(hierarchyList,'Quantity',chartType.toUpperCase());//event for changing chart data
                App.analyticsTplConfig(self);
                _.debounce(App.expandTreeList(hierarchyList), 500);
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

                    combineData[0] = App.DataStore.hierarchyList;
                    App.Project(tplId, tplFooter, combineData);
                    //$("#hChange").val(App.projectID);
                    switch (name) {
                        case 'earnedSchedule':
                            App.setDataSelection();
                            esData = App.ESSet();
                            $.when(esData).done(function (eData) {
                                App.createSplittersFT();
                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, eData)) {
                                    return;
                                }
                                var filteredEs = App.ESfilter(eData.d.results,App.dataType);
                                var dataStore = App.AssignStore(filteredEs);

                                App.createSpiCpiChart(dataStore, App.seriesES, true, App.dataType);

                                $(document).bind("kendo:skinChange", App.createSpiCpiChart);
                                 $(".chart-type-chooser").bind("change", App.refreshChart);
                                App.analyticsTplConfig(self);
                                //_.debounce(App.expandTreeList(hierarchyList), 500);
                                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                            });
                            break;
                        case 'spiCPI':
                            App.setDataSelection();
                            svData = App.SVSet();// get SnapShot Cost Data
                            hierData = App.HierarchySet();//get hierarchy Data
                            $.when(hierData, svData).done(function (hData, sData) {
                                App.createSplittersFT();
                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, sData)) {
                                    return;
                                }
                                App.DataStore.setSpiCpiData(sData,hData);
                                App.hierListInitialize(App.DataStore.hierarchySv);
                                App.createSpiCpiChart(App.DataStore.spiCpiChart, App.CpiSpiSeries, false,App.dataType);

                                var projectName = App.DataStore.hierarchySv[0].ExtID;
                                $(document).bind("kendo:skinChange", App.createSpiCpiChart);
                                //$(".chart-type-chooser").bind("change", App.refreshChart);
                                var hierarchyList = $("div#treelist");
                                App.hierSpiCpiEvent(hierarchyList);//event for changing chart data
                                App.analyticsTplConfig(self);
                                $('#cpiSpiChange').val(App.HierarchySelectionID);
                                _.debounce(App.expandTreeList(hierarchyList), 500);
                                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                            });
                            break;
                        case 'spa':
                            if (_.isEmpty(App.DataStore.chart)) {
                                App.setDataSelection();
                                chartData = App.SnapshotSet();// get SnapShot Cost Data
                            }
                            hierData = App.HierarchySet();//get hierarchy Data
                            $.when(hierData, chartData).done(function (hData, cData) {
                                App.createSplittersFT();
                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, cData)) {
                                    return;
                                }

                                if (!_.isEmpty(cData)) {
                                    App.DataStore.setData(cData, hData);
                                }
                                var refined = App.FilterChartData(App.DataStore.chart.options.data, App.dataType);
                                App.DataStore.chart = App.AssignStore(refined.graph);
                                App.DataStore.hierarchy = _.first(hData).d.results;
                                App.hierListInitialize(App.DataStore.hierarchy);
                                App.createChart(App.DataStore.chart, App.series, false, App.dataType);
                                var projectName = App.DataStore.hierarchy[0].ExtID;
                                $(document).bind("kendo:skinChange", App.createChart);
                                //$(".chart-type-chooser").bind("change", App.refreshChart);
                                var hierarchyList = $("div#treelist");
                                App.hierEvent(hierarchyList, App.dataType, name);//event for changing chart data
                                App.analyticsTplConfig(self);
                                $('#hChange').val(App.HierarchySelectionID);
                                _.debounce(App.expandTreeList(hierarchyList), 500);
                                _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                            });

                            break;
                        case 'scheduleVAR':
                            if (_.isEmpty(App.DataStore.chart)) {
                                console.log('hit empty chart request');
                                App.setDataSelection();
                                chartData = App.SnapshotSet();// get SnapShot Cost Data
                            }
                            hierData = App.HierarchySet();//get hierarchy Data
                            $.when(hierData, chartData).done(function (hData, cData) {
                                App.createSplittersFT();
                                if (App.apiErrorHandler(e.currentTarget, loadingWheel, cData)) {
                                    return;
                                }
                                if (!_.isEmpty(cData)) {
                                    App.DataStore.setData(cData, hData);
                                }
                                App.DataStore.hierarchy = _.first(hData).d.results;
                                App.hierListInitialize(App.DataStore.hierarchy);
                                var refined = App.FilterChartData(App.DataStore.chart.options.data, App.dataType);
                                App.DataStore.chart = App.AssignStore(refined.graph);
                                App.createChart(App.DataStore.chart, App.seriesSV, true, App.dataType);

                                var projectName = App.DataStore.hierarchy[0].ExtID;
                                $(document).bind("kendo:skinChange", App.createChart);
                                //$(".chart-type-chooser").bind("change", App.refreshChart);
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
                version = '', projectData = '', hierData = '', vData = '', hier = '', costs = '', chartData = '',
                totals = '', gauges = '', chartDataSource = '', currentVersion = [],
                retrieveTpl = 'tpl!templates/reports/' + id + '.html';
            console.log(id);
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
                requirejs([retrieveTpl], function (tempTpl) {
                    /*********   Data Processing  *************/
                    if (_.isEmpty(App.DataStore.chart)) {
                        console.log('hit empty chart request');
                        chartData = App.SnapshotSet();// get SnapShot Cost Data
                        projectData = App.projectData();//get project Data
                        hierData = App.HierarchySet();//get hierarchy Data
                    }
                    $.when(projectData, hierData, chartData).done(function (pData, hData, cData) {//holds on for async data calls
                        /** Error handler **/
                        if (App.apiErrorHandler(e.currentTarget, loadingWheel, cData)) {
                            return;
                        }
                        /** Error handler **/
                        if (!_.isEmpty(cData)) {
                            App.DataStore.project = _.first(pData).d.results;
                            App.DataStore.setData(cData, hData);
                        }
                        hier = App.DataStore.hierarchy;
                        costs = App.DataStore.chart.options.data;

                        App.dataType = 'Quantity';
                        switch (sheet) {
                            case 'CPR-1':
                                console.log('hit 1');
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                                break;
                            case 'CPR-2':
                                console.log('hit 2');
                                /*********   Data Processing  *************/
                                combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                                break;
                            case 'CPR-3':
                                console.log('hit 3');
                                /*********   Template Processing  *********/
                                combineData[0] = App.formatThreeTotals(costs,App.dataType);
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                                break;
                            case 'CPR-4':
                                console.log('hit 4');
                                /*********   Template Processing  *********/
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatFourTotals(costs);
                                combineData[2] = {"months": App.unit.months};
                                console.log(combineData[1]);
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);

                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                                break;
                            case 'CPR-5':
                                console.log('hit 5');
                                var data = App.FilterChartData(costs, App.dataType);
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatFiveTotals(data);
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);

                                break;
                            case 'CPR-TWBS':
                                console.log('hit TW');
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
                                break;
                            case 'CPR-TOBS':
                                console.log('hit TO');
                                combineData[0] = App.DataStore.project;
                                combineData[1] = App.formatOneTotals(hier, costs, App.dataType);//Return Totals for format one
                                /*********   Template Processing  *********/
                                tplId = tempTpl;
                                tplFooter = reportFooterTpl;
                                App.Project(tplId, tplFooter, combineData);
                                bkgChange.attr('id', 'cprBG');
                                App.reportTplConfig(self);
                                /*********   End Template Processing  *****/
                                App.SpinnerTpl(loadingWheel, 0);
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

        doc.on('change', '.dataType', function (e) {
            e.preventDefault();
            App.SpinnerTpl(loadingWheel, 1);
            var self = $(this).find(':selected'),
                dataType = self.val(),
                logic = self.attr('data-sheet'),
                reportType = self.attr('data-temp');
            console.log('type: ' + dataType + ' and Report: ' + reportType);
            App.dataType = dataType;
            if (dataType === 'Quantity') {
                $('.costType').hide();
            } else if (dataType === 'Costs') {
                dataType = 'IntValProjCurr';
                $('.costType').show();
                //App.SpinnerTpl(loadingWheel, 0);
                //return;
            } else {
            }

            var retrieveTpl = 'tpl!templates/reports/' + reportType + '.html';
            var hier = App.DataStore.hierarchy;
            var costs = App.DataStore.chart.options.data;
            requirejs([retrieveTpl], function (tempTpl) {
                switch (logic) {
                    case 'CPR-1':
                        console.log('hit 1');
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatOneTotals(hier, costs, dataType);//Return Totals for format one
                        /*********   Template Processing  *********/
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        //bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        console.log(dataType);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cpr1Title').html('CPR FORMAT 1 - WBS (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cpr1Title').html('CPR FORMAT 1 - WBS (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);


                        break;
                    case 'CPR-2':

                        console.log('hit 2');
                        /*********   Data Processing  *************/
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatOneTotals(hier, costs, dataType);//Return Totals for format one
                        /*********   Template Processing  *********/
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        //bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cpr2Title').html('CPR FORMAT 2 - OBS (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cpr2Title').html('CPR FORMAT 2 - OBS (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);

                        break;
                    case 'CPR-3':
                        console.log('hit 3');
                        /*********   Template Processing  *********/
                        combineData[0] = App.formatThreeTotals(costs,dataType);
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cpr3Title').html('CPR FORMAT 3 - BASELINE (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cpr3Title').html('CPR FORMAT 3 - BASELINE (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);

                        break;
                    case 'CPR-4':

                        console.log('hit 4');
                        /*********   Template Processing  *********/
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatFourTotals(costs, dataType);
                        combineData[2] = {"months": App.unit.months};
                        console.log(combineData[1]);
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        //bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cpr4Title').html('CPR FORMAT 4 - STAFFING/FORECAST (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cpr4Title').html('CPR FORMAT 4 - STAFFING/FORECAST (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);

                        break;
                    case 'CPR-5':
                        console.log('hit 5');
                        /* var totals = App.DataStore.chartTotals;
                         var gauges = App.DataStore.gaugesData;*/
                        var data = App.FilterChartData(costs, dataType);
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatFiveTotals(data);
                        /*********   Template Processing  *********/
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        //bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cpr5Title').html('CPR FORMAT 5 - VAR (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cpr5Title').html('CPR FORMAT 5 - VAR (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);
                        break;
                    case 'CPR-TWBS':
                        console.log('hit TW');
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatOneTotals(hier, costs, dataType);//Return Totals for format one
                        /*********   Template Processing  *********/
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        //bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cprTWTitle').html('CPR FORMAT TREND - WBS (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cprTWTitle').html('CPR FORMAT TREND - WBS (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);
                        break;
                    case 'CPR-TOBS':
                        console.log('hit TO');
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatOneTotals(hier, costs, dataType);//Return Totals for format one
                        /*********   Template Processing  *********/
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        //bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                            $('#units').html('HRS');
                            $('#cprTOTitle').html('CPR FORMAT TREND - OBS (MANHOURS)');
                        } else {
                            $('.costType').show();
                            $('#units').html('&pound;');
                            $('#cprTOTitle').html('CPR FORMAT TREND - OBS (MATERIAL)');
                            $('.dataType').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel, 0);
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
                hier = '';
                costs = '';
                reportType = self.attr('data-temp');
            console.log('type: ' + dataType + ' and Report: ' + reportType);
            App.dataType = dataType;
            if (dataType === 'Quantity') {
                $('.costType').hide();
            } else if (dataType === 'Costs') {
                dataType = 'IntValProjCurr';
                $('.costType').show();
            } else {
            }

            var retrieveTpl = 'tpl!templates/analytics/' + reportType + '.html';
            /* send hierarchy list to template*/
            combineData[0] = App.DataStore.hierarchyList;
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
                     hier = App.DataStore.hierarchy;
                     costs = App.DataStore.chart.options.data;
                        console.log(combineData);
                        App.createSplittersFT();
                        App.hierListInitialize(hier);
                        var refined = App.FilterChartData(costs, dataType);
                        App.DataStore.chart = App.AssignStore(refined.graph);
                        App.createChart(App.DataStore.chart, App.series, false, dataType);
                        var projectName = App.DataStore.hierarchy[0].ExtID;
                        $(document).bind("kendo:skinChange", App.createChart);
                        $(".chart-type-chooser").bind("change", App.refreshChart);
                        var hierarchyList = $("div#treelist");
                        App.hierEvent(hierarchyList, dataType);//event for changing chart data
                        App.analyticsTplConfig(self);
                        console.warn("Selected Type " + dataType);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                        } else {
                            $('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
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
                        var filteredEs = App.ESfilter(eData.d.results, dataType);
                        var dataStore = App.AssignStore(filteredEs);

                        App.createSpiCpiChart(dataStore, App.seriesES, true, dataType);

                        $(document).bind("kendo:skinChange", App.createSpiCpiChart);
                        $(".chart-type-chooser").bind("change", App.refreshChart);
                        App.analyticsTplConfig(self);
                        console.log("Selected Type " + dataType);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                        } else {
                            $('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);
                    });

                    break;
                case 'scheduleVAR':
                    hier = App.DataStore.hierarchy;
                    costs = App.DataStore.chart.options.data;
                        App.createSplittersFT();
                        var refined = App.FilterChartData(costs, dataType);
                        App.DataStore.chart = App.AssignStore(refined.graph);
                        App.createChart(App.DataStore.chart, App.seriesSV, true, dataType);
                        var projectName = App.DataStore.hierarchy[0].ExtID;
                        $(document).bind("kendo:skinChange", App.createChart);
                        $(".chart-type-chooser").bind("change", App.refreshChart);
                        App.analyticsTplConfig(self);
                        console.log("Selected Type " + dataType);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                        } else {
                            $('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
                        }
                        _.debounce(App.SpinnerTpl(loadingWheel, 0), 1000);

                    break;
                case 'spiCPI':
                        hier = App.DataStore.hierarchySv;
                        costs = App.DataStore.rawspiCpiChartdata;
                        App.createSplittersFT();
                        App.hierListInitialize(hier);
                        var cpiSpiTrendData = App.cpiSpiTrend(costs, dataType);
                        var cpiSpiTrend = App.AssignStore(cpiSpiTrendData);
                        App.createSpiCpiChart(cpiSpiTrend, App.CpiSpiSeries, false);
                        var projectName = App.DataStore.hierarchySv[0].ExtID;
                        $(document).bind("kendo:skinChange", App.createChart);
                        $(".chart-type-chooser").bind("change", App.refreshChart);
                        var hierarchyList = $("div#treelist");
                        App.hierSpiCpiEvent(hierarchyList, dataType);//event for changing chart data
                        App.analyticsTplConfig(self);
                        console.log("Selected Type " + dataType);
                        if (dataType === 'Quantity') {
                            $('.costType').hide();
                        } else {
                            $('.costType').show();
                            $('.dataTypeAnalytics').val('Costs');
                            if (dataType === 'IntValProjCurr') {
                                $('.costType').val('IntValProjCurr');
                            } else {
                                $('.costType').val('ExtValProjCurr');
                            }
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