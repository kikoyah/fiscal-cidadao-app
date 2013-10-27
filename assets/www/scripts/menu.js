/**
 * On document ready.
 */
$(document).ready(function(){
	$("#reclamacao").click(function(){
		window.location.href = "report.html";
	});
	document.addEventListener("backbutton", function(){
		navigator.app.exitApp();
	}, false);
});