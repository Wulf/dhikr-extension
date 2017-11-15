'use strict';

var DEFAULT_MINUTES = 15
var DEFAULT_DISPLAY_PERIOD_MILLISECONDS = 2000

const notifications = [{
    title: 'Subḥān Allāh — سبحان الله‎‎',
    message: "God is Perfect.",
}, {
    title: 'Alḥamdulillāh — الحَمْد لله‎‎',
    message: "Praise and thanks belong to God."
}, {
    title: 'Allāhu akbar — الله أكبر',
    message: "God is Greatest."
}]

function getBrowser() {
  if (typeof chrome !== "undefined") {
    if (typeof browser !== "undefined") {
      return "Firefox";
    } else {
      return "Chrome";
    }
  } else {
    return "Edge";
  }
}

function setBadgeText(text) {
    if(getBrowser() === 'Firefox') {
	browser.browserAction.setBadgeText({text: text})
    } else {
	chrome.browserAction.setBadgeText({text: text})
    }
}

function initState() {
    chrome.storage.sync.set({'org.akhira.dhikr.minutes': DEFAULT_MINUTES})
    chrome.storage.sync.set({'org.ahkira.dhikr.showtime': DEFAULT_DISPLAY_PERIOD_MILLISECONDS})
    chrome.storage.sync.set({'org.akhira.dhikr.state': true})
}

/*
 * @param clearMS {Number} Optional
 *        milliseconds until force cleark
 */
function createNotification(clearMS) {
    if (!clearMS) {
	clearMS = DEFAULT_DISPLAY_PERIOD_MILLISECONDS
    }
    
    // Thanks MDN: https://developer.mozilla.org/
    function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	//The maximum is exclusive and the minimum is inclusive
	return Math.floor(Math.random() * (max - min)) + min; 
    }


    var index = getRandomInt(0, notifications.length)
    var options = {
	type:     'basic',
	//iconUrl:  'dhikr.png',
	title:    notifications[index].title,
	message:  notifications[index].message,
	priority: 0
    }
	
    if(getBrowser() === 'Chrome') {
	// Chrome requires an image!
	options.iconUrl = 'dhikr.png'
    }
    
    chrome.notifications.create('org.akhira.dhikr', options)
    
    setTimeout(() => {
    	chrome.notifications.clear('org.akhira.dhikr')
    }, clearMS)

}

chrome.alarms.onAlarm.addListener(function() {
    createNotification()
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var request = message.request
    if(request === 'ping') {
	createNotification()
    } else if(request === 'start') {
	start()
    } else if(request === 'stop') {
	stop();
    } else if(request === 'showtime') {
	var showtime_seconds = Number(message.seconds)
	
	DEFAULT_DISPLAY_PERIOD_MILLISECONDS = showtime_seconds * 1000
	chrome.storage.sync.set({'org.akhira.dhikr.showtime_seconds' : showtime_seconds})
    } else if(request === 'intervaltime') {
	var intervaltime_minutes = Number(message.minutes)

	DEFAULT_MINUTES = intervaltime_minutes
	chrome.storage.sync.set({'org.akhira.dhikr.minutes' : intervaltime_minutes})
	restart(DEFAULT_MINUTES)
    }
})


function restart(minutes) {
    minutes = Number(minutes)
    chrome.alarms.clear('org.akhira.dhikr')
    chrome.alarms.create('org.akhira.dhikr', {periodInMinutes: minutes})
}

function start() {
    chrome.storage.sync.get('org.akhira.dhikr.minutes', function (obj) {
	var minutes = DEFAULT_MINUTES
	
	if(obj !== undefined) {
	    minutes = Number(obj['org.akhira.dhikr.minutes'])
	}
	
	chrome.storage.sync.set({'org.akhira.dhikr.state': true})
	chrome.alarms.clear('org.akhira.dhikr')
	chrome.alarms.create('org.akhira.dhikr', {periodInMinutes: minutes})
	setBadgeText('')
    })
}

function stop() {
    chrome.storage.sync.set({'org.akhira.dhikr.state': false})
    chrome.alarms.clear('org.akhira.dhikr')
    setBadgeText('off')
}

// Get initial state
chrome.storage.sync.get('org.akhira.dhikr.state', function(obj) {
    var state = true
    if(obj !== undefined) {
	state = obj['org.akhira.dhikr.state']
    }
    
    if(state === true) {
	start()
    } else if(state === false) {
	stop()
    } else {
	// no previous state!
	initState()
	start()
    }
})

