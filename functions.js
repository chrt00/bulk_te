/*
The MIT License (MIT)

Copyright (c) 2014 Chris To

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var BulkTE = BulkTE || {};
BulkTE.ContentScript= function(){
  var error = false;
  var timeouts = new Array();
  // parse TE page data
  function parseResult(data,url) {
    var result = -1;
    var regex = /<title>[.\s\n]*(\d*)[.\s\n]*result[s]?/i;
    var searchlimit = /You have reached your daily[.\s\n\W\w]*search limit/i;
    var match =regex.exec(data)
    if(!match) {
        if(searchlimit.exec(data)){
        throw "Reached Tineye search limit. (50/day)";
      } else {
        throw "Unknown TinEye error";
      }
      console.log("Tineye error: "+ url);
    }else if(match.length == 2) {
      result = parseInt(match[1]);
    }
    return result;
  }
  // overlay content over image
  function overlay(element, insert) {
    var css = {
      "position":"absolute",
      "left":"0px",
    "top":"0px",
    "z-index":1200,
    "font-weight":"bold",
      "font-size":"12px",
    "color":"#900",
    "text-shadow":"0 0 5px #000, 0 0 2px #000",
    "margin":"0px",
    "padding":"5px",
    "line-height":"0px"
    }
    var e = $(element);
    //overlay with div wrapper for absolute positioning to work properly with static parents
    var wrapper = $("<div style='position:relative'></div>");
    var inner = $(insert);
    inner.css(css);
    wrapper.append(inner);
    e.before(wrapper);
  }
  //Get page data, parse and apply overlay.
  function tineye(url, element) {
    console.log('retrieving tineye search info');
    var tineyeurl="http://www.tineye.com/search?url="+escape(url);
    var tineyePage = $.get(tineyeurl).done( 
    function(data, status, jqxhr){
      console.log(jqxhr);
      var result =-1
      try{
        result = parseResult(data,tineyeurl);
      } catch(err){
        result = -2;
      console.log('Error. halt furthter script execution');
      error = true;
      }
      if(result >= 0) {
        overlay(element, '<a href="'+ tineyeurl +'" target=_blank>' + result + ' results</a>');
      $(element).addClass('data-tineye-searched');
      } else {
        overlay(element, '<a href="'+ tineyeurl +'" target=_blank>' + 'TE error' + '</a>');
      }
      }
    );
  }

  // Offline test method for tineye(url, element);
  function testTinEyeOffline(url, element){
    console.log('mark');
    $(element).addClass('data-tineye-searched');
    overlay(element, '<a href=#>testMarking</a>');
  }
  function clearTimeouts(){
    while(timeouts.length > 0) {
      clearTimeout(timeouts.pop());
    }
  }
  // Setup batch execution
  function run(selector, limit){
    var images = $(selector);
    var processed = 0;
    clearTimeouts();
    for(var i = 0; i < images.length && processed < limit; i++){
      if(!$(images[i]).hasClass('data-tineye-searched')){
        //Push requests at 1s timeouts to not bog down TE
      timeouts.push(setTimeout(function(i){
        if(!error){
          var url = $(images[i]).attr('src');
            tineye(url, images[i]);
            //testTinEyeOffline(url, images[i]);
        } else {
          clearTimeouts();
        }
      }
    , 1000*processed, i));
    processed++;
    }
    }
  }
  return {
    run: run
  }
}();
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension:" + sender.id);
    // @TODO check message by sender.id - https://developer.chrome.com/extensions/packaging
	//console.log(sender);
	console.log(request);
	if(!sender.tab && sender.id) {

	  if(request.action == "run"){
	    var selector = request.selector ? request.selector : "img";
	    var limit = request.limit ? parseInt(request.limit) : 2;
	    if(limit<1){limit = 1;}
	    console.log(selector, request.limit);
	    BulkTE.ContentScript.run(selector, limit);
		sendResponse({"contentScriptLoaded":true, "action":"run"});
	  } else if(request.action == "checkContentScriptLoaded"){
	    console.log('send response');
	    sendResponse({"contentScriptLoaded":true});
	  }
	}
});
console.log('loaded content script');
