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
BulkTE.BackgroundScript= function(){
  var loaded = false;
  // Pass message params to injected content script.
  function sendParams(selector, limit){
    chrome.tabs.query({active: true, currentWindow: true}, 
      function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "run",selector: selector, limit: limit});
    });
  }
  function contentScriptLoaded(){
    // getCurrent gives null sometimes... so! 
    chrome.tabs.query({ currentWindow: true, active: true },
      function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "checkContentScriptLoaded"},
        function(response) {
        //console.log(response);
        if(response) {
          loaded = response.contentScriptLoaded
        }
      }
      );
    });
  }
  function triggerContentScript(selector, limit){
    contentScriptLoaded();
    setTimeout(function(){
    if(loaded){
      sendParams(selector, limit);
    }else{
      chrome.tabs.executeScript(null,
        {file: "jquery-2.1.0.min.js"}, function(){
        chrome.tabs.executeScript(null,{file: "functions.js"},
          function(){sendParams(selector, limit);}
        )
      }  
      );
    }
    loaded=false;
    }, 100);
  }
  // Set up single search
  function imageSearch(info, tab){
    var selector='img[src|="'+info.srcUrl+'"]'
    limit = 1;
    triggerContentScript(selector, limit);
  }
  return {
    imageSearch:imageSearch,
    triggerContentScript: triggerContentScript
  }
}();
chrome.contextMenus.create({
    "title": "TinEye Overlay",
    "contexts": ["image"],
    "onclick": BulkTE.BackgroundScript.imageSearch}
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(sender.id===chrome.runtime.id){
      //console.log('trigger content script');
      if(request){
        var selector = request.selector || 'img';
        var limit = parseInt(request.limit) || 1;
        BulkTE.BackgroundScript.triggerContentScript(selector, limit);
      }
    }
  }
);

console.log('background script loaded');