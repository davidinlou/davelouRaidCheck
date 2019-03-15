// ==UserScript==
// @name         davelouRaidCheck
// @namespace    https://github.com/davidinlou/davelouRaidCheck/
// @version      1.0.0
// @description  checks reports for raids that need to be reset
// @author       davelou
// @match        https://*.crownofthegods.com
// @grant        none
// @updateURL    https://github.com/davidinlou/davelouRaidCheck/raw/master/davelouRaidCheck.user.js
// @downloadURL  https://github.com/davidinlou/davelouRaidCheck/raw/master/davelouRaidCheck.user.js
// ==/UserScript==



(function() {

    function dlcheckinit() {
        if (typeof $ != 'undefined' && $('#worldtime')[0]) {
            dlcheck();
        } else {
            setTimeout(dlcheckinit, 2000);
        }
    }

    function dlcheck() {
        var cl = true;

        var cm = {}

        if ($('#worldtime')[0]) {
            var dlch = '<button type="button" id="dlpw" class="newblueb" style="margin-left:7px;padding:5px;width:75px;font-size: 10px;">DLCheck</button>';

            var dlc = $('#worldtime').after(dlch)

            $('#dlpw').click(function(){
                if (cl) {
                    cl = false;
                    $.each(ppdt.c, function(a,b) {
                        var name = b[2].split(" - ")[0];
                        var val = b[1];
                        cm[name] = val;
                    })
                    //console.log(cm)
                }
                show()
            })

            var popup = '<div id="dlchb" title="DL Raid Check" style="overflow:hidden scroll;"><div style="height:400px;">'

            popup += '<div style="height:50px;background-color:rgb(172, 140, 92); padding:2px">'
            popup += '<span style="margin-left:5px;">Hours:</span>'
            popup += '<select id="dlchhh" class="newblueb" style="margin:2px;padding:2px;">'
            popup += '<option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>'
            popup += '<option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select>'
            popup += '<span style="margin-left:5px;">Threshold(%):</span>'
            popup += '<select id="dlchth" class="newblueb" style="margin:2px;padding:2px;">'
            popup += '<option>50</option><option>70</option><option>80</option><option>90</option><option>95</option><option>100</option>'
            popup += '<option>105</option><option>110</option><option>120</option><option>130</option><option>150</option></select>'
            popup += '<button id="dlchs" type="button" class="newblueb" style="margin-left:10px;padding:2px 6px 2px 6px;">Scan</button>'

            popup += '<div><span id="dlchr" style="display:block; text-align:center; padding:5px;">Press Scan to search raid reports</span></div></div>';

            popup += '<div style="height:300px;">'
            popup += '<div id="dlchle" style="width:49%;display:inline-block"></div><div id="dlchri" style="width:49%;display:inline-block"></div></div></div>'

            $("body").append(popup);

            var dlw = $("#dlchb").dialog({autoOpen:false});
            dlw.css("background-color","#c0a070")

            var hours=5
            var thresh=100
            loadPref()
            $('#dlchhh').click(savePref);
            $('#dlchth').click(savePref);

            var pr = dlw.prev();
            pr.addClass("newblueb")

            var p = dlw.parent();
            p.css("z-index","1000")
            p.css('background','#605030')
            p.css('font-size','10')

            $('#dlchs').click(function(){
                $('#dlchr').text("Scan running...");

                $.ajax({
                    type: 'POST',
                    url: 'overview/rreps.php',
                    success: scan,
                    error: failed,
                });
            })

        }

        var le = ""
        var ri = ""

        function scan(data) {
            var list=JSON.parse(data);
            //console.log(list);
            parse(list.b)
        }
        function failed(xhr, status, error) {
            $('#dlchr').text("Err: "+error);

        }

        function parse(data) {
            var count =0
            var found = 0
            var look = 2;
            var res = {};
            var hh = 0
            var mm = 0
            var mn = false
            var txt = "";
            try {
                $.each(data, function(index, elem){
                    count++;
                    if (look) {
                        var p1 = Math.round(elem[8])
                        var n1 = elem[1]
                        var c1 = Number(elem[3])

                        var ala = elem[4].match(/(\d*):(\d*)/)

                        var h0 = ala[1]
                        var h1 = Number(h0)
                        var m0 = ala[2]
                        var m1 = Number(m0)
                        if (look == 2) {
                            look = 1
                            hh = h1 - hours
                            if (hh < 0) {
                                hh = 24+hh
                                mn = true;
                            }
                            mm = m1
                        } else if (look == 1) {
                            if (mn) {
                                //scan past midnight
                                if (h1>12) mn = false
                            } else {
                                if (h1 <= hh) {
                                    if (m1 <= mm) {
                                        look = 0
                                        return false;
                                    }
                                }
                            }
                        }
                        if (c1 < thresh && p1 > 5 ) {
                            var idx = n1
                            if (!res[n1]) {
                                res[n1] = [n1, p1, c1, h0, m0]
                                found++;
                            } else {
                                var old = res[n1]
                                if (c1 < old[2]) {
                                    res[n1] = [n1, p1, c1, h0, m0]
                                }
                            }
                        }
                    }
                })
                var srt = []
                $.each(res,function(a,b) {
                    srt.push(b)
                })
                srt.sort(function(a,b){
                    return a[2] - b[2];
                })
                localStorage.setItem("dlcheck", JSON.stringify(srt))
                var dt = "Time: "+new Date().toLocaleTimeString()+" Scanned: "+count+" Found: "+found;
                $('#dlchr').text(dt);
                show()
            } catch (err) {
                $('#dlchr').text("Err: "+err);
                console.log(err)
                console.log(txt)
            }

        }

        function generate() {
            le = "<ul style='list-style-type:none;'>"
            ri = "<ul style='list-style-type:none;'>"
            var list = JSON.parse(localStorage.getItem("dlcheck"));
            if (list) {
                $.each(list,proc);
                le += "</ul>"
                ri += "</ul>"
            } else {
                le = "No Report scan found.<br>Press Scan to search reports"
                ri = ""
            }

        }

        function show() {
            try {
                $('.dlchl').unbind("click",dlgoto)
                generate()
                $('#dlchle').html(le);
                $('#dlchri').html(ri);
                $('.dlchl').click(dlgoto)
                $('#dlchb').dialog("open");
                $('#dlchb').dialog("moveToTop");
            } catch (err) {
                $('#dlchle').html("Err: "+err);
                $('#dlchb').dialog("open");
                $('#dlchb').dialog("moveToTop");
                console.log(err)
            }
        }

        function proc(key, value) {
            var name = value[0]
            var val = cm[name];
            var y = Math.floor(val/65536);
            var x = val % 65536
            var li = "<li class='cityblink dlchl' id='dlch"+val+"' >"+name + " ("+x+":"+y+")</li>"
            le += li
            li = "<li >Pr "+value[1] + "% Ca "+value[2]+"% "+value[3]+":"+value[4]+"</li>"
            ri += li
        }

        function dlgoto(event) {
            var id = event.target.id;
            $("#"+id).css("color","#707070");
            $("#organiser").val("all").change();
            id = Number(id.substring(4))
            $("#cityDropdownMenu").val(id).change();
        }

        function loadPref() {
            var list = JSON.parse(localStorage.getItem("dlchpref"));
            if (list) {
                hours = Number(list.hours);
                thresh = Number(list.thresh);
                $('#dlchhh').val(hours);
                $('#dlchth').val(thresh);
            } else {
                $('#dlchhh').val(hours);
                $('#dlchth').val(thresh);
                savePref();
            }
        }
        function savePref() {
            var res = {}
            res.hours = hours = Number($('#dlchhh').val());
            res.thresh = thresh = Number($('#dlchth').val());
            localStorage.setItem("dlchpref", JSON.stringify(res))
        }
    }

    dlcheckinit();

})();

