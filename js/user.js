function changeName(a) {
	$("#nameDo").html(a);
};
function changeDate(a, b) {
	$("#dateDo").html(a + "<br /> " + b);
};
function changeDestination(a, b) {
	$("#destinationDo").html(a + "<br /> " + b);
};
function getRatingsFromServer() {
	var a = {
		filter: "no"
	};
	jQuery.ajax({
		url: "getRatings.php",
		dataType: "json",
		data: a,
		success: ratingReadySuccess
	})
};
$('body').on('click','#classify',function(e){
    var width = $(this).width();
    var x;
    if (e.pageX) { 
      x = e.pageX;
    }
    else { 
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
    }
    if(width*0.33>x) {
        $('#classify img').attr('src','img/70/dontComeAgain.png');
        $(this).addClass('dontComeAgain');
        $(this).removeClass('comeAgain');
        $(this).removeClass('favComeAgain');
    } else if(width*0.66>x) {
        $('#classify img').attr('src','img/70/comeAgain.png');
        $(this).removeClass('dontComeAgain');
        $(this).addClass('comeAgain');
        $(this).removeClass('favComeAgain');
    } else {
        $('#classify img').attr('src','img/70/favComeAgain.png');
        $(this).removeClass('dontComeAgain');
        $(this).removeClass('comeAgain');
        $(this).addClass('favComeAgain');
    }
});
$("body").on("templateChange", function (a, b) {
		var c = b.split("/")[0];
		if ("user" != c) return !1;
		console.log("TemplateChange fired with: " + b);
		switch (b) {
		case "user/pendingRating":
			showHeader();
			hideSpinner();
			showNav();
			changeTitle("F\xfcgg\u0151ben l\xe9v\u0151 \xe9r\xe9kel\xe9sek");
			changeIcon("medal");
			hideRight();
			app.rateId = !1;
			app.backToTemplate = "order/main";
			break;
		case "user/favoriteDrivers":
			app.driveId = !1;
			console.log("QHY NO");
			showHeader();
			hideSpinner();
			showNav();
			changeTitle("Kedvenc taxisok");
			changeIcon("heart");
			hideRight();
			app.backToTemplate = "order/main";
			break;
		case "user/bannedDrivers":
			app.driveId = !1;
			showHeader();
			hideSpinner();
			showNav();
			changeTitle("Kiz\xe1rt taxisok");
			changeIcon("bannedIcon");
			hideRight();
			app.backToTemplate = "order/main";
			break;
		case "user/detailedRating":
			showHeader();
			hideSpinner();
			showNav();
			changeTitle("Kedvenc taxisok");
			changeIcon("heart");
			hideRight();
			app.backToTemplate = "user/pendingRating";
			break;
		default:
			showHeader();
			hideSpinner();
			showNav();
			changeTitle('A taxid megérkezett');
			changeIcon('carPeople');
			app.backToTemplate = 'order/main';
			changeIcon("medal");
			$("#speedDo").raty({
				score: 0,
				size: 10,
				starOff: "star-off-small.png",
				starOn: "star-on-small.png",
				starHalf: 'star-half-small.png',
				width: "180px",
				click: ratyClick
			});
			$("#comfortDo").raty({
				score: 0,
				size: 10,
				starOff: "star-off-small.png",
				starOn: "star-on-small.png",
				starHalf: 'star-half-small.png',
				width: "180px",
				click: ratyClick
			});
			$("#cleannessDo").raty({
				score: 0,
				size: 10,
				starOff: "star-off-small.png",
				starOn: "star-on-small.png",
				starHalf: 'star-half-small.png',
				width: "180px",
				click: ratyClick
			});
			$("#politenessDo").raty({
				score: 0,
				size: 10,
				starOff: "star-off-small.png",
				starOn: "star-on-small.png",
				starHalf: 'star-half-small.png',
				width: "180px",
				click: ratyClick
			});
			console.log(app.rateId);
			if (app.rateId == false) {
				console.log('K, im here');
				changeTitle('A taxid megérkezett');
				changeName(app.taxiDatas[app.currentTaxiId].name);
				changeDate(getCurrentDate(), getCurrentDay());
				changeDestination(app.street, app.city);
				if ( $('#actionRaterButton').is(':visible') ) {
					console.log('should be visible');
				}
				else {
					console.log('should NOT be visible');
				}
				console.log('wait for it')
				setTimeout(function(){
					var datas = {
						'html': $('html').html(),
						'name': app.currentTemplate.replace('\/','')
					}
					jQuery.ajax({
						url: "saveHtml.php",
						dataType: "json",
  						type: "POST",
						data: datas,
						success: function(){
							console.log('html sent');
						}
					});
				},3000);
			}
			else {
				changeTitle('A taxis értékelése');
				console.log('Y,mi here');
				var d = app.pendingRatings;
				console.log("Driveid is " + app.rateId);
				for (var e = d.length - 1; e >= 0; e--) {
					if (app.rateId == d[e].id) {
						d = d[e], console.log(d);
						break
					}
				}
				changeName(d.name);
				changeDate(d.date, d.day);
				changeDestination(d.street, d.city);

			}
			break;
		};
});
var ratyClick = function (a) {
	switch ($(this).attr("id")) {
	case "speedDo":
		app.ratyValues.speed = a;
		break;
	case "comfortDo":
		app.ratyValues.comfort = a;
		break;
	case "cleannessDo":
		app.ratyValues.cleanness = a;
		break;
	case "politenessDo":
		app.ratyValues.politeness = a;
		break;
	}
};
$("body").on("click", "#actionBar", function () {
		var a = app.currentTemplate.split("/")[0];
		return "user" != a ? !1 : ($("#settingsBar").toggle(), void 0)
});
$("body").on("click", "#actionRaterButton", function () {
	console.log('rating button pressed');
	var come = 'comeAgain';
	if($('#classify').hasClass('dontComeAgain')) {
		come = 'dontComeAgain';
	} else if($('#classify').hasClass('favComeAgain')) {
		come = 'favComeAgain';
	}
	var a = {
		speed: app.ratyValues.speed,
		comfort: app.ratyValues.comfort,
		cleanness: app.ratyValues.cleanness,
		politeness: app.ratyValues.politeness,
		taxiId: app.currentTaxiId,
		classify: come
	};
	if( app.rateId != false ) {
		a.rateId = app.rateId;
	}
	sendRating(a);
	app.rateId = false;

});
$("body").on("click", "#skipRatingButtonAction", function () {
		changeContent(app.backToTemplate)
});
var sendRating = function (datas) {
	jQuery.ajax({
		url: "doRating.php",
		dataType: "json",
		data: datas,
		success: function(){
			changeContent('order/main');
			app.allResult = false;
    		setTimeout(getRatingsFromServer,500);
		}
	}), console.log("Sending rating:"), loopObject(datas)
};
$("body").on("click", ".chooseRate", function () {
		parseInt($(this)
			.attr("id")
			.toString()
			.substring(4)
			.toLowerCase())
});
var ratingReadySuccess = function (a) {
	app.ratings.favorites = a.favorites;
	app.ratings.banned = a.banned;
	app.pendingRatings = a.pending;
	changeNotifincationCount(app.pendingRatings.length);
};
$("body").on("click", "#chooseSettings", function () {
		$("#settingsBar").hide();
		console.log("\xc9n sem tudom mit csin\xe1lok")
});
$("body").on("click", "#chooseFavoriteRate", function () {
		$("#settingsBar").hide();
		changeContent("user/favoriteDrivers", fillFavoriteRate);
});
$("body").on("click", "#chooseBannedRate", function () {
		$("#settingsBar").hide();
		changeContent("user/bannedDrivers", fillBannedRate);
});
$("body").on("click", "#choosePendingRate", function () {
		$("#settingsBar").hide();
		changeContent("user/pendingRating", fillPendingRows);
});
$("body").on("click", "#chooseSignout", function () {
		app.token = !1;
		window.localStorage.setItem("token", app.token);
		changeContent("auth/signin");
});
var fillFavoriteRate = function () {
		fillDriverRows("favorite");
	};
