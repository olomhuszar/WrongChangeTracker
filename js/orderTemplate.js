$('body').on('templateChange',function(event, file) {
	console.log('TemplateChange fired with: ' + file);
	var path = file.split("/")[0];
	if( path != 'order' ) return false;
	$('#rightIcon').hide();
	switch( file ) {
		case 'order/changeAddress':
			showHeader();
			showSpinner();
			showNav();
			changeTitle('Helyszín módosítása');
			var corr = $('#addressChangeSubmit').css('width');
			$('#addressChangeSubmit').css('width','140px').css('margin','20px auto 0 auto');
			$('.noborder').css('border','none');
			changeIcon('map');
			app.backToTemplate = 'order/main';
			break;
		case 'order/chooseProvider':
			showHeader();
			hideSpinner();
			showBack();
			changeTitle('Taxis választó');
			changeIcon('people');
			app.backToTemplate = 'order/main';
			break;
		case 'order/driverCancel':
			showHeader();
			hideSpinner();
			showNav();
			changeTitle('Technikai probléma');
			changeIcon('triangle');
			app.backToTemplate = 'order/main';
			break;
		case 'order/driverDetail':
			showHeader();
			hideSpinner();
			showBack();
			changeTitle('Taxis részletező');
			changeIcon('head');
			app.backToTemplate = 'order/chooseProvider';
			break;
		case 'order/taxiComing':
			showHeader();
			hideSpinner();
			showNav();
			changeTitle('Taxi érkezése folyamatban');
			changeIcon('taxiArrow');
			app.backToTemplate = 'order/main';
			break;
		case 'order/taxiArrived':
			showHeader();
			hideSpinner();
			showNav();
			changeTitle('A taxid megérkezett');
			changeIcon('carPeople');
			app.backToTemplate = 'order/main';
			break;
		default:
			app.allResult == false;
			showHeader();
			hideSpinner();
			showNav();
			changeTitle('Taxi rendelés');
			changeIcon('car');
			changeNotifincationCount(app.pendingRatings.length);
			app.backToTemplate = 'exit';
			var screenSize 	= $(window).height();console.log('screenSize is : ' + screenSize)
			var headerSize 	= $('div[data-role="header"]').height();console.log('headerSize is : ' + headerSize)
			var addressSize = $('#mapPosition').height();console.log('addressSize is : ' + addressSize)
			var prefSize    = $('#preferences').height();console.log('prefSize is : ' + prefSize)
			var callSize    = $('#fastestProvider').height();console.log('callSize is : ' + callSize)
			var mapSize     = screenSize-(headerSize+addressSize+prefSize+callSize);
			if(mapSize>600) mapSize = 600;
			app.mapHeight = mapSize-1;
			$('#mapCanvas').css('height',mapSize-1 + 'px');
			$('#mapCanvas').css('line-height',mapSize-1 + 'px');
			updateMap();
			$('body').trigger('positionReady');
			$('#passengerCount').html(app.orderOptions.passengerCount);
			$('#'+app.orderOptions.luggage).trigger('click');
			$('#'+app.orderOptions.pet).trigger('click');
	}
});
$('body').on('click','#acceptDriver', function(){
	showOverlay();
	changeMessage('Továbbítjuk a rendelésed a választott taxinak!');
	changeAlertIcon('loading','gif');
	showCancelButton();
	setButtonSize('small');
	showDetail();
	setDriverInfo(app.taxiDatas[app.currentTaxiId].name,app.taxiDatas[app.currentTaxiId].licensePlate,app.taxiDatas[app.currentTaxiId].car);
	var distance = app.taxiDatas[app.currentTaxiId].distanceValue;
	var duration = Math.round(app.taxiDatas[app.currentTaxiId].durationValue/60);
	setRouteInfo(distance,duration,app.taxiDatas[app.currentTaxiId].rating);
	sendRequest('order', {direct:'indirect'});
});
$('body').on('click','#fastestProvider', function(){
	if( $(this).hasClass('inMain') ) {
		collectOrderParams();
	}
	orderFastest();
});
$('body').on('click','#messageDriver', function(){
	showMessage();
});
var showFastestOrder = function( notavailable ) {
	showOverlay();
	if( notavailable ) {
		changeMessage('Sajnos nincs elérhető taxis!');
		changeAlertIcon('alertIcon');
		showAcceptButton();
	} else {
		changeMessage('Továbbítjuk a rendelésed a leggyorsabb taxinak!');
		changeAlertIcon('loading','gif');
		showCancelButton();
	}
	setButtonSize();
	hideDetail();
}
var driverCancel = function() {
	showOverlay();
	changeMessage('A válaszott taxis nem fogadta el a rendelésed, válassz másik taxist!');
	changeAlertIcon('alertIcon');
	setButtonSize('small');
	showAcceptButton();
	showDetail();
	setDriverInfo(app.taxiDatas[app.currentTaxiId].name,app.taxiDatas[app.currentTaxiId].licensePlate,app.taxiDatas[app.currentTaxiId].car);
	var distance = app.taxiDatas[app.currentTaxiId].distanceValue;
	var duration = Math.round(app.taxiDatas[app.currentTaxiId].durationValue/60);
	setRouteInfo(distance,duration,app.taxiDatas[app.currentTaxiId].rating);
};
var driverTimeout = function() {
	showOverlay();
	changeMessage('A válaszott taxist nem tudtuk elérni, próbáld meg később vagy válassz másik taxist!');
	changeAlertIcon('timeoutIcon');
	setButtonSize('small');
	showAcceptButton();
	showDetail();
	setDriverInfo(app.taxiDatas[app.currentTaxiId].name,app.taxiDatas[app.currentTaxiId].licensePlate,app.taxiDatas[app.currentTaxiId].car);
	var distance = app.taxiDatas[app.currentTaxiId].distanceValue;
	var duration = Math.round(app.taxiDatas[app.currentTaxiId].durationValue/60);
	setRouteInfo(distance,duration,app.taxiDatas[app.currentTaxiId].rating);
};
var getDetailedTaxi = function() {
	var id = app.currentTaxiId;
	var headImg = 'img/70/bigUnknownHead.png';
	var companyImg = 'img/70/unknownBarTaxi';
	loopObject(app.taxiDatas[id]);
	if( app.taxiDatas[id].headImg != null ) {
		headImg = app.imgPath + app.taxiDatas[id].headImg;
		$('img#bigDriverHead').attr('src',headImg);
	}
	if( app.taxiDatas[id].companyImg != null ) {
		companyImg = app.imgPath + app.taxiDatas[id].companyImg;
		$('div#taxi img').attr('src',companyImg).css('width','45px').css('height', '45px');
	}
	$('#taxiName').html(app.taxiDatas[id].name);
	$('#taxiLicensePlate').html(app.taxiDatas[id].licensePlate);
	$('#taxiCarType').html(app.taxiDatas[id].car);
	$('#taxiCallCount').html(app.taxiDatas[id].callCount);
	$('#taxiFavoriteCount').html(app.taxiDatas[id].favoriteCount);
	$('#taxiRating').html(app.taxiDatas[id].rating);
	var speedRating = parseInt(app.taxiDatas[id].speedRating);
	var comfortRating = parseInt(app.taxiDatas[id].comfortRating);
	var cleanness = parseInt(app.taxiDatas[id].cleanness);
	var politeness = parseInt(app.taxiDatas[id].politeness);
    $('#speedRating').raty({ score: speedRating, readOnly: true});
    $('#comfortRating').raty({ score: comfortRating, readOnly: true });
    $('#cleanness').raty({ score: cleanness, readOnly: true });
    $('#politeness').raty({ score: politeness, readOnly: true });
}
var doRating = function() {
	changeContent('user/rating');
}
var addMessage = function (message, me)  {
	if(typeof me == 'undefined')
		$('.recivedMessage').append( '<p class="fromTaxi">' + message + '</p>');
	else 
		$('.recivedMessage').append( '<p class="fromClient">' + message + '</p>');
};
var showMessage = function() {
	$('#messageModule').show();
};
var fillPrevAddresses = function() {
	rows = '';
	if( app.prevRoutes == false )	return;
	for( var i = 0; i < app.prevRoutes.length; i++) {
		rows = rows + '<tr id="'+i+'" class="prevAddressRow"><td class="iterColumn">' + (parseInt(i)+1) + '</td><td class="addressColumn">' + app.prevRoutes[i].city + ', ' + app.prevRoutes[i].street + '</td></tr>';
	}	
	$('#prevAddresses').html(rows);
};