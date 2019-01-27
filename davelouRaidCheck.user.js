// ==UserScript==
// @name         davelouRaidCheck
// @namespace    http://tampermonkey.net/
// @version      0.3.1
// @description  checks reports for raids that need to be reset
// @author       davelou
// @match        https://*.crownofthegods.com/o*
// @match        https://*.crownofthegods.com
// @grant        none
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
            dlbutton += '<select id="dlchhh" class="btn btn-primary btn-xs" style="margin:2px;"><option>1</option><option>2</option><option>3</option><option>4</option><option selected="selected">5</option><option>6</option><option>7</option><option>8</option></select>'
            dlbutton += '<span style="margin-left:10px;">Threshold(%):</span>'
            dlbutton += '<select id="dlchth" class="btn btn-primary btn-xs" style="margin:2px;"><option>80</option><option>85</option><option>90</option><option>95</option><option selected="selected">100</option><option>105</option><option>110</option><option>115</option></select>'
            dlbutton += '<button id="dlchs" type="button" class="btn btn-primary btn-xs" style="margin-left:15px">Scan</button>'
            dlbutton += '<span id="dlchb" style="margin-left:15px"></span></div>';

            $('#rdetadiv').append(dlbutton)

            $('#dlchs').click(function(){
                var count =0
                var found = 0
                var look = 2;
                var res = {};
                var hh = 0
                var hours = $('#dlchhh').val();
                var thresh = $('#dlchth').val();
                $('#repbod span').each(function(index, elem){
                    count++;
                    if (look) {
                        var txt = $(this).text();
                        //console.log(txt)
                        var ala = txt.match(/ \((\d..):(\d..)\) .(\d+)%. From (.*) \[\d+% Lost.*\[(\d+)% Carry..(\d\d):(\d\d):/)
                        if (ala[5] < thresh && ala[3] > 5 ) {
                            var idx = ala[4]+" "+ala[1]+":"+ala[2]
                            if (!res[idx]) {
                                res[idx] = [ala[1], ala[2], ala[3], ala[4], ala[5], ala[6], ala[7]]
                                found++;
                            }
                        }
                        if (look == 2) {
                            look = 1
                            hh = ala[6] - hours
                            if (hh < 0) {
                                hh = 24+hh
                            }
                            console.log("scan back to "+hh+":00")
                        } else if (look == 1) {
                            if (ala[6] == hh) look = 0
                        }
                    }
                })
                localStorage.setItem("dlcheck", JSON.stringify(res))
                var dt = "Time: "+new Date().toLocaleTimeString()+" Scanned: "+count+" Found: "+found;
                console.log(dt)
                $('#dlchb').text(dt);
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
                        var name = b[2].split(" ")[0];
                        var val = b[1];
                        cm[name] = val;
                    })
                }
                generate()
                $('#dlchle').html(le);
                $('#dlchri').html(ri);
                $('.dlchl').click(dlgoto)
                $('#dlchb').dialog("open");
                $('#dlchb').dialog("moveToTop");
            })

            var popup = '<div id="dlchb" title="DL Raid Check" style="overflow:hidden scroll;"><div style="height:300px"><div id="dlchle" style="width:49%;display:inline-block"></div><div id="dlchri" style="width:49%;display:inline-block"></div></div></div>'

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
            id = id.substring(4)
            $("#cityDropdownMenu").val(id).change();
        }

        //var fn = '<script type="text/javascript">function dlgoto(id) {$("#dlch"+id).css("color","#303020"); $("#organiser").val("all").change(); $("#cityDropdownMenu").val(id).change();}</script>}'

        //$('head').append(fn);
    }

    dlcheckinit();

})();

