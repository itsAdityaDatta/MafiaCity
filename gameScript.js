let socket = io();

document.addEventListener("DOMContentLoaded", function(event) {
	checkCookie();

	let form = document.getElementById("form1");
	form.addEventListener("submit", handleForm);
	function handleForm(event) {
		event.preventDefault();
		let msg = document.getElementById("inp1").value;
		socket.emit(
			"chat message",
			msg,
			getCookie("roomName"),
			getCookie("playerName")
		);
		document.getElementById("inp1").value = "";
		return false;
	}
	socket.on("chat message2", function(msg, playerName) {
		var node = document.createElement("li");
		var textnode = document.createTextNode(playerName + ": " + msg);
		node.appendChild(textnode);
		document.getElementById("messages").appendChild(node);
		window.scrollTo(0, document.body.scrollHeight);
	});

	socket.on("instructions", function(msg) {
		var node = document.createElement("li");
		var textnode = document.createTextNode(msg);
		node.appendChild(textnode);
		document.getElementById("messages").appendChild(node);
		window.scrollTo(0, document.body.scrollHeight);
	});

	socket.on("createJoin", playerName => {
		var node = document.createElement("li");
		let msg = "Server: " + playerName + " has joined the room";
		var textnode = document.createTextNode(msg);
		node.appendChild(textnode);
		document.getElementById("messages").appendChild(node);
		window.scrollTo(0, document.body.scrollHeight);

		var node2 = document.createElement("li");
		let msg2 =
			"Server: " +
			"(Room Name: " +
			getCookie("roomName") +
			" | Room Password: " +
			getCookie("roomPass") +
			")";
		var textnode2 = document.createTextNode(msg2);
		node2.appendChild(textnode2);
		document.getElementById("messages").appendChild(node2);
		window.scrollTo(0, document.body.scrollHeight);
	});

	socket.on("disconnecting2", playerName => {
		var node = document.createElement("li");
		let msg = "Server: " + playerName + " has left the room";
		var textnode = document.createTextNode(msg);
		node.appendChild(textnode);
		document.getElementById("messages").appendChild(node);
		window.scrollTo(0, document.body.scrollHeight);
	});

	document.getElementById("leaveRoom").addEventListener("click", () => {
		let ans = confirm("Are you sure you want to leave the current room?");
		if (ans == true) {
			setCookie("roomName", "");
			setCookie("isInRoom", 0);
			window.location.href = "/";
		}
	});

	//_____________________________________________________COOKIE FUNCTIONS ______________________________________________________________________

	function setCookie(cname, cvalue, exdays) {
		document.cookie = cname + "=" + cvalue;
	}

	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(";");
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	function checkCookie() {
		let playerName = getCookie("playerName");
		if (playerName == "") {
			window.location.href = "/";
		} else {
			let roomName = getCookie("roomName");
			let roomPass = getCookie("roomPass");
			socket.emit("createRoomJoin2", roomName, roomPass, playerName);
		}
	}
});


/////////////////////////////////////////////////////////////////////////////////////////////////

var style_cookie_name = "styles";
var style_cookie_duration = 3;
var style_domain = "localhost:3000/game";



function switch_style(css_title) {
	var i, link_tag;
	for (
		i = 0, link_tag = document.getElementsByTagName("link");
		i < link_tag.length;
		i++
	) {
		if (link_tag[i].rel.indexOf("stylesheet") != -1 && link_tag[i].title) {
			link_tag[i].disabled = true;
			if (link_tag[i].title == css_title) {
				link_tag[i].disabled = false;
			}
		}
		set_cookie(
			style_cookie_name,
			css_title,
			style_cookie_duration,
			style_domain
		);
	}
}

function set_style_from_cookie() {
	var css_title = get_cookie(style_cookie_name);
	if (css_title.length) {
		switch_style(css_title);
	}
}
function set_cookie(cookie_name, cookie_value, lifespan_in_days, valid_domain) {
	var domain_string = valid_domain ? "; domain=" + valid_domain : "";
	document.cookie =
		cookie_name +
		"=" +
		encodeURIComponent(cookie_value) +
		"; max-age=" +
		60 * 60 * 24 * lifespan_in_days +
		"; path=/" +
		domain_string;
}
function get_cookie(cookie_name) {
	var cookie_string = document.cookie;
	if (cookie_string.length != 0) {
		var cookie_array = cookie_string.split("; ");
		for (i = 0; i < cookie_array.length; i++) {
			cookie_value = cookie_array[i].match(cookie_name + "=(.*)");
			if (cookie_value != null) {
				return decodeURIComponent(cookie_value[1]);
			}
		}
	}
	return "";
}
