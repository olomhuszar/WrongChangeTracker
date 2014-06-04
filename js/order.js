var positionChange = function(  ){
	lat = app.position.lat;
	lng = app.position.lng;
	jQuery.ajax({
		url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true&language=hu',
	    dataType: 'json',
		success: addressReady
	});
};
var addressReady = function(data) {
	console.log('addressReady');
	if(typeof data.results[0] == 'undefined') return;
	$('#fastestProvider').show();
	$('#chooseProviderButton').show();
	app.markerPos = data.results[0].geometry.location.lat+','+data.results[0].geometry.location.lng;
	var address = data.results[0].formatted_address;
	var components = address.split(',');
	var street = components[1];
	var city = components[0];
	$('#street').html(street);
	$('#city').html(city)
	app.city = city;
	app.street = street;
	updateMap();

};

var addressReadyFromChange = function(data) {
	var location = data.results[0].geometry.location;
	app.position.lat = location.lat;
	app.position.lng = location.lng;
	$('body').trigger('positionReady');
};
var taxiComingSuccess = function( ) {
	changeContent('order/taxiComing', taxiComing);
};
var taxiArrivedSuccess = function( ) {
	changeContent('order/taxiArrived', taxiArrived);
};
var taxiComing = function( ) {
	var data = app.taxiDatas[app.currentTaxiId];
	var oldDateObj = new Date();
	var newDateObj = new Date();
	newDateObj.setTime(oldDateObj.getTime() + (data.durationValue*1000));
	console.log(newDateObj.getTime() + ' is the new time');
	console.log(oldDateObj.getTime() + ' is the old time');
	$('#timer').countdown(newDateObj, function(event) {
	    if(event.type == 'update')  {
	        $(this).html(event.strftime('%M:%S'));
	    }
	});
	setInverseDetails(data.name, data.licensePlate, data.car, data.rating);
};
var taxiArrived = function() {
	var data = app.taxiDatas[app.currentTaxiId];
	setInverseDetails(data.name, data.licensePlate, data.car, data.rating);
	$('#orderCount .value').html(app.orderOptions.passengerCount);
	$('#orderLuggage .value img').attr('src','img/70/'+app.orderOptions.luggage+'LuggageWhite.png');
	$('#orderPet .value img').attr('src','img/70/'+app.orderOptions.pet+'PetWhite.png');
}
var getTaxies = function() {
	var newDateObj = new Date();
	console.log("UUUUUUUUUUUUUUUUU");
	loopObject(app.allResult);
	if(app.allResult == false || app.allResult.count == 0)   {
		console.log('allresult false');
		var datas = {
			passengerCount: app.orderOptions.passengerCount,
			luggage: app.orderOptions.luggage,
			pet: app.orderOptions.pet,
			by: app.orderOptions.by,
			lat: app.position.lat,
			lng: app.position.lng
		};
		jQuery.ajax({
			url: 'findTaxi.php',
		    dataType: 'json',
			data: datas,
			success: getTaxiSuccess
		});
	} else {
		console.log('Draw taxies with order by ' + app.orderOptions.by);
		drawTaxies();
	}
};


