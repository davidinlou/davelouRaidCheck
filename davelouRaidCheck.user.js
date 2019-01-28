// ==UserScript==
// @name         davelouRaidCheck
// @namespace    https://github.com/davidinlou/davelouRaidCheck/
// @version      0.5.5
// @description  checks reports for raids that need to be reset
// @author       davelou
// @match        https://*.crownofthegods.com/o*
// @match        https://*.crownofthegods.com
// @grant        none
// @updateURL    https://github.com/davidinlou/davelouRaidCheck/raw/master/davelouRaidCheck.user.js
// @downloadURL  https://github.com/davidinlou/davelouRaidCheck/raw/master/davelouRaidCheck.user.js
// ==/UserScript==



(function() {

    function dlcheckinit() {
        if (typeof $ != 'undefined' && ($('#rdetadiv')[0] || $('#worldtime')[0])) {
            dlcheck();
        } else {
            setTimeout(dlcheckinit, 2000);
        }
    }

    function dlcheck() {
        var cl = true;

        if ($('#rdetadiv')[0]) {

            var dlbutton = '<div style="margin:15px">'
            dlbutton += '<label style="margin:5px;">DLCheck</label><span style="margin-left:10px;">Hours to scan:</span>'
            dlbutton += '<select id="dlchhh" class="btn btn-primary btn-xs" style="margin:2px;"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select>'
            dlbutton += '<span style="margin-left:10px;">Threshold(%):</span>'
            dlbutton += '<select id="dlchth" class="btn btn-primary btn-xs" style="margin:2px;"><option>50</option><option>70</option><option>80</option><option>90</option><option>95</option><option>100</option><option>105</option><option>110</option><option>120</option><option>130</option><option>150</option></select>'
            dlbutton += '<button id="dlchs" type="button" class="btn btn-primary btn-xs" style="margin-left:15px">Scan</button>'
            dlbutton += '<span id="dlchb" style="margin-left:15px"></span></div>';

            $('#rdetadiv').append(dlbutton)

            var hours=5
            var thresh=100
            loadPref()
            $('#dlchhh').click(savePref);
            $('#dlchth').click(savePref);

            $('#dlchs').click(function(){
                $('#dlchb').text("Scan running...");

                var count =0
                var found = 0
                var look = 2;
                var res = {};
                var hh = 0
                var mm = 0
                var mn = false
                var txt = "";
                try {
                    $('#repbod span').each(function(index, elem){
                        count++;
                        if (look) {
                            txt = $(this).text();
                            var ala = txt.match(/ \((\d..):(\d..)\) .(\d+)%. From (.*) \[\d+% Lost.*\[(\d+)% Carry..(\d\d):(\d\d):/)
                            delete(ala)
                            var h1 = Number(ala[6])
                            var m1 = Number(ala[7])
                            var c1 = Number(ala[5])
                            var p1 = Number(ala[3])
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
                                var idx = ala[4]+" "+ala[1]+":"+ala[2]
                                if (!res[idx]) {
                                    res[idx] = [ala[1], ala[2], ala[3], ala[4], ala[5], ala[6], ala[7]]
                                    found++;
                                }
                            }
                        }
                    })
                    localStorage.setItem("dlcheck", JSON.stringify(res))
                    var dt = "Time: "+new Date().toLocaleTimeString()+" Scanned: "+count+" Found: "+found;
                    $('#dlchb').text(dt);
                } catch (err) {
                    $('#dlchb').text("Error: "+err);
                    console.log(err)
                    console.log(txt)
                }
            })

        }

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
                $('.dlchl').unbind("click",dlgoto)
                generate()
                $('#dlchle').html(le);
                $('#dlchri').html(ri);
                $('.dlchl').click(dlgoto)
                $('#dlchb').dialog("open");
                $('#dlchb').dialog("moveToTop");
            })

            var popup = '<div id="dlchb" title="DL Raid Check" style="overflow:hidden scroll;"><div style="height:300px;"><div id="dlchle" style="width:49%;display:inline-block"></div><div id="dlchri" style="width:49%;display:inline-block"></div></div></div>'

            $("body").append(popup);

            var dlw = $("#dlchb").dialog({autoOpen:false});
            dlw.css("background-color","#c0a070")

            var pr = dlw.prev();
            pr.addClass("newblueb")

            var p = dlw.parent();
            p.css("z-index","1000")
            p.css('background','#605030')
            p.css('font-size','10')

        }

        var le = ""
        var ri = ""

        function generate() {
            le = "<ul style='list-style-type:none;'>"
            ri = "<ul style='list-style-type:none;'>"
            var list = JSON.parse(localStorage.getItem("dlcheck"));
            if (list) {
                $.each(list,proc);
                le += "</ul>"
                ri += "</ul>"
            } else {
                le = "No Report scan found.<br>Go to Overview screen and press DLCheck button there first."
            }

        }

        function proc(key, value) {
            var val = cm[value[3]];
            var y = Math.floor(val/65536);
            var x = val % 65536
            var li = "<li class='cityblink dlchl' id='dlch"+val+"' >"+value[3] + " ("+x+":"+y+")</li>"
            le += li
            li = "<li >Pr "+value[2] + "% Ca "+value[4]+"% "+value[5]+":"+value[6]+"</li>"
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

