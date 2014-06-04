
$('body').on('click','#changePosition', function(){
	collectOrderParams();
	changeContent('order/changeAddress',fillPrevAddresses);
});
$('body').on('click','#addressChangeSubmit', function(){
	app.customAddress = true;
	var address = $('input[name="addressCity"]').val() + ' ' + $('input[name="addressDistrict"]').val() + '., ' + $('input[name="addressRoad"]').val() + ' ' + $('input[name="addressNumber"]').val() + '.';
	jQuery.ajax({
		url: 'http://maps.googleapis.com/maps/api/geocode/json?address='+address+'&sensor=true&language=hu',
	    dataType: 'json',
		success: addressReadyFromChange
	});
	changeContent('order/main');
});
$('body').on('click','div#chooseProviderButton', function(){
	collectOrderParams();
	changeContent('order/chooseProvider',getTaxies);
});
$('body').on('click','#spinnerOptions',function(e){
	$('#spinnerOptions').hide();
	app.orderOptions.by = e.target.id.toString().substring(6).toLowerCase();
	getTaxies();
});
$('body').on('click','#callDriver', function(){
	window.open('tel:'+app.taxiDatas[app.currentTaxiId].phoneNumber+'', '_system');
});
$('body').on('click','#acceptMessage', function(){
	app.currentTaxiId = false;
	hideOverlay();
	changeContent('order/chooseProvider',getTaxies);
});
$('body').on('click','#cancelOrder', function(){
	candelOrderSuccess();
});
$('body').on('click','#cancelDriver', function(){
	candelOrderSuccess();
});

$('body').on('click','#acceptReorder', function(){
	app.currentTaxiId = false;
	changeContent('order/chooseProvider',getTaxies);
});
$('body').on('click','#cancelReorder', function(){
	app.currentTaxiId = false;
	changeContent('order/main');
});

$('body').on('click','#few', function(){
	$('#few').attr('src','img/70/fewLuggageSelected.png');
	$('#mid').attr('src','img/70/midLuggage.png');
	$('#huge').attr('src','img/70/hugeLuggage.png');
	$('#few').removeClass('selectedLuggage');
	$('#mid').removeClass('selectedLuggage');
	$('#huge').removeClass('selectedLuggage')
	$('#few').addClass('selectedLuggage');
});

$('body').on('click','#mid', function(){
	$('#mid').attr('src','img/70/midLuggageSelected.png');
	$('#few').attr('src','img/70/fewLuggage.png');
	$('#huge').attr('src','img/70/hugeLuggage.png');
	$('#few').removeClass('selectedLuggage');
	$('#mid').removeClass('selectedLuggage');
	$('#huge').removeClass('selectedLuggage');
	$('#mid').addClass('selectedLuggage');
});

$('body').on('click','#huge', function(){
	$('#huge').attr('src','img/70/hugeLuggageSelected.png');
	$('#few').attr('src','img/70/fewLuggage.png');
	$('#mid').attr('src','img/70/midLuggage.png');
	$('#few').removeClass('selectedLuggage');
	$('#mid').removeClass('selectedLuggage');
	$('#huge').removeClass('selectedLuggage');
	$('#huge').addClass('selectedLuggage');
});

$('body').on('click','#no', function(){
	$('#no').attr('src','img/70/noPetSelected.png');
	$('#cat').attr('src','img/70/catPet.png');
	$('#dog').attr('src','img/70/dogPet.png');
	$('#no').removeClass('selectedPet');
	$('#cat').removeClass('selectedPet');
	$('#dog').removeClass('selectedPet');
	$('#no').addClass('selectedPet');
});

$('body').on('click','#cat', function(){
	$('#cat').attr('src','img/70/catPetSelected.png');
	$('#no').attr('src','img/70/noPet.png');
	$('#dog').attr('src','img/70/dogPet.png');
	$('#no').removeClass('selectedPet');
	$('#cat').removeClass('selectedPet');
	$('#dog').removeClass('selectedPet');
	$('#cat').addClass('selectedPet');
});

$('body').on('click','#dog', function(){
	$('#dog').attr('src','img/70/dogPetSelected.png');
	$('#no').attr('src','img/70/noPet.png');
	$('#cat').attr('src','img/70/catPet.png');
	$('#no').removeClass('selectedPet');
	$('#cat').removeClass('selectedPet');
	$('#dog').removeClass('selectedPet');
	$('#dog').addClass('selectedPet');
});
$('body').on('positionReady', function() {
	positionChange();
});
$('body').on('click','#passengerPlus', function(){
	var current = parseInt($('#passengerCount').html());
	$('#passengerCount').html(current+1);
});
$('body').on('click','#passengerMinus', function(){
	var current = parseInt($('#passengerCount').html());
	if(current>1)
		$('#passengerCount').html(current-1);
});

$('body').on('click','#actionBar', function( e ){
	if( app.currentTemplate == 'order/chooseProvider' ) {
		$('#spinnerOptions').toggle();
	}
});
$('body').on('click','#rightIcon', function( e ){
	if(app.pendingRatings == false || app.pendingRatings.length == 0)
		changeContent('user/favoriteDrivers',fillFavoriteRate);
	else
		changeContent('user/pendingRating',fillPendingRows);
});
$('body').on('click','#messageOk', function( e ){
	$('#messageModule').hide();
});
$('body').on('click','.sendMessage', function( e ){
	sendRequest('message');
	$('.recivedMessage').append( '<p class="fromClient">' + $('textarea#myMessage').val() + '</p>');
});