function changeContent(file, onSuccess) {
    if ( $('#spinnerOptions').is(':visible') ) {
        $('#spinnerOptions').hide();
    }
    if ( $('#overlay').is(':visible') ) {
        $('#overlay').hide();
    }
    if ( $('#settingsBar').is(':visible') ) {
        $('#settingsBar').hide();
    }
    if ( $('#alert').is(':visible') ) {
        $('#alert').hide();
    }
    
	console.log('second paramter type is' + typeof(onSuccess));
	app.currentTemplate = file;
	var path = file.split("/")[0];
	if( ( app.token == null || app.token == false || app.token == 'undefined' ) && file != 'auth/signup') {
		file = 'auth/signin';
		console.log("Need to sign in, because token is " + app.token);
	}
	jQuery.get('templates/' + file + '.html' , function (data) {
		$('div[data-role="content"]').html(data).trigger('create');
		if(onSuccess !== false) {
			$("body").trigger('templateChange',file);
			console.log('Triggering templateChange')
		} else {
			console.log('SKIP Triggering templateChange')
		}
			
		if( typeof onSuccess == 'function' ) {
			console.log('onSuccess called');
			app.callbacks[file] = onSuccess;
			onSuccess();
		} else if( typeof app.callbacks[file] == 'function' ) {
			var callback = app.callbacks[file];
			callback();
		}
	});
	$('div[data-role="content"]').css("padding", "0");
	$('div[data-role="content"]').css("height", "100%");
	console.log('Content changed to ' + file );
}
function callScriptFile(filename) {
	var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = filename; 
    document.getElementsByTagName("body")[0].appendChild(script);
    $('body').trigger('create');
    return false;
}
function showAlert( alertMessage, acceptable ){
	$('div#overlay').show();
	$('#button').hide();
	$('#acceptMessage').hide();
	$('#acceptAlert').hide();
	$('#cancelOrder').hide();
	$('#message').css('font-size','36px');
	if(acceptable === true) {
		$('#button').show();
		$('#acceptAlert').show();

	}
	hideDetail();
	changeMessage(alertMessage);
}
function hideSpinner() {
	$('#spinner').hide();
}
function showSpinner() {
	$('#spinner').show();
}
function hideHeader() {
	$('div[data-role="header"]').hide();
}
function showHeader() {
	$('div[data-role="header"]').show();
}
function showBack( to ) {
	$('div#nav img').attr('src','img/70/back.png');
	app.backToTemplate = to;
}
function showNav() {
	$('div#nav img').attr('src','img/70/nav.png');
}
function hideLeft() {
	$('div#nav img').attr('src','img/70/empty.png');
}
function changeTitle( title ) {
	$('div#action h1').html( title );
}
function changeIcon( icon ) {
	$('div#icon img').attr('src','img/70/' + icon + '.png');
}
function hideRight() {
	$('#rightIcon').hide();
}
function changeNotifincationCount(  to ) {

	console.log('changeNotifincationCount to ' + to);
	if(to<1) {
		$('#rightIcon').show();
		$('#rightIcon #count').hide();
		$('img#flag').attr('src', 'img/70/emptyFlag.png');
	}
	else {
		$('#rightIcon').show();
		$('img#flag').attr('src', 'img/70/flag.png');
		$('#rightIcon #count').show().html( to );
	}
}

function showOverlay() {
	$('div#overlay').show();
	$('#message').css('font-size','18px');
}
function hideOverlay() {
	$('div#overlay').hide();	
}
function changeMessage( message ) {
	$('div#overlay div#message').html( message );
}
function changeAlertIcon( iconSrc , extention) {
	var ext = 'png';
	if(extention == 'gif') ext = extention;
	$('#alertImage img').attr('src','img/70/' + iconSrc + '.'+ext);
}
function showCancelButton() {
	$('#acceptMessage').hide();
	$('#acceptAlert').hide();
	$('#cancelOrder').show();
}
function showAcceptButton() {
	$('#acceptMessage').show();
	$('#cancelOrder').hide();
	$('#acceptAlert').hide();
}
function setButtonSize( to ) {
	if( to == 'small') {
		$('#overlay #button').css('height','10%');
		$('#detail').css('bottom','10%');
	}else {
		$('#overlay #button').css('height','30%');
		$('#detail').css('bottom','30%');
	}
}
function showDetail() {
	$('div#detail').show();
}
function hideDetail() {
	$('div#detail').hide();	
}
function setDriverInfo( name, license, car ) {
	var innerHtml = '<div id="name"><span id="taxiName">'+name+'</span></div><div id="carData"><span id="taxiLicensePlate">'+license+'</span><br /><span id="taxiCarType">'+car+'</span></div>';
	$('#detail #driver').html(innerHtml);
}
function setRouteInfo(meter, minute, rating) {
	var innerHtml = '<div id="routeDistance">'+meter+'m<br />'+minute+' perc</div><div id="routeRating">'+String(rating).replace(/\./g, ',')+'<br /><div id="overallRating"></div></div>';
	$('#detail #route').html(innerHtml);
	$('#overallRating').raty({ score: rating, readOnly: true, size: 20,width:130, starOff: 'star-off-small.png',  starOn : 'star-on-small.png',starHalf: 'star-half-small.png'});
}

