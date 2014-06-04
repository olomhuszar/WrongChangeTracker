var login = function(email, password, type) {
	console.log("Loggin attempt with " + email + " and " + password);
	password = CryptoJS.SHA1(password).toString();
	window.localStorage.setItem("email",email);
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if( re.test(email) == false ) {
    	$('#alert').show().html('A bejelentkezéshez valós e-mail címet kell megadni.');
    	return;
    }
	var datas = {
		'email' : email,
		'pass' : password, 
		'action' : type
	};
	jQuery.ajax({
		url: 'login.php',
	    dataType: 'json',
		data: datas,
		success: loginSuccess
	});
}
var guestLogin = function() {
	jQuery.ajax({
		url: 'unAuthLogin.php',
	    dataType: 'json',
		success: loginSuccess
	});	
}
var loginSuccess = function( response ) {
	if(response['status']=="OK") {
		app.token = response['token'];
		window.localStorage.setItem("token",app.token);
        changeContent('order/main');
        pollMessages();
        setTimeout(initialateValues,600);
        setTimeout(getPrevRoutes,1200);
	} else {
		$('#alert').show().html( 'Sikertelen bejelentkezés: ' + response['message'] );
	}
}
var signupSuccess = function( response ) {
	if(response['status']=="OK") {
    changeContent('auth/signin');
	} else {
		$('#alert').show().html( 'Sikertelen regisztráció: ' + response['message'] );
	}
}
/**After load functions**/
console.log('authjs ready');
var email		= null;
var password	= null;
$('body').on("click","button#signin", function( event ){
	event.preventDefault(); 
	email		= $('input[name="loginEmail"]').val();
	password	= $('input[name="loginPassword"]').val();
	if( email == "" && false) {
		email = 'baran@dev.hu';
		password = 'qwe';
	}
	login(email, password,'signed');
});
$('body').on("click","button#signup", function( event ){
	event.preventDefault();
	email		= $('input[name="loginEmail"]').val();
	password	= $('input[name="loginPassword"]').val();
	changeContent('auth/signup');
});
$('body').on("templateChange", function(event, file) {
	var path = file.split("/")[0];
	if( path != 'auth' ) return false;
	hideHeader();
	switch( file ) {
		case 'auth/signup':
			app.backToTemplate = 'auth/signin';
			break;
		default:
			var defEmail = window.localStorage.getItem('email');
			if( defEmail != null) {
        		$('img.changeCheck').attr('src','img/cheched.png');
        		$('#signup').hide();
        		$('#signin').show();
        		$('input[name="loginEmail"]').val( defEmail );
        		console.log('Email set to ' + defEmail);
			}
			app.backToTemplate = 'exit';
	}	
	$('input[name="signupEmail"]').val( email ).textinput('refresh');
	$('input[name="signupPassword"]').val(password ).textinput('refresh');
});
$('body').on("click","button#signupAccept", function( event ){
	event.preventDefault();
	$('button#signupAccept').hide();
	$('button#signupSubmit').removeClass('ui-disabled');
});
$('body').on("click","button#signupSubmit", function( event ){
	event.preventDefault();
	var email = $('input[name="signupEmail"]').val();
	var password = $('input[name="signupPassword"]').val();
	var emailAgain = $('input[name="signupEmailAgain"]').val();
	var passwordAgain = $('input[name="signupPasswordAgain"]').val();
	var sha1 = CryptoJS.SHA1(password).toString();
	var telephone = $('input[name="signupPhone"]').val();
	console.log('Registrating with ' + email + ' and ' + password + ' phone: ' + telephone + ' sha1: ' + sha1);

	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if( re.test(email) == false ) {
    	$('#alert').show().html('A regisztrációhoz valós e-mail címet kell megadni.');
    } else if(email != emailAgain) {
    	$('#alert').show().html('A két e-mail címnek meg kell egyeznie');
    } else if(password.trim() == '') {
    	$('#alert').show().html('A jelszó nem lehet üres');
    } else if(password != passwordAgain) {
    	$('#alert').show().html('A két jelszónak meg kell egyeznie');
    } else if(password.trim() == '') {
    	$('#alert').show().html('A jelszó nem lehet üres');
    } else if(telephone.trim() == '') {
    	$('#alert').show().html('Telefonszám megadása kötelező');
    } else {
	    var datas = {
			'email' : email,
			'pass' : sha1, 
			'tel' : telephone,
			'type' : 1
		};
		jQuery.ajax({
			url: 'signup.php',
			dataType: 'json',
			data: datas,
			success: signupSuccess
		});		
    }
});
$('body').on("click","p#changeCheck", function(){
    var img = $('img.changeCheck').attr('src');
    if( img == 'img/unchecked.png' ) {
        $('img.changeCheck').attr('src','img/cheched.png');
    } else {
        $('img.changeCheck').attr('src','img/unchecked.png');
    }
    console.log('tooogle from ' + img)
    $('#signup').toggle();
    $('#signin').toggle();
});
var lostPassword = function() {
	var email 	 = $('input[name="loginEmail"]').val();
	jQuery.ajax({
		url: 'lostPassword.php',
	    dataType: 'json',
		data: {
			'email': email
		},
		success: function() {
			$('#alert').show().html('Kérjük nézze meg e-mail fiókját');
		}
	});
}