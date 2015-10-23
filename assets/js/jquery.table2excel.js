/**
 * Created by craig on 7/14/2015.
 */
//table2excel.js


;
(function ($, window, document, undefined) {
        var pluginName = "table2excel",
            defaults = {
                exclude: ".noExl",
                name: "Table2Excel"
            };

        // The actual plugin constructor
        function Plugin(element, options) {
            this.element = element;
            // jQuery has an extend method which merges the contents of two or
            // more objects, storing the result in the first object. The first object
            // is generally empty as we don't want to alter the default options for
            // future instances of the plugin
            //
            this.settings = $.extend({}, defaults, options);
            this._defaults = defaults;
            this._name = pluginName;
            this.init();
        }

        Plugin.prototype = {
            init: function () {
                var e = this;

             /*   e.template = {
                    head: "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>",
                    sheet: {
                        head: "<x:ExcelWorksheet><x:Name>",
                        tail: "</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>"
                    },
                    mid: "</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>",
                    table: {
                        head: "<table>",
                        tail: "</table>"
                    },
                    foot: "</body></html>"
                };*/

                e.convertHex = function(hex,opacity){
                    hex = hex.replace('#','');
                    r = parseInt(hex.substring(0,2), 16);
                    g = parseInt(hex.substring(2,4), 16);
                    b = parseInt(hex.substring(4,6), 16);
                    if(opacity=== undefined)opacity = 100;
                    result = 'rgb('+r+','+g+','+b+','+opacity/100+')';
                    return result;
                };

                e.convertRGB = function(rgb){
                    var color = rgb.split("(")[1].split(")")[0],
                    hex  = color.split(',');//array
                    var b = hex.map(function(x){            //For each array element
                        x = parseInt(x).toString(16);      //Convert to a base16 string
                        return (x.length==1) ? "0"+x : x; //Add zero if we get only one character
                    });
                    b = 'FF'+b.join("");
                    return b;
                };


                e.tableRows = [];

                // get contents of table except for exclude
                $(e.element).each(function (i, o) {
                    var tempRows = "";
                    var data = [];

                    $(o).find("tr").not(e.settings.exclude).each(function (i, o) {
                        e.tableRows[i] = [];
                        $(o).children().each(function(k,value){
                            var obj = {};
                            obj.value = _.isNaN(Number(value.innerText)) ? value.innerText : Number(value.innerText);
                            if(obj.value === 0)obj.value = '';
                            var style = _.map(value.style,function(item){return item;});
                            var parsedStyles = {}
                            parsedStyles =  $(value).css(style);
                            console.log('1');
                            if(!_.isEmpty(parsedStyles)) {
                             var bgColor = _.has(parsedStyles, "background-color") ? parsedStyles['background-color'] != 'transparent' ? e.convertRGB(parsedStyles['background-color']) : "FFFFFFFF" : "FFFFFFFF"
                                obj.style = {
                                    "numFmt": "General",
                                    "fill": {
                                        /*"patternType": "darkHorizontal",*/
                                        "fgColor": {
                                             "rgb": bgColor
                                        }
                                       /* "bgColor": {
                                            "theme": 1,
                                            "tint": -0.25,
                                            "auto": 1,
                                            "rgb": bgColor,
                                         //   "indexed": 64
                                        }*/
                                    },
                                    "alignment":{
                                        "vertical":"center",
                                        "horizontal":"center",
                                        "wrapText":false
                                    },
                                    "font": {
                                        "sz": 8,
                                        "color": {
                                            "theme": "1"
                                        },
                                        "bold":parsedStyles.bold === 'bold'? true : false,
                                        "name": "Calibri"
                                    },
                                    "border": {
                                        "top":{ style:'thin', color: {auto: 1} },
                                         //"left":{ style:'thin', color:{auto: 1} },
                                         "right":{ style:'thin', color: {auto: 1} },
                                        "bottom":{ style:'thin', color:{auto: 1} }
                                    }
                                };
                            }
                            obj.colSpan = value.colSpan;
                            e.tableRows[i].push(obj);
                        });
                    });
                   // e.tableRows[i].push(data); // tempRows += "<tr>" + $(o).html() + "</tr>";
                });

                e.tableToExcel(e.tableRows, e.settings.name);
            },

            tableToExcel: function (table, name) {
                var e = this, fullTemplate = "", i, link, a;
                //e.uri = "data:application/vnd.ms-excel;base64,";
                e.uri = "data:application/vnd.ms-excel;base64,";//application/vnd.ms-excel
                e.base64 = function (s) {
                    return Base64.encode(unescape(encodeURIComponent(s)));
                };
                e.format = function (s, c) {
                    return s.replace(/{(\w+)}/g, function (m, p) {
                        return c[p];
                    });
                };
                e.datenum =  function (v, date1904) {
                    if(date1904) v+=1462;
                    var epoch = Date.parse(v);
                    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
                };

                e.sheet_from_array_of_arrays = function(data, opts) {
                    var ws = {};
                    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
                    ws['!merges'] = [];var colspan = [];
                    for(var R = 0; R != data.length; ++R) {
                        for(var C = 0; C != data[R].length; ++C) {
                            if(range.s.r > R) range.s.r = R;
                            if(range.s.c > C) range.s.c = C;
                            if(range.e.r < R) range.e.r = R;
                            if(range.e.c < C) range.e.c = C;
                            var cell = {v: data[R][C].value,s:{}};
                            if(cell.v == null) continue;
                            if(!_.isUndefined(data[R][C].style)){
                                cell.s = data[R][C].style;
                            }
                            if(typeof cell.v === 'number'){
                                cell.t = 'n';
                                cell.s.numFmt = XLSX.SSF._table[2];
                            }
                            else if(typeof cell.v === 'boolean') cell.t = 'b';
                            else if(cell.v instanceof Date) {
                                cell.t = 'n'; cell.s.numFmt = XLSX.SSF._table[15];
                                cell.v = moment(cell.v);
                                //cell.s.numFmt = "General";
                            } else cell.t = 's';

                            var mergeCellPos = '',cell_ref={},added ='',cellPos={},Blankcell='',newCell='',newCell_ref='';

                            if(C === 0){
                                colspan = [];
                                colspan.push(data[R][C].colSpan); //start over for new column
                                cellPos = {s: {c:C,r:R}, e: {c:C,r:R}};
                                mergeCellPos = cellPos;
                                mergeCellPos.e.c = data[R][C].colSpan;
                                 cell_ref = XLSX.utils.encode_cell({c:cellPos.s.c,r:cellPos.s.r});
                                ws[cell_ref] = cell;
                                for(var w = cellPos.s.c+1; w < data[R][C].colSpan +1;w++){
                                    Blankcell = {v: "",s:{"border": {
                                        "top":{ style:'thin', color: {auto: 1} },
                                         "left":{ style:'thin', color:{auto: 1} },
                                         "right":{ style:'thin', color: {auto: 1} },
                                        "bottom":{ style:'thin', color:{auto: 1} }
                                    }}};
                                    newCell = {c:w,r:R};
                                    newCell_ref = XLSX.utils.encode_cell(newCell);
                                    ws[newCell_ref] = Blankcell;
                                    colspan.push(w);
                                }
                                ws['!merges'].push(mergeCellPos);
                            }else{
                                cellPos = {s: {c:C,r:R}, e: {c:C,r:R}};
                                cellPos.s.c = (_.last(colspan)+1);
                                mergeCellPos = cellPos;
                                mergeCellPos.s.c = cellPos.s.c;//add last colspan to start
                                mergeCellPos.e.c = (data[R][C].colSpan > 1 ? data[R][C].colSpan : 2); //add current colspan to end
                                cell_ref = XLSX.utils.encode_cell({c:cellPos.s.c,r:cellPos.s.r});
                                ws[cell_ref] = cell;
                                if(data[R][C].colSpan > 1){
                                    var len = (data[R][C].colSpan + cellPos.s.c);
                                    for(var d = cellPos.s.c+1; d < len; d++){
                                        Blankcell = {v: "",s:{"border": {
                                            "top":{ style:'thin', color: {auto: 1} },
                                            "left":{ style:'thin', color:{auto: 1} },
                                            "right":{ style:'thin', color: {auto: 1} },
                                            "bottom":{ style:'thin', color:{auto: 1} }
                                        }}};
                                        newCell = {c:d,r:R};
                                        newCell_ref = XLSX.utils.encode_cell(newCell);
                                        ws[newCell_ref] = Blankcell;
                                        colspan.push(d);//push in current
                                    }
                                    ws['!merges'].push(mergeCellPos);
                                }else{
                                    colspan.push(cellPos.s.c);
                                }

                            }

                        }
                    }
                    if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                    return ws;
                };
                function Workbook () {
                    if(!(this instanceof Workbook)) return new Workbook();
                    this.SheetNames = [];
                    this.Sheets = {};
                };
                e.ctx = {
                    worksheet: name || "Worksheet",
                    table: table
                };
                e.s2ab  = function (s) {
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
                    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                };

                var wb = new Workbook(), ws =  e.sheet_from_array_of_arrays(e.ctx.table);

                wb.SheetNames.push(e.ctx.worksheet);
                wb.Sheets[e.ctx.worksheet] = ws;
                var wbOut = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
                /* fullTemplate = e.template.head;

               if ($.isArray(table)) {
                    for (i in table) {
                        //fullTemplate += e.template.sheet.head + "{worksheet" + i + "}" + e.template.sheet.tail;
                        fullTemplate += e.template.sheet.head + name + " " + e.template.sheet.tail;
                        //fullTemplate += e.template.sheet.head + "Table" + i + name +"" + e.template.sheet.tail;
                    }
                }

                fullTemplate += e.template.mid;

                if ($.isArray(table)) {
                    for (i in table) {
                        fullTemplate += e.template.table.head + "{table" + i + "}" + e.template.table.tail;
                    }
                }

                fullTemplate += e.template.foot;

                for (i in table) {
                    if (table.hasOwnProperty(i)) {
                        e.ctx["table" + i] = table[i];
                    }
                }
                delete e.ctx.table;*/






                console.log('userAgent ' + navigator.userAgent);


                if (bowser.msie && bowser.version >= 5) {
                    if (bowser.msie) {

                        if (bowser.version <= 9) {
                            alert('For IE 9 and below, Save Text file as .XLS.')
                        }

                    //    console.log('IE browser ' + bowser.version);
                    //    var format1 = e.format(fullTemplate, e.ctx);
                     //   console.log('format ' + format1.length);
                      //  saveTextAs(format1, getFileName(e.settings));//alerts user to save txt file as xls

                    } else {
                        alert('IE 5 and lower not supported');
                    }
                } else if (bowser.firefox || bowser.chrome || bowser.safari || bowser.iphone || bowser.android) {
                    console.log(bowser.version);
               
                    saveAs(new Blob([e.s2ab(wbOut)],{type:"application/octet-stream"}), name+".xlsx")
                }

                return true;
            }
        };

        function getFileName(settings) {
            return ( settings.filename ? settings.filename : "table2excel") + '.xls';//removed xlsx and it worked. bug
        };

        $.fn[pluginName] = function (options) {
            var e = this;
            e.each(function () {
                if (!$.data(e, "plugin_" + pluginName)) {
                    $.data(e, "plugin_" + pluginName, new Plugin(this, options));
                }
            });

            // chain jQuery functions
            return e;
        };

    })(jQuery, window, document);

