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
window.onload = function(){
var selectorInput = document.getElementById('selector');
var limitInput = document.getElementById('limit');
// Load params from localStorage
if(localStorage['selector']) { selectorInput.value = localStorage['selector'] }
else {selectorInput.value = 'img.thumb';}
if(localStorage['limit']) { limitInput.value = localStorage['limit'] }
else {limitInput.value = '3';}
// Save params in localStorage.
selectorInput.addEventListener('keyup', function (){
  localStorage['selector'] = selectorInput.value
}, false);
limitInput.addEventListener('keyup', function (){
  localStorage['limit'] = limitInput.value
}, false);

// Execute content script
document.getElementById('tinit').addEventListener('click', 
  function(){
    //triggerContentScript(selectorInput.value, limitInput.value);
	chrome.runtime.sendMessage({selector:selectorInput.value, limit:limitInput.value});
	console.log('sent message');
  }
  , false);
}