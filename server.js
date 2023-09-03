//export PORT=3000
const path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var hateoas = require("hateoas")({baseUrl: "http://ec2-54-94-33-33.sa-east-1.compute.amazonaws.com:3000"});
var cors = require('cors');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
var corsOptions = {
  origin: '*',
  allowedHeaders: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

function LoginPost (request, response) {
	console.log("LoginPost: login requested");
	console.log("» request.headers.authorization: " + request.headers.authorization);
	let authorization_parts = request.headers.authorization?.split(" ");
	let credentials_b64 = authorization_parts[1];
	console.log("» credentials_b64: " + Buffer.from(credentials_b64, 'base64').toString());
	response.json({sessionId:123}).status(200).end();
}
app.post("/login", LoginPost);

function BeaconPost (request, response) {
	console.log("BeaconPost");
	console.log("» publicId: " + request.body.id);
	console.log("» status: " + request.body.status);
	response.json({message:"OK"}).status(200).end();
}
app.post("/beacon", BeaconPost);

function ServicePost (request, response) {
	console.log("ServicePost");
	console.log("» position: " + request.body.distance);
	console.log("» publicId: " + request.body.id);
	if (request.body.distance > 1.1) {
		console.log("» hateoas: " + JSON.stringify(hateoas.link("theme", {id: 2})));
		response.json(hateoas.link("theme", {id: 2})).status(200).end();
	} else {
		console.log("» hateoas: " + JSON.stringify(hateoas.link("theme", {id: 1})));
		response.json(hateoas.link("theme", {id: 1})).status(200).end();
	}
}
app.post("/service", ServicePost);

hateoas.registerLinkHandler("root", function() {
    return {
        "self": "/",
        "themes": "/themes"
    };
});

hateoas.registerLinkHandler("theme", function(theme) {
    var links = {
        "self": "/themes/" + theme.id,
    };
 
    return links;
});

// TODO Rever
function ExperiencePost (request, response) {
	console.log("ExperiencePost");
	response.json({message:"OK"}).status(200).end();
}
app.post("/experience", ExperiencePost);

function ThemeGet (request, response) {
	const themeId = request.params.themeId;
	console.log("ThemeGet");
	console.log("» themeId: " + themeId);
	response.sendFile(path.join(__dirname, '/public/' + themeId + '.html'));
}
app.get("/themes/:themeId", ThemeGet);

var listener = app.listen(process.env.PORT, function () {
	console.log('Indoor Analytics listening on port ' + listener.address().port);
});
