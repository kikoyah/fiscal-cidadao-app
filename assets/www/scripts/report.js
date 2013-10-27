var database;
var destinationType;
var pictureSource;
var noRouteSelected = "Escolha uma linha...";
var noDescription = "Descreva o problema...";

/**
 * On document ready.
 */
$(document).ready(function(){
	document.addEventListener("deviceready", onDeviceReady, false);
	
	$("#capturePhoto").click(function() {
		navigator.camera.getPicture(onPhotoDataSuccess, onPhotoDataFail,
				{ quality: 20, destinationType: destinationType.FILE_URI });
	});
	$("#facts").change(function(){
		database.query("SELECT COUNT(*) as COUNT FROM FACTS WHERE LOCAL = 'R' AND ID = " + $(this).val(),
			function(tx, results){
				if (results.rows.item(0).COUNT == 1) {
					$("#routes").show();
				} else {
					$("#routes").hide();
				}
			});
	});
	$("#description")
     	.focus(function(){
     		if ($(this).val() == noDescription) {
     			$(this).val("");
     		}
     	})
     	.blur(function(){
     		if($.trim($(this).val()) == "") {
     			$(this).val(noDescription);
     		}
     	})
		.val(noDescription);
	$("#removePhoto").click(function(){
		$("#imageURI").val("");
		$("#smallImage").attr("src", "");
		$("#smallImage").hide();
		$(this).hide();
	});
	$("#send").click(function(){
		if ($("#facts option:selected").val() == "0") {
			alert("Selecione um tipo de reclamação!");
		} else {
			var fact = $("#facts option:selected").val();
			var route = $("#routeSelected").val() != noRouteSelected ? $("#routeSelected").val().substring(0, 7) : "";
			var latitude = $("#latitude").val() == "" ? null : $("#latitude").val();
			var longitude = $("#longitude").val() == "" ? null : $("#longitude").val();
			var photoPath = $("#imageURI").val();
			var description = $("#description").val() != noDescription ? $("#description").val() : "";
			var timestamp = new Date().getTime();
			
			database.query("SELECT IFNULL(MAX(ID),0) + 1 AS NEXTVAL FROM OCCURRENCES", function(tx, results){
				
				database.execute("INSERT INTO OCCURRENCES (ID, FACT_ID, ROUTE_ID, LATITUDE, LONGITUDE, PHOTO_PATH, DESCRIPTION, TIMESTAMP, SEND) values " +
						"(" + results.rows.item(0).NEXTVAL + ", " + fact + ", '" + route + "', " + latitude + ", " + longitude + ", '" + photoPath + "', '" + description + "', " + timestamp + ", 0)", function(){
					alert("Reclamação enviada com sucesso!");
					$("#cancel").trigger("click");
				});
			});
		}
	});
	$("#cancel").click(function(){
		window.location.href = "../index.html";
	});
});

/**
 * On device ready.
 */
function onDeviceReady() {
	database = new Database();
	database.create(onCreate);

    destinationType=navigator.camera.DestinationType;
    pictureSource=navigator.camera.PictureSourceType;

	navigator.geolocation.getCurrentPosition(onSuccessGeo, onErrorGeo);
}

/**
 * On success to get the current position.
 * @param position current position.
 */
function onSuccessGeo(position) {
    $("#latitude").val(position.coords.latitude);
    $("#longitude").val(position.coords.longitude);
}

/**
 * On fail to get the current position.
 * @param error error data.
 */
function onErrorGeo(error) {
//	alert("Get current position failed because: " + error.message);
}

/**
 * On success to get photo data.
 * @param imageData image URI.
 */
function onPhotoDataSuccess(imageURI) {
	$("#imageURI").val(imageURI);
	$("#smallImage").show();
	$("#smallImage").attr("src", imageURI);
	$("#smallImage").width(300);
	$("#removePhoto").show();
}

/**
 * On fail to get photo data.
 * @param message fail message.
 */
function onPhotoDataFail(message) {
//	alert("Photo capture fail because: " + message);
}

/**
 * On database created.
 */
function onCreate() {
	database.query("SELECT ID, DESCRIPTION FROM FACTS ORDER BY ID", function(tx, results){
		for (var i = 0; i < results.rows.length; i++) {
			var item = results.rows.item(i);
			$("#facts").append($('<option></option>')
					.val(item.ID)
					.html(item.DESCRIPTION));
		}
	});
	database.query("SELECT ID, DESCRIPTION FROM ROUTES", function(tx, results){
		var availableRoutes = [];
		for (var i = 0; i < results.rows.length; i++) {
			var item = results.rows.item(i);
			availableRoutes.push(item.ID + " " + item.DESCRIPTION);
		}
		$( "#routes" )
	     	.autocomplete({
	     		source: availableRoutes,
	     		select: function(event, object) {
	     			$("#routeSelected").val(object.item.value);
	     		}
	     	})
	     	.focus(function(){
	     		if ($(this).val() == noRouteSelected) {
	     			$(this).val("");
	     		}
	     	})
	     	.blur(function(){
	     		if($.trim($(this).val()) == "") {
	     			$("#routeSelected").val("");
	     		}
	     		if ($("#routeSelected").val() == "") {
	     			$(this).val(noRouteSelected);
	     		} else if ($("#routeSelected").val() != $(this).val()) {
	     			$(this).val($("#routeSelected").val());
	     		}
	     	})
	     	.val(noRouteSelected);
	});
	$("#report").show();
}