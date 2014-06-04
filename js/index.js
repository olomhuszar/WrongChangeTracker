var app = {
    // Application Constructor
    token: false,
    position: {
        lat: false,
        lng: false
    },
    customAddress: false,
    backToTemplate: 'exit',
    callbacks: {},
    taxiDatas: {},
    currentTaxiId: false,
    serverUrl: 'http://getspot.hu/mobileApp/client/',
    gMapsJs: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCNaLcBKhyLsjKy0v5ppcLt-pebCRp-m4Y&sensor=true',
    gmapsLoaded: false,
    currentTemplate: false,
    mapHeight: false,
    markerPos: false,
    watchId: false,
    locationRefresh: 15,
    currentMessageType: false,
    flowState: 'idle',
    polling: false,
    pollFrequency: 4,
    city: false,
    street: false,
    serverAccess: false,
    orderedIt: 0, 
    orderOptions: {
        passengerCount: 1,
        luggage: 'none',
        pet: 'none',
        by: 'distance'
    },
    driverId: false,
    rateId: false,
    ratings: [ ],
    pendingRatings: [ ],
    allResult: false,
    ratyValues:{
        speed: false,
        comfort: false, 
        politeness: false,
        cleanness: false
    },
    lastTaxiRequest: false,
    initialize: function() {
        app.bindEvents();
    },
    prevRoutes: false,
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.onBackButton, false);
        document.addEventListener('menubutton', this.onMenuButton, false);
        document.addEventListener("offline", this.onOffline, false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("pause", this.onPause, false);
    },
    onOffline: function(e) {
        app.receivedEvent('offline');
        changeContent('offline');
        showAlert('Az alkalmazás használatához internet kapcsolat szükséges!');
    },
    onOnline: function(e){
        app.receivedEvent('online');
        if(app.gmapsLoaded == false) {
            app.gmapsLoaded = true;
            jQuery.ajax({
                url: app.gMapsJs,
                dataType: 'script',
                error: function(){
                console.log("couldnt download google api error");
                changeContent('offline');
                showAlert('Az alkalmazás használatához internet kapcsolat szükséges!');
                }
            });    
        }
    },
    onBackButton: function(e) {
        app.receivedEvent('backbutton');
        e.preventDefault();
        app.rateId = false;
        app.driverId = false;
        if ( $('#spinnerOptions').is(':visible') ) {
            $('#spinnerOptions').hide();
            return;
        }
        if ( $('#alert').is(':visible') ) {
            $('#alert').hide();
            return;
        }
        if ( $('#overlay').is(':visible') ) {
            $('#overlay').hide();
            return;
        }
        if ( $('#settingsBar').is(':visible') ) {
            $('#settingsBar').hide();
        }
        if(app.backToTemplate != false) {
            if( app.backToTemplate == 'exit' ) {
                navigator.app.exitApp();
            } else {
                changeContent(app.backToTemplate);
            }
        } else  {
            changeContent('order/main');
        }
    },
    onMenuButton: function(e) {
        app.receivedEvent('offline');
        e.preventDefault();
        $("#appMenu").show();
    },
    onDeviceReady: function() {/*
        navigator.splashscreen.show();
        checkConnection();
        console.log("source: " + app.gMapsJs);
        jQuery.ajax({
            url: app.gMapsJs,
            error: function(){
            console.log("couldnt download google api error");
            changeContent('offline');
            showAlert('Az alkalmazás használatához internet kapcsolat szükséges!');
            }
        });
        navigator.splashscreen.hide();*/
        var options = { timeout: 1000 * app.locationRefresh , enableHighAccuracy: true, maximumAge: Infinity};
        app.watchId = navigator.geolocation.watchPosition(positionReady, onLocationError, options);
        app.receivedEvent('deviceready');
        redefineAjax();
        initAjax();
        if( window.localStorage.getItem('passengerCount') !== null ) app.orderOptions.passengerCount = window.localStorage.getItem('passengerCount');
        if(app.orderOptions.passengerCount == 'NaN') app.orderOptions.passengerCount = 1;
        if( window.localStorage.getItem('luggage') !== null ) app.orderOptions.luggage = window.localStorage.getItem('luggage');
        if( window.localStorage.getItem('pet') !== null ) app.orderOptions.pet = window.localStorage.getItem('pet');
        if( window.localStorage.getItem('by') !== null ) app.orderOptions.by = window.localStorage.getItem('by');
        authHandler();
    },
    onPause: function() {
        jQuery.ajax({
            url: 'clientAction.php',
            dataType: 'json',
            data: {
                type: 'onpause'
            },
            success: function() {
                console.log('valasz is megjott');
            }
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
var positionReady = function( pos ) {
    if(app.customAddress == false) {
        app.position.lat = pos.coords.latitude;
        app.position.lng = pos.coords.longitude;
        app.position.accuracy = pos.coords.accuracy;
        console.log('Position is after manual change ' + app.position.lat +','+ app.position.lng + ' with ' + app.position.accuracy + 'm accuracy');
        $('body').trigger('positionReady');
    } else {
        navigator.geolocation.clearWatch(app.watchId);
    }
}
var authHandler = function() {
    app.token = window.localStorage.getItem("token");
    console.log("Token is " + app.token);
    if(app.token == null || app.token == 'undefined' || app.token == false || app.token == 'false' ) {
        console.log('Access from authHandler');
        changeContent('auth/signin');
    }
    else {
        autoAuth();
    }
}
var initialateValues = function() {
    console.log('initialize app, Where token is: '+ app.token);
    getRatingsFromServer();
}
var autoAuth = function () {
    var datas = {
        'init' : '1'
    };
    jQuery.ajax({
        url: 'needAuth.php',
        dataType: 'json',
        data: datas,
        success: loginSuccess
    });
}
var initAjax = function () {
    jQuery.ajaxSetup({
        type: "GET",
        beforeSend: function(jqXHR, settings) {
            if(settings.url.substring(0,9 ) != "templates" && settings.url.substring(0,4 ) != "http" && settings.url.substring(0,4 ) != "file" ) { //serverre kell menni, serverURL-t hozzá kell csatolni
                app.serverAccessInProgress = true;
                if(settings.url.indexOf('?') == -1)
                    settings.url = app.serverUrl + settings.url + '?token='+app.token;
                else
                    settings.url = app.serverUrl + settings.url + '&token='+app.token;
            }
            console.log('Accessing: ' + settings.url);
            return true;
        }
    });
    $(document).ajaxSuccess(function( event, xhr, settings ){
        console.log(settings.url + ' accessed');
        if(settings.url.substring(0,app.serverUrl.length ) == app.serverUrl) { //server
            app.serverAccessInProgress = false;
            console.log("SERVER ACCESS");
            console.log(xhr.responseText);
            if( xhr.responseJSON.status == 'REAUTH' ) {
                app.token = false;
                console.log('Access from reauth');
                changeContent('auth/signin');
            } else {
                app.token = xhr.responseJSON.token;
                window.localStorage.setItem("token",app.token);
            }
        }
    });
    $( document ).ajaxError(function( event, xhr, settings, error ) {
        console.log( "Triggered ajaxError handler. "  + settings.url)
        if(settings.url.substring(0,app.serverUrl.length ) == app.serverUrl) { //server
            app.serverAccessInProgress = false;
        }
        console.log("readyState: "+xhr.readyState+"\nstatus: "+xhr.status);
        console.log("responseText: "+xhr.responseText);
        console.log('Location detection failed because:\n errcode: '    + error.code    + '\n' +
                  'errmessage: ' + error.message + '\n');
    });
}
var onLocationError = function( error ){
    if(error.code == '2') {
        var options = { timeout: 1000 * app.locationRefresh, maximumAge: Infinity};
        app.watchId = navigator.geolocation.watchPosition(positionReady, onLocationError, options);
    }
};
var mySorter = function(a,b) {
    if(app.orderOptions.by == 'taxi') {
      var aValue = a.taxi;
      var bValue = b.taxi; 
    }
    else if(app.orderOptions.by == 'favorite') {
      var aValue = a.favorite;
      var bValue = b.favorite; 
    }
    else if(app.orderOptions.by == 'rating') {
      var aValue = a.rating;
      var bValue = b.rating; 
    }
    else {
        console.log(a.distanceValue);
      var aValue = b.distanceValue;
      var bValue = a.distanceValue; 
    }
    return ((aValue < bValue) ? 1 : ((aValue > bValue) ? -1 : 0));
}

var loopObject = function(object) {
    for(var o in object) {
        if(typeof(object[o]) == 'object') {
            loopObject(object[o]);
        }
        else {
            console.log( o + ': '+ object[o]);
        }
    }
}
var redefineAjax = function() {
    jQuery.ajaxOld = jQuery.ajax;
    jQuery.ajax = function(url1, settingsObject) {
        var check = (typeof(url1) == 'object' && url1.url.substring(0,9 ) != "templates" && url1.url.substring(0,4 ) != "http" && url1.url.substring(0,4 ) != "file" );
        if (check && app.serverAccessInProgress) {
            console.log('Server access in progress, delaying for 100ms.: ' + url1.url);
            setTimeout(function() {
                jQuery.ajax(url1, settingsObject);
            },500);
        } else {
            jQuery.ajaxOld(url1, settingsObject);
        }
    }
};
function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    console.log('Connection type: ' + states[networkState]);
}