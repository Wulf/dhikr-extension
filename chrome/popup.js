'use strict';

function updateUI() {
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

    // Set UI seconds from storage
    chrome.storage.sync.get('org.akhira.dhikr.showtime', function(obj) {
	var seconds = Number(obj['org.akhira.dhikr.showtime'])
	if(!seconds) {
	    chrome.storage.sync.set({'org.akhira.dhikr.showtime': 1.5})
	    document.getElementById('showtime').value = 1.5
	} else {
	    document.getElementById('showtime').value = seconds
	}
    })

    // Set UI for Toggle button
    chrome.storage.sync.get('org.akhira.dhikr.state', function(obj) {
	if(obj['org.akhira.dhikr.state'] === true) {
	    document.getElementById('toggle').innerHTML = 'Disable'
	} else {
	    document.getElementById('toggle').innerHTML = 'Enable'
	}
    })
}

chrome.browserAction.onClicked.addListener(function() {
    // this may not be needed; TODO: Test if UI updates when the line below is commented out.
    updateUI()
})

updateUI()

function start() {
    chrome.runtime.sendMessage({request: 'start'})
}

function stop() {
    chrome.runtime.sendMessage({request: 'stop'})
}

function ping() {
    chrome.runtime.sendMessage({request:'ping'})
}

function setShowtimeSeconds(seconds) {
    chrome.runtime.sendMessage({
	request: 'showtime',
	seconds: seconds
    })
}

function setIntervalMinutes(minutes) {
    chrome.runtime.sendMessage({
	request: 'intervaltime',
	minutes: minutes
    })
}

function toggle() {
    chrome.storage.sync.get('org.akhira.dhikr.state', function(obj) {
	var state = true
	
	if(obj !== undefined) {
	    state = obj['org.akhira.dhikr.state']
	}
	
    	if(state === true) {
    	    stop();
	    window.close()
    	} else {
    	    start();
	    window.close()
    	}
    })

    
}


/*===================================================================
  DOM Event Handlers
===================================================================*/
function setMinutes(event) {
    var minutes = Number(event.target.value)

    setIntervalMinutes(minutes)
}

function setShowtime(event) {
    var showtime_seconds = Number(event.target.value)
    
    setShowtimeSeconds(showtime_seconds)
}

// bind event handlers
document.getElementById('showtime').addEventListener('change', setShowtime)
document.getElementById('toggle').addEventListener('click', toggle)
document.getElementById('minutes').addEventListener('change', setMinutes)
document.getElementById('ping').addEventListener('click', ping)
