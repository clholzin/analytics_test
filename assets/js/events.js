define(['jquery','underscore','domReady','app',
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

    'moment','kendo','FileSaver','en-GB','bootstrap-select',
    'Blob','base64','jszip',
    'jquery.table2excel','bootstrap'],function ($,_,domReady,App,
          homeTpl,projectAnalyticsFTTpl,earnedScheduleTpl,scheduleTpl,spaTpl,spiCPITpl,
          reportFooterTpl,blankFooterTpl,analyticsFooterATpl,analyticsFooterBTpl,
          spinnerTpl,cpr1,cpr2,cpr3,cpr4a,cpr4b,cpr5,cprTWBS,cprTOBS,moment){

    domReady(function() {
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
        App.SpinnerTpl(loadingWheel,1);//Add spinner on load
        App.getUsername();

        var hierarchySets = App.projectData();
        $.when(hierarchySets).done(function(hData) {
            combineData.push(hData.d.results);
            mainBody.html(homeTpl({'combineData': combineData}));
            footer.html(blankFooterTpl);
            if (combineData[0].length > 1) {
                doc.find('.menuItem').addClass('menu-disabled');
            } else {
                App.setProjectID(combineData[0][0].TreeSelection);
            }
            App.SpinnerTpl(loadingWheel,0);//remove spinner after load + 1 sec
        });
        /** END ON LOAD **/

        /** Updated Code to allow for Selects to work inside Bootstrap Dropdown **/
        doc.on('click','.dropdown',function(e){
            e.stopPropagation();
        });

        doc.on('click','#projectSets',function(e){
            e.preventDefault();
            var value = $("#projectSets").val();
            console.log(value);
            if(_.isEmpty(value)){
                doc.find('.menuItem').addClass('menu-disabled');
                value = undefined;
                App.setProjectID(value);
            } else {
                    App.setProjectID(value);
                   if(!_.isEmpty(App.projectID) || !_.isUndefined(App.projectID)){
                        doc.find('.menuItem').removeClass('menu-disabled');
                    }
                App.ClearDataStore();

            }
            console.log('Project ID: '+ App.projectID);
            console.log('Project URLs: '+    App.urlSnapshotSet  +'  '+ App.urlHierarchySet)
        });

        doc.on('click','body',function(e){
            var target = $(e.target);
            if (target.parents('.bootstrap-select').length) {
                e.stopPropagation();
                $('.bootstrap-select.open').removeClass('open');
            }
        });

        /**
         *
         * You were right Tom, 'Change' works better here, good lookin out
         *
         * **/
        doc.on('change','#hChange',function(e){
            e.preventDefault();
            var selectedHier  = $('#hChange').val(),
                chartDataSource,
                self = $(this),
                $treeList = doc.find("div#treelist").data("kendoTreeList"),
                $chartGraph = doc.find("div#chart").data("kendoChart");
                App.setProjectID(selectedHier);
                    if(App.CheckProdId()){
                        return;
                    } else {
                        App.ClearDataStore();
                    }
                App.SpinnerTpl(loadingWheel,1);
                var hData = App.hierListData();
                var cData = App.ChartData();

            $.when(hData, cData).done(function(hierData,chartData) {
                /** Error handler **/
                if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                    return;
                }
                /** Error handler **/

                App.DataStore.rawChartdata = _.first(chartData).d.results;
                chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                App.DataStore.chartTotals  = chartDataSource.totals;
                App.DataStore.gaugesData   = chartDataSource.gauges;
                App.DataStore.hierarchy = _.first(hierData).d.results;

                /** Clear Hierarchy and Chart **/
                if(!_.isUndefined($treeList)){
                    $treeList.destroy();
                    $chartGraph.destroy();
                    doc.find("div#chart").empty();
                    doc.find("div#treelist").empty();
                }

                //$chartGraph.dataSource = App.AssignStore(chartDataSource.graph);
                //$treeList.dataSource.data(App.DataStore.hierarchy);
                App.createChart(App.DataStore.chart, App.series, false);
                App.hierListInitialize(App.DataStore.hierarchy);
                /** Clear Hierarchy and Chart **/
               // $(document).bind("kendo:skinChange", App.createChart);
               // $(".chart-type-chooser").bind("change", App.refreshChart);
                App.refreshChart();
                var hierarchyList = doc.find("div#treelist");
                App.hierEvent(hierarchyList);//event for changing chart data
                App.analyticsTplConfig(self);
                _.debounce(App.expandTreeList(hierarchyList), 500);
                _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
            });
        });

        /** Updated Code from 100 to 267 - 072815**/
        doc.on('click', '.homeTpl', function (e){
            e.preventDefault();
            var combineData = [];
            var hierarchySets = App.projectData();
            $.when(hierarchySets).done(function(hData) {
                combineData.push(hData.d.results);

                App.SpinnerTpl(loadingWheel,1);
                var id = $(this).data('temp'),
                    name = $(this).data('name');
                bkgChange.attr('id', 'indexBG');
                App.Project(homeTpl, blankFooterTpl, combineData);
                $("#projectSets").val(App.projectID);
                App.SpinnerTpl(loadingWheel,0);
            });
        });

        doc.on('click','.getAnalytics',function(e){
            e.preventDefault();
            if(App.CheckProdId()){
                return;
            }
            App.addSpinner(e.currentTarget);//bkg loading
            App.SpinnerTpl(loadingWheel,1);
            var self = $(this),
                cData = [],
                hData = [],
                chartDataSource = '',
                id = self.data('temp'),//Name of DIV
                name = self.data('name');//File Name to Export As

            /** Begin Hierarchy Panel **/
            if(_.isEmpty(App.DataStore.chart)){
                console.log('hit empty chart request');
                 cData = App.ChartData();// get SnapShot Cost Data
            }
            hData = App.hierListData();//get hierarchy Data
            /**GET REPORT TPL ON THE FLY**/
            var retrieveTpl = 'tpl!templates/analytics/'+id+'.html';
            requirejs([retrieveTpl],function(tempTpl){
                    tplId = tempTpl;
                    switch(name) {
                        case 'projectAnalyticsFT':
                            tplFooter = analyticsFooterATpl;
                            break;
                        default:
                            tplFooter = analyticsFooterBTpl;
                            break;
                    }
                    App.Project(tplId, tplFooter, combineData);
                    //$("#hChange").val(App.projectID);
                    switch(name){
                        /*case 'projectAnalytics':
                     $.when(hData, cData).done(function(hierData,chartData) {
                     App.createSplitters();
                     if(!_.isEmpty(chartData)){
                     chartDataSource = App.FilterChartData(chartData[0].d.results);
                     App.DataStore.rawChartdata = chartData[0].d.results;
                     App.DataStore.chart = new kendo.data.DataSource({
                     data: _.flatten(chartDataSource.graph),
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
                     App.DataStore.chartTotals  = chartDataSource.totals;
                     App.DataStore.gaugesData   = chartDataSource.gauges;
                     App.DataStore.hierarchy = _.sortBy(hierData[0].d.results,'SortOrder');
                     }
                     //console.log(App.DataStore.chart);
                     App.hierListInitialize(App.DataStore.hierarchy);
                     //console.log(App.DataStore.gaugesData);
                     //console.log(JSON.stringify(App.DataStore.chartTotals));

                     App.createChart(App.DataStore.chart, App.series);

                     App.createGauge(App.DataStore.gaugesData);
                     App.createTooltip(App.DataStore.gaugesData);

                     var projectName = App.DataStore.hierarchy[0].ExtID;
                     var WBSDesc = App.DataStore.hierarchy[0].Description;
                     App.displayTotals(App.DataStore.chartTotals, projectName);

                     $(document).find('.gaugeHeading').text(WBSDesc);
                     $(document).bind("kendo:skinChange", App.createChart);
                     $(".chart-type-chooser").bind("change", App.refreshChart);
                     //Changed Refresh Chart Name for clarity
                     var hierarchyList = $("div#treelist");
                     App.hierEvent(hierarchyList);//event for changing chart data
                     _.debounce(App.expandTreeList(hierarchyList), 500);
                     //var chartSelector = $("div#chart");
                     $(".export-pdf").click(function () {
                     $("#chart").getKendoChart().saveAsPDF();
                     });
                     _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
                     });
                     break;*/
                        case 'projectAnalyticsFT':
                            $.when(hData, cData).done(function(hierData,chartData) {
                                App.createSplittersFT();
                                /** Error handler **/
                                if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                                    return;
                                }
                                /** Error handler **/
                                if(!_.isEmpty(chartData)){
                                    App.DataStore.rawChartdata = _.first(chartData).d.results;
                                    chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                                    App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                                    App.DataStore.chartTotals  = chartDataSource.totals;
                                    App.DataStore.gaugesData   = chartDataSource.gauges;
                                    App.DataStore.hierarchy = _.first(hierData).d.results;
                                }
                                //console.log(App.DataStore.chart);
                                App.hierListInitialize(App.DataStore.hierarchy);
                                //console.log(App.DataStore.gaugesData);
                                //console.log(JSON.stringify(App.DataStore.chartTotals));



                                //App.createGauge(App.DataStore.gaugesData);
                                //App.createTooltip(App.DataStore.gaugesData);

                                var projectName = _.first(App.DataStore.hierarchy).ExtID;
                                var WBSDesc = _.first(App.DataStore.hierarchy).Description;
                                //App.displayTotals(App.DataStore.chartTotals, projectName);

                                $(document).find('.gaugeHeading').text(WBSDesc);
                                $(document).bind("kendo:skinChange", App.createChart);
                                $(".chart-type-chooser").bind("change", App.refreshChart);
                                /** Changed Refresh Chart Name for clarity**/
                                var hierarchyList = $("div#treelist");
                                App.hierEvent(hierarchyList);//event for changing chart data
                                _.debounce(App.expandTreeList(hierarchyList), 500);
                                //var chartSelector = $("div#chart");
                                $(".export-pdf").click(function () {
                                    $("#chart").getKendoChart().saveAsPDF();
                                });
                                _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
                            });
                            break;
                        case 'earnedSchedule':
                            $.when(hData, cData).done(function(hierData,chartData) {
                                App.createSplittersFT();
                                /** Error handler **/
                                if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                                    return;
                                }
                                /** Error handler **/
                                if(!_.isEmpty(chartData)){
                                    App.DataStore.rawChartdata = _.first(chartData).d.results;
                                    chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                                    App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                                    App.DataStore.chartTotals  = chartDataSource.totals;
                                    App.DataStore.gaugesData   = chartDataSource.gauges;
                                    App.DataStore.hierarchy = _.first(hierData).d.results;
                                }
                                //console.log(App.DataStore.chart);
                                App.hierListInitialize(App.DataStore.hierarchy);
                                //console.log(App.DataStore.gaugesData);
                                //console.log(JSON.stringify(App.DataStore.chartTotals));

                                App.createChart(App.DataStore.chart, App.seriesSV, true);

                                var projectName = _.first(App.DataStore.hierarchy).ExtID;
                                $(document).bind("kendo:skinChange", App.createChart);
                                $(".chart-type-chooser").bind("change", App.refreshChart);
                                /** Changed Refresh Chart Name for clarity**/
                                var hierarchyList = $("div#treelist");
                                App.hierEvent(hierarchyList);//event for changing chart data
                                App.analyticsTplConfig(self);
                                _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
                            });
                            break;
                        case 'spiCPI':
                            $.when(hData, cData).done(function(hierData,chartData) {
                                App.createSplittersFT();
                                /** Error handler **/
                                if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                                    return;
                                }
                                /** Error handler **/
                                if(!_.isEmpty(chartData)){
                                    App.DataStore.rawChartdata = _.first(chartData).d.results;
                                    chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                                    App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                                    App.DataStore.chartTotals  = chartDataSource.totals;
                                    App.DataStore.gaugesData   = chartDataSource.gauges;
                                    App.DataStore.hierarchy = _.first(hierData).d.results;
                                }
                                //console.log(App.DataStore.chart);
                                App.hierListInitialize(App.DataStore.hierarchy);
                                //console.log(App.DataStore.gaugesData);
                                //console.log(JSON.stringify(App.DataStore.chartTotals));

                                App.createChart(App.DataStore.chart, App.series, false);

                                var projectName = _.first(App.DataStore.hierarchy).ExtID;
                                $(document).bind("kendo:skinChange", App.createChart);
                                $(".chart-type-chooser").bind("change", App.refreshChart);
                                /** Changed Refresh Chart Name for clarity**/
                                var hierarchyList = $("div#treelist");
                                App.hierEvent(hierarchyList);//event for changing chart data
                                App.analyticsTplConfig(self);
                                _.debounce(App.expandTreeList(hierarchyList), 500);
                                _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
                            });
                            break;
                        case 'spa':
                            $.when(hData, cData).done(function(hierData,chartData) {
                                App.createSplittersFT();
                                /** Error handler **/
                                if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                                    return;
                                }
                                /** Error handler **/
                                if(!_.isEmpty(chartData)){
                                    App.DataStore.rawChartdata = _.first(chartData).d.results;
                                    chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                                    App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                                    App.DataStore.chartTotals  = chartDataSource.totals;
                                    App.DataStore.gaugesData   = chartDataSource.gauges;
                                    App.DataStore.hierarchy = _.first(hierData).d.results;
                                }
                                //console.log(App.DataStore.chart);
                                App.hierListInitialize(App.DataStore.hierarchy);
                                //console.log(App.DataStore.gaugesData);
                                //console.log(JSON.stringify(App.DataStore.chartTotals));

                                App.createChart(App.DataStore.chart, App.series, false);

                                var projectName = App.DataStore.hierarchy[0].ExtID;
                                $(document).bind("kendo:skinChange", App.createChart);
                                $(".chart-type-chooser").bind("change", App.refreshChart);
                                /** Changed Refresh Chart Name for clarity**/
                                var hierarchyList = $("div#treelist");
                                App.hierEvent(hierarchyList);//event for changing chart data
                                App.analyticsTplConfig(self);
                                _.debounce(App.expandTreeList(hierarchyList), 500);
                                _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
                            });
                            break;
                        case 'scheduleVAR':
                            $.when(hData, cData).done(function(hierData,chartData) {
                                App.createSplittersFT();
                                /** Error handler **/
                                if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                                    return;
                                }
                                /** Error handler **/
                                if(!_.isEmpty(chartData)){
                                    App.DataStore.rawChartdata = _.first(chartData).d.results;
                                    chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                                    App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                                    App.DataStore.chartTotals  = chartDataSource.totals;
                                    App.DataStore.gaugesData   = chartDataSource.gauges;
                                    App.DataStore.hierarchy = _.first(hierData).d.results;
                                }
                                //console.log(App.DataStore.chart);
                                App.hierListInitialize(App.DataStore.hierarchy);
                                //console.log(App.DataStore.gaugesData);
                                //console.log(JSON.stringify(App.DataStore.chartTotals));

                                App.createChart(App.DataStore.chart, App.seriesSV, true);

                                var projectName = _.first(App.DataStore.hierarchy).ExtID;
                                $(document).bind("kendo:skinChange", App.createChart);
                                $(".chart-type-chooser").bind("change", App.refreshChart);
                                /** Changed Refresh Chart Name for clarity**/
                                var hierarchyList = $("div#treelist");
                                App.hierEvent(hierarchyList);//event for changing chart data
                                App.analyticsTplConfig(self);
                                _.debounce(App.SpinnerTpl(loadingWheel,0), 1000);
                            });
                            break;
                        default:
                            console.log('hit default');
                            break;
                    }
              });
        });

        doc.on('click', '.getReport',function(e) {
            e.preventDefault();
            if(App.CheckProdId()){
                return;
            }
            App.addSpinner(e.currentTarget);//bkg loading
            App.SpinnerTpl(loadingWheel,1);
            var  combineData = [],
                self = $(this),
                id = self.data('temp'),
                sheet = self.data('sheet'),//Worksheet Name
                pData = '',hData = '',hier = '',costs = '',cData = '',
                totals = '',gauges = '',chartDataSource = '',
                retrieveTpl = 'tpl!templates/reports/'+id+'.html';
            console.log(id);
            requirejs([retrieveTpl],function(tempTpl){
            /*********   Data Processing  *************/
            if(_.isEmpty(App.DataStore.chart)){
                console.log('hit empty chart request');
                cData = App.ChartData();// get SnapShot Cost Data
                pData = App.projectData();//get project Data
                hData = App.hierListData();//get hierarchy Data
            }
                $.when(pData, hData,cData).done(function(projectData, hierData,chartData) {//holds on for async data calls
                    /** Error handler **/
                    if(App.apiErrorHandler(e.currentTarget,loadingWheel,chartData)){
                        return;
                    }
                    /** Error handler **/
                    if(!_.isEmpty(projectData)){
                          App.DataStore.project = _.first(projectData).d.results;
                          App.DataStore.rawChartdata = _.first(chartData).d.results;
                          chartDataSource = App.FilterChartData(App.DataStore.rawChartdata);
                          App.DataStore.chart = App.AssignStore(chartDataSource.graph);
                          App.DataStore.chartTotals  = chartDataSource.totals;
                          App.DataStore.gaugesData   = chartDataSource.gauges;
                          App.DataStore.hierarchy = _.first(hierData).d.results;

                      }
                        hier = App.DataStore.hierarchy;
                        costs = App.DataStore.rawChartdata;

            switch(sheet){
                case 'CPR-1':
                    console.log('hit 1');
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatOneTotals(hier,costs,'OB');//Return Totals for format one
                        /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                          /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel,0);
                    break;
                case 'CPR-2':
                    console.log('hit 2');
                    /*********   Data Processing  *************/
                        combineData[1] = App.formatOneTotals(hier,costs,'PR');//Return Totals for format one
                        /*********   Template Processing  *********/
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);

                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel,0);
                    break;
                case 'CPR-3':
                    console.log('hit 3');
                    /*********   Template Processing  *********/
                        totals = App.DataStore.chartTotals;
                        var chartData = App.DataStore.chart.options.data;
                        combineData[0]= App.formatThreeTotals(totals,chartData,costs);
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);

                    /*********   End Template Processing  *****/
                    App.SpinnerTpl(loadingWheel,0);
                    break;
                case 'CPR-4':
                    console.log('hit 4');
                    /*********   Template Processing  *********/
                        combineData[0] = App.DataStore.project;
                        combineData[1] = App.formatFourTotals(App.DataStore.chart.options.data);
                        combineData[2] = {"months":App.unit.months};
                        console.log(combineData[1]);
                        tplId = tempTpl;
                        tplFooter = reportFooterTpl;
                        App.Project(tplId, tplFooter, combineData);
                        bkgChange.attr('id', 'cprBG');
                        App.reportTplConfig(self);

                    /*********   End Template Processing  *****/
                    App.SpinnerTpl(loadingWheel,0);
                    break;
                case 'CPR-5':
                    console.log('hit 5');
                        totals = App.DataStore.chartTotals;
                        gauges = App.DataStore.gaugesData;
                        combineData[0] = App.DataStore.project;
                        combineData[1]=   App.formatFiveTotals(totals,gauges);
                        /*********   Template Processing  *********/
                            tplId = tempTpl;
                            tplFooter = reportFooterTpl;
                            App.Project(tplId, tplFooter, combineData);
                            bkgChange.attr('id', 'cprBG');
                            App.reportTplConfig(self);
                        /*********   End Template Processing  *****/
                        App.SpinnerTpl(loadingWheel,0);

                    break;
                case 'CPR-TWBS':
                    console.log('hit TW');
                    /*********   Template Processing  *********/
                    tplId = tempTpl;
                    tplFooter = reportFooterTpl;
                    App.Project(tplId, tplFooter, combineData);
                    bkgChange.attr('id', 'cprBG');
                    App.reportTplConfig(self);

                    /*********   End Template Processing  *****/
                    App.SpinnerTpl(loadingWheel,0);

                    break;
                case 'CPR-TOBS':
                    console.log('hit TO');
                    /*********   Template Processing  *********/
                    tplId = tempTpl;
                    tplFooter = reportFooterTpl;
                    App.Project(tplId, tplFooter, combineData);
                    bkgChange.attr('id', 'cprBG');
                    App.reportTplConfig(self);

                    /*********   End Template Processing  *****/
                    App.SpinnerTpl(loadingWheel,0);

                    break;
                default:
                    console.log('hit default');
                    break;
            }
                });//end of when clause
                /*********   End Data Processing  *********/
            });//end of template require
        });

        doc.on('click', 'span.export-excel', function (e){
            e.preventDefault();
            var tableName = $(this).data('id'),
                sheet = $(this).data('sheet'),
                name = $(this).data('name');

            App.ExportTable('#' + tableName, sheet, name);
        });

        doc.on('click', 'span.export-chart-pdf', function (e){
            e.preventDefault();
            var fileName = $(this).data('id');
            kendo.drawing.drawDOM($('#chart')).then(function(group){
                kendo.drawing.pdf.saveAs(group, fileName+".pdf");
            });
        });

        doc.on('click', 'span.export-report-pdf', function (e){
            e.preventDefault();
            var fileName = $(this).data('id');
            kendo.drawing.drawDOM($('.exportTable')).then(function(group){
                kendo.drawing.pdf.saveAs(group, fileName+".pdf");
            });
        });

        doc.on('click', 'a#clearRAG', function (e){
            e.preventDefault();
            doc.find('.rag').each(function(key,value) {
                $(this).css('background-color', '');
            });
            $('#applyRAGButton').show();
            $('#clearRAGButton').hide();
        });

        doc.on('click', 'a#applyRAG', function (e){
            e.preventDefault();
            doc.find('.rag').each(function(key,value) {
                var ragColour = $(this).data('colour');
                $(this).css('background-color', ragColour);
            });
            $('#applyRAGButton').hide();
            $('#clearRAGButton').show();
        });

        doc.on('click', '#dataType', function (e){
            e.preventDefault();
            if (doc.find('#dataType').val() == "Cost") {
                $('#costType').attr('disabled', false);
                $('#units').html('&pound;');
                $('#cpr1Title').html('CPR FORMAT 1 - WBS (MATERIAL)');
                $('#cpr2Title').html('CPR FORMAT 2 - OBS (MATERIAL)');
                $('#cpr3Title').html('CPR FORMAT 3 - BASELINE (MATERIAL)');
                $('#cpr4Title').html('CPR FORMAT 4 - STAFFING/FORECAST (MATERIAL)');
                $('#cpr5Title').html('CPR FORMAT 5 - VAR (MATERIAL)');
                $('#cprTWTitle').html('CPR FORMAT TREND - WBS (MATERIAL)');
                $('#cprTOTitle').html('CPR FORMAT TREND - OBS (MATERIAL)');
            } else {
                $('#costType').attr('disabled', true);
                $('#units').html('HRS');
                $('#cpr1Title').html('CPR FORMAT 1 - WBS (MANHOURS)');
                $('#cpr2Title').html('CPR FORMAT 2 - OBS (MANHOURS)');
                $('#cpr3Title').html('CPR FORMAT 3 - BASELINE (MANHOURS)');
                $('#cpr4Title').html('CPR FORMAT 4 - STAFFING/FORECAST (MANHOURS)');
                $('#cpr5Title').html('CPR FORMAT 5 - VAR (MANHOURS)');
                $('#cprTWTitle').html('CPR FORMAT TREND - WBS (MANHOURS)');
                $('#cprTOTitle').html('CPR FORMAT TREND - OBS (MANHOURS)');
            }
        });

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
        });
    });//end dom ready
});