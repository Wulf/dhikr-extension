'use strict';

// Set UI minutes from storage
chrome.storage.sync.get('org.akhira.dhikr.minutes', function(obj) {
    var minutes = Number(obj['org.akhira.dhikr.minutes'])
    if(!minutes) {
	chrome.storage.sync.set({'org.akhira.dhikr.minutes': 10})
	document.getElementById('minutes').value = 10
    } else {
	document.getElementById('minutes').value = minutes
    }
})


function start() {
    chrome.runtime.sendMessage({request: 'start'})
}

function stop() {
    chrome.runtime.sendMessage({request: 'stop'})
}

function ping() {
    chrome.runtime.sendMessage({request:'ping'})
}

function restart(minutes) {
    minutes = Number(minutes)
    chrome.alarms.clear('org.akhira.dhikr')
    chrome.alarms.create('org.akhira.dhikr', {periodInMinutes: minutes})
}

function toggle() {
    chrome.storage.sync.get('org.akhira.dhikr.state', function(obj) {
    	if(obj['org.akhira.dhikr.state'] === true) {
    	    stop();
	    window.close()
    	} else {
    	    start();
	    window.close()
    	}
    })

    
}

function setMinutes(event) {
    var minutes = Number(event.target.value)

    chrome.storage.sync.set({'org.akhira.dhikr.minutes': minutes})
    restart(minutes)
}

document.getElementById('toggle').addEventListener('click', toggle);
document.getElementById('minutes').addEventListener('change', setMinutes);
document.getElementById('ping').addEventListener('click', ping)
