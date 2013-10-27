var database;

/**
 * On document ready.
 */
$(document).ready(function(){
	document.addEventListener("deviceready", onDeviceReady, false);
});

/**
 * On device ready.
 */
function onDeviceReady() {
	database = new Database();
	database.create(onCreate);
}

/**
 * On database created.
 */
function onCreate() {
	var networkState = navigator.network.connection.type;
	if (networkState != Connection.UNKNOWN && networkState != Connection.NONE) {
		database.query("SELECT * FROM OCCURRENCES WHERE SEND = 0", function(tx, results){
			for (var i = 0; i < results.rows.length; i++) {
				var item = results.rows.item(i);
				var id = item.ID;
				var fact = item.FACT_ID;
				var route = item.ROUTE_ID;
				var latitude = item.LATITUDE;
				var longitude = item.LONGITUDE;
				var photoPath = item.PHOTO_PATH;
				var description = item.DESCRIPTION;
				var timestamp = item.TIMESTAMP;
				
				var options = new FileUploadOptions();
				options.fileKey = "photo";
				options.fileName = photoPath.substr(photoPath.lastIndexOf('/') + 1);
				
//				var fileTransfer = new FileTransfer();
//				fileTransfer.upload(photoPath,
//						encodeURI("http://192.168.0.24:8000/occurrence/"),
//						function(r) {
//							alert("File transfer successful!");
//						},
//						function(e){
//							alert("An error has ocurried during file transfer!");
//						},
//						options);
				
				$.ajax({
					url: "http://192.168.0.24:8000/occurrence/",
					type: "POST",
					data: $("<form>" +
							"<input name='fact' value='" + fact + "'/>" +
							"<input name='route' value='" + route + "'/>" +
							"<input name='latitude' value='" + latitude + "'/>" +
							"<input name='longitude' value='" + longitude + "'/>" +
							"<input name='date_time' value='" + timestamp + "'/>" +
							"<input name='comment' value='" + description + "'/>" +
							"</form>")
							.serialize(),
					success: function(data, textStatus, xhr) {
						database.execute("UPDATE OCCURRENCES SET SEND = 1 WHERE ID = " + id, function(){
//							alert("Ocorrência '" + id + "' enviada com sucesso!");
						});
					},
					error: function(data, textStatus, errorThrown) {
//						alert("Error on submit data report: " + errorThrown);
					}
				});
			}
		});
	}
}