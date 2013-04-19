/**
 * @preserve Copyright 2012 Martijn van de Rijdt
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint browser:true, devel:true, jquery:true, smarttabs:true*//*global GUI, gui, Form, Connection, Modernizr, getGetVariable, vkbeautify*/
var form, source, url, $tabs, $upload, _error, state, connection, fileManager,
	error_msg = 'There were errors. Please see the "report" tab for details.',
	templateShow = false;

$(document).ready(function(){
	"use strict";
	connection = new Connection();
	state = new State();
	state.init();

	_error = console.error;
	console.error = function(){
		addJsError(arguments[0]);
		gui.feedback(error_msg);
		return _error.apply(console, arguments);
	};

	if (!state.source){
		$('#html5-form-source').hide();
		$('li a[href="#html5-form-source"]').parent('li').remove();
	}

	$('li a[href="#upload"]').tab('show');

	gui.setup();

	$('#upload-form [name="xml_file"]').change(function(){
		$('#upload-form').submit();
	});

	$('#upload-form').submit(function(){
		var $formId = $(this).find('[name="form_id"]'),
			formId = $formId.val(),
			$serverURL = $(this).find('[name="server_url"]'),
			serverURL = $serverURL.val(),
			$file = $(this).find('[name="xml_file"]'),
			file = ($file.val()) ? $file[0].files[0] : null,
			error = function(jqXHR, status, errorThrown){
				if (status !== 'validationerror'){
					gui.feedback('Sorry, an error occured while communicating with the Enketo server. ('+errorThrown+')');
				}
				else {
					gui.alert(errorThrown);
					//resetAll();
				}
			},
			complete = function(jqXHR, textStatus){
				$('#upload progress').hide();
			};

		resetAll();

		$('#upload progress').show();

		if ( formId || file ){
			if (file) {
				$('#form-list ul').empty();
			}
			connection.getTransForm(serverURL, formId, file, null, {
				success: function(resp, textStatus, jqXHR){
					state.server = (serverURL) ? serverURL : null;
					state.id = (formId) ? formId : null;
					state.setUrl();
					processForm($(resp));
				},
				error: error,
				complete: complete
			});
		}
		else{
			$('#form-list ul').empty();
			connection.getFormlist(serverURL, {
				success: function(resp, textStatus, jqXHR){
					//$('#upload .hurry').hide();
					state.server = serverURL;
					state.id = null;
					state.setUrl();
					processFormlist(resp);
					$serverURL.val(serverURL);
				},
				error: error,
				complete: complete
			});
		}
		return false;
	});

	$('#upload-form #input-switcher a')
		.click(function(e){
			e.preventDefault();
			$('#upload-form label').hide().find('input[name="'+$(this).attr('id')+'"]').parents('label').show();
			$(this).siblings().removeClass('active');
			$(this).addClass('active');
		});

	$('#data-template-show input').change(function(){
		templateShow = ($(this).is(':checked')) ? true : false;
		updateData();
	});

	$(document).on('click', '#form-list a', function(event){
		var id = /** @type {string} */ $(this).attr('id').toString(),
			server = /** @type {string} */ $(this).attr('data-server');
		event.preventDefault();
		$('#upload-form input[name="server_url"]').val(server);
		$('#upload-form input[name="form_id"]').val(id);
		$('#upload-form').submit();
	});

	$('#html5-form-source form').submit(function(){
		var cls, $form = $(this);
		var html = '<!DOCTYPE html><html><head><meta charset="utf-8" /><title></title></head><body>'+
			$form.find('textarea[name="content"]').val()+'</body></html>';
		
		$('#html5validationmessages div').html('<form style="text-align:center;"><progress></progress></form>');
		
		connection.validateHTML(html, {
			success: function(response){
				//strip <script> elements
				var $response = $('<div></div>');
				$response.append(response.replace(/<script[A-z =".]*><\/script>/gi, ''));
				$response.find('ol:not(.source) li>*:first-child').each(function(){
					cls = /**@type {string} */$(this).parent('li').attr('class');
					$(this).addClass(cls);
				});
				parseMsgList ($response.find('p.success, ol:not(.source) li>*:first-child'), $('#html5validationmessages div'));
				//correction as Web Service does not accept 'level: 'error' parameter:
				$('#html5validationmessages div li.info').hide();
			},
			error: function(){
				$('#html5validationmessages div').empty().append('<ol><li class="info">'+
					'<span class="ui-icon ui-icon-info"></span>This validation is currently not functional</li></ol>');
			}
		});
		return false;
	});
	
	$('#upload-form #input-switcher a#server_url').click();

	/*$('#launch form').submit(function(){
		var serverURL = $(this).find('[name="server_url"]').val(),
			formId = $(this).find('[name="form_id"]').val();

		gui.alert('<form style="text-align:center;><progress></progress></form>', 'Requesting url...', 'normal');

		connection.getSurveyURL(serverURL, formId, {
			error: function(response){
				gui.alert('Ouch, an error occurred during the request. Please try again.');
			},
			success: function(response){
				//{success: true, url: .......}
				//{success: false, reason: 'existing', url: ....}
				//{success: false, reason: 'empty'} empty form fields sent in POST
				//{success: false, reason: 'database'} error inserting record into database
				//{succces: false, reason: ''} unknown, could be invalid url(s)
				console.log('form submission complete');
				if (response.success){
					gui.alert('Form was succesfully launched at this address: '+
						'<a class="launch-link" href="'+response.url+'">'+response.url+'</a>', 'Launched!', 'success');
				}
				else{
					switch(response.reason){
						case 'existing':
							gui.alert('This survey was launched before at this address: '+
								'<a class="launch-link" href="'+response.url+'">'+response.url+'</a>', 'Launched!', 'success');
							break;
						case 'empty':
							gui.alert('Server url and/or form id submitted to the server found to be empty.', 'Failed');
							break;
						case 'database':
							gui.alert('Problem occurred trying to add survey details to Enketo database to launch.', 'Failed');
							break;
						default:
							gui.alert('Unknown error', 'Failed');
					}
				}
			}
		});
		return false;
	});*/

	if (state.server){
		$('#upload-form input[name="server_url"]').val(state.server);
		$('#upload-form input[name="form_id"]').val(state.id);
		$('#upload-form').submit();
	}
	else{
		console.log('no server in state');
		$('.hurry').show();
		gui.parseFormlist(null, $('#form-list'), true);
	}
});

/**
 * State class maintains 'fake' state using url GET variables
 *
 * @constructor
 */
function State(){
	
}

State.prototype.init = function (){
	var that,
		serverGetVar = decodeURIComponent(decodeURI(helper.getQueryParam('server')));

	this.initialURL = location.href,
	this.server = ( serverGetVar && connection.isValidURL(serverGetVar) ) ? serverGetVar : null;
	this.id = helper.getQueryParam('id') || null; //CHECK THIS FOR 'VALIDITY'
	this.source = helper.getQueryParam('source') || false;
	this.debug = helper.getQueryParam('debug') || false;
	this.everPushedState = false;
	that = this;

	state.setUrl();

	$(window).on('popstate', function(event){
		//console.debug('state popped! with everPushedState:'+that.everPushedState);
		// Ignore inital popstate that some browsers fire on page load
		if ( that.everPushedState && (location.href !== that.initialURL )){
			//console.debug('popstate event fired with state props: ', event.originalEvent.state);
			window.location = location.href;
		}
	});
	setTimeout(function(){that.everPushedState = true;}, 1000);
};

State.prototype.setUrl = function(){
	var stateProps = {server: this.server, id: this.id, source: this.source, debug: this.debug},
		urlAppend = '',
		url = 'formtester';
	urlAppend = (this.server !== null && connection.isValidURL(this.server)) ? urlAppend+'server='+encodeURIComponent(this.server) : urlAppend;
	urlAppend = (this.id !== null) ? urlAppend+'&id='+encodeURIComponent(this.id) : urlAppend;
	urlAppend = (this.source == 'true' || this.source === true ) ? urlAppend+'&source='+encodeURIComponent(this.source) : urlAppend;
	urlAppend = (this.debug == 'true' || this.debug === true ) ? urlAppend+'&debug='+encodeURIComponent(this.debug) : urlAppend;
	urlAppend = (urlAppend.substring(0,1) == '&') ? urlAppend.substring(1) : urlAppend;
	url = (urlAppend.length > 0) ? url+'?'+urlAppend : url;
	if ((location.href !== location.protocol+'//'+location.hostname+'/'+url) || this.everPushedState){
		//console.debug('pushing history state ', location.href);
		//console.debug(location.hostname+'/'+url);
		//console.debug(stateProps);
		//this.everPushedState = true;
		history.pushState( stateProps, 'Enketo Form Tester', url);
	}
};

State.prototype.reset = function(){
	console.debug('resetting state');
	this.server = null;
	this.id = null;
	this.setUrl();
};

function resetAll(){
	"use strict";
	//state.reset();
	$('#upload-form')[0].reset();
	$('#upload-form input[type="hidden"]').val('');
	//$('#form-list ul').empty().hide();
	$('#upload progress').hide();
	//$('#input-switcher, #upload .hurry').show().find('a#server_url').click();
	$('#form-languages').remove();
	$('#survey-form form, #xsltmessages div, #html5validationmessages div, #jrvalidationmessages div, #xmlerrors div, #xslerrors div, #html5-form-source textarea, #data textarea').empty();
	form = null;
	$('#validate-form').addClass('disabled');
	$('.nav li a[href="#upload"]').tab('show');
}

function processForm($response){
	var formStr = new XMLSerializer().serializeToString($response.find(':first>form')[0]);
	//data as string
	var jrDataStr = new XMLSerializer().serializeToString($response.find(':first>model')[0]);
	//extract messages
	var $xsltMsg = $response.find('xsltmessages message');
	//var $html5Msg = $response.find('html5validatormessages message');
	var $jrMsg = $response.find('jrvalidationmessages message');
	var $xmlMsg = $response.find('xmlerrors message');
	var $xslMsg = $response.find('xslformerrors message, xsldataerrors message');

	$('#upload progress').hide();
	
	if(formStr.length > 0){
		$('#html5-form-source textarea').empty().text(vkbeautify.xml(formStr));
		$('#html5-form-source form').submit();
		
		//important to use append with string and not $object for some reason => JQuery bug?
		$('#survey-form form').replaceWith(formStr);
		
		form = new Form('form.jr:eq(0)', jrDataStr);
		form.init();
			
		$('.nav a[href="#survey-form"]').tab('show');
		
		//set event handlers for changes in form input fields
		$(document).on('change dataupdate', 'form.jr', updateData);

		//enable buttons
		$('#validate-form').removeClass('disabled');
	}
	else {
		$('#survey-form div').empty();
		$('.nav li a[href="#report"]').tab('show');
	}
	
	if (form && form.getDataStr().length > 0){
		updateData();
	}
	else{
		$('#data div').text('An error occurred whilst trying to extract the data.');
	}
	
	if (form && form.getDataStr().length > 0 && $xsltMsg.length === 0){
		$xsltMsg = $('<message class="success">Nothing reported back. A good sign if there are no other errors!</message>');
	}
	parseMsgList ($xsltMsg, $('#xsltmessages div'));

	if ($jrMsg.length === 0){
		$jrMsg = $('<message class="info">Something went wrong</message>');
	}
	parseMsgList ($jrMsg, $('#jrvalidationmessages div'));
	
	if ($xmlMsg.length === 0){
		$xmlMsg = $('<message class="success">Valid XML document!</message>');
	}
	parseMsgList ($xmlMsg, $('#xmlerrors div'));
	
	if ($xslMsg.length > 0){
		$xslMsg.each(function(){
			console.error('XSLT stylesheet error: '+$(this).text());
		});
	}
	
	if (form && form.getDataStr().length > 0 && $('#report .level-2, #report .level-3').length > 0){
		gui.feedback(error_msg);
	}
}

function processFormlist(list)
{
	"use strict";
	$('.hurry').hide();
	gui.parseFormlist(list, $('#form-list'));
}

function updateData(){
	"use strict";
	if (form){
		var dataStr = form.getDataStr(templateShow);
		//console.log('updating data tab');// with string: '+dataStr);
		$('#data textarea').empty().text(vkbeautify.xml(dataStr));
	}
	else {
		//console.log('nothing to do, there is no form');
	}
}

function parseMsgList(msgObj, targetEl){
	"use strict";
	var messageList = $('<ul></ul>');
	msgObj.each(function(){
		var level = '', liStr, cls, icon = '', message = $(this).text(),
			classes = {'0':'info', 'info warning':'warning', '1':'warning', '2':'error', '3':'error'};
		level = $(this).attr('level') ? $(this).attr('level') : $(this).attr('class');
		cls = (classes[level]) ? "text-"+classes[level] : "muted";
		liStr = '<li class="'+cls+'">'+message+'</li>';
				
		//avoid duplicate messages
		if (messageList.find('li').filter(function(){return $(this).text() == message;}).length === 0) {
			messageList.append(liStr);
		}
	});
	targetEl.empty().append(messageList);
}

function addJsError(message){
	"use strict";
	if ($('#jserrors div ul').length !== 1){
		$('#jserrors div').append('<ul></ul>');
	}
	$('#jserrors div ul').append('<li class="text-error">'+message+'</li>');
}