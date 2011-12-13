/*
 * Copyright (c) 2011 Metropolitan Transportation Authority
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var OBA = window.OBA || {};

OBA.Wizard = function(routeMap) {	
			
	var wizard = jQuery("#wizard"),
		wizard_start = jQuery("#wizard_start"),
		wizard_startLink = jQuery("#wizard-col1"),
		wizardClose = jQuery("#wizard .close"),
		wizard_inuse = jQuery("#wizard_inuse"),
		wizard_inuseClose = jQuery('#wizard_inuse .close'),
		wizard_finaltip = jQuery("#wizard_finaltip"),
		wizard_finaltipClose = jQuery("#wizard_finaltip .close"),
		searchBar = jQuery("#searchbar form"),
		mapHeader = jQuery("#map_header"),
		formElement = jQuery("input[name=q]"),
		legend = jQuery("#legend"),
		theWindow = jQuery(window);	
	
	var search_title = 'Search',
		search_text = '<p>Type a bus route, <a href="#" rel="popover" id="stop_code_popup">stop code</a> or nearby intersection in the search box & press enter.</p><br /><p>Or keep zooming the map in by double clicking on a location.</p>',
		
		direction_title = 'Find Your Stop',
		direction_text = '<p>Click on a direction (next to the <span class="ui-icon ui-icon-triangle-1-e"></span><br /> symbol) to open a bus stop list. Click again to close it.</p><br /><p>Scroll down to your stop & click on it to see it on the map.</p>',
		
		mobile_title = 'Bus Time for Mobile Web',
		mobile_text = 'Visit <a href="http://bustime.mta.info/m"><span style="font-weight:bold;text-decoration:none;">http://mta.info/bustime</span></a> on your web-enabled mobile device.',
		
		sms_title = 'Bus Time for SMS / Text',
		sms_text = 'Text your 6-digit bus stop code # (also add bus route for best results) to <span style="font-weight:bold">511123</span>.',
		
		share_title = 'Copy this link',
		share_text = '<form><input id="url" type="text" size="25" style="font-weight:bold;height:20px;width=200px;" value="http://mta.info/bustime"></input></form>',
		
		stop_code_title = "What's my bus stop code?",
		stop_pole_diagram = "<div class='pole'><img id='pole_img' src='css/map/img/wizard/bus_stop_pole.png' /></div>";
	
	var stop_code_content = "<p>Option 1. Type a location at left or zoom the map in as much as you can. Click on a bus stop name or stop icon <img src='css/map/img/wizard/stop-unknown.png' style='vertical-align:-6px;' /> to see the stop code &amp; bus info.</p>"
						  + "<p>Option 2. Locate your stop code on a bus stop pole box:</p>" 
						  + stop_pole_diagram;
	
	var popover_left = 0,
		wizard_activated = false,
		current_height = 0;
		
	// Set wizard at footer
	function reviseHeight(wizard_height) {	
		wizard.css("height", wizard_height);
		wizard.css("margin-top", -1 * wizard_height);
		current_height = wizard_height;
		popover_left = searchBar.offset().left + searchBar.width();
	}
	reviseHeight(135);
	
	// When window is resized
	function addResizeBehavior() {
		function resize() {
			reviseHeight(current_height);
		}
		theWindow.resize(resize);
	}
	
	// 1. Launch wizard on click
	
	wizard_startLink.click(function(e) { 
		 e.preventDefault(); 
		 wizard_start.hide();
		 reviseHeight(22);
		 wizard_inuse.show();
		 wizard_inuse.popover('hide');  // in case of previous search
		 wizard_start.popover('show');
		 wizard_activated = true;
		 
		 // Stop code inner popup
		 var stop_code_popup = jQuery("#stop_code_popup");
		 stop_code_popup.popover({
				animate: true,
				delayIn: 0,
				delayOut: 300,
				fallback: 'Stop Codes can be found using the map or on bus stop pole boxes.',
				html: true,
				live: false,
				offset: 0,
				placement: 'below',
				title: function() { return stop_code_title; },
				content: function() { return stop_code_content; },
				trigger: 'hover',
				close_btn: false,
				extraClass: true   // info popup within popover
		});
	});
	
	wizardClose.click(function(e) {
		e.preventDefault();
		wizard_start.hide();
		hideSearchPopover();
		unbindLegend();
		wizard.hide();
	});
	
	wizard_start.popover({
		animate: true,
		delayIn: 0,
		delayOut: 500,
		fallback: 'Enter a search term here',
		html: true,
		live: false,
		offset: 10,
		placement: 'right',
		title: function() { return search_title; },
		content: function() { return search_text; },
		trigger: 'manual',
		left: popover_left,
		top_offset: mapHeader.offset().top + formElement.offset().top - 7
	});
	
	function hideSearchPopover() {
		wizard_start.popover('hide');
	}
	
	wizard_inuseClose.click(function(e) {
		e.preventDefault();
		wizard_inuse.hide();
		wizard_start.popover('hide');
		if (wizard_finaltip) {
			wizard_finaltip.popover('hide');
		}
		wizard.hide();
	});
	
	
	// 2. Point out search bar
	// On loading event or map click close pop up
	// Otherwise auto-close wizard if wizard not activated
	searchBar.submit(function() {
		if (wizard_activated) {
			hideSearchPopover();
		} else {
			wizardClose.trigger('click');
		}
	});
	bindLegend();
	routeMap.registerMapListener('zoom_changed',
		function() { 
			if (wizard_activated) {
				hideSearchPopover(); 			
			} else {
				wizardClose.trigger('click');
			}
		});	
	
	// TODO - MORE SPECIFIC
	// Hints for disambiguation
	// function showFindLocation() {
	//}
	
	// 3. Click on direction headings & find stop
	// Show when legend loads
	
	function bindLegend() {
		legend.bind('legend_loaded', showFindStopPopup);
	}
	
	function unbindLegend() {
		legend.unbind('legend_loaded', showFindStopPopup);
	}
	
	function showFindStopPopup() {
		if (! wizard_activated) {
			wizardClose.trigger('click');
			unbindLegend();
			return;
		}
		hideSearchPopover(); 		// check this is closed
		
		wizard_inuse.popover({
			animate: true,
			delayIn: 100,
			delayOut: 500,
			fallback: 'Click on a route direction to find your stop',
			html: true,
			live: false,
			offset: 20,
			placement: 'right',
			title: function() { return direction_title; },
			content: function() { return direction_text; },
			trigger: 'manual',
			left: popover_left,
			top_offset: legend.offset().top + 30
		});
		wizard_inuse.popover('show');
		
		function hideDirectionPopover() {
			wizard_inuse.popover('hide');
			wizard_inuse.hide();
			if (wizard_activated) {
				showFinalTips();
			}
		}
		routeMap.registerMapListener('center_changed', function() { hideDirectionPopover(); });
		unbindLegend();
	}
	
	// 4. Final Tips & social web links
	
	function showFinalTips() {
		reviseHeight(110);
		wizard_finaltip.show();
	}
	
	wizard_finaltipClose.click(function(e) {
		e.preventDefault();
		wizard_finaltip.hide();
		wizard_start.popover('hide');
		if (wizard_inuse) {
			wizard_inuse.popover('hide');
		}
		if (wizard_share) {
			wizard_share.popover('hide');
		}
		unbindLegend();
		wizard_activated = false;
		wizard.hide();
	});
	
	
	// Mobile Web tip popups
	var wizard_mobile_splash = jQuery("#wizard-col3");
	wizard_mobile_splash.popover({
		animate: true,
		delayIn: 100,
		delayOut: 100,
		fallback: 'Go to http://bustime.mta.info on your phone',
		html: true,
		live: false,
		offset: 0,
		placement: 'above',
		title: function() { return mobile_title; },
		content: function() { return mobile_text; },
		trigger: 'hover',
		close_btn: false
	});
	
	var wizard_mobile = jQuery("#wizard_mobile");
	wizard_mobile.popover({
		animate: true,
		delayIn: 100,
		delayOut: 100,
		fallback: 'Go to http://bustime.mta.info on your phone',
		html: true,
		live: false,
		offset: 10,
		placement: 'above',
		title: function() { return mobile_title; },
		content: function() { return mobile_text; },
		trigger: 'hover',
		close_btn: false
	});
	
	// SMS tip popups
	var wizard_sms_splash = jQuery("#wizard-col4");
	wizard_sms_splash.popover({
		animate: true,
		delayIn: 100,
		delayOut: 100,
		fallback: 'Text your 6-digit Bus Stop Code # to <span style="font-weight:bold;text-decoration:none;">511123</span>',
		html: true,
		live: false,
		offset: 0,
		placement: 'above',
		title: function() { return sms_title; },
		content: function() { return sms_text; },
		trigger: 'hover', 
		close_btn: false
	});
	
	var wizard_sms = jQuery("#wizard_sms");
	wizard_sms.popover({
		animate: true,
		delayIn: 100,
		delayOut: 100,
		fallback: 'Text your 6-digit Bus Stop Code # to <span style="font-weight:bold;text-decoration:none;">511123</span>',
		html: true,
		live: false,
		offset: 10,
		placement: 'above',
		title: function() { return sms_title; },
		content: function() { return sms_text; },
		trigger: 'hover',
		close_btn: false
	});
	
	// Share link popup
	var wizard_share  = jQuery("#wizard_share");
	wizard_share.popover({
		animate: true,
		delayIn: 100,
		delayOut: 100,
		fallback: 'Copy this URL: <span style="font-weight:bold;text-decoration:none">http://mta.info/bustime</span>',
		html: true,
		live: false,
		offset: 10,
		placement: 'above',
		title: function() { return share_title; },
		content: function() { return share_text; },
		trigger: 'hover'
	});
	
	wizard_share.click(function() {
		wizard_share.popover('show');
		wizard_share.find('#url').select();
	});
	wizard_share.hover(function(e) {
		e.preventDefault();
		setTimeout( function() {
			var urlField = jQuery('input#url');
			urlField.focus();
			urlField.select();
		}, 400);
	});
	
	// Final tips stop code popup
	// Stop code inner popup
	 var tips_code_popup = jQuery("#tips_code_popup");
	 tips_code_popup.popover({
			animate: true,
			delayIn: 0,
			delayOut: 0,
			fallback: 'Stop Codes can also be found on bus stop pole boxes.',
			html: true,
			live: false,
			offset: 0,
			placement: 'below',
			title: function() { return "Bus Stop Pole Box"; },
			content: function() { return stop_pole_diagram + "Stop codes can also be found here."; },
			trigger: 'hover',
			close_btn: false
		});

};