function setInverseDetails( name, license, car, rating) {
	var innerHtml = '<div id="name"><span id="taxiName">'+name+'</span></div><div id="carData"><span id="taxiLicensePlate">'+license+'</span><br /><span id="taxiCarType">'+car+'</span></div><div id="routeRate">'+String(rating).replace(/\./g, ',')+'</div><div id="inverseRating"></div>';
	$('#inverseDetails').html(innerHtml);
 	$('#inverseRating').raty({ score: parseInt(rating), readOnly: true, size: 20,width:130, starOff  : 'star-off-small.png',  starOn   : 'star-on-small-inverse.png', starHalf: 'star-half-small-inverse.png'});
}

function updateMap() {
	var height = app.mapHeight;
	if( height == false ) {
		var screenSize 	= $(window).height();console.log('screenSize is : ' + screenSize)
		var headerSize 	= $('div[data-role="header"]').height();console.log('headerSize is : ' + headerSize)
		var addressSize = $('#mapPosition').height();console.log('addressSize is : ' + addressSize)
		var prefSize    = $('#preferences').height();console.log('prefSize is : ' + prefSize)
		var callSize    = $('#fastestProvider').height();console.log('callSize is : ' + callSize)
		var mapSize     = screenSize-(headerSize+addressSize+prefSize+callSize);
		if(mapSize>600) mapSize = 600;
		app.mapHeight = mapSize;
	}
	var width = $(window).width();
	var lat = app.position.lat;
	var lng = app.position.lng;
	var zoom  = 17;
	if( app.position.accuracy > 70 ) zoom = 16;
	if( app.position.accuracy > 140 ) zoom = 15;
	if( app.position.accuracy > 400 ) zoom = 14;
	if( lat == false || lng == false ) return;
	var marker = app.serverUrl + 'html/img/70/marker.png';
	var src = 'http://maps.google.com/maps/api/staticmap?center='+lat+','+lng+'&markers=icon:'+marker+'|'+lat+','+lng+'&zoom=17&size='+width+'x'+height+'&sensor=false';
	$("#mapCanvas").html('<img src="'+src+'" />');
	console.log('map changed to ' + src);
}
$('div#nav').on('click',function(){
	if(app.backToTemplate != false) {
		changeContent(app.backToTemplate);
	}
});
$('div#signOut').on('click',function(){
	app.token = false;
    window.localStorage.setItem("token",app.token);
    console.log("Access after signout");
	changeContent('auth/signin');
	$('#appMenu').hide();
});
$('div#exitApp').on('click',function(){
	navigator.app.exitApp();
});
$('div#hideMenu').on('click',function(){
	$('#appMenu').hide();
});
$('#acceptAlert').on('click',function(){
	hideOverlay();
	$(this).hide();
});

var getCurrentDate = function() {
    var today = new Date();
    var year = today.getFullYear();
    var months = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
    var month = months[today.getMonth()];
    var day = today.getDate();
    if( day < 10 )
        day = '0' + day;
    return year + '.' + ' ' + month + ' ' + day + '.';
}
var getCurrentDay = function() {
    var days = ['Vasárnap', 'Hétfő', 'Kedd','Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    var today = new Date();
    return days[today.getDay()];
}
var setHeight = function(id, size) {
	var scale = (($(window).height()/1280)*size) + 'px';
	console.log(id + ' set to ' + scale);
	$(id).css('css',scale);
};