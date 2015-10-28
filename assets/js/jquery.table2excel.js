/**
 * Created by craig on 7/14/2015.
 */
//table2excel.js


;
(function ($, window, document, undefined) {
        var pluginName = "table2excel",
            exportValue = '',
            type = {},
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



        type.xlsxExport = {
            init: function () {
                var e = this;


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
                        var len = this.length;
                        $(o).children().each(function(k,value){
                            var obj = {};
                            obj.value = _.isNaN(Number(value.innerText)) ? value.innerText :   (value.innerText === "" ? "" : Number(value.innerText) );
                          //  if(obj.value == 0 && String(obj.value).indexOf(".") == -1) obj.value = '';
                            var style = _.map(value.style,function(item){return item;});
                            var parsedStyles = {},
                                alignment = _.isUndefined(value.align) ? 'left' : value.align === '' ? 'left':value.align;
                            if(i == 0 || i == 1 || i == len-1 && k == 0) alignment='center';//center first two rows and last row
                            parsedStyles =  $(value).css(style);
                            if(!_.isEmpty(parsedStyles)) {
                                obj.style = {
                                    "numFmt": "General",
                                    "fill": {
                                        /*"patternType": "darkHorizontal",*/
                                        "fgColor": {
                                             "rgb": ''
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
                                        "horizontal":alignment,
                                        "wrapText":true
                                    },
                                    "font": {
                                        "sz": 8,
                                        "color": {
                                            "theme": "1"
                                        },
                                        "bold":parsedStyles.bold === 'bold'? true : false,
                                        "name": "Calibri"
                                    },
                                    "border": { }
                                };
                                obj.style.fill.fgColor['rgb'] = _.has(parsedStyles, "background-color") ? parsedStyles['background-color'] != 'transparent' ? e.convertRGB(parsedStyles['background-color']) : "FFFFFFFF" : "FFFFFFFF";
                                obj.style.border.top = _.has(parsedStyles, "border-top-style") ? { style:'thin', color: {auto: 1} } : null;
                                obj.style.border.left = _.has(parsedStyles, "border-left-style") ? { style:'thin', color: {auto: 1} } : null;
                                obj.style.border.right = _.has(parsedStyles, "border-right-style") ? { style:'thin', color: {auto: 1} } : null;
                                obj.style.border.bottom = _.has(parsedStyles, "border-bottom-style") ? { style:'thin', color: {auto: 1} } : null;

                            }
                            obj.colSpan = value.colSpan;
                            e.tableRows[i].push(obj);
                        });
                    });

                });

                e.tableToExcel(e.tableRows, e.settings.name);
            },

            tableToExcel: function (table, name) {
                var e = this, fullTemplate = "", i, link, a;

                e.datenum =  function (v, date1904) {
                    if(date1904) v+=1462;
                    var epoch = Date.parse(v);
                    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
                };

                e.sheet_from_array_of_arrays = function(data, opts) {
                    var ws = {},  colspan = [];
                    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
                    ws['!merges'] = [],ws['!cols']=[];
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
                                cell.s.numFmt = XLSX.SSF._table[0];
                            }
                            else if(typeof cell.v === 'boolean') cell.t = 'b';
                            else if(cell.v instanceof Date) {
                                cell.t = 'n'; cell.s.numFmt = XLSX.SSF._table[15];
                                cell.v = new Date(moment(cell.v,'MM/YYYY'));
                                //cell.s.numFmt = "General";
                            } else cell.t = 's';

                            var mergeCellPos = '',cell_ref={},
                                added ='',cellPos={},
                                Blankcell='',newCell='',newCell_ref='',
                                lastArrayKey = (data[R][C].length -1),
                                iteratee='';

                            /**
                             * Lines 175 - 182
                             * Parse character lenghts for cell sizing
                             */
                            var stringLength = String(data[R][C].value).length;
                            stringLength = (stringLength === 0 ? 10 : stringLength);
                            if(stringLength > 15){
                                stringLength = 15;
                            }else if(stringLength < 5){
                                stringLength = 10;
                            }
                            ws['!cols'].push({wch:stringLength});

                            /**
                             * Parse Cell colspan and convert to merged cells
                             */
                            if(C === 0){
                                colspan = [];
                                cellPos = {s: {c:C,r:R}, e: {c:C,r:R}};
                                mergeCellPos = cellPos;
                                mergeCellPos.e.c = data[R][C].colSpan-1;
                                colspan.push(mergeCellPos.e.c); //start over for new column
                                cell_ref = XLSX.utils.encode_cell({c:cellPos.s.c,r:cellPos.s.r});
                                ws[cell_ref] = cell;
                                iteratee = data[R][C].colSpan;
                                    for (var w = cellPos.s.c + 1; w < iteratee; w++) {
                                        Blankcell = { v: "", s: data[R][C].style };
                                        newCell = {c: w, r: R};
                                        newCell_ref = XLSX.utils.encode_cell(newCell);
                                        ws[newCell_ref] = Blankcell;
                                        colspan.push(w);
                                        ws['!cols'].push({wch:7});
                                    }
                                    ws['!merges'].push(mergeCellPos);

                            }else{
                                cellPos = {s: {c:C,r:R}, e: {c:C,r:R}};
                                cellPos.s.c = (_.last(colspan)+1);
                                mergeCellPos = cellPos;
                                mergeCellPos.s.c = cellPos.s.c;//add last colspan to start
                                if(lastArrayKey === C){
                                    mergeCellPos.e.c = (data[R][C].colSpan > 1 ? (_.last(colspan)+data[R][C].colSpan)-1 : (_.last(colspan) -1)); //add current colspan to end
                                }else{
                                    mergeCellPos.e.c = (data[R][C].colSpan > 1 ? _.last(colspan)+data[R][C].colSpan : _.last(colspan)); //add current colspan to end
                                }

                                cell_ref = XLSX.utils.encode_cell({c:cellPos.s.c,r:cellPos.s.r});
                                ws[cell_ref] = cell;
                                if(data[R][C].colSpan > 1){
                                    iteratee = (data[R][C].colSpan + cellPos.s.c);
                                    for(var d = cellPos.s.c+1; d < iteratee; d++){
                                        Blankcell = {v: "",s:data[R][C].style};
                                        newCell = {c:d,r:R};
                                        newCell_ref = XLSX.utils.encode_cell(newCell);
                                        ws[newCell_ref] = Blankcell;
                                        colspan.push(d);//push in current
                                        ws['!cols'].push({wch:7});
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

                var wb = new Workbook(),
                    ws =  e.sheet_from_array_of_arrays(e.ctx.table);

                wb.SheetNames.push(e.ctx.worksheet);
               // wb.SheetNames.push('Craig');
                wb.Sheets[e.ctx.worksheet] = ws;
                //wb.Sheets['Craig'] = ws;
                var wbOut = XLSX.write(wb, {bookType:'xlsx',bookSST:true,  type: 'binary'});
                console.log(bowser.version+ ' - userAgent ' + navigator.userAgent);
                saveAs(new Blob([e.s2ab(wbOut)],{type:"application/octet-stream"}), name+".xlsx");
              /* var blobData = new Blob([e.s2ab(wbOut)],{type:"application/octet-stream"});
                var ww = XLSX.utils.sheet_to_csv(blobData);
                saveAs(new Blob([e.s2ab(ww)],{type:"application/octet-stream"}), name+".csv");*/
                return true;
            }
        };

        type.xlsExport  = {
                init: function() {
                    var e = this;

                    e.template = {
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
                    };


                    e.tableRows = [];

                    // get contents of table except for exclude
                    $(e.element).each(function (i, o) {
                        var tempRows = "";
                        $(o).find("tr").not(e.settings.exclude).each(function (i, o) {
                            tempRows += "<tr>" + $(o).html() + "</tr>";
                        });
                        e.tableRows.push(tempRows);
                    });

                    e.tableToExcel(e.tableRows, e.settings.name);
                },

                tableToExcel: function (table, name) {
                    var e = this, fullTemplate = "", i, link, a;
                    //e.uri = "data:application/vnd.ms-excel;base64,";
                    e.uri = "data:application/application/vnd.ms-excel;base64,";//application/vnd.ms-excel
                    e.base64 = function (s) {
                        return Base64.encode(unescape(encodeURIComponent(s)));
                    };
                    e.format = function (s, c) {
                        return s.replace(/{(\w+)}/g, function (m, p) {
                            return c[p];
                        });
                    };
                    e.ctx = {
                        worksheet: name || "Worksheet",
                        table: table
                    };

                    fullTemplate = e.template.head;

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
                    delete e.ctx.table;


                    console.log(bowser.version+' '+bowser.msie+' - userAgent ' + navigator.userAgent);

                    var format1 = e.format(fullTemplate, e.ctx);
                    alert('Save this file as: \n .XLS \n Replace .txt on SaveAs.');
                   // var blob = new Blob([format1], {type:"application/octet-stream"});//{type: "application/vnd.ms-excel"}text/html
                    saveTextAs(format1, getFileName(e.settings));//saves xls as usual for modern browsers

                    return true;
                }
            };

        if (bowser.msie && bowser.version >= 5) {
                if (bowser.version >= 5) {
                   if (bowser.version <= 9) {
                        exportValue = type.xlsExport;
                    }else if (bowser.version >= 10) {
                        exportValue = type.xlsxExport;
                   }

                } else {
                    alert('IE 5 and lower not supported');
                    exportValue = { init:function(){return true} }
                }
            } else {//if (bowser.firefox || bowser.chrome || bowser.safari || bowser.iphone || bowser.android) {
            exportValue = type.xlsxExport;

        }

        Plugin.prototype = exportValue;

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

