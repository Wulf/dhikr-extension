'use strict';

const DEFAULT_MINUTES = 15

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


// Thanks MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


/*
 * @param clearMS {Number} Optional
 *        milliseconds until force cleark
 */
function createNotification(clearMS) {
    if (!clearMS) {
	clearMS = 1500
    }

    var index = getRandomInt(0, notifications.length)
    
    chrome.notifications.create('org.akhira.dhikr', {
	type:     'basic',
	iconUrl:  'dhikr.png',
	title:    notifications[index].title,
	message:  notifications[index].message,
	priority: 0
    })

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
    }
})

function start() {
    chrome.storage.sync.get('org.akhira.dhikr.minutes', function (obj) {
	var minutes = Number(obj['org.akhira.dhikr.minutes'])
	chrome.storage.sync.set({'org.akhira.dhikr.state': true})
	chrome.alarms.clear('org.akhira.dhikr')
	chrome.alarms.create('org.akhira.dhikr', {periodInMinutes: minutes})
	chrome.browserAction.setBadgeText({text: ''})
    })
}

function stop() {
    chrome.storage.sync.set({'org.akhira.dhikr.state': false})
    chrome.alarms.clear('org.akhira.dhikr')
    chrome.browserAction.setBadgeText({text: 'off'})
}

// Get initial state
chrome.storage.sync.get('org.akhira.dhikr.state', function(obj) {
    var state = obj['org.akhira.dhikr.state']
    
    if(state === true) {
	start()
    } else if(state === false) {
	stop()
    } else {
	// no previous state!
	chrome.storage.sync.set({'org.akhira.dhikr.minutes': DEFAULT_MINUTES})
	start()
    }
})