var viewDetails = function( id ) {
	app.currentTaxiId = id;
	changeContent('order/driverDetail', getDetailedTaxi);
	console.log("getDatils");
}
var searchedCount = 0;
var getTaxiSuccess = function( result ) {
	console.log('getTaxiSuccess: ' + typeof(result));
	var newDateObj = new Date();
	app.lastTaxiRequest = newDateObj.getTime();
	app.allResult = result;
	var count = app.allResult.count;
	var data = app.allResult.data;
	var lat = app.position.lat;
	var lng = app.position.lng;
	var search = new Array();
	searchedCount = count;
	if( count == 0) {
        items = '<tr><td colspan="5">Jelenleg nincs elérhető taxis, kérjük próbálkozzon később</td></tr>';
		$('#taxies').html(items);
        setTimeout(getTaxies, 600);
        return;
	}
	for( var i = 0; i < count; i++) {
		search['http://maps.googleapis.com/maps/api/distancematrix/json?origins='+data[i].lat+','+data[i].lng+'&destinations='+lat+','+lng+'&sensor=true&language=hu'] = data[i].id;
		jQuery.ajax({
			url: 'http://maps.googleapis.com/maps/api/distancematrix/json?origins='+data[i].lat+','+data[i].lng+'&destinations='+lat+','+lng+'&sensor=true&language=hu',
		    dataType: 'json',
			success: function( apiresult ) {
				if(typeof(apiresult.rows[0].elements[0].duration) != 'undefined' )
			    	updateTaxiDistance(search[this.url],apiresult.rows[0].elements[0].distance.value,apiresult.rows[0].elements[0].duration.value, --searchedCount);
			}
		});
	}
	console.log('now');
}
var updateTaxiDistance = function( taxiId, distance, duration, order) {
	for( var i = 0; i < app.allResult.count; i++) {
		if(app.allResult.data[i].id == taxiId) {
			console.log('chagne the distance of ' + taxiId + ' to ' + distance + '('+ duration +') at step ' + order);
			app.allResult.data[i].distanceValue = distance;
			app.allResult.data[i].durationValue = duration;	
		}
	}
	if( order == 0 ) {
		console.log(app.currentTaxiId+ ' is the latest taxid');
		if( app.currentTaxiId == 'fastest' ) {
			app.orderOptions.by = 'fastest';
			app.allResult.data.sort(mySorter);
			orderFastest();
		}
		drawTaxies();
	}
}
var drawTaxies = function( ) {
	if(app.allResult == false || typeof app.allResult == 'undefined') return;
	console.log('The type of fult is ' + typeof(app.allResult.data));
	var object = app.allResult
	for(var index in object) { 
	   if (object.hasOwnProperty(index)) {
	       console.log(index + ': ' + object[index]);
	   }
	}
	console.log('----------------')
	object = app.allResult.data
	loopObject(app.allResult);
	app.allResult.data.sort(mySorter);
	var count = app.allResult.count;
	var data = app.allResult.data;
	var items = '';
	var headImg = 'img/70/unknownHead.png';
	var companyImg = 'img/70/unknownTaxi.png';

	if( count == 0) {
        items = '<tr><td colspan="5">Jelenleg nincs elérhető taxis, kérjük próbálkozzon később</td></tr>';
	} else {
		for( var i = 0; i < count; i++) {
			id = data[i].id;
			app.taxiDatas[id] = data[i];
			if( data[i].headImg != null ) {
				headImg = data[i].headImg;
			}
			if( data[i].companyImg != null ) {
				companyImg = data[i].companyImg;
			}
			items = items + '<tr onclick="viewDetails('+id+')">';
		    items = items + '<td><img src="'+ headImg +'"> <span>'+data[i].name+'</span></td>';
		    items = items + '<td><img src="'+ companyImg +'"></td>';
		    items = items + '<td>';
	            if( data[i].favorite == '1' ) {
	    			items = items + '<img src="img/70/favorite.png">';
	            }
		    items = items + '</td>';
		    items = items + '<td>';
		    if( typeof data[i].distanceValue != 'undefined' ) {
		    	items = items + '    <div id="distance">'+Math.round(data[i].distanceValue/100)/10+' km</div>';
		    	items = items + '    <div id="duration">'+Math.round(data[i].durationValue/60)+' perc</div>';
		    } else {
		    	items = items + '    <div id="distance">'+Math.round(data[i].distance*10)/10+'km</div>';
		    	items = items + '    <div id="duration">'+Math.round(data[i].distance*3)+' perc</div>';
		    }
		    items = items + '</td>';
		    items = items + '<td id="rating">'+Math.round(data[i].rating*10)/10+'</td>';
		    items = items + '</tr>';
		}
	}
	$('#taxies').html(items);
};
var storeState = function() {
    window.localStorage.setItem('passengerCount', app.orderOptions.passengerCount);
    window.localStorage.setItem('luggage', app.orderOptions.luggage);
    window.localStorage.setItem('pet', app.orderOptions.pet);
    window.localStorage.setItem('by', app.orderOptions.by);
};
var candelOrderSuccess = function() {
	sendRequest('cancel');
	app.currentTaxiId = false;
	hideOverlay();
	changeContent('order/main',function() {
		setTimeout(getTaxies,1000);
	});
};
var orderFastest = function() {
	console.log('Ordering the fastest');
	app.orderOptions.by = 'fastest';
	if(app.allResult == false) {
		app.currentTaxiId = 'fastest';
		getTaxies();
	} else {
		console.log(app.allResult.count + ">" + app.orderedIt);
		if( app.allResult.count>app.orderedIt ) {
			app.allResult.data.sort(mySorter);
			app.currentTaxiId = app.allResult.data[app.orderedIt].id;
			app.taxiDatas[app.currentTaxiId] = app.allResult.data[app.orderedIt];
			app.orderedIt += 1;
			sendRequest('order',{direct:'direct'});
			showFastestOrder(false);
		} else {
			drawTaxies();
			showFastestOrder(true);
		}
	}
}
var driverCancelSuccess = function() {
	changeContent('order/driverCancel');
};
var collectOrderParams = function() {
	app.orderOptions.passengerCount = parseInt($('#passengerCount').html());
	app.orderOptions.luggage = $('.selectedLuggage').attr('id');
	app.orderOptions.pet = $('.selectedPet').attr('id');
	console.log('The order current orderoptions: ' + app.orderOptions.passengerCount + ' people, ' + app.orderOptions.luggage + ' luggage, ' + app.orderOptions.pet + ' pet.');
	storeState();
}
var recieveEvents = function(){
	//TODO: 
	//taxi not  accepts
	//taxi timeout
	//taxi cancel
	//taxi arrived
		//setTimeout(taxiComingSuccess, 1000);
	//setTimeout(taxiArrivedSuccess, 1000);
	//setTimeout(driverCancelSuccess, 1000);
}
var sendRating = function() {
	//TODO implement
};
var checkTimeout = function(){
	if( app.flowState == 'order' ) {
		if(app.orderedIt > 0) {
			if( app.orderedIt >= app.allResult.count ) {
				driverTimeout();
			} else {
				app.currentTaxiId = app.allResult.data[app.orderedIt].id;
				sendRequest('order',{direct:'direct'});
				app.orderedIt += 1;
			}
		} else {	
			driverTimeout();
			app.flowState = 'idle';
			app.currentTaxiId = false;
		}
	}
}
var sendRequest = function( type, opt) {
	var url = '';
	var datas = {};
	var requestSuccess = function(){};
	switch(type) {
		case 'order':
			app.flowState = 'order';
			url = 'clientAction.php';
			datas.passengerCount = app.orderOptions.passengerCount;
			datas.luggage = app.orderOptions.luggage;
			datas.pet = app.orderOptions.pet;
			datas.lat = app.position.lat;
			datas.lng = app.position.lng;
			datas.type = type;
			datas.orderType = opt.direct;
			datas.taxiId = app.currentTaxiId;
			datas.city = app.city;
			datas.street = app.street;
			datas.distance = app.taxiDatas[app.currentTaxiId].distanceValue;
			datas.duration = app.taxiDatas[app.currentTaxiId].durationValue;
			$('.recivedMessage').html('');
			$('#myMessage').val('');
			setTimeout(function(){
				app.polling = true;
			},500);
			setTimeout(checkTimeout, 45000);
			break;
		case 'cancel':
			app.orderedIt = 0;
			app.flowState = 'idle';
			app.polling = false;
			url = 'clientAction.php';
			datas.type = type;
			datas.taxiId = app.currentTaxiId;
			break;
		case 'message':
			url = 'clientAction.php';
			datas.type = type;
			datas.taxiId = app.currentTaxiId;
			datas.message = $('textarea#myMessage').val();
			break;
		default:
		break;
	}
	jQuery.ajax({
			url: url,
			data: datas,
		    dataType: 'json',
			success: requestSuccess
	});
}
var actionController = function (message) {
	if (app.currentMessageType == message.type && app.currentMessageType == 'message') return;
	console.log( 'New message recieved: ' + message.type );
	app.currentMessageType = message.type;
	if( message.type == 'acceptOrder' ) {
		app.orderedIt = 0;
		app.flowState = 'waiting';
		app.currentTaxiId = message.data.taxiId;
		taxiComingSuccess();
	}
	else if (message.type == 'cancel') {
		app.polling = true;
		app.flowState = 'idle';
		if( message.reason == 'pass' ) {
			driverCancel();
		} else {
			driverCancelSuccess();	
		}
		app.currentTaxiId = false;
	}
	else if (message.type == 'arrived') {
		app.flowState = 'arrived';
		taxiArrivedSuccess();
	}
	else if (message.type == 'pickup') {
		app.flowState = 'onway';
		doRating();
	}
	else if (message.type == 'ended') {
		app.flowState = 'idle';
		app.currentTaxiId = false;
		app.polling = false;
		app.allResult = false;
		setTimeout(getRatingsFromServer,500);
		setTimeout(getTaxies,1000);
	}
	else if (message.type == 'message') {
		addMessage(message.message);
		showMessage();
	}
};
var controllerSuccessHandler = function (data) {
	console.log('Answear: ' + data);
};
var pollMessages = function () {
	if (app.polling === true) {
		jQuery.ajax({
			url: 'pollMessages.php',
			dataType: 'json',
			success: actionController
		});
	}
	setTimeout(pollMessages, app.pollFrequency * 1000);
};