/*
 Copyright 2012 Martijn van de Rijdt

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var gui,printO;$(document).ready(function(){gui=new GUI;gui.init();"undefined"==typeof console&&(console={log:function(){}});"undefined"==typeof window.console.debug&&(console.debug=console.log);"true"!==getGetVariable("debug")&&(window.console.log=function(){},window.console.debug=function(){});"true"==getGetVariable("touch")?(Modernizr.touch=!0,$("html").addClass("touch")):"false"==getGetVariable("touch")&&(Modernizr.touch=!1,$("html").removeClass("touch"));printO=new Print});function GUI(){}
GUI.prototype.init=function(){this.nav.setup();this.pages().init();this.setEventHandlers();"function"===typeof this.setCustomEventHandlers&&this.setCustomEventHandlers();$(".dialog [title]").tooltip({});Modernizr.borderradius&&(Modernizr.boxshadow&&Modernizr.csstransitions&&Modernizr.opacity)&&$(document).trigger("browsersupport","fancy-visuals");$("footer").detach().appendTo("#container");this.display()};GUI.prototype.setup=function(){$(window).trigger("resize")};
GUI.prototype.setEventHandlers=function(){var a=this;$(document).on("click","#feedback-bar .close",function(){a.hideFeedback();return!1});$(document).on("click",".touch #feedback-bar",function(){a.hideFeedback()});$(document).on("click","#page .close",function(){a.pages().close();return!1});$(document).on("click",'a[href^="#"]:not([href="#"]):not(nav ul li a)',function(a){var c=$(this).attr("href");console.log("captured click to nav page, href="+c);"#"!==c&&(a.preventDefault(),$('nav li a[href="'+
c+'"]').click())});$('nav ul li a[href^="#"]').click(function(b){b.preventDefault();b=$(this).attr("href").substr(1);a.pages().open(b);$(this).closest("li").addClass("active")});$(window).on("onlinestatuschange",function(b,c){a.updateStatus.connection(c)});$(document).on("edit","form.jr",function(b,c){a.updateStatus.edit(c)});$(document).on("browsersupport",function(b,c){a.updateStatus.support(c)});$("#page, #feedback-bar").on("change",function(){a.display()})};
GUI.prototype.nav={setup:function(){$("article.page").each(function(){var a,b="",c;c=$(this).attr("id");a=$(this).attr("data-display")?$(this).attr("data-display"):c;b=$(this).attr("data-title")?$(this).attr("data-title"):c;c=$(this).attr("data-ext-link")?$(this).attr("data-ext-link"):"#"+c;$('<li class=""><a href="'+c+'" title="'+b+'" >'+a+"</a></li>").appendTo($("nav ul"))})},reset:function(){$("nav ul li").removeClass("active")}};
GUI.prototype.pages=function(){this.init=function(){this.$pages=$("<pages></pages>");$("article.page").detach().appendTo(this.$pages)};this.get=function(a){var b=this.$pages.find('article[id="'+a+'"]');return b=0<b.length?b:$('article[id="'+a+'"]')};this.isShowing=function(a){return 0<$("#page article.page"+("undefined"!==typeof a?'[id="'+a+'"]':"")).length};this.open=function(a){if(!this.isShowing(a)){a=this.get(a);if(1!==a.length)return console.error("page not found");this.isShowing()&&this.close();
$("#page .content").prepend(a.show()).trigger("change");$(window).bind("resize.pageEvents",function(){$("#page").trigger("change")})}};this.close=function(){var a;a=$("#page .page").detach();this.$pages.append(a);$("#page").trigger("change");this.nav.reset();$("#overlay").hide();$("#overlay, header").unbind(".pageEvents");$(window).unbind(".pageEvents")};return this};
GUI.prototype.showFeedback=function(a,b){var c,b=b?1E3*b:1E4;$("#feedback-bar p").eq(1).remove();$("#feedback-bar p").html()!==a&&(c=$("<p></p>"),c.append(a),$("#feedback-bar").append(c));$("#feedback-bar").trigger("change");setTimeout(function(){typeof c!=="undefined"&&c.remove();$("#feedback-bar").trigger("change")},b)};GUI.prototype.hideFeedback=function(){$("#feedback-bar p").remove();$("#feedback-bar").trigger("change")};
GUI.prototype.alert=function(a,b,c){var d=$("#dialog-alert"),c=c||"error",c="normal"===c?"":"alert alert-block alert-"+c;d.find(".modal-header h3").text(b||"Alert");d.find(".modal-body p").removeClass().addClass(c).html(a).capitalizeStart();d.modal({keyboard:!0,show:!0});d.on("hidden",function(){d.find(".modal-header h3, .modal-body p").html("")})};
GUI.prototype.confirm=function(a,b){var c,d,e,g,f;"string"===typeof a?c=a:"string"===typeof a.msg&&(c=a.msg);c="undefined"!==typeof c?c:"Please confirm action";d="undefined"!==typeof a.heading?a.heading:"Are you sure?";e="undefined"!==typeof a.errorMsg?a.errorMsg:"";g="undefined"!==typeof a.dialog?a.dialog:"confirm";b="undefined"!==typeof b?b:{};b.posButton=b.posButton||"Confirm";b.negButton=b.negButton||"Cancel";b.posAction=b.posAction||function(){return false};b.negAction=b.negAction||function(){return false};
b.beforeAction=b.beforeAction||function(){};f=$("#dialog-"+g);f.find(".modal-header h3").text(d);f.find(".modal-body .msg").html(c).capitalizeStart();f.find(".modal-body .alert-error").html(e);f.modal({keyboard:!0,show:!0});f.on("shown",function(){b.beforeAction.call()});f.find("button.positive").on("click",function(){b.posAction.call();f.modal("hide")}).text(b.posButton);f.find("button.negative").on("click",function(){b.negAction.call();f.modal("hide")}).text(b.negButton);f.on("hide",function(){f.off("shown hidden hide");
f.find("button.positive, button.negative").off("click")});f.on("hidden",function(){f.find(".modal-body .msg, .modal-body .alert-error, button").text("")})};
GUI.prototype.updateStatus={connection:function(a){console.log("updating online status in menu bar to:");console.log(a);!0===a?($("header #status-connection").removeClass().addClass("ui-icon ui-icon-signal-diag").attr("title","It appears there is currently an Internet connection available."),$(".drawer #status").removeClass("offline waiting").text("")):!1===a?($("header #status-connection").removeClass().addClass("ui-icon ui-icon-cancel").attr("title","It appears there is currently no Internet connection"),
$(".drawer #status").removeClass("waiting").addClass("offline").text("Offline. ")):$(".drawer #status").removeClass("offline").addClass("waiting").text("Waiting. ")},edit:function(a){a?$("header #status-editing").removeClass().addClass("ui-icon ui-icon-pencil").attr("title","Form is being edited."):$("header #status-editing").removeClass().attr("title","")},support:function(){},offlineLaunch:function(a){$(".drawer #status-offline-launch").text(a?"Offline Launch: Yes":"Offline Launch: No")}};
GUI.prototype.display=function(){var a,b;b=$("header");var c=$("#feedback-bar"),d=$("#page");0<c.find("p").length?(a="fixed"===b.css("position")?b.outerHeight():0,b=this.pages().isShowing()?b.outerHeight()+c.outerHeight():0-d.outerHeight()):(a="fixed"===b.css("position")?b.outerHeight()-c.outerHeight():0-c.outerHeight(),b=this.pages().isShowing()?b.outerHeight():0-d.outerHeight());c.css("top",a);d.css("top",b)};
GUI.prototype.setSettings=function(a){var b,c=this;console.log("gui updateSettings() started");$.each(a,function(a,e){b=e?c.pages().get("settings").find('input[name="'+a+'"][value="'+e+'"]'):c.pages().get("settings").find('input[name="'+a+'"]');0<b.length&&b.attr("checked",e?!0:!1).trigger("change")})};
GUI.prototype.parseFormlist=function(a,b){var c,d="";if($.isEmptyObject(a))d='<p class="alert alert-error">Error occurred during creation of form list or no forms found</p>';else for(c in a)d+='<li><a class="btn btn-block btn-info" id="'+c+'" title="'+a[c].title+'" href="'+a[c].url+'" data-server="'+a[c].server+'" >'+a[c].name+"</a></li>";b.removeClass("empty").find("ul").empty().append(d)};
function getGetVariable(a){for(var b=window.location.search.substring(1).split("&"),c=0;c<b.length;c++){var d=b[c].split("=");if(d[0]==a)return encodeURI(d[1])}return!1}function Print(){this.setStyleSheet();this.setDpi()}Print.prototype.setDpi=function(){var a,b=document.body.appendChild(document.createElement("DIV"));b.style.width="1in";b.style.padding="0";a=b.offsetWidth;b.parentNode.removeChild(b);this.dpi=a};
Print.prototype.setStyleSheet=function(){this.styleSheet=this.getStyleSheet();this.$styleSheetLink=$('link[media="print"]:eq(0)')};Print.prototype.getStyleSheet=function(){for(var a=0;a<document.styleSheets.length;a++)if("print"===document.styleSheets[a].media.mediaText)return document.styleSheets[a];return null};Print.prototype.styleToAll=function(){this.styleSheet||this.setStyleSheet();this.styleSheet.media.mediaText="all";this.$styleSheetLink.attr("media","all")};
Print.prototype.styleReset=function(){this.styleSheet.media.mediaText="print";this.$styleSheetLink.attr("media","print")};Print.prototype.printForm=function(){console.debug("preparing form for printing");this.removePageBreaks();this.removePossiblePageBreaks();this.styleToAll();this.addPageBreaks();this.styleReset();window.print()};Print.prototype.removePageBreaks=function(){$(".page-break").remove()};Print.prototype.removePossiblePageBreaks=function(){$(".possible-break").remove()};
Print.prototype.addPossiblePageBreaks=function(){var a=$("<hr>",{"class":"possible-break"});this.removePossiblePageBreaks();$("form.jr").before(a.clone()).after(a.clone()).find("fieldset>legend, label:not(.geo)>input:not(input:radio, input:checkbox), label>select, label>textarea, .trigger>*, h4>*, h3>*").parent().each(function(){var b,c;b=$(this);return(c=b.prev().get(0))&&("H3"===c.nodeName||"H4"===c.nodeName)||$(c).hasClass("repeat-number")||0<b.parents("#jr-calculated-items, #jr-preload-items").length?
null:b.before(a.clone())});$(".possible-break").each(function(){if($(this).prev().hasClass("possible-break"))return $(this).remove()})};
Print.prototype.addPageBreaks=function(){var a,b,c,d,e,g,f,h;f=9.5*this.dpi;d=function(a,b){this.begin=$(a);this.begin_top=this.begin.offset().top;this.end=$(b);this.end_top=this.end.offset().top;this.h=this.end_top-this.begin_top;if(0>this.h)throw console.debug("begin (top: "+this.begin_top+")",a),console.debug("end (top: "+this.end_top+")",b),Error("A question group has an invalid height.");};d.prototype.break_before=function(){var a,b;b=(a=this.begin.prev().get(0))?["after",a]:["before",this.begin.parent().get(0)];
a=b[0];return $(b[1])[a]("<hr class='page-break' />")};this.removePageBreaks();this.addPossiblePageBreaks();c=$(".possible-break");b=[];for(a=1;a<c.length;a++)b.push(new d(c[a-1],c[a]));d=0;c=[];a=[];g=0;for(h=b.length;g<h;g++)e=b[g],d+e.h>f?(a.push(c),c=[e],d=e.h):(c.push(e),d+=e.h);a.push(c);console.debug("pages: ",a);f=1;for(c=a.length;f<c;f++)b=a[f],0<b.length&&b[0].break_before();return $(".possible-break").remove()};
(function(a){a.fn.toLargestWidth=function(){var b=0;return this.each(function(){a(this).width()>b&&(b=a(this).width())}).each(function(){a(this).width(b)})};a.fn.toSmallestWidth=function(){var b=2E3;return this.each(function(){console.log(a(this).width());a(this).width()<b&&(b=a(this).width())}).each(function(){a(this).width(b)})};a.fn.reverse=[].reverse;a.fn.alphanumeric=function(b){b=a.extend({ichars:"!@#$%^&*()+=[]\\';,/{}|\":<>?~`.- ",nchars:"",allow:""},b);return this.each(function(){b.nocaps&&
(b.nchars+="ABCDEFGHIJKLMNOPQRSTUVWXYZ");b.allcaps&&(b.nchars+="abcdefghijklmnopqrstuvwxyz");for(var c=b.allow.split(""),d=0;d<c.length;d++)-1!=b.ichars.indexOf(c[d])&&(c[d]="\\"+c[d]);b.allow=c.join("|");var e=b.ichars+b.nchars,e=e.replace(RegExp(b.allow,"gi"),"");a(this).keypress(function(a){var b;b=a.charCode?String.fromCharCode(a.charCode):String.fromCharCode(a.which);e.indexOf(b)!=-1&&a.preventDefault();a.ctrlKey&&b=="v"&&a.preventDefault()});a(this).bind("contextmenu",function(){return false})})};
a.fn.numeric=function(b){var c="abcdefghijklmnopqrstuvwxyz",c=c+c.toUpperCase(),b=a.extend({nchars:c},b);return this.each(function(){a(this).alphanumeric(b)})};a.fn.alpha=function(b){b=a.extend({nchars:"1234567890"},b);return this.each(function(){a(this).alphanumeric(b)})};a.fn.capitalizeStart=function(a){a||(a=1);var c=this.contents().filter(function(){return 3==this.nodeType}).first(),d=c.text(),a=d.split(" ",a).join(" ");c.length&&(c[0].nodeValue=d.slice(a.length),c.before('<span class="capitalize">'+
a+"</span>"))}})(jQuery);/*
 Copyright 2012 Martijn van de Rijdt

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function StorageLocal(){function a(a){var c;for(c=0;c<b.length;c++)if(a===b[c])return!0;return!1}var b="__settings null __history Firebug undefined __bookmark __counter __current_server".split(" "),c=window.localStorage;this.isSupported=function(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}};this.getForbiddenKeys=function(){return b};this.setRecord=function(b,e,g,f,h){console.debug("setRecord received record with final: "+e.ready);if(!b||1>b.length)return console.error("no key provided for record"),
"require";b=b.trim();h="string"===typeof h?h.trim():null;f="undefined"!==typeof f&&!0===f?!0:!1;if("string"===typeof e.data&&a(b))return"forbidden";var i;if(i="string"===typeof e.data)if(i=h!==b)i=c.getItem(b)?!0:!1,i=i&&!0!==f;if(i)return"existing";try{return"string"===typeof e.data&&(e.lastSaved=(new Date).getTime(),c.setItem("__counter",JSON.stringify({counter:this.getCounterValue()}))),c.setItem(b,JSON.stringify(e)),console.debug("saved: "+b+", old key was: "+h),null!==h&&(""!==h&&h!==b)&&g&&
(console.log("going to remove old record with key:"+h),this.removeRecord(h)),"success"}catch(j){return console.log("error in store.setRecord:"+j.message),"error"}};this.getRecord=function(a){var b;try{return b=JSON.parse(c.getItem(a))}catch(g){return console.error("error with loading data from store: "+g.message),null}};this.removeRecord=function(a){try{return c.removeItem(a),$("form.jr").trigger("delete",JSON.stringify(this.getRecordList())),!0}catch(b){return console.log("error with removing data from store: "+
b.message),!1}};this.getFormList=function(a){return"undefined"!==typeof a?null:this.getRecord("__server_"+a)};this.getRecordList=function(){var a,b,c=[],f=this.getSurveyRecords(!1);for(a=0;a<f.length;a++)b=f[a],c.push({key:b.key,ready:b.ready,lastSaved:b.lastSaved});console.debug("formList returning "+c.length+" items");c.sort(function(a,b){return b.lastSaved-a.lastSaved});return c};this.getSurveyRecords=function(b,e){var g,f,h=[],i={},b=b||!1,e=e||null;for(g=0;g<c.length;g++)if(f=c.key(g),i=this.getRecord(f),
!a(f))try{i.key=f,f!==e&&(!b||"true"===i.ready||!0===i.ready)&&h.push(i)}catch(j){console.log("record found that was probably not in the correct JSON format (e.g. Firebug settings or corrupt record) (error: "+j.message+"), record was ignored")}return h};this.getSurveyDataArr=function(a,b){var c,f,h=[];f=this.getSurveyRecords(a||!0,b);for(c=0;c<f.length;c++)h.push({name:f[c].key,data:f[c].data});return h};this.getSurveyDataOnlyArr=function(a){for(var b=this.getSurveyDataArr(a),c=[],a=0;a<b.length;a++)c.push(b[a].data);
return 0<c.length?c:null};this.getCounterValue=function(){var a=this.getRecord("__counter");return((a&&"undefined"!==typeof a.counter&&isNumber(a.counter)?Number(a.counter):0)+1).toString().pad(4)}}function isNumber(a){return!isNaN(parseFloat(a))&&isFinite(a)};/*
 Copyright 2012 Martijn van de Rijdt

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function Connection(){var a=this;this.CONNECTION_URL="/checkforconnection.php";this.SUBMISSION_URL="/data/submission";this.GETSURVEYURL_URL="/launch/get_survey_url";this.SUBMISSION_TRIES=2;this.uploadOngoing=this.currentOnlineStatus=!1;this.init=function(){this.checkOnlineStatus();a=this;window.setInterval(function(){a.checkOnlineStatus()},15E3);$(window).on("offline online",function(){console.log("window network event detected");a.setOnlineStatus(a.getOnlineStatus())});$(window).trigger("online")}}
Connection.prototype.checkOnlineStatus=function(){var a,b=this;navigator.onLine?$.ajax({type:"GET",url:this.CONNECTION_URL,cache:!1,dataType:"json",timeout:3E3,complete:function(c){a="undefined"!==typeof c.responseText&&"connected"===c.responseText;b.setOnlineStatus(a)}}):this.setOnlineStatus(!1)};Connection.prototype.getOnlineStatus=function(){return this.currentOnlineStatus};
Connection.prototype.setOnlineStatus=function(a){a!==this.currentOnlineStatus&&(console.log("online status changed to: "+a+", triggering window.onlinestatuschange"),$(window).trigger("onlinestatuschange",a));this.currentOnlineStatus=a};
Connection.prototype.uploadRecords=function(a,b,c){b="undefined"!==typeof b?b:!1;a="object"===typeof a&&!$.isArray(a)?[a]:a;c="undefined"===typeof c?null:c;if(0===a.length)return!1;this.uploadOngoing||(this.uploadResult={win:[],fail:[]},this.uploadQueue=a,this.forced=b,console.debug("upload queue length: "+this.uploadQueue.length),this.uploadOne(c));return!0};
Connection.prototype.uploadOne=function(a){var b,c,d,e=this,a="undefined"===typeof a||!a?{complete:function(a){e.processOpenRosaResponse(a.status,b.name,d);e.uploadOne()},error:function(a,b){"timeout"===b?console.debug("submission request timed out"):console.error("error during submission",b)},success:function(){}}:a;0<this.uploadQueue.length&&(b=this.uploadQueue.pop(),!0!==this.getOnlineStatus()?this.processOpenRosaResponse(0,b.name,!0):(this.uploadOngoing=!0,c=new FormData,c.append("xml_submission_data",
b.data),c.append("Date",(new Date).toUTCString()),d=0===this.uploadQueue.length?!0:!1,this.setOnlineStatus(null),$.ajax(this.SUBMISSION_URL,{type:"POST",data:c,cache:!1,contentType:!1,processData:!1,timeout:6E4,complete:function(b,c){e.uploadOngoing=!1;a.complete(b,c)},error:a.error,success:a.success})))};
Connection.prototype.processOpenRosaResponse=function(a,b,c){var d,e="";d=[];var g="Contact "+settings.supportEmail+" please.",f="Sorry, the enketo server is down or being maintained. Please try again later or contact "+settings.supportEmail+" please.",g={"0":{success:!1,msg:"undefined"!==typeof jrDataStrToEdit?"Uploading of data failed. Please try again.":"Uploading of data failed (maybe offline) and will be tried again later."},200:{success:!1,msg:"Data server did not accept data. "+g},201:{success:!0,
msg:""},202:{success:!0,msg:b+" may have had errors. Contact the survey administrator please."},"2xx":{success:!1,msg:"Unknown error occurred when submitting data. "+g},400:{success:!1,msg:"Data server did not accept data. Contact the survey administrator please."},403:{success:!1,msg:"You are not allowed to post data to this data server. Contact the survey administrator please."},404:{success:!1,msg:"Submission service on data server not found or not properly configured."},"4xx":{success:!1,msg:"Unknown submission problem on data server."},
413:{success:!1,msg:"Data is too large. Please export the data and contact "+settings.supportEmail+"."},500:{success:!1,msg:f},503:{success:!1,msg:f},"5xx":{success:!1,msg:f}};console.debug("name: "+b+" status: "+a);"undefined"!==typeof g[a]?!0===g[a].success?("undefined"!==typeof store&&(store.removeRecord(b),console.log("tried to remove record with key: "+b)),$("form.jr").trigger("uploadsuccess",b),this.uploadResult.win.push([b,g[a].msg])):!1===g[a].success&&this.uploadResult.fail.push([b,g[a].msg]):
500<a?(console.error("Error during uploading, received unexpected statuscode: "+a),this.uploadResult.fail.push([b,g["5xx"].msg])):400<a?(console.error("Error during uploading, received unexpected statuscode: "+a),this.uploadResult.fail.push([b,g["4xx"].msg])):200<a&&(console.error("Error during uploading, received unexpected statuscode: "+a),this.uploadResult.fail.push([b,g["2xx"].msg]));if(!0===c){console.debug("going to provide upload feedback (forced = "+this.forced+") from object:");console.debug(this.uploadResult);
if(0<this.uploadResult.win.length){for(a=0;a<this.uploadResult.win.length;a++)d.push(this.uploadResult.win[a][0]),e="undefined"!==typeof this.uploadResult.win[a][2]?e+this.uploadResult.win[a][1]+" ":"";a=1<a?" were":" was";d=d.join(", ");gui.showFeedback(d.substring(0,d.length)+a+" successfully uploaded. "+e);this.setOnlineStatus(!0)}if(0<this.uploadResult.fail.length&&(this.setOnlineStatus(!1),!0===this.forced)){for(a=0;a<this.uploadResult.fail.length;a++)e+=this.uploadResult.fail[a][0]+": "+this.uploadResult.fail[a][1]+
"<br />";$(".drawer.left.closed .handle").click();gui.alert(e,"Failed data submission")}}};Connection.prototype.isValidURL=function(a){return/^(https?:\/\/)([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?[\/\w \.\-\=\&\?]*$/.test(a)};
Connection.prototype.getFormlist=function(a,b){b=this.getCallbacks(b);this.isValidURL(a)?$.ajax("/formlist/get_list",{type:"GET",data:{server_url:a},cache:!1,contentType:"json",timeout:6E4,success:b.success,error:b.error,complete:b.complete}):b.error(null,"validationerror","not a valid URL")};
Connection.prototype.getSurveyURL=function(a,b,c){c=this.getCallbacks(c);!a||!this.isValidURL(a)?c.error(null,"validationerror","not a valid server URL"):!b||0===b.length?c.error(null,"validationerror","not a valid formId"):$.ajax({url:this.GETSURVEYURL_URL,type:"POST",data:{server_url:a,form_id:b},cache:!1,timeout:6E4,dataType:"json",success:c.success,error:c.error,complete:c.complete})};
Connection.prototype.getFormHTML=function(a,b){var c,d,e,g=new FormData(a[0]),b=this.getCallbacks(b);c=a.find('input[name="server_url"]').val()||"";d=a.find('input[name="form_id"]').val()||"";e=a.find('input[name="xml_file"]').val()||"";""===e&&""===c&&""===d?b.error(null,"validationerror","No form file or URLs provided"):""===e&&!this.isValidURL(c)?b.error(null,"validationerror","Not a valid server url"):""===e&&0===d.length?b.error(null,"validationerror","No form id provided"):$.ajax("/transform/get_html_form",
{type:"POST",cache:!1,contentType:!1,processData:!1,dataType:"xml",data:g,success:b.success,error:b.error,complete:b.complete})};Connection.prototype.validateHTML=function(a,b){var c=new FormData,b=this.getCallbacks(b);c.append("level","error");c.append("content",a);$.ajax("/html5validate/",{type:"POST",data:c,contentType:!1,processData:!1,success:b.success,error:b.error,complete:b.complete})};
Connection.prototype.oRosaHelper={fragToServerURL:function(a,b){var c;c="";if(!b)return console.log("nothing to do"),null;switch(a){case "http":case "https":c=/^http(|s):\/\//.test(b)?"":a+"://";c+=b;break;case "formhub_uni":case "formhub":c="http://formhub.org/"+b;break;case "appspot":c="https://"+b+".appspot.com"}if(!connection.isValidURL(c))return console.error("not a valid url: "+c),null;console.log("server_url: "+c);return c}};
Connection.prototype.loadGoogleMaps=function(a){var b=settings.mapsAPIKey||"",c=document.createElement("script");window.googleMapsInit=a;c.type="text/javascript";c.src="http://maps.googleapis.com/maps/api/js?v=3.exp&key="+b+"&sensor=false&libraries=places&callback=googleMapsInit";document.body.appendChild(c)};
Connection.prototype.getCallbacks=function(a){a=a||{};a.error=a.error||function(a,c,d){console.error(c+" : "+d)};a.complete=a.complete||function(){};a.success=a.success||function(){console.log("success!")};return a};/*
 Copyright 2012 Martijn van de Rijdt

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var CACHE_CHECK_INTERVAL=36E5;function Cache(){}
Cache.prototype.init=function(){var a,b=this;if(!this.isSupported)return!1;a=window.applicationCache;setTimeout(function(){1===a.status&&(gui.updateStatus.offlineLaunch(!0),b.showBookmarkMsg())},6E4);if(a.status===a.UPDATEREADY)this.onUpdateReady();if(a.status===a.OBSOLETE)this.onObsolete();$(a).on("obsolete",function(){b.onObsolete()});$(a).on("cached",function(){b.onCached()});$(a).on("updateready",function(){b.onUpdateReady()});$(a).on("error",function(a){b.onErrors(a)});setInterval(function(){b.update()},
CACHE_CHECK_INTERVAL);return!0};Cache.prototype.update=function(){window.applicationCache.update()};Cache.prototype.onObsolete=function(){store.removeRecord("__bookmark");gui.alert("Application/form is no longer able to launch offline. Try to refresh the page to fix this.");gui.updateStatus.offlineLaunch(!1)};Cache.prototype.onCached=function(){this.showBookmarkMsg("This form can be loaded and used when you are offline! <br />",!0);gui.updateStatus.offlineLaunch(!0)};
Cache.prototype.onUpdateReady=function(){applicationCache.swapCache();gui.showFeedback("A new version of this application or form has been downloaded. Refresh this page to load the updated version.",20)};
Cache.prototype.onErrors=function(a){!0===connection.currentOnlineStatus&&(console.error("HTML5 cache error event",a),gui.alert('There is a new version of this application or form available but an error occurs when trying to download it. Please try to refresh the page or send a bug report to <a href="mailto:'+settings.supportEmail+'">'+settings.supportEmail+"</a>."))};
Cache.prototype.showBookmarkMsg=function(a,b){var c,a=a||"",b=b||!1;c=(c=store.getRecord("__bookmark"))?c.shown:0;if(b||3>c)gui.showFeedback(a+"We recommend to bookmark this page for easy access when you are not connected to the Internet. "),c++,store.setRecord("__bookmark",{shown:c})};Cache.prototype.isSupported=function(){return window.applicationCache?!0:!1};/*
 Copyright 2012 Martijn van de Rijdt & Modilabs 

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var connection,store;window.addEventListener("load",function(){setTimeout(function(){window.scrollTo(0,1)},0)},!1);
$(document).ready(function(){connection=new Connection;store=new StorageLocal;$("[title]").tooltip();gui.setup();$("body").on("touchstart.dropdown",".dropdown-menu",function(a){a.stopPropagation()});$(".url-helper a").click(function(){var a,b;$(this).parent().addClass("active").siblings().removeClass("active");a=$(this).attr("data-value");b="formhub_uni"===a?"formhub_u":"";$("input#server").attr("placeholder","formhub"===a||"formhub_uni"===a?"enter formhub account":"appspot"===a?"enter appspot subdomain":
"e.g. formhub.org/johndoe");$("input#server").val()!==b&&$("input#server").val(b).trigger("change")}).andSelf().find('[data-value="formhub"]').click();$("input").change(function(){0<$(this).val().length&&$(".go").click();return!1});$(".go").click(function(){var a,b=$("input#server").val(),c=$(".url-helper li.active > a").attr("data-value");"none"===$("progress").css("display")&&(a={server:connection.oRosaHelper.fragToServerURL(c,b),helper:$(".url-helper li.active > a").attr("data-value"),inputValue:$("input#server").val()},
a.server&&($("progress").show(),connection.getFormlist(a.server,{success:function(b,c){processFormlistResponse(b,c,a)}})))});$("#form-list").on("click","a",function(){console.log("caught click");var a,b,c=$(this).attr("href");!c||""===c||"#"===c?(console.log("going to request enketo url"),a=$(this).attr("data-server"),b=$(this).attr("id"),connection.getSurveyURL(a,b,{success:function(c,e){c.serverURL=a;c.formId=b;processSurveyURLResponse(c,e)}})):location.href=c;return!1});loadPreviousState()});
function loadPreviousState(){var a;if(a=store.getRecord("__current_server"))$(".url-helper li").removeClass("active").find('[data-value="'+a.helper+'"]').parent("li").addClass("active"),$("input#server").val(a.inputValue),a=store.getFormList(a.url),gui.parseFormlist(a,$("#form-list"))}
function processFormlistResponse(a,b,c){console.log("processing formlist response");"object"===typeof a&&!$.isEmptyObject(a)&&(store.setRecord("__server_"+c.server,a,!1,!0),store.setRecord("__current_server",{url:c.server,helper:c.helper,inputValue:c.inputValue},!1,!0));$("progress").hide();gui.parseFormlist(a,$("#form-list"))}
function processSurveyURLResponse(a){var b=a.url||null,c=a.serverURL||null,d=a.formId||null;console.debug(a);console.debug("processing link to:  "+b);b&&(c&&d)&&(a=store.getRecord("__server_"+c)||{},a[d].url=b,store.setRecord("__server_"+c,a,!1,!0),$('a[id="'+d+'"][data-server="'+c+'"]').attr("href",b).click())};