'use strict';
/*global alert, IS_DEBUG, IS_MOCKMOBILE, myApp, URLSafeBase64, $:false */
/*exported appDev */

// -----------------------------------------------------------------------------
// Developer functions
// -----------------------------------------------------------------------------

// default logging function to call
var log = function(message) {
	console.log(message);
};

// main
function appDev() {
  if (IS_DEBUG) {
		myApp.debugButton = document.querySelector("#debugButton");
		myApp.debugConsole = document.querySelector("#debugConsoleLog textarea");
		myApp.isDebugConsoleOpen = false;
		myApp.debugLineNo = 0;
		if(myApp.debugButton) {
			myApp.debugButton.removeAttribute("hidden");
			myApp.debugButton.addEventListener("click", toggleDebugConsole);
			setupDebugButtons();
		}
		if (myApp.debugConsole) {
			log = logText;
			log("Welcome to Postcard");
		}
	}
}

// drop-in logging function for debug mode
function logText(message) {
	myApp.debugConsole.value = myApp.debugLineNo +': '+ message +
                              "\n"+ myApp.debugConsole.value;
	myApp.debugLineNo++;
  // TODO: limit lines (or buffer size)
}

// show/hide textarea log
function toggleDebugConsole(e) {
	myApp.isDebugConsoleOpen = !myApp.isDebugConsoleOpen;
	if(myApp.isDebugConsoleOpen) {
		myApp.debugConsole.parentElement.removeAttribute("hidden");
	} else {
		myApp.debugConsole.parentElement.setAttribute("hidden", true);
	}
}

// debug button functions
function setupDebugButtons() {
	console.log("Setup debug buttons");
	var deviceInfoButton = document.querySelector("#deviceInfoButton");
	var trashButton = document.querySelector("#trashButton");
	if (deviceInfoButton) {
		deviceInfoButton.addEventListener("click", deviceInfoButtonClicked);
	}
	if (trashButton) {
		trashButton.addEventListener("click", trashButtonClicked);
	}
	// Only applicable for native mobile app
	if (!IS_MOCKMOBILE) {
		var stopButton = document.querySelector("#stopButton");
		var startButton = document.querySelector("#startButton");
		if (stopButton) {
			stopButton.removeAttribute("hidden");
			stopButton.addEventListener("click", stopButtonClicked);
		}
		if (startButton) {
			startButton.removeAttribute("hidden");
			startButton.addEventListener("click", startButtonClicked);
		}
	}
}

// -----------------------------------------------------------------------------
// Dveloper button functions
// -----------------------------------------------------------------------------

function stopButtonClicked() {
	$.ajax({
		url: myApp.manager + 'stop',
		type: 'GET'
	}).fail( function() {
		alert("Error stopping TRM");
	}).done( function(data) {
		log("Stop TRM");
		console.log(data);
	});
}

function startButtonClicked() {
	$.ajax({
		url: myApp.manager + 'start',
		type: 'GET'
	}).fail( function() {
		alert("Error starting TRM");
	}).done( function(data) {
		log("Start TRM");
		console.log(data);
	});
}

function deviceInfoButtonClicked() {
	$.ajax({
		url: myApp.webview + 'DeviceIdentity',
		type: 'GET'
	}).fail( function() {
		alert("Error getting DeviceIdentity");
	}).done( function(data) {
		console.log(data);
		if (data.deviceIdentity) {
			log("DeviceIdentity: " + data.deviceIdentity);
      log("=> urlsafe: " + URLSafeBase64.encode(data.deviceIdentity));
		}
		if (data.publicKeyHash) {
			log("PublicKeyHash: " + data.publicKeyHash); // old API
		}
	});
}

function trashButtonClicked() {
  destroyPostcards();
}

function destroyPostcards() {
  $.ajax({
		timeout: 1000,
		url: myApp.api + 'destroy',
		type: 'DELETE'
	}).fail( function() {
		alert("Error destroying card db");
	}).done( function(data) {
		console.log(data);
		if (data.ok === true) {
			log("Card db deleted");
      destroyAddresses();
		}
	});
}

function destroyAddresses() {
  $.ajax({
		timeout: 1000,
		url: myApp._api + 'destroy',
		type: 'DELETE'
	}).fail( function() {
		alert("Error destroying address db");
	}).done( function(data) {
		console.log(data);
		if (data.ok === true) {
			log("Address db deleted");
			log("Database(s) destroyed - restart app!");
			alert("Restart app");
		}
	});
}