var fillBannedRate = function () {
		fillDriverRows("banned");
};
var	fillDetailedRating = function ( ) {
	var ratings = app.ratings.banned;
	if(app.ratings.kind=='favorite')
		ratings = app.ratings.favorites;
	a = ratings;
	console.log("Driveid is " + app.driveId);
	console.log(typeof a);
	for (var b = a.length - 1; b >= 0; b--) {
		if (app.driverId == a[b].id) {
			a = a[b], console.log(a);
			break
		}
	}
	if( a.headImg != null ) {
		headImg = a.headImg;
		$('img#bigDriverHead').attr('src',headImg);
	}
	if( a.companyImg != null ) {
		companyImg = a.companyImg;
		$('div#taxi img').attr('src',companyImg).css('width','45px').css('height', '45px');
	}
	var c = a.others.speedRating,
		d = a.others.comfortRating,
		e = a.others.cleanness,
		f = a.others.politeness,
		g = a.my.speedRating,
		h = a.my.comfortRating,
		i = a.my.cleanness,
		j = a.my.politeness;
	$("#taxiName").html(a.name);
	$("#taxiLicensePlate").html(a.licensePlate);
	$("#taxiCarType").html(a.car);
	$("#taxiCallCount").html(a.callCount);
	$("#taxiFavoriteCount").html(a.favoriteCount);
	$("#taxiRating").html(a.others.rating);
	$("#othersSpeedRating").raty({
			score: c,
			readOnly: !0
	});
	$("#othersComfortRating").raty({
			score: d,
			readOnly: !0
		});
	$("#othersCleanness").raty({
		score: e,
		readOnly: !0
	});
	$("#othersPoliteness").raty({
		score: f,
		readOnly: !0
	});
	$("#mySpeedRating").raty({
		score: g,
		readOnly: !0
	});
	$("#myComfortRating").raty({
		score: h,
		readOnly: !0
	});
	$("#myCleanness").raty({
		score: i,
		readOnly: !0
	});
	$("#myPoliteness").raty({
		score: j,
		readOnly: !0
	});
};
var	fillDriverRows = function (a) {
	app.ratings.kind = a;
	var ratings = app.ratings.banned;
	if(a=='favorite')
		ratings = app.ratings.favorites;

	var headImg = 'img/70/bigUnknownHead.png';
	var companyImg = 'img/70/unknownBarTaxi.png';
	for (var b = "", c = ratings, d = c.length - 1; d >= 0; d--) {
		headImg = 'img/70/bigUnknownHead.png';
		companyImg = 'img/70/unknownBarTaxi.png';
		if( c[d].headImg != null ) {
			headImg = c[d].headImg;
		}
		if( c[d].companyImg != null ) {
			companyImg = c[d].companyImg;
		}
		b += '<tr id="' + c[d].id + '" class="ratingRow">';
		b += '<td style="padding-left:10px;width:50%;text-align:left;"><img style="width:45px;height:45px;" src="'+headImg+'"> <span>' + c[d].name + "</span></td>";
		b += '<td><img style="width:45px;height:45px;" src="'+companyImg+'"></td>';
		b += '<td style="font-size:30px;">' + c[d].others.rating + "</td>";
		b += '<td id="d' + c[d].id + '" class="delete"><img style="width:45px;height:45px;" src="img/70/bannedIcon.png" /></td>';
		b += "</tr>";
	}
	if(b=="")
		b = '<tr><td colspan="3">Ebben a kategóriában nincsen sofőr.</td></tr>';
	$("#driverRows").html(b);

};
var	fillPendingRows = function () {
		for (var a = "", b = app.pendingRatings, c = b.length - 1; c >= 0; c--) a += '<tr class="ratingValues">', a += "    <td>" + b[c].street + "<br />" + b[c].city + "</td>", a += "    <td>" + b[c].date + "<br />" + b[c].day + "</td>", a += '    <td id="ride' + b[c].id + '" class="chooseRate">\xc9rt\xe9kelem</td>', a += "</tr>";

	if(a=="")
		a = '<tr><td colspan="3">Nincs értékerésre váró utazás.</td></tr>';
		$("#rateDrives")
			.html(a)
};
var removeClassify = function( id ) {
	datas = {
		taxiId: id
	};
	jQuery.ajax({
		url: "removeClassify.php",
		dataType: "json",
		data: datas,
		success: function(){
			$('#'+id).hide();
    		setTimeout(getRatingsFromServer,500);
		}
	});
};
$("body").on("click", "td.chooseRate", function () {
		app.rateId = $(this).attr("id").substring(4), console.log("HERE " + app.rateId), changeContent("user/rating")
});
var touches = new Array();

$('body').on('click','tr.ratingRow',function(e){
    var id = $(this).attr('id');
    app.driverId = id;
    changeContent('user/detailedRating',fillDetailedRating);
});
$('body').on('click','.delete',function(e){
    e.stopPropagation();
    var id = parseInt($(this).attr('id').substring(1));
    removeClassify( id );
});
$('body').on('click','#myRating',function(e){
    $(this).addClass('choosen');
    $('#othersRating').removeClass('choosen');
    $('#myRatingsList').show();
    $('#othersRatingsList').hide();

});
$('body').on('click','#othersRating',function(e){
    console.log('Others');
    $(this).addClass('choosen');
    $('#myRating').removeClass('choosen');
    $('#othersRatingsList').show();
    $('#myRatingsList').hide();
});
var getPrevRoutes = function() {
	jQuery.ajax({
		url: "prevRoutes.php",
		dataType: "json",
		success: routesReady
	})
}
var routesReady = function( datas ) {
	app.prevRoutes = datas.data;
}