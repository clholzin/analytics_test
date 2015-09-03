/**
 * Created by Craig on 7/14/2015.
 * Update by Tom on 7/27/2015
 */
define(['jquery','underscore','moment','kendo','Blob','base64','jszip','FileSaver',
    'jquery.table2excel'], function ($,_,moment) {
    var App = App || {};
    App.projectID = "";
    App.reportData = "/DSN/PMR_01_SRV";
    App.serviceRoot = window.location.protocol + '//' + window.location.host + '/pmr01srv' + App.reportData;
    App.urlProjectSet = "/ReportSelectionSet?$format=json";
    App.colorpicker = '';
    moment.locale('en');
    App.tdColor = '#ede330';
    App.series = [
        {
            name: "BCWS",
            type: "line",
            field: "runningBCWS",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#428bca",
            markers: {type: "circle"}
        },
        {
            name: "BCWP",
            type: "line",
            field: "runningBCWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#5bc0de",
            markers: {type: "circle"}
        },
        {
            name: "EAC",
            type: "line",
            field: "runningEAC",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#5cb85c",
            markers: {type: "circle"}
        },
        {
            name: "ACWP",
            type: "line",
            field: "runningACWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#f0ad4e",
            markers: {type: "circle"}
        }
    ];
    App.seriesCombo = [
        {
            name: "BCWS",
            type: "column",
            field: "BCWS",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#428bca",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "BCWP",
            type: "column",
            field: "BCWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#5bc0de",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "EAC",
            type: "column",
            field: "EAC",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#5cb85c",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "ACWP",
            type: "column",
            field: "ACWP",
            categoryField: "Date",
            // aggregate: "sum",
            color: "#f0ad4e",
            markers: {type: "circle"},
            axis: "Total"
        },
        {
            name: "BCWS [cum]",
            type: "line",
            field: "runningBCWS",
            categoryField: "Date",
            color: "#27596b",
            markers: {type: "circle"},
            axis: "Cumulative"
        },
        {
            name: "BCWP [cum]",
            type: "line",
            field: "runningBCWP",
            categoryField: "Date",
            color: "#3585ba",
            markers: {type: "circle"},
            axis: "Cumulative"
        },
        {
            name: "EAC [cum]",
            type: "line",
            field: "runningEAC",
            categoryField: "Date",
            color: "#258440",
            markers: {type: "circle"}
            ,
            axis: "Cumulative"
        },
        {
            name: "ACWP [cum]",
            type: "line",
            field: "runningACWP",
            categoryField: "Date",
            color: "#ea9643",
            markers: {type: "circle"},
            axis: "Cumulative"
        }
    ];

    App.DataStore = {
        chart:{},
        chartTotals:[],
        rawChartdata:[],
        gaugesData:[],
        project:{},
        hierarchy:[],
         empty: function(){
             this.chart = {};
             this.chartTotals = [];
             this.rawChartdata = [];
             this.gaugesData = [];
             this.project = {};
             this.hierarchy = [];
        }
    };

    /**App.unit = {"months":[]};
     App.unit.months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     **/
    App.unit = {
        _monthAttr:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        get months(){
            return this._monthAttr;
        }
    };
    App.paint = {
        "trCssTransparent" : {
            'color':'black',
            'background-color':'transparent'
        },
        "tdCssTransparent" : {
            'color':'black',
            'background-color':'transparent'
        },
        "setTRHighlight":{
            'background-color':App.tdColor,
            'color':'black'
        },
        "setHighlight" : {
            'background-color':App.tdColor,
            'color':'black'
        },
        "hoverHighlight" :{
            'background-color':App.tdColor,
            'color':'black'
        }
    };

    App.setProjectID = function(value){
        this.projectID = value;
        this.urlSnapshotSet = "/SnapshotSet(TreeSelection='" + this.projectID + "')?$format=json";
        this.urlHierarchySet = "/HierarchySet(TreeSelection='" + this.projectID + "')?$format=json";
    };

    App.CheckProdId = function(){
      if(_.isEmpty(this.projectID) || _.isUndefined(this.projectID)){
            alert('Please select option from CAM Assigned Projects.');
                 return true;
        }
    };

    App.ClearDataStore = function(){
        this.DataStore.empty();
    };

    App.AssignStore = function(data){
       // if(_.isEmpty(App.DataStore.chart)){
           return  new kendo.data.DataSource({
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
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
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
    App.Project =  function (id, foot, data) {
         var pageBody = $('div.mainBody'),
           pageFooter = $('div.footer');
      //  pageBody.empty();
      //  pageFooter.empty();
        var pageData = id;
        var footerData = foot;
        pageBody.html(pageData({'combineData': data}));
        pageFooter.html(footerData);
    };

    App.colorpicker = function(selector) {
        selector.kendoColorPicker({
            value: this.tdColor,
            buttons: false
        }).data("kendoColorPicker");
    };

    App.analyticsTplConfig = function (selector) {
        var name = $(selector).data('name'),//File Name to Export As
            $exportReportPDF = $(document).find('span.export-report-pdf');
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
                picker = $(document).find("input#picker"),
                tempTable = $(document).find('table');
                    console.log('tableName ' + tableName);
                    $export.attr('data-id', tableName);
                    $export.attr('data-name', name);
                    $export.attr('data-sheet', sheet);
                    $exportPDF.attr('data-id', name);
                    $exportReportPDF.attr('data-id', name);

                    $(document).find('.selectpicker').selectpicker({
                        container: 'body'
                    });

                    App.colorpicker(picker);
                    App.picker = picker.data("kendoColorPicker");
                    $(document).find('div.k-animation-container').css('left', '-10px');
                    tempTable.addClass('table table-responsive').css('table-layout', 'fixed').wrap('<div class="wbsWrap"></div>');
                    tempTable.find('tr').addClass('border-color');
                    var tdTable = {"font-size": "0.7vmax", "overflow": "hidden"};
                    tempTable.find('td').addClass('single').css(tdTable);

                    var tdBkg = $(document).has('table').find('td.single');
                    tdBkg.hover(self.tdHover);
    };

    App.formatOneTotals =  function(hier, costs,type) {
        console.time('Format One Totals');
        var newObj = '';
        var hierarchy = '';
        var cost = [];
        var total = 0;
        var amounts = '';
        var parent = [];
        var self = this;
        if (hier.length === 0) {
            return alert('No Heirarchy data');
        }

        if (costs.length === 0) {
            return alert('No SnapShot data');
        }
        $.each(hier, function (k, v) {
            if (k > 0) {
                newObj = $.grep(costs, function (item) {
                    return item.ObjectNumber === v.ObjectNumber
                });
            } else {
                newObj = costs;
            }

            var data = self.FilterChartData(newObj);

            total = data.totals.length != 0 ? data.totals : 0;

            if (total === 0) {
                amounts = {
                    "bcwsTotal":total,
                    "curBcwsTotal": total,
                    "bcwpTotal": total,
                    "curBcwpTotal": total,
                    "eacTotal": total,
                    "curEacTotal": total,
                    "acwpTotal": total,
                    "curAcwpTotal": total,
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
                var CurrSV = parseFloat(total[1].curBcwpTotal) - parseFloat(total[0].curBcwsTotal);
                var CurrCV = parseFloat(total[1].curBcwpTotal) - parseFloat(total[3].curAcwpTotal);
                var sv = parseFloat(total[1].bcwpTotal) - parseFloat(total[0].bcwsTotal);
                var cv = parseFloat(total[1].bcwpTotal) - parseFloat(total[3].acwpTotal);
                var vac = parseFloat(total[5].bac) - parseFloat(total[4].eacCum);
                var gaugeData = data.gauges,
                    spi = gaugeData[0].spi,
                    cpi = gaugeData[1].cpi;
                //var currentSPI = $(document).find('');
                var spiColour = "";
                if (spi < 0.9) {
                    spiColour = "#FF0000";//red
                } else if (spi > 0.9 && spi < 0.95) {
                    spiColour = "#FF9933";//amber
                } else if (spi > 0.95 && spi < 1.2) {
                    spiColour = "#009933";//green
                } else {
                    spiColour = "#0066CC";//blue
                }
                //currentSPI.attr('data-colour', spiColour);
                var cpiColour = "";
                if (cpi < 0.9) {
                    cpiColour = "#FF0000";//red
                } else if (cpi > 0.9 && cpi < 0.95) {
                    cpiColour = "#FF9933";//amber
                } else if (cpi > 0.95 && cpi < 1.2) {
                    cpiColour = "#009933";//green
                } else {
                    cpiColour = "#0066CC";//blue
                }
                var curSPI = gaugeData[0].curSPI;
                var curCPI = gaugeData[1].curCPI;
                amounts = {
                    "bcwsTotal": total[0].bcwsTotal,
                     "curBcwsTotal": total[0].curBcwsTotal,
                    "bcwpTotal": total[1].bcwpTotal,
                     "curBcwpTotal": total[1].curBcwpTotal,
                    "eacTotal": total[2].eacTotal,
                     "curEacTotal": total[2].curEacTotal,
                    "acwpTotal": total[3].acwpTotal,
                     "curAcwpTotal": total[3].curAcwpTotal,
                    "eacCum": total[4].eacCum,
                    "bac": total[5].bac,
                    "tcpi": total[6].tcpi,
                    "sv": sv,
                    "cv": cv,
                    "CurrSV": CurrSV,
                    "CurrCV": CurrCV,
                    "vac": vac,
                    "curSPI": curSPI,
                    "curCPI": curCPI,
                    "spi": spi,
                    "cpi": cpi,
                    "spiColour": spiColour,
                    "cpiColour": cpiColour
                };
            }
            cost.push({
                'parentNumber': v.ParentObjNum,
                'objNumber': v.ObjectNumber,
                'ExtID': v.ExtID,
                'Type': v.Type,
                'Description': v.Description,
                'SortOrder': v.SortOrder,
                'bcwsCost': amounts.bcwsTotal,
                'totals': amounts
            });
        });//end of each loop
        $.each(cost, function (key, value) {
            if (key > 0) {
                var indexof = _.findIndex(cost, function (search) {
                    return search.objNumber === value.parentNumber
                });
              //  console.log(indexof);
                if (indexof != -1 && (indexof > 0)) {
                        parent.push(indexof);
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
                    cost[indexof].totals.curSPI += parseFloat(value.totals.curSPI);
                    cost[indexof].totals.curCPI += parseFloat(value.totals.curCPI);
                        cost[indexof].totals.vac += parseFloat(value.totals.vac);
                    cost[indexof].totals.spiColour = value.totals.spiColour;
                    cost[indexof].totals.cpiColour = value.totals.cpiColour;
                }
            }
        });//end loop

       $.each(parent, function (kk, vv) {
            var roundbcwsTotal = self.Math.ceil10(cost[vv].totals.bcwsTotal, -2);
            var roundbcwpTotal = self.Math.ceil10(cost[vv].totals.bcwpTotal, -2);
            var roundacwpTotal = self.Math.ceil10(cost[vv].totals.acwpTotal, -2);
            var spiTotal = (roundbcwpTotal / roundbcwsTotal);
            var cpiTotal = (roundbcwpTotal / roundacwpTotal);
            //  var tcpi = (bac - roundbcwpTotal)/(eacCum - roundacwpTotal);
            if (isNaN(spiTotal)) {
                spiTotal = 0;
            }
            if (isNaN(cpiTotal)) {
                cpiTotal = 0;
            }
            cost[vv].totals.spi = self.Math.ceil10(spiTotal, -2);
            cost[vv].totals.cpi = self.Math.ceil10(cpiTotal, -3);
        });/** **/
        hierarchy = $.grep(cost,function(item,i){
            if(i > 0){
                return item.Type === type;
            }
            if(i === 0){
                return item;
            }
        });
        console.timeEnd('Format One Totals');
        return hierarchy;
    };

    App.formatThreeTotals = function(totals,chartData,rawData){
        var rawSortedDate = _.sortBy(rawData,'Date');
        var array = [],
            start = moment(_.first(rawSortedDate).Date).format('YYYY/MM'),
            end = moment(_.last(rawSortedDate).Date).format('YYYY/MM'),
            bcwsHrRate = parseFloat(totals[0].bcwsTotal) / parseFloat(totals[0].bcwsHrs),
            bcwpHrRate = parseFloat(totals[1].bcwpTotal) / parseFloat(totals[1].bcwpHrs),
            eacHrRate  = parseFloat(totals[2].eacTotal) / parseFloat(totals[2].eacHrs),
            acwpHrRate = parseFloat(totals[3].acwpTotal) / parseFloat(totals[3].acwpHrs);
            array.push({
                "start":start,
                "end":end,
                "bcwsTotal":bcwsHrRate.toFixed(2)+' Hourly Rate',
                "bcwsHrs":totals[0].bcwsHrs.toFixed(2),
                "bcwpTotal": bcwpHrRate.toFixed(2)+' Hourly Rate',
                "bcwpHrs": totals[1].bcwpHrs.toFixed(2),
                "eacTotal":eacHrRate.toFixed(2)+' Hourly Rate',
                "eacHrs":totals[2].eacHrs.toFixed(2),
                "acwpTotal":acwpHrRate.toFixed(2)+' Hourly Rate',
                "acwpHrs":totals[3].acwpHrs.toFixed(2),
                "eacCum":totals[4].eacCum.toFixed(2),
                "bac":totals[5].bac.toFixed(2)
            });
        return array[0];
    };

    App.formatFourTotals =  function(costs) {
        var master = [],
            year = '',
            monthTitle = '',
            month = '';
        if(_.isArray(costs)){
            var length = Number(costs.length);
            console.time('formatFourTotals loop');
            console.log('costs length '+length);
            var beginDate = moment(costs[0].Date).format('YY');
            console.log('beginDate '+beginDate);
            var BCWS = $.grep(costs,function(item){
                 if(item.Type === 'BCWS'){
                     return item;
                 }
            });
            var BCWP = $.grep(costs,function(item){
                if(item.Type === 'BCWP'){
                    return item;
                }
            });
            var EAC = $.grep(costs,function(item){
                if(item.Type === 'EAC'){
                    return item;
                }
            });
            var ACWP = $.grep(costs,function(item){
                if(item.Type === 'ACWP'){
                    return item;
                }
            });
            console.time('BCWS loop');
            console.log('BCWS len '+BCWS.length);
            $.each(BCWS,function(ka,va){
                year = moment(va.Date).format('YY');
                month = moment(va.Date).format('M');
                monthTitle = moment(va.Date).format('MMM');
                if(_.isUndefined(master[year])){
                    master[year] = {};
                }
                if(!_.has(master[year],'bcws')){
                    master[year].bcws = [];
                    master[year].bcws[month] = {};
                }
                if(_.has(master[year].bcws[month],'Quantity')) {
                    master[year].bcws[month].Quantity += parseFloat(va.QuantityBCWS);
                    master[year].bcws[month].Total += parseFloat(va.BCWS);
                }else {
                    master[year].bcws[month] = {
                        "Month":monthTitle,
                        "Quantity":App.Math.ceil10(va.QuantityBCWS,-2),
                        "Total":App.Math.ceil10(va.BCWS,-2)};
                    }
            });
            console.timeEnd('BCWS loop');
            console.time('BCWP loop');
            console.log('BCWP len '+BCWP.length);
            $.each(BCWP,function(kb,vb){
                year = moment(vb.Date).format('YY');
                month = moment(vb.Date).format('M');
                monthTitle = moment(vb.Date).format('MMM');
                if(_.isUndefined(master[year])){
                    master[year] = {};
                }
                if(!_.has(master[year],'bcwp')){
                    master[year].bcwp = [];
                    master[year].bcwp[month] = {};
                }
                if(_.has(master[year].bcwp[month],'Quantity')) {
                    master[year].bcwp[month].Quantity += parseFloat(vb.QuantityBCWP);
                    master[year].bcwp[month].Total += parseFloat(vb.BCWP);
                }else {
                    master[year].bcwp[month] = {
                        "Month":monthTitle,
                        "Quantity":App.Math.ceil10(vb.QuantityBCWP,-2),
                        "Total":App.Math.ceil10(vb.BCWP,-2)};
                }
            });
            console.timeEnd('BCWP loop');
            console.time('EAC loop');
            console.log('EAC len '+EAC.length);
            $.each(EAC,function(kc,vc){
                year = moment(vc.Date).format('YY');
                month = moment(vc.Date).format('M');
                monthTitle = moment(vc.Date).format('MMM');
                if(_.isUndefined(master[year])){
                    master[year] = {};
                }
                if(!_.has(master[year],'eac')){
                    master[year].eac = [];
                    master[year].eac[month] = {};
                }
                if(_.has(master[year].eac[month],'Quantity')) {
                    master[year].eac[month].Quantity += parseFloat(vc.QuantityEAC);
                    master[year].eac[month].Total += parseFloat(vc.EAC);
                }else {
                    //  console.log('hit else');
                    master[year].eac[month] = {
                        "Month":monthTitle,
                        "Quantity":App.Math.ceil10(vc.QuantityEAC,-2),
                        "Total":App.Math.ceil10(vc.EAC,-2)};
                }
            });
            console.timeEnd('EAC loop');
            console.time('ACWP loop');
            console.log('ACWP len '+ACWP.length);
            $.each(ACWP,function(kd,vd){
                year = moment(vd.Date).format('YY');
                month = moment(vd.Date).format('M');
                monthTitle = moment(vd.Date).format('MMM');
                if(_.isUndefined(master[year])){
                    master[year] = {};
                }
                if(!_.has(master[year],'acwp')){
                    master[year].acwp = [];
                    master[year].acwp[month] = {};
                }
                if(_.has(master[year].acwp[month],'Quantity')) {
                    master[year].acwp[month].Quantity += parseFloat(vd.QuantityACWP);
                    master[year].acwp[month].Total += parseFloat(vd.ACWP);
                }else {
                    master[year].acwp[month] = {
                        "Month":monthTitle,
                        "Quantity":App.Math.ceil10(vd.QuantityACWP,-2),
                        "Total":App.Math.ceil10(vd.ACWP,-2)};
                }
            });
            console.timeEnd('ACWP loop');
        }
        console.timeEnd('formatFourTotals loop');
        return master;
    };

    App.formatFiveTotals = function(totals, gauges){
        var sv = parseFloat(totals[1].bcwpTotal) - parseFloat(totals[0].bcwsTotal);
        var cv = parseFloat(totals[1].bcwpTotal) - parseFloat(totals[3].acwpTotal);
        var vac = parseFloat(totals[5].bac) - parseFloat(totals[4].eacCum);
        var spi = gauges[0].spi;
        var cpi = gauges[1].cpi;
        var spiColour = "";
        if (spi < 0.9) {
            spiColour = "#FF0000";//red
        } else if (spi > 0.9 && spi < 0.95) {
            spiColour = "#FF9933";//amber
        } else if (spi > 0.95 && spi < 1.2) {
            spiColour = "#009933";//green
        } else {
            spiColour = "#0066CC";//blue
        }
        var cpiColour = "";
        if (cpi < 0.9) {
            cpiColour = "#FF0000";//red
        } else if (cpi > 0.9 && cpi < 0.95) {
            cpiColour = "#FF9933";//amber
        } else if (cpi > 0.95 && cpi < 1.2) {
            cpiColour = "#009933";//green
        } else {
            cpiColour = "#0066CC";//blue
        }
        return {
            "bcwsTotal":totals[0].bcwsTotal,
            "bcwpTotal": totals[1].bcwpTotal,
            "eacTotal":totals[2].eacTotal,
            "acwpTotal":totals[3].acwpTotal,
            "eacCum":totals[4].eacCum,
            "bac":totals[5].bac,
            "tcpi":totals[6].tcpi,
            "vac":vac,
            "cpi":gauges[1].cpi,
            "spi":gauges[0].spi,
            "cpiColour":cpiColour,
            "spiColour":spiColour,
            "sv":sv,
            "cv":cv
        };

    };

    App.ExportTable = function(selector, DocName, fileName) {
        $(selector).table2excel({
            exclude: "",
            name: DocName,
            filename: fileName
        });
    };

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
            //setTimeout(function () {
                placeOnDom.addClass('displayNone').fadeOut('slow').empty();
           // }, 1000);
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

    App.createSplitters = function(){
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
                {collapsible: true, size: "75%"}
            ]
        });
    };

    App.createSplittersFT = function(){
        $("#vertical").kendoSplitter({
            orientation: "vertical",
            panes: [
                {collapsible: true},
                {collapsible: true, size: "70%"}
            ]
        });

        $("#horizontal").kendoSplitter({
            panes: [
                {collapsible: true, size: "225px"},
                {collapsible: true}
            ]
        });
    };

    App.createSplittersFC = function(){
        $("#vertical").kendoSplitter({
            orientation: "vertical",
            panes: [
                {collapsible: true},
                {collapsible: true, size: "50%"}
            ]
        });

        $("#horizontal").kendoSplitter({
            panes: [
                {collapsible: true, size: "275px"},
                {collapsible: true}
            ]
        });
    };

    App.refreshChart = function() {
        var chart = $("#chart").data("kendoChart"),
            series = '',
            type = $("input[name=seriesType]:checked").val();
        //stack = $("#stack").prop("checked");
            var ValueAxis = [{
                title: {text: ' Total'}
            }];
            if(type === 'combo'){
                series = App.seriesCombo;
                ValueAxis =  [{
                        name: "Cumulative",
                        title: { text: "Cum" },
                        color: "#ec5e0a"
                    },
                    {   name: "Total",
                        title: {text: ' Total'}
                    }];

            }else{
                series = App.series;
                for (var i = 0, length = series.length; i < length; i++) {
                    //series[i].stack = stack;
                    series[i].type = type;
                }

            }
        chart.setOptions({
            valueAxes:ValueAxis,
            series: series
        });
    };

    App.tdHover = function(e) {
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

    App.hierEvent = function(selector) {
        /*********** New Hierarchy Button View Click Event ***************/
        selector.on('click', 'tr span.js-hier', function (e) {
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
              //  case 1:
                    chartFiltered = App.FilterChartData(chartdata);
                    break;
                default:
                    if ($children) {
                        var allChildIndexes = App.allNodes($($trParent), collectIndexes);
                        console.log(JSON.stringify(allChildIndexes));
                        var Indexes = _.without(allChildIndexes, -1);
                        console.log(JSON.stringify(Indexes));
                        $.each(Indexes, function (key, value) {//[data-children="false"]
                            filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[value].ObjectNumber});
                        });
                        console.log('multiple ' + JSON.stringify(filteredSnapByIndex));
                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = App.FilterChartData(filteredSnapByParentId);
                    } else {
                        filteredSnapByIndex.push({'ObjectNumber': $treeList.dataSource.options.data[$rowIndex].ObjectNumber});
                        console.log('single ' + JSON.stringify(filteredSnapByIndex));
                        filteredSnapByParentId = App.FilterByHierList(filteredSnapByIndex, chartdata);
                        chartFiltered = App.FilterChartData(filteredSnapByParentId);
                    }
                    break;
            }
            if (chartFiltered != undefined) {
                var chartTotalsFilteredBy = _.flatten(chartFiltered.totals);
                console.log(chartTotalsFilteredBy);
                App.displayTotals(chartTotalsFilteredBy);

                var chartFilteredByParentId = _.flatten(chartFiltered.graph);
                console.log(chartFilteredByParentId.length);
                $chartGraph.dataSource.data(chartFilteredByParentId);
                App.refreshChart();

                var gaugesData = _.flatten(chartFiltered.gauges);
                App.createGauge(gaugesData);
                App.createTooltip(gaugesData);
            }

        });
    };

    /**********Added Initilized Hiearchy expaneded**********/
    App.expandTreeList = function(selector) {
        $(document).find(selector).data("kendoTreeList").expand(".k-treelist-group");
       // $(document).find(selector).data("kendoTreeList").expand(".k-alt");

    };

    /** New Function projectData 072815**/
    App.projectData = function() {
        var projectSource = $.ajax({
            url: this.serviceRoot + this.urlProjectSet,
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
    App.ChartData = function() {
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
                                "TreeSelection": value.TreeSelection,
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

    App.FilterChartData = function(results) {
        var master = {};
        master.graph = [];
        master.totals = [];
        master.gauges = [];
        var dateCheck = '';
        var dateCheckBefore = '';
        var data = _.flatten(results);
        if (data.length === 0) {
            console.log('No Data to filter series.');
           // return master;
        }
        var BCWS = $.grep(data, function (item) {
            if (item.Version === 'D02' && (item.ValueType === '01')) {
                return item;
            }
        });//filter data
        var BCWP = $.grep(data, function (item) {
            if (item.Version === 'D02' && (item.ValueType === 'P2')) {
                return item;
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
            if (item.Version === 'EA1' && (item.ValueType === '01')) {
                return item;
            }
        });//filter data
        if (_.isArray(BCWS)) {
            var runningTotalBCWS = 0;
            var BCWSdata = _.map(BCWS, function (value) {
                runningTotalBCWS += parseFloat(value.IntValProjCurr);
                dateCheck =  moment(value.Date).isSame(value.SnapshotDate);
                dateCheckBefore =  moment(value.SnapshotDate).isAfter(value.Date);
                return {
                    "BCWS": Number(value.IntValProjCurr),
                    "QuantityBCWS": Number(value.Quantity),
                    "runningBCWS":Number(runningTotalBCWS),
                    "IntValProjCurr": Number(value.IntValProjCurr),
                    "ExtValProjCurr" : Number(value.ExtValProjCurr),
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type":"BCWS",
                    "Date": value.Date,
                    "isSame":dateCheck,
                    "isAfter":dateCheckBefore
                }
            });//convert IntValProjCurr key for Chart Series
            var bcwsTotal = 0,bcwsAll = 0, bcwsHrs = 0, curBcwsTotal = 0, curBcwsHrs = 0;
            $.each(BCWSdata, function (key, value) {
                bcwsAll += parseFloat(value.BCWS);
                if(value.isAfter || value.isSame) {
                    bcwsTotal += parseFloat(value.BCWS);
                    bcwsHrs += parseFloat(value.QuantityBCWS);
                }
                if(value.isSame){
                    curBcwsTotal += parseFloat(value.BCWS);
                    curBcwsHrs += parseFloat(value.QuantityBCWS);
                }
            });
            master.totals.push({"bcwsAll":App.Math.ceil10(bcwsAll, -2),"bcwsTotal": App.Math.ceil10(bcwsTotal, -2),"bcwsHrs":App.Math.ceil10(bcwsHrs, -2),"curBcwsTotal": App.Math.ceil10(curBcwsTotal, -2),"curBcwsHrs":App.Math.ceil10(curBcwsHrs, -2)});//.toFixed(2)
            master.graph.push(BCWSdata);//add array to master array
        }
        if (_.isArray(BCWP)) {
            var runningTotalBCWP = 0;
            var BCWPdata = _.map(BCWP, function (value) {
                runningTotalBCWP += parseFloat(value.IntValProjCurr);
                dateCheck =  moment(value.Date).isSame(value.SnapshotDate);
                dateCheckBefore =  moment(value.SnapshotDate).isBefore(value.Date);
                return {
                    "BCWP": Number(value.IntValProjCurr),
                    "QuantityBCWP": Number(value.Quantity),
                    "runningBCWP":Number(runningTotalBCWP),
                    "IntValProjCurr": Number(value.IntValProjCurr),
                    "ExtValProjCurr" : Number(value.ExtValProjCurr),
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type":"BCWP",
                    "Date": value.Date,
                    "isSame":dateCheck,
                    "isBefore":dateCheckBefore
                }
            });//convert IntValProjCurr key for Chart Series
            var bcwpTotal = 0, bcwpHrs = 0, curBcwpTotal = 0, curBcwpHrs = 0;
            $.each(BCWPdata, function (key, value) {
                if(!value.isBefore || value.isSame) {
                    bcwpTotal += parseFloat(value.BCWP);
                    bcwpHrs += parseFloat(value.QuantityBCWP);
                }
                if(value.isSame){
                    curBcwpTotal += parseFloat(value.BCWP);
                    curBcwpHrs += parseFloat(value.QuantityBCWP);
                }
            });
            master.totals.push({"bcwpTotal": App.Math.ceil10(bcwpTotal, -2),"bcwpHrs":App.Math.ceil10(bcwpHrs, -2),"curBcwpTotal": App.Math.ceil10(curBcwpTotal, -2),"curBcwpHrs":App.Math.ceil10(curBcwpHrs, -2)});//.toFixed(2)
            master.graph.push(BCWPdata);//add array to master array
        }
        if (_.isArray(EAC)) {
            var runningTotalEAC = 0;
            var EACdata = _.map(EAC, function (value) {
                runningTotalEAC +=  parseFloat(value.IntValProjCurr);
                return {
                    "EAC": Number(value.IntValProjCurr),
                    "QuantityEAC": Number(value.Quantity),
                    "runningEAC": runningTotalEAC,
                    "IntValProjCurr": Number(value.IntValProjCurr),
                    "ExtValProjCurr" : Number(value.ExtValProjCurr),
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type":"EAC",
                    "Date": value.Date
                }
            }); //convert IntValProjCurr key for Chart Series
            master.graph.push(EACdata);//add array to master array
            var eacTotal = 0, eacHrs = 0;
            $.each(EACdata, function (key, value) {
                    eacTotal += parseFloat(value.EAC);
                    eacHrs += parseFloat(value.QuantityEAC);
            });
            //console.log('eacTotal '+eacTotal);
            master.totals.push({"eacTotal": App.Math.ceil10(eacTotal, -2),"eacHrs": App.Math.ceil10(eacHrs, -2)});//.toFixed(2)
        }
        if (_.isArray(ACWP)) {
            var runningTotalACWP = 0;
            var ACWPdata = _.map(ACWP, function (value) {
                runningTotalACWP += parseFloat(value.IntValProjCurr);
                dateCheck =  moment(value.Date).isSame(value.SnapshotDate);
                dateCheckBefore =  moment(value.SnapshotDate).isBefore(value.Date);
                return {
                    "ACWP": Number(value.IntValProjCurr),
                    "QuantityACWP": Number(value.Quantity),
                    "runningACWP":Number(runningTotalACWP),
                    "IntValProjCurr": Number(value.IntValProjCurr),
                    "ExtValProjCurr" : Number(value.ExtValProjCurr),
                    "ObjectNumber": value.ObjectNumber,
                    "Version": value.Version,
                    "ValueType": value.ValueType,
                    "Type":"ACWP",
                    "Date": value.Date,
                    "isSame":dateCheck,
                    "isBefore":dateCheckBefore
                }
            });//convert IntValProjCurr key for Chart Series
            var acwpTotal = 0,acwpHrs = 0, curAcwpTotal = 0, curAcwpHrs = 0;
            $.each(ACWPdata, function (key, value) {
                if(!value.isBefore || value.isSame) {
                    acwpTotal += parseFloat(value.ACWP);
                    acwpHrs += parseFloat(value.QuantityACWP);
                }
                if(value.isSame){
                    curAcwpTotal += parseFloat(value.ACWP);
                    curAcwpHrs += parseFloat(value.QuantityACWP);
                }
            });
            master.totals.push({"acwpTotal": App.Math.ceil10(acwpTotal, -2),"acwpHrs": App.Math.ceil10(acwpHrs, -2),"curAcwpTotal": App.Math.ceil10(curAcwpTotal, -2),"curAcwpHrs": App.Math.ceil10(curAcwpHrs, -2)});//.toFixed(2)
            master.graph.push(ACWPdata);//add array to master array
        }
        if (_.isArray(ETC)) {
            var ETCdata = _.map(ETC, function (value) {
               // dateCheck =  moment(value.Date).isBefore(value.SnapshotDate);
                return {"ETC": Number(value.IntValProjCurr)};
            });//not used for chart, just calculations
            var etcTotal = 0;
            $.each(ETCdata, function (key, value) {
                var etccost = App.Math.ceil10(value.ETC, -2);
                etcTotal += parseFloat(etccost);
            });
           // console.log("etcTotal: " + etcTotal);
            // master.totals.push({"etcTotal": etcTotal});//.toFixed(2)
            // master.graph.push(ETCdata);//add array to master array
        }
        //  console.log('Before Decimal Rounding bcwpTotal ' + bcwpTotal + '  bcwsTotal ' + bcwsTotal + ' acwpTotal ' + acwpTotal + ' etcTotal ' + etcTotal);
        var roundbcwpTotal = App.Math.ceil10(bcwpTotal, -2);
        var roundbcwsAll = App.Math.ceil10(bcwsAll, -2);
        var roundbcwsTotal = App.Math.ceil10(bcwsTotal, -2);
        var roundacwpTotal = App.Math.ceil10(acwpTotal, -2);
        var roundetcTotal = App.Math.ceil10(etcTotal, -2);
        //  console.log('After Decimal Rounding roundbcwpTotal ' + roundbcwpTotal + '  roundbcwsTotal ' + roundbcwsTotal + ' roundacwpTotal ' + roundacwpTotal + ' roundetcTotal ' + roundetcTotal);

        var eacCum = (roundacwpTotal + roundetcTotal);
        master.totals.push({"eacCum": App.Math.ceil10(eacCum,-2)});

        var bac = roundbcwsAll;
        master.totals.push({"bac": App.Math.ceil10(bac, -2)});

        var tcpi = (bac - roundbcwpTotal) / (eacCum - roundacwpTotal);
        master.totals.push({"tcpi": App.Math.ceil10(tcpi, -2)});

        var spiTotal = (roundbcwpTotal / roundbcwsTotal);
        var cpiTotal = (roundbcwpTotal / roundacwpTotal);
        var curSPITotal = (curBcwpTotal / curBcwsTotal);
        var curCPITotal = (curBcwpTotal / curAcwpTotal);
        // console.log('Before Check ' + App.Math.ceil10(spiTotal, -2) + '  ' + App.Math.ceil10(cpiTotal, -3));
        if (isNaN(spiTotal)) {
            spiTotal = 0;
        }
        if (isNaN(cpiTotal)) {
            cpiTotal = 0;
        }
        if (isNaN(curSPITotal)) {
            curSPITotal = 0;
        }
        if (isNaN(curCPITotal)) {
            curCPITotal = 0;
        }
        // console.log('After Check ' + App.Math.ceil10(spiTotal, -2) + '  ' + App.Math.ceil10(cpiTotal, -3));
        master.gauges.push({'spi': App.Math.ceil10(spiTotal, -2),'curSPI': App.Math.ceil10(curSPITotal, -2)});//master.gauges[0].spi
        master.gauges.push({'cpi': App.Math.ceil10(cpiTotal, -3),'curCPI': App.Math.ceil10(curCPITotal, -3)});//master.gauges[1].cpi

        _.flatten(master.totals);
        _.flatten(master.graph);
        _.flatten(master.gauges);
       // console.log(master.totals);
        return master;
    };

    App.createChart = function(dataSource, series) {
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
                highlight: { visible: false },
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
            valueAxis: [
                {title: {text: ' Total'}}
            ],
            tooltip: {
                visible: true,
                shared: true,
                template: "#= kendo.format('{0:C}',value) #"
            }
        });
    };


    return App;
});