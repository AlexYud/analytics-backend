const {PORT = 3000} = process.env;
const path = require('path');
const assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
var corsOptionsRoute = {
  origin: '*',
  allowedHeaders: '*',
  methods: "GET,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  credentials: true,
  preflightContinue: true
}
app.use(cors(corsOptionsRoute))

/* DOMAIN */
var distanceMap = [];

const INVALID_INDEX = -1;
const BEACON_MAX_DISTANCE = 0.5;
var merchants = [];
var merchantIndex = 0;
class Merchant {
	constructor(name) {
		this.id = this.nextId();
		this.name = name;
		this.facilities = [];	
	}
	nextId() {
		merchantIndex++;
		return merchantIndex;
	}
	addFacility(facility) {
		this.facilities.push(facility);
	}
	removeFacility(facility) {
		this.facilities.splice(facilities.findIndex(v => v.id == facility.id), 1);
	}
}

var facilities = [];
var facilityIndex = 0;
class Facility {
	constructor(name) {
		this.id = this.nextId();
		this.name = name;
		this.environments = [];
	}
	nextId() {
		facilityIndex++;
		return facilityIndex;
	}
	addEnvironment(environment) {
		this.environments.push(environment);
	}
	removeEnvironment(environment) {
		this.environments.splice(environments.findIndex(v => v.id == environment.id), 1);
	}
}

var environments = [];
var environmentIndex = 0;
ENVIRONMENT_BEACON_PRIORITY_INCONSISTENT = "ENVIRONMENT_BEACON_PRIORITY_INCONSISTENT";
class Environment {
	constructor(name, url) {
		this.id = this.nextId();
		this.name = name;
		this.url = url;
		this.beacons = [];
	}
	nextId() {
		environmentIndex++;
		return environmentIndex;
	}
	addBeacon(newBeacon) {
		for(let beacon in this.beacons) {
			if (beacon.priority == newBeacon.priority)
				throw new Error(ENVIRONMENT_BEACON_PRIORITY_INCONSISTENT);
		}
		this.beacons.push(beacon);
	}
	removeBeacon(beacon) {
		this.beacons.splice(beacons.findIndex(v => v.id == beacon.id), 1);
	}
}

const Status = {
	NOT_FOUND: "NOT_FOUND",
	FOUND: "FOUND",
	CONNECTED: "CONNECTED",
	DISCONNECTED: "DISCONNECTED",
	FAILED_TO_CONNECT: "FAILED_TO_CONNECT"
}

var beacons = [];
var beaconIndex = 0;
BEACON_UNDEFINED_URL = "BEACON_UNDEFINED_URL";
BEACON_NULL_URL = "BEACON_NULL_URL";
BEACON_UNDEFINED_PRIORITY = "BEACON_UNDEFINED_PRIORITY";
BEACON_NULL_PRIORITY = "BEACON_NULL_PRIORITY";
BEACON_WRONG_TYPE_PRIORITY = "BEACON_WRONG_TYPE_PRIORITY";
class Beacon {
	constructor(publicIdentifier, url, distance, priority) {
		this.id = publicIdentifier;
		this.publicIdentifier = publicIdentifier;
		
		assert.notEqual(url, undefined, TypeError(BEACON_UNDEFINED_URL));
		assert.notEqual(url, null, ReferenceError(BEACON_NULL_URL));
		this.url = url;
		this.distance = Math.abs(distance);

		assert.notEqual(priority, undefined, TypeError(BEACON_UNDEFINED_PRIORITY));
		assert.notEqual(priority, null, ReferenceError(BEACON_NULL_PRIORITY));
		assert.notEqual(Number.parseInt(priority), Number.NaN, ReferenceError(BEACON_WRONG_TYPE_PRIORITY));
		this.priority = Number.parseInt(priority);
		this.connectedUsers = 0;
		this.devices = [];
		this.connectedDevices = [];
		this.services = [];
	}
	nextId() {
		beaconIndex++;
		return beaconIndex;
	}
	addDevice(device) {
		device.status = Status.FOUND;
		this.devices.push(device);
	}
	connectDevice(device) {
		device.status = Status.CONNECTED;
		this.devices.push(device);
	}
	removeDevice(device) {
		device.status = Status.DISCONNECTED;
		this.devices.splice(devices.findIndex(v => v.id == device.id), 1);
	}
	addService(service) {
		this.services.push(service);
	}
	removeService(service) {
		this.services.splice(services.findIndex(v => v.id == service.id), 1);
	}
}

var devices = [];
var deviceIndex = 0;
class Device {
	constructor(name) {
		this.id = name;
		this.name = name;
		this.status = Status.NOT_FOUND;
	}
	nextId() {
		deviceIndex++;
		return deviceIndex;
	}
}

var services = [];
var serviceIndex = 0;
class Service {
	constructor(name) {
		this.id = this.nextId();
		this.name = name;
	}
	nextId() {
		serviceIndex++;
		return serviceIndex;
	}
}

/* EXPOSITION */
// Beacon Collection
const BEACON_COLLECTION_ROUTE = "/beacons";
function BeaconCollectionDeleteRoute(request, response, next) {
	console.log("BeaconCollectionDeleteRoute");
	beacons = [];
	distanceMap = [];
	beaconIndex = 0;
	response.status(200).end();
}
app.delete(BEACON_COLLECTION_ROUTE, BeaconCollectionDeleteRoute);

function BeaconCollectionGetRoute(request, response, next) {
	console.log("BeaconCollectionGetRoute");
	response.json(beacons).status(200).end();
}
app.get(BEACON_COLLECTION_ROUTE, BeaconCollectionGetRoute);

function BeaconCollectionOptionsRoute(request, response, next) {
	console.log("BeaconCollectionOptionsRoute");
	response.status(200).end();
}
app.options(BEACON_COLLECTION_ROUTE, BeaconCollectionOptionsRoute);

function BeaconCollectionPatchRoute(request, response, next) {
	console.log("BeaconCollectionPatchRoute");
	response.status(200).end();
}
app.patch(BEACON_COLLECTION_ROUTE, BeaconCollectionPatchRoute);

function BeaconCollectionPostRoute(request, response, next) {
	try {
		console.log("BeaconCollectionPostRoute");
		console.log("TODO Utilizar JSON.stringify apenas uma vez");
		var publicIdentifier = JSON.stringify(request.body.publicIdentifier);
		publicIdentifier = publicIdentifier.replaceAll("\"", "");
		console.log("» publicIdentifier: " + publicIdentifier);
		var url = JSON.stringify(request.body.url);
		url = url.replaceAll("\"", "");
		console.log("» url: " + url);
		var distance = JSON.stringify(request.body.distance);
		distance = distance.replaceAll("\"", "");
		console.log("» distance: " + distance);
		var priority = JSON.stringify(request.body.priority);
		priority = priority.replaceAll("\"", "");
		console.log("» priority: " + priority);
		let index = beacons.findIndex(v => v.id == publicIdentifier);
		var beacon = null;
		if (index == INVALID_INDEX) {
			beacon = new Beacon(publicIdentifier, url, distance, priority);
			beacons.push(beacon);
		} else
			beacon = beacons[index];
		response.json(beacon).status(200).end();
	} catch (error) {
		let message = {
			message: error.message
		};
		if (error instanceof ReferenceError) {
			response.json(message).status(400).end();
		} else if (error instanceof TypeError) {
			response.json(message).status(400).end();
		} else {
			response.json(message).status(400).end();
		}
	}
}
app.post(BEACON_COLLECTION_ROUTE, BeaconCollectionPostRoute);

function BeaconCollectionPutRoute(request, response, next) {
	console.log("BeaconCollectionPutRoute");
	response.status(200).end();
}
app.put(BEACON_COLLECTION_ROUTE, BeaconCollectionPutRoute);

// Beacon Item
const BEACON_ITEM_ROUTE = "/beacons/:beacon_id";
function BeaconItemDeleteRoute(request, response, next) {
	console.log("BeaconItemDeleteRoute");
	let beacon_id = request.params.beacon_id;
	console.log("» beacon_id: " + beacon_id);
	beacons.splice(beacons.findIndex(v => v.id == beacon_id), 1);
	response.status(200).end();
}
app.delete(BEACON_ITEM_ROUTE, BeaconItemDeleteRoute);

function BeaconItemGetRoute(request, response, next) {
	console.log("BeaconItemGetRoute");
	let beacon_id = request.params.beacon_id
	console.log("» beacon_id: " + beacon_id);
	let beaconIndex = beacons.findIndex(v => v.id == beacon_id);
	if (beaconIndex == INVALID_INDEX) {
		return response.status(400).json({message:"beaconIndex == INVALID_INDEX"});
	}
	response.json(beacons[beaconIndex]).status(200).end();
	next();
}
app.get(BEACON_ITEM_ROUTE, BeaconItemGetRoute);

function BeaconItemOptionsRoute(request, response, next) {
	console.log("BeaconItemOptionsRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.options(BEACON_ITEM_ROUTE, BeaconItemOptionsRoute);

function BeaconItemPatchRoute(request, response, next) {
	console.log("BeaconItemPatchRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.patch(BEACON_ITEM_ROUTE, BeaconItemPatchRoute);

function BeaconItemPostRoute(request, response, next) {
	console.log("BeaconItemPostRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.post(BEACON_ITEM_ROUTE, BeaconItemPostRoute);

function BeaconItemPutRoute(request, response, next) {
	console.log("BeaconItemPutRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.put(BEACON_ITEM_ROUTE, BeaconItemPutRoute);

// Device Collection
const DEVICE_COLLECTION_ROUTE = "/devices";
function DeviceCollectionDeleteRoute(request, response, next) {
	console.log("DeviceCollectionDeleteRoute");
	devices = [];
	deviceIndex = 0;
	response.status(200).end();
}
app.delete(DEVICE_COLLECTION_ROUTE, DeviceCollectionDeleteRoute);

function DeviceCollectionGetRoute(request, response, next) {
	console.log("DeviceCollectionGetRoute");
	response.json(devices).status(200).end();
}
app.get(DEVICE_COLLECTION_ROUTE, DeviceCollectionGetRoute);

function DeviceCollectionOptionsRoute(request, response, next) {
	console.log("DeviceCollectionOptionsRoute");
	response.status(200).end();
}
app.options(DEVICE_COLLECTION_ROUTE, DeviceCollectionOptionsRoute);

function DeviceCollectionPatchRoute(request, response, next) {
	console.log("DeviceCollectionPatchRoute");
	response.status(200).end();
}
app.patch(DEVICE_COLLECTION_ROUTE, DeviceCollectionPatchRoute);

function DeviceCollectionPostRoute(request, response, next) {
	console.log("DeviceCollectionPostRoute");
	var name = JSON.stringify(request.body.name);
	console.log("» name: " + name);
	if (name == null)
		return response.json({message:"name == null"}).status(404).end();
	name = name.replaceAll("\"", "");
	let index = beacons.findIndex(v => v.name == name);
	var device = null;
	if (index == INVALID_INDEX) {
		device = new Device(name);
		devices.push(device);
	} else
		device = devices[index];
	return response.json(device).status(200).end();
}
app.post(DEVICE_COLLECTION_ROUTE, DeviceCollectionPostRoute);

function DeviceCollectionPutRoute(request, response, next) {
	console.log("DeviceCollectionPutRoute");
	response.status(200).end();
}
app.put(DEVICE_COLLECTION_ROUTE, DeviceCollectionPutRoute);

// Device Item
const DEVICE_ITEM_ROUTE = "/devices/:device_id";
function DeviceItemDeleteRoute(request, response, next) {
	console.log("DeviceItemDeleteRoute");
	let device_id = request.params.device_id;
	console.log("» device_id: " + device_id);
	devices.splice(devices.findIndex(v => v.id == device_id), 1);
	response.status(200).end();
}
app.delete(DEVICE_ITEM_ROUTE, DeviceItemDeleteRoute);

function DeviceItemGetRoute(request, response, next) {
	console.log("DeviceItemGetRoute");
	let device_id = request.params.device_id;
	console.log("» device_id: " + device_id);
	let index = devices.findIndex(v => v.id == device_id)
	response.json(devices[index]).status(200).end();
}
app.get(DEVICE_ITEM_ROUTE, DeviceItemGetRoute);

function DeviceItemOptionsRoute(request, response, next) {
	console.log("DeviceItemOptionsRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.options(DEVICE_ITEM_ROUTE, DeviceItemOptionsRoute);

function DeviceItemPatchRoute(request, response, next) {
	console.log("DeviceItemPatchRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.patch(DEVICE_ITEM_ROUTE, DeviceItemPatchRoute);

function DeviceItemPostRoute(request, response, next) {
	console.log("DeviceItemPostRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.post(DEVICE_ITEM_ROUTE, DeviceItemPostRoute);

function DeviceItemPutRoute(request, response, next) {
	console.log("DeviceItemPutRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.put(DEVICE_ITEM_ROUTE, DeviceItemPutRoute);

// Environment Collection
const ENVIRONMENT_COLLECTION_ROUTE = "/environments";
function EnvironmentCollectionDeleteRoute(request, response, next) {
	console.log("EnvironmentCollectionDeleteRoute");
	environments = [];
	environmentIndex = 0;
	response.status(200).end();
}
app.delete(ENVIRONMENT_COLLECTION_ROUTE, EnvironmentCollectionDeleteRoute);

function EnvironmentCollectionGetRoute(request, response, next) {
	console.log("EnvironmentCollectionGetRoute");
	response.json(environments).status(200).end();
}
app.get(ENVIRONMENT_COLLECTION_ROUTE, EnvironmentCollectionGetRoute);

function EnvironmentCollectionOptionsRoute(request, response, next) {
	console.log("EnvironmentCollectionOptionsRoute");
	response.status(200).end();
}
app.options(ENVIRONMENT_COLLECTION_ROUTE, EnvironmentCollectionOptionsRoute);

function EnvironmentCollectionPatchRoute(request, response, next) {
	console.log("EnvironmentCollectionPatchRoute");
	response.status(200).end();
}
app.patch(ENVIRONMENT_COLLECTION_ROUTE, EnvironmentCollectionPatchRoute);

function EnvironmentCollectionPostRoute(request, response, next) {
	console.log("EnvironmentCollectionPostRoute");
	let name = JSON.stringify(request.body.name);
	console.log("» name: " + name);
	let url = JSON.stringify(request.body.url);
	url = url.replaceAll("\"", "");
	console.log("» url: " + url);
	var environment = new Environment(name, url);
	environments.push(environment);
	response.json(environment).status(200).end();
}
app.post(ENVIRONMENT_COLLECTION_ROUTE, EnvironmentCollectionPostRoute);

function EnvironmentCollectionPutRoute(request, response, next) {
	console.log("EnvironmentCollectionPutRoute");
	response.status(200).end();
}
app.put(ENVIRONMENT_COLLECTION_ROUTE, EnvironmentCollectionPutRoute);

// Environment Item
const ENVIRONMENT_ITEM_ROUTE = "/environments/:environment_id";
function EnvironmentItemDeleteRoute(request, response, next) {
	console.log("EnvironmentItemDeleteRoute");
	let environment_id = request.params.environment_id;
	console.log("» environment_id: " + environment_id);
	environments.splice(environments.findIndex(v => v.id == environment_id), 1);
	response.status(200).end();
}
app.delete(ENVIRONMENT_ITEM_ROUTE, EnvironmentItemDeleteRoute);

function EnvironmentItemGetRoute(request, response, next) {
	console.log("EnvironmentItemGetRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.get(ENVIRONMENT_ITEM_ROUTE, EnvironmentItemGetRoute);

function EnvironmentItemOptionsRoute(request, response, next) {
	console.log("EnvironmentItemOptionsRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.options(ENVIRONMENT_ITEM_ROUTE, EnvironmentItemOptionsRoute);

function EnvironmentItemPatchRoute(request, response, next) {
	console.log("EnvironmentItemPatchRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.patch(ENVIRONMENT_ITEM_ROUTE, EnvironmentItemPatchRoute);

function EnvironmentItemPostRoute(request, response, next) {
	console.log("EnvironmentItemPostRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.post(ENVIRONMENT_ITEM_ROUTE, EnvironmentItemPostRoute);

function EnvironmentItemPutRoute(request, response, next) {
	console.log("EnvironmentItemPutRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.put(ENVIRONMENT_ITEM_ROUTE, EnvironmentItemPutRoute);

// Service Collection by Beacon
const SERVICE_COLLECTION_BY_BEACON_ROUTE = "/beacons/:beacon_id/services";
function ServiceCollectionByBeaconDeleteRoute(request, response, next) {
	console.log("ServiceCollectionByBeaconDeleteRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.delete(SERVICE_COLLECTION_BY_BEACON_ROUTE, ServiceCollectionByBeaconDeleteRoute);

function ServiceCollectionByBeaconGetRoute(request, response, next) {
	console.log("ServiceCollectionByBeaconGetRoute");
	let beacon_id = request.params.beacon_id;
	console.log("» beacon_id: " + beacon_id);
	
	let beaconIndex = beacons.findIndex(v => v.id == beacon_id);
	if (beaconIndex == INVALID_INDEX)
		return response.status(400).json({message:"beaconIndex == INVALID_INDEX"});
	
	response.json(beacons[beaconIndex].services).status(200).end();
}
app.get(SERVICE_COLLECTION_BY_BEACON_ROUTE, ServiceCollectionByBeaconGetRoute);

function ServiceCollectionByBeaconOptionsRoute(request, response, next) {
	console.log("ServiceCollectionByBeaconOptionsRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.options(SERVICE_COLLECTION_BY_BEACON_ROUTE, ServiceCollectionByBeaconOptionsRoute);

function ServiceCollectionByBeaconPatchRoute(request, response, next) {
	console.log("ServiceCollectionByBeaconPatchRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.patch(SERVICE_COLLECTION_BY_BEACON_ROUTE, ServiceCollectionByBeaconPatchRoute);

function ServiceCollectionByBeaconPostRoute(request, response, next) {
	console.log("ServiceCollectionByBeaconPostRoute");
	let beacon_id = request.params.beacon_id;
	console.log("» beacon_id: " + beacon_id);	
	var name = request.body.name;
	name = name.replaceAll("\"", "");
	console.log("» name: " + name);
	
	let beaconIndex = beacons.findIndex(v => v.id == beacon_id);	
	if (beaconIndex == INVALID_INDEX)
		return response.status(400).json({message:"beaconIndex == INVALID_INDEX"});
	else if (beacons[beaconIndex] == null)
		return response.status(400).json({message:"beacons[beaconIndex] == null"});

	let serviceIndex = services.findIndex(v => v.name == name);
	var service = null;
	if (serviceIndex == INVALID_INDEX)
		service = new Service(name);
	else if (services[serviceIndex] == null)
		return response.status(400).json({message:"services[serviceIndex] == null"});
	else {
		service = services[serviceIndex];
		beacons[beaconIndex].removeService(service);
	}
	beacons[beaconIndex].addService(service);
	
	for(var merchant of merchants) {
		for(var facility of merchant.facilities) {
			for(var environment of facility.environments) {
				let beaconIndex = environment.beacons.findIndex(v => v.id == beacon_id);
				if (beaconIndex != INVALID_INDEX) {
					environment.beacons[beaconIndex].removeService(service);
					environment.beacons[beaconIndex].addService(service);
				}
			}
		}
	}
	
	response.json(service).status(200).end();
}
app.post(SERVICE_COLLECTION_BY_BEACON_ROUTE, ServiceCollectionByBeaconPostRoute);

function ServiceCollectionByBeaconPutRoute(request, response, next) {
	console.log("ServiceCollectionByBeaconPutRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.put(SERVICE_COLLECTION_BY_BEACON_ROUTE, ServiceCollectionByBeaconPutRoute);

// Device Collection by Beacon
const DEVICE_COLLECTION_BY_BEACON_ROUTE = "/beacons/:beacon_id/devices";
function DeviceCollectionByBeaconDeleteRoute(request, response, next) {
	console.log("DeviceCollectionByBeaconDeleteRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.delete(DEVICE_COLLECTION_BY_BEACON_ROUTE, DeviceCollectionByBeaconDeleteRoute);

function DeviceCollectionByBeaconGetRoute(request, response, next) {
	console.log("DeviceCollectionByBeaconGetRoute");
	let beacon_id = request.params.beacon_id;
	console.log("» beacon_id: " + beacon_id);
	let index = beacons.findIndex(v => v.id == beacon_id);
	if (beacons[index] == null)
		response.status(400).end();
	response.json(beacons[index].devices).status(200).end();
}
app.get(DEVICE_COLLECTION_BY_BEACON_ROUTE, DeviceCollectionByBeaconGetRoute);

function DeviceCollectionByBeaconOptionsRoute(request, response, next) {
	console.log("DeviceCollectionByBeaconOptionsRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.options(DEVICE_COLLECTION_BY_BEACON_ROUTE, DeviceCollectionByBeaconOptionsRoute);

function DeviceCollectionByBeaconPatchRoute(request, response, next) {
	console.log("DeviceCollectionByBeaconPatchRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.patch(DEVICE_COLLECTION_BY_BEACON_ROUTE, DeviceCollectionByBeaconPatchRoute);

function DeviceCollectionByBeaconPostRoute(request, response, next) {
	console.log("DeviceCollectionByBeaconPostRoute");
	let beacon_id = request.params.beacon_id;
	console.log("» beacon_id: " + beacon_id);
	let device_id = request.body.device_id;
	console.log("» device_id: " + device_id);
	
	let beaconIndex = beacons.findIndex(v => v.id == beacon_id);	
	if (beaconIndex == INVALID_INDEX)
		return response.status(400).json({message:"beaconIndex == INVALID_INDEX"});
	else if (beacons[beaconIndex] == null)
		return response.status(400).json({message:"beacons[beaconIndex] == null"});
	
	let deviceIndex = devices.findIndex(v => v.id == device_id);
	if (deviceIndex == INVALID_INDEX)
		return response.status(400).json({message:"deviceIndex == INVALID_INDEX"});
	else if (devices[deviceIndex] == null)
		return response.status(400).json({message:"devices[deviceIndex] == null"});
	
	devices[deviceIndex].status = Status.FOUND;
	beacons[beaconIndex].devices.push(devices[deviceIndex]);
	
	var rv_environment = null;
	for(var merchant of merchants) {
		for(var facility of merchant.facilities) {
			for(var environment of facility.environments) {
				let beaconIndex = environment.beacons.findIndex(v => v.id == beacon_id);
				if (beaconIndex != INVALID_INDEX) {
					environment.beacons[beaconIndex].removeDevice(devices[deviceIndex]);
					environment.beacons[beaconIndex].addDevice(devices[deviceIndex]);
					rv_environment = environment;
				}
			}
		}
	}
		
	response.json(rv_environment).status(200).end();
}
app.post(DEVICE_COLLECTION_BY_BEACON_ROUTE, DeviceCollectionByBeaconPostRoute);

function DeviceCollectionByBeaconPutRoute(request, response, next) {
	console.log("DeviceCollectionByBeaconPutRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.put(DEVICE_COLLECTION_BY_BEACON_ROUTE, DeviceCollectionByBeaconPutRoute);

// Device Item by Beacon
const DEVICE_ITEM_BY_BEACON_ROUTE = "/beacons/:beacon_id/devices/:device_id";
function DeviceItemByBeaconDeleteRoute(request, response, next) {
	console.log("DeviceItemByBeaconDeleteRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.delete(DEVICE_ITEM_BY_BEACON_ROUTE, DeviceItemByBeaconDeleteRoute);

function DeviceItemByBeaconGetRoute(request, response, next) {
	console.log("DeviceItemByBeaconGetRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.get(DEVICE_ITEM_BY_BEACON_ROUTE, DeviceItemByBeaconGetRoute);

function DeviceItemByBeaconOptionsRoute(request, response, next) {
	console.log("DeviceItemByBeaconOptionsRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.options(DEVICE_ITEM_BY_BEACON_ROUTE, DeviceItemByBeaconOptionsRoute);

function DeviceItemByBeaconPatchRoute(request, response, next) {
	console.log("DeviceItemByBeaconPatchRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.patch(DEVICE_ITEM_BY_BEACON_ROUTE, DeviceItemByBeaconPatchRoute);

function DeviceItemByBeaconPostRoute(request, response, next) {
	console.log("DeviceItemByBeaconPostRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.post(DEVICE_ITEM_BY_BEACON_ROUTE, DeviceItemByBeaconPostRoute);

function DeviceItemByBeaconPutRoute(request, response, next) {
	console.log("DeviceItemByBeaconPutRoute");
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.put(DEVICE_ITEM_BY_BEACON_ROUTE, DeviceItemByBeaconPutRoute);

// Device Item Status by Beacon
const DEVICE_ITEM_STATUS_BY_BEACON_ROUTE = "/beacons/:beacon_id/devices/:device_id/status";
function DeviceItemStatusByBeaconDeleteRoute(request, response, next) {
	console.log("DeviceItemStatusByBeaconDeleteRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.delete(DEVICE_ITEM_STATUS_BY_BEACON_ROUTE, DeviceItemStatusByBeaconDeleteRoute);

function DeviceItemStatusByBeaconGetRoute(request, response, next) {
	console.log("DeviceItemStatusByBeaconGetRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.get(DEVICE_ITEM_STATUS_BY_BEACON_ROUTE, DeviceItemStatusByBeaconGetRoute);

function DeviceItemStatusByBeaconOptionsRoute(request, response, next) {
	console.log("DeviceItemStatusByBeaconOptionsRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.options(DEVICE_ITEM_STATUS_BY_BEACON_ROUTE, DeviceItemStatusByBeaconOptionsRoute);

function DeviceItemStatusByBeaconPatchRoute(request, response, next) {
	console.log("DeviceItemStatusByBeaconPatchRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.patch(DEVICE_ITEM_STATUS_BY_BEACON_ROUTE, DeviceItemStatusByBeaconPatchRoute);

function DeviceItemStatusByBeaconPostRoute(request, response, next) {
	console.log("DeviceItemStatusByBeaconPostRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.post(DEVICE_ITEM_STATUS_BY_BEACON_ROUTE, DeviceItemStatusByBeaconPostRoute);

function DeviceItemStatusByBeaconPutRoute(request, response, next) {
	console.log("DeviceItemStatusByBeaconPutRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.put(DEVICE_ITEM_STATUS_BY_BEACON_ROUTE, DeviceItemStatusByBeaconPutRoute);

// Facility Collection
const FACILITY_COLLECTION_ROUTE = "/facilities";
function FacilityCollectionDeleteRoute(request, response, next) {
	console.log("FacilityCollectionDeleteRoute");
	facilities = [];
	facilityIndex = 0;
	response.status(200).end();
}
app.delete(FACILITY_COLLECTION_ROUTE, FacilityCollectionDeleteRoute);

function FacilityCollectionGetRoute(request, response, next) {
	console.log("FacilityCollectionGetRoute");
	response.json(facilities).status(200).end();
}
app.get(FACILITY_COLLECTION_ROUTE, FacilityCollectionGetRoute);

function FacilityCollectionOptionsRoute(request, response, next) {
	console.log("FacilityCollectionOptionsRoute");
	response.status(200).end();
}
app.options(FACILITY_COLLECTION_ROUTE, FacilityCollectionOptionsRoute);

function FacilityCollectionPatchRoute(request, response, next) {
	console.log("FacilityCollectionPatchRoute");
	response.status(200).end();
}
app.patch(FACILITY_COLLECTION_ROUTE, FacilityCollectionPatchRoute);

function FacilityCollectionPostRoute(request, response, next) {
	console.log("FacilityCollectionPostRoute");
	let name = JSON.stringify(request.body.name);
	console.log("» name: " + name);
	var facility = new Facility(name);
	facilities.push(facility);
	response.json(facility).status(200).end();
}
app.post(FACILITY_COLLECTION_ROUTE, FacilityCollectionPostRoute);

function FacilityCollectionPutRoute(request, response, next) {
	console.log("FacilityCollectionPutRoute");
	response.status(200).end();
}
app.put(FACILITY_COLLECTION_ROUTE, FacilityCollectionPutRoute);

// Facility Item
const FACILITY_ITEM_ROUTE = "/facilities/:facility_id";
function FacilityItemDeleteRoute(request, response, next) {
	console.log("FacilityItemDeleteRoute");
	let facility_id = request.params.facility_id;
	console.log("» facility_id: " + facility_id);
	facilities.splice(facilities.findIndex(v => v.id == facility_id), 1);
	response.status(200).end();
}
app.delete(FACILITY_ITEM_ROUTE, FacilityItemDeleteRoute);

function FacilityItemGetRoute(request, response, next) {
	console.log("FacilityItemGetRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.get(FACILITY_ITEM_ROUTE, FacilityItemGetRoute);

function FacilityItemOptionsRoute(request, response, next) {
	console.log("FacilityItemOptionsRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.options(FACILITY_ITEM_ROUTE, FacilityItemOptionsRoute);

function FacilityItemPatchRoute(request, response, next) {
	console.log("FacilityItemPatchRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.patch(FACILITY_ITEM_ROUTE, FacilityItemPatchRoute);

function FacilityItemPostRoute(request, response, next) {
	console.log("FacilityItemPostRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.post(FACILITY_ITEM_ROUTE, FacilityItemPostRoute);

function FacilityItemPutRoute(request, response, next) {
	console.log("FacilityItemPutRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.put(FACILITY_ITEM_ROUTE, FacilityItemPutRoute);

// Beacon Collection By Environment
const BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE = "/environments/:environment_id/beacons";
function BeaconCollectionByEnvironmentDeleteRoute(request, response, next) {
	console.log("BeaconCollectionByEnvironmentDeleteRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.delete(BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE, BeaconCollectionByEnvironmentDeleteRoute);

function BeaconCollectionByEnvironmentGetRoute(request, response, next) {
	console.log("BeaconCollectionByEnvironmentGetRoute");
	let environment_id = request.params.environment_id;
	console.log("» environment_id: " + environment_id);
	let environmentIndex = environments.findIndex(v => v.id == environment_id);
	if (environmentIndex == INVALID_INDEX) {
		console.log("» RETURN: " + JSON.stringify({message:"environmentIndex == INVALID_INDEX"}));
		return response.status(400).json({message:"environmentIndex == INVALID_INDEX"});
	} else if (environments[environmentIndex] == null) {
		console.log("» RETURN: " + JSON.stringify({message:"environments[environmentIndex] == null"}));
		return response.status(400).json({message:"environments[environmentIndex] == null"});
	} else {
		console.log("» RETURN: " + JSON.stringify(environments[environmentIndex].beacons));
		response.json(environments[environmentIndex].beacons).status(200).end();
	}
}
app.get(BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE, BeaconCollectionByEnvironmentGetRoute);

function BeaconCollectionByEnvironmentOptionsRoute(request, response, next) {
	console.log("BeaconCollectionByEnvironmentOptionsRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.options(BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE, BeaconCollectionByEnvironmentOptionsRoute);

function BeaconCollectionByEnvironmentPatchRoute(request, response, next) {
	console.log("BeaconCollectionByEnvironmentPatchRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.patch(BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE, BeaconCollectionByEnvironmentPatchRoute);

function BeaconCollectionByEnvironmentPostRoute(request, response, next) {
	try {
		
		console.log("BeaconCollectionByEnvironmentPostRoute");
		let environment_id = request.params.environment_id;
		console.log("» environment_id: " + environment_id);
		let beacon_id = request.body.beacon_id;
		console.log("» beacon_id: " + beacon_id);
		
		let environmentIndex = environments.findIndex(v => v.id == environment_id);	
		let beaconIndex = beacons.findIndex(v => v.id == beacon_id);
		if (environments[environmentIndex] == null)
			response.status(400).end();
		environments[environmentIndex].beacons.push(beacons[beaconIndex]);
		
		for(var merchant of merchants) {
			for(var facility of merchant.facilities) {
				let environmentIndex = facility.environments.findIndex(v => v.id == environment_id);
				if (environmentIndex > 0)
					facility.environments[environmentIndex].beacons.push(beacons[beaconIndex]);
			}
		}
		
		response.json(environments[environmentIndex].beacons).status(200).end();
		
	} catch (error) {
		let message = {
			message: error.message
		};
		if (error instanceof ReferenceError) {
			response.json(message).status(400).end();
		} else if (error instanceof TypeError) {
			response.json(message).status(400).end();
		} else {
			response.json(message).status(400).end();
		}
	}
}
app.post(BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE, BeaconCollectionByEnvironmentPostRoute);

function BeaconCollectionByEnvironmentPutRoute(request, response, next) {
	console.log("BeaconCollectionByEnvironmentPutRoute");
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.put(BEACON_COLLECTION_BY_ENVIRONMENT_ROUTE, BeaconCollectionByEnvironmentPutRoute);

// Beacon Item By Environment
const BEACON_ITEM_BY_ENVIRONMENT_ROUTE = "/environments/:environment_id/beacons/:beacon_id";
function BeaconItemByEnvironmentDeleteRoute(request, response, next) {
	console.log("BeaconItemByEnvironmentDeleteRoute");
	console.log("» environment_id: " + request.params.environment_id);
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.delete(BEACON_ITEM_BY_ENVIRONMENT_ROUTE, BeaconItemByEnvironmentDeleteRoute);

function BeaconItemByEnvironmentGetRoute(request, response, next) {
	console.log("BeaconItemByEnvironmentGetRoute");
	console.log("» environment_id: " + request.params.environment_id);
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.get(BEACON_ITEM_BY_ENVIRONMENT_ROUTE, BeaconItemByEnvironmentGetRoute);

function BeaconItemByEnvironmentOptionsRoute(request, response, next) {
	console.log("BeaconItemByEnvironmentOptionsRoute");
	console.log("» environment_id: " + request.params.environment_id);
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.options(BEACON_ITEM_BY_ENVIRONMENT_ROUTE, BeaconItemByEnvironmentOptionsRoute);

function BeaconItemByEnvironmentPatchRoute(request, response, next) {
	console.log("BeaconItemByEnvironmentPatchRoute");
	console.log("» environment_id: " + request.params.environment_id);
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.patch(BEACON_ITEM_BY_ENVIRONMENT_ROUTE, BeaconItemByEnvironmentPatchRoute);

function BeaconItemByEnvironmentPostRoute(request, response, next) {
	console.log("BeaconItemByEnvironmentPostRoute");
	console.log("» environment_id: " + request.params.environment_id);
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.post(BEACON_ITEM_BY_ENVIRONMENT_ROUTE, BeaconItemByEnvironmentPostRoute);

function BeaconItemByEnvironmentPutRoute(request, response, next) {
	console.log("BeaconItemByEnvironmentPutRoute");
	console.log("» environment_id: " + request.params.environment_id);
	console.log("» beacon_id: " + request.params.beacon_id);
	response.status(200).end();
}
app.put(BEACON_ITEM_BY_ENVIRONMENT_ROUTE, BeaconItemByEnvironmentPutRoute);

// Environment Collection By Facility
const ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE = "/facilities/:facility_id/environments";
function EnvironmentCollectionByFacilityDeleteRoute(request, response, next) {
	console.log("EnvironmentCollectionByFacilityDeleteRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.delete(ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE, EnvironmentCollectionByFacilityDeleteRoute);

function EnvironmentCollectionByFacilityGetRoute(request, response, next) {
	console.log("EnvironmentCollectionByFacilityGetRoute");
	let facility_id = request.params.facility_id;
	console.log("» facility_id: " + facility_id);
	let index = facilities.findIndex(v => v.id == facility_id);
	response.json(facilities[index].environments).status(200).end();
}
app.get(ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE, EnvironmentCollectionByFacilityGetRoute);

function EnvironmentCollectionByFacilityOptionsRoute(request, response, next) {
	console.log("EnvironmentCollectionByFacilityOptionsRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.options(ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE, EnvironmentCollectionByFacilityOptionsRoute);

function EnvironmentCollectionByFacilityPatchRoute(request, response, next) {
	console.log("EnvironmentCollectionByFacilityPatchRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.patch(ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE, EnvironmentCollectionByFacilityPatchRoute);

function EnvironmentCollectionByFacilityPostRoute(request, response, next) {
	console.log("EnvironmentCollectionByFacilityPostRoute");
	let facility_id = request.params.facility_id;
	console.log("» facility_id: " + facility_id);
	let environment_id = request.body.environment_id;
	console.log("» environment_id: " + environment_id);
	
	let facilityIndex = facilities.findIndex(v => v.id == facility_id);	
	let environmentIndex = environments.findIndex(v => v.id == environment_id);
	if (facilities[facilityIndex] == null)
		response.status(400).end();
	facilities[facilityIndex].environments.push(environments[environmentIndex]);
	
	for(var merchant of merchants) {
		let facilityIndex = merchant.facilities.findIndex(v => v.id == facility_id);
		if (facilityIndex > 0)
			merchant.facilities[facilityIndex].environments.push(environments[environmentIndex]);
	}
	
	response.json(facilities[facilityIndex].environments).status(200).end();

}
app.post(ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE, EnvironmentCollectionByFacilityPostRoute);

function EnvironmentCollectionByFacilityPutRoute(request, response, next) {
	console.log("EnvironmentCollectionByFacilityPutRoute");
	console.log("» facility_id: " + request.params.facility_id);
	response.status(200).end();
}
app.put(ENVIRONMENT_COLLECTION_BY_FACILITY_ROUTE, EnvironmentCollectionByFacilityPutRoute);

// Environment Item By Facility
const ENVIRONMENT_ITEM_BY_FACILITY_ROUTE = "/facilities/:facility_id/environments/:environment_id";
function EnvironmentItemByFacilityDeleteRoute(request, response, next) {
	console.log("EnvironmentItemByFacilityDeleteRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.delete(ENVIRONMENT_ITEM_BY_FACILITY_ROUTE, EnvironmentItemByFacilityDeleteRoute);

function EnvironmentItemByFacilityGetRoute(request, response, next) {
	console.log("EnvironmentItemByFacilityGetRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.get(ENVIRONMENT_ITEM_BY_FACILITY_ROUTE, EnvironmentItemByFacilityGetRoute);

function EnvironmentItemByFacilityOptionsRoute(request, response, next) {
	console.log("EnvironmentItemByFacilityOptionsRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.options(ENVIRONMENT_ITEM_BY_FACILITY_ROUTE, EnvironmentItemByFacilityOptionsRoute);

function EnvironmentItemByFacilityPatchRoute(request, response, next) {
	console.log("EnvironmentItemByFacilityPatchRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.patch(ENVIRONMENT_ITEM_BY_FACILITY_ROUTE, EnvironmentItemByFacilityPatchRoute);

function EnvironmentItemByFacilityPostRoute(request, response, next) {
	console.log("EnvironmentItemByFacilityPostRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.post(ENVIRONMENT_ITEM_BY_FACILITY_ROUTE, EnvironmentItemByFacilityPostRoute);

function EnvironmentItemByFacilityPutRoute(request, response, next) {
	console.log("EnvironmentItemByFacilityPutRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» environment_id: " + request.params.environment_id);
	response.status(200).end();
}
app.put(ENVIRONMENT_ITEM_BY_FACILITY_ROUTE, EnvironmentItemByFacilityPutRoute);

// Merchant Collection
const MERCHANT_COLLECTION_ROUTE = "/merchants";
function MerchantCollectionDeleteRoute(request, response, next) {
	console.log("MerchantCollectionDeleteRoute");
	merchants = [];
	merchantIndex = 0;
	response.status(200).end();
}
app.delete(MERCHANT_COLLECTION_ROUTE, MerchantCollectionDeleteRoute);

function MerchantCollectionGetRoute(request, response, next) {
	console.log("MerchantCollectionGetRoute");
	response.json(merchants).status(200).end();
}
app.get(MERCHANT_COLLECTION_ROUTE, MerchantCollectionGetRoute);

function MerchantCollectionOptionsRoute(request, response, next) {
	console.log("MerchantCollectionOptionsRoute");
	response.status(200).end();
}
app.options(MERCHANT_COLLECTION_ROUTE, MerchantCollectionOptionsRoute);

function MerchantCollectionPatchRoute(request, response, next) {
	console.log("MerchantCollectionPatchRoute");
	response.status(200).end();
}
app.patch(MERCHANT_COLLECTION_ROUTE, MerchantCollectionPatchRoute);

function MerchantCollectionPostRoute(request, response, next) {
	console.log("MerchantCollectionPostRoute");
	let name = JSON.stringify(request.body.name);
	console.log("» name: " + name);
	var merchant = new Merchant(name);
	merchants.push(merchant);
	response.json(merchant).status(200).end();
}
app.post(MERCHANT_COLLECTION_ROUTE, MerchantCollectionPostRoute);

function MerchantCollectionPutRoute(request, response, next) {
	console.log("MerchantCollectionPutRoute");
	response.status(200).end();
}
app.put(MERCHANT_COLLECTION_ROUTE, MerchantCollectionPutRoute);

// Merchant Item
const MERCHANT_ITEM_ROUTE = "/merchants/:merchant_id";
function MerchantItemDeleteRoute(request, response, next) {
	console.log("MerchantItemDeleteRoute");
	let merchant_id = request.params.merchant_id;
	console.log("» merchant_id: " + merchant_id);
	merchants.splice(merchants.findIndex(v => v.id == merchant_id), 1);
	response.status(200).end();
}
app.delete(MERCHANT_ITEM_ROUTE, MerchantItemDeleteRoute);

function MerchantItemGetRoute(request, response, next) {
	console.log("MerchantItemGetRoute");
	let merchant_id = request.params.merchant_id;
	console.log("» merchant_id: " + merchant_id);
	let index = merchants.findIndex(v => v.id == merchant_id);
	response.json(merchants[index]).status(200).end();
}
app.get(MERCHANT_ITEM_ROUTE, MerchantItemGetRoute);

function MerchantItemOptionsRoute(request, response, next) {
	console.log("MerchantItemOptionsRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.options(MERCHANT_ITEM_ROUTE, MerchantItemOptionsRoute);

function MerchantItemPatchRoute(request, response, next) {
	console.log("MerchantItemPatchRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.patch(MERCHANT_ITEM_ROUTE, MerchantItemPatchRoute);

function MerchantItemPostRoute(request, response, next) {
	console.log("MerchantItemPostRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.post(MERCHANT_ITEM_ROUTE, MerchantItemPostRoute);

function MerchantItemPutRoute(request, response, next) {
	console.log("MerchantItemPutRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.put(MERCHANT_ITEM_ROUTE, MerchantItemPutRoute);

// Facility Collection By Merchant
const FACILITY_COLLECTION_BY_MERCHANT_ROUTE = "/merchants/:merchant_id/facilities";
function FacilityCollectionByMerchantDeleteRoute(request, response, next) {
	console.log("FacilityCollectionByMerchantDeleteRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.delete(FACILITY_COLLECTION_BY_MERCHANT_ROUTE, FacilityCollectionByMerchantDeleteRoute);

function FacilityCollectionByMerchantGetRoute(request, response, next) {
	console.log("FacilityCollectionByMerchantGetRoute");
	let merchant_id = request.params.merchant_id;
	console.log("» merchant_id: " + merchant_id);
	let index = merchants.findIndex(v => v.id == merchant_id);
	if (merchants[index] == null)
		response.status(400).end();
	response.json(merchants[index].facilities).status(200).end();
}
app.get(FACILITY_COLLECTION_BY_MERCHANT_ROUTE, FacilityCollectionByMerchantGetRoute);

function FacilityCollectionByMerchantOptionsRoute(request, response, next) {
	console.log("FacilityCollectionByMerchantOptionsRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.options(FACILITY_COLLECTION_BY_MERCHANT_ROUTE, FacilityCollectionByMerchantOptionsRoute);

function FacilityCollectionByMerchantPatchRoute(request, response, next) {
	console.log("FacilityCollectionByMerchantPatchRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.patch(FACILITY_COLLECTION_BY_MERCHANT_ROUTE, FacilityCollectionByMerchantPatchRoute);

function FacilityCollectionByMerchantPostRoute(request, response, next) {
	console.log("FacilityCollectionByMerchantPostRoute");
	let merchant_id = request.params.merchant_id;
	console.log("» merchant_id: " + merchant_id);
	let facility_id = request.body.facility_id;
	console.log("» facility_id: " + facility_id);

	let merchantIndex = merchants.findIndex(v => v.id == merchant_id);
	let facilityIndex = facilities.findIndex(v => v.id == facility_id);
	merchants[merchantIndex].addFacility(facilities[facilityIndex]);
	
	response.json(merchants[merchantIndex].facilities).status(200).end();
}
app.post(FACILITY_COLLECTION_BY_MERCHANT_ROUTE, FacilityCollectionByMerchantPostRoute);

function FacilityCollectionByMerchantPutRoute(request, response, next) {
	console.log("FacilityCollectionByMerchantPutRoute");
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.put(FACILITY_COLLECTION_BY_MERCHANT_ROUTE, FacilityCollectionByMerchantPutRoute);

// Facility Item By Merchant
const FACILITY_ITEM_BY_MERCHANT_ROUTE = "/merchants/:merchant_id/facilities/:facility_id";
function FacilityItemByMerchantDeleteRoute(request, response, next) {
	console.log("FacilityItemByMerchantDeleteRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.delete(FACILITY_ITEM_BY_MERCHANT_ROUTE, FacilityItemByMerchantDeleteRoute);

function FacilityItemByMerchantGetRoute(request, response, next) {
	console.log("FacilityItemByMerchantGetRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.get(FACILITY_ITEM_BY_MERCHANT_ROUTE, FacilityItemByMerchantGetRoute);

function FacilityItemByMerchantOptionsRoute(request, response, next) {
	console.log("FacilityItemByMerchantOptionsRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.options(FACILITY_ITEM_BY_MERCHANT_ROUTE, FacilityItemByMerchantOptionsRoute);

function FacilityItemByMerchantPatchRoute(request, response, next) {
	console.log("FacilityItemByMerchantPatchRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.patch(FACILITY_ITEM_BY_MERCHANT_ROUTE, FacilityItemByMerchantPatchRoute);

function FacilityItemByMerchantPostRoute(request, response, next) {
	console.log("FacilityItemByMerchantPostRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.post(FACILITY_ITEM_BY_MERCHANT_ROUTE, FacilityItemByMerchantPostRoute);

function FacilityItemByMerchantPutRoute(request, response, next) {
	console.log("FacilityItemByMerchantPutRoute");
	console.log("» facility_id: " + request.params.facility_id);
	console.log("» merchant_id: " + request.params.merchant_id);
	response.status(200).end();
}
app.put(FACILITY_ITEM_BY_MERCHANT_ROUTE, FacilityItemByMerchantPutRoute);

// Device Collection By Service
const DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE = "/beacons/:beacon_id/services/:service_id/devices";
function DeviceCollectionByServiceDeleteRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDeleteRoute");
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.delete(DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE, DeviceCollectionByServiceDeleteRoute);

function DeviceCollectionByServiceGetRoute(request, response, next) {
	console.log("DeviceCollectionByServiceGetRoute");
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.get(DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE, DeviceCollectionByServiceGetRoute);

function DeviceCollectionByServiceOptionsRoute(request, response, next) {
	console.log("DeviceCollectionByServiceOptionsRoute");
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.options(DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE, DeviceCollectionByServiceOptionsRoute);

function DeviceCollectionByServicePatchRoute(request, response, next) {
	console.log("DeviceCollectionByServicePatchRoute");
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.patch(DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE, DeviceCollectionByServicePatchRoute);

function DeviceCollectionByServicePostRoute(request, response, next) {
	console.log("DeviceCollectionByServicePostRoute");
	let beacon_id = request.params.beacon_id;
	console.log("» beacon_id: " + beacon_id);
	let service_id = request.params.service_id;
	console.log("» service_id: " + service_id);
	let device_id = request.body.device_id;
	console.log("» device_id: " + device_id);
	
	let beaconIndex = beacons.findIndex(v => v.id == beacon_id);	
	if (beaconIndex == INVALID_INDEX)
		return response.status(400).json({message:"beaconIndex == INVALID_INDEX"});
	else if (beacons[beaconIndex] == null)
		return response.status(400).json({message:"beacons[beaconIndex] == null"});

	let serviceIndex = services.findIndex(v => v.name == name);
	if (serviceIndex == INVALID_INDEX)
		return response.status(400).json({message:"serviceIndex == INVALID_INDEX"});
	else if (services[serviceIndex] == null)
		return response.status(400).json({message:"services[serviceIndex] == null"});

	let deviceIndex = devices.findIndex(v => v.id == device_id);
	if (deviceIndex == INVALID_INDEX)
		return response.status(400).json({message:"deviceIndex == INVALID_INDEX"});
	else if (devices[deviceIndex] == null)
		return response.status(400).json({message:"devices[deviceIndex] == null"});

	devices[deviceIndex].status == Status.CONNECTED;
	service = services[serviceIndex];
	service.addDevice(devices[deviceIndex]);
	
	for(var merchant of merchants) {
		for(var facility of merchant.facilities) {
			for(var environment of facility.environments) {
				for(var beacon of environment.beacons) {
					if (beacon.id == beacon_id)
						for(var service of beacon.services) {
							if (service.id == service_id) {
								service.addDevice(devices[deviceIndex]);
								return response.json(service).status(200).end();
							}
						}
				}
			}
		}
	}
}
app.post(DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE, DeviceCollectionByServicePostRoute);

function DeviceCollectionByServicePutRoute(request, response, next) {
	console.log("DeviceCollectionByServicePutRoute");
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.put(DEVICE_COLLECTION_BY_BEACON_SERVICE_ROUTE, DeviceCollectionByServicePutRoute);

// Device Item By Service
const DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE = "/beacons/:beacon_id/services/:service_id/devices/:device_id";
function DeviceItemByServiceDeleteRoute(request, response, next) {
	console.log("DeviceItemByServiceDeleteRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.delete(DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE, DeviceItemByServiceDeleteRoute);

function DeviceItemByServiceGetRoute(request, response, next) {
	console.log("DeviceItemByServiceGetRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.get(DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE, DeviceItemByServiceGetRoute);

function DeviceItemByServiceOptionsRoute(request, response, next) {
	console.log("DeviceItemByServiceOptionsRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.options(DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE, DeviceItemByServiceOptionsRoute);

function DeviceItemByServicePatchRoute(request, response, next) {
	console.log("DeviceItemByServicePatchRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.patch(DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE, DeviceItemByServicePatchRoute);

function DeviceItemByServicePostRoute(request, response, next) {
	console.log("DeviceItemByServicePostRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.post(DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE, DeviceItemByServicePostRoute);

function DeviceItemByServicePutRoute(request, response, next) {
	console.log("DeviceItemByServicePutRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.put(DEVICE_ITEM_BY_BEACON_SERVICE_BEACON_ROUTE, DeviceItemByServicePutRoute);

// Session Collection By Service and Device
const SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE = "/services/:service_id/devices/:device_id/sessions";
function DeviceCollectionByServiceDeviceDeleteRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDeviceDeleteRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.delete(SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE, DeviceCollectionByServiceDeviceDeleteRoute);

function DeviceCollectionByServiceDeviceGetRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDeviceGetRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.get(SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE, DeviceCollectionByServiceDeviceGetRoute);

function DeviceCollectionByServiceDeviceOptionsRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDeviceOptionsRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.options(SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE, DeviceCollectionByServiceDeviceOptionsRoute);

function DeviceCollectionByServiceDevicePatchRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDevicePatchRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.patch(SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE, DeviceCollectionByServiceDevicePatchRoute);

function DeviceCollectionByServiceDevicePostRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDevicePostRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.post(SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE, DeviceCollectionByServiceDevicePostRoute);

function DeviceCollectionByServiceDevicePutRoute(request, response, next) {
	console.log("DeviceCollectionByServiceDevicePutRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	response.status(200).end();
}
app.put(SESSION_COLLECTION_BY_SERVICE_DEVICE_ROUTE, DeviceCollectionByServiceDevicePutRoute);

// Session Item By Service and Device
const SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE = "/services/:service_id/devices/:device_id/sessions/:session_id";
function DeviceItemByServiceDeviceDeleteRoute(request, response, next) {
	console.log("DeviceItemByServiceDeviceDeleteRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.delete(SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE, DeviceItemByServiceDeviceDeleteRoute);

function DeviceItemByServiceDeviceGetRoute(request, response, next) {
	console.log("DeviceItemByServiceDeviceGetRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.get(SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE, DeviceItemByServiceDeviceGetRoute);

function DeviceItemByServiceDeviceOptionsRoute(request, response, next) {
	console.log("DeviceItemByServiceDeviceOptionsRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.options(SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE, DeviceItemByServiceDeviceOptionsRoute);

function DeviceItemByServiceDevicePatchRoute(request, response, next) {
	console.log("DeviceItemByServiceDevicePatchRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.patch(SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE, DeviceItemByServiceDevicePatchRoute);

function DeviceItemByServiceDevicePostRoute(request, response, next) {
	console.log("DeviceItemByServiceDevicePostRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.post(SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE, DeviceItemByServiceDevicePostRoute);

function DeviceItemByServiceDevicePutRoute(request, response, next) {
	console.log("DeviceItemByServiceDevicePutRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.put(SESSION_ITEM_BY_SERVICE_DEVICE_ROUTE, DeviceItemByServiceDevicePutRoute);

// Data Collection By Beacon and Device
const DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE = "/beacons/:beacon_id/devices/:device_id/data";
function DataCollectionByBeaconDeviceDeleteRoute(request, response, next) {
	console.log("DataCollectionByBeaconDeviceDeleteRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.delete(DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE, DataCollectionByBeaconDeviceDeleteRoute);

function DataCollectionByBeaconDeviceGetRoute(request, response, next) {
	console.log("DataCollectionByBeaconDeviceGetRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.get(DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE, DataCollectionByBeaconDeviceGetRoute);

function DataCollectionByBeaconDeviceOptionsRoute(request, response, next) {
	//console.log("DataCollectionByBeaconDeviceOptionsRoute");
	//console.log("» beacon_id: " + request.params.beacon_id);
	//console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.options(DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE, DataCollectionByBeaconDeviceOptionsRoute);

function DataCollectionByBeaconDevicePatchRoute(request, response, next) {
	console.log("DataCollectionByBeaconDevicePatchRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.patch(DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE, DataCollectionByBeaconDevicePatchRoute);


function DataCollectionByBeaconDevicePostRoute(request, response, next) {
	try {
		console.log("DataCollectionByBeaconDevicePostRoute");
		
		let beacon_id = request.params.beacon_id;
		console.log("» beacon_id: " + beacon_id);
	
		let device_id = request.params.device_id;
		console.log("» device_id: " + device_id);
		
		var distance = request.body.distance;
		distance = Math.abs(distance);
		console.log("» distance: " + distance);
	
		console.log("» distanceMap: " + JSON.stringify(distanceMap));
		
		let index = distanceMap.findIndex( v => v.pid == beacon_id );
		console.log("» index: " + index);
		if (index == INVALID_INDEX) {
			var distanceObj = {};
			distanceObj.pid = beacon_id;
			distanceObj.distance = distance ;
			distanceMap.push(distanceObj);
		} else
			distanceMap[index].distance = distance;
			console.log("» distance found: " + distance);
			
			var rv_url = null;
			for(let item of distanceMap) {
				let beaconidx = beacons.findIndex( beacon => beacon.publicIdentifier == item.pid );
				console.log("» beaconidx: " + beaconidx);
				console.log("» item.distance < beacons[beaconidx].distance: " + item.distance < beacons[beaconidx].distance);
				let deviceidx = devices.findIndex( device => device.id == device_id );
				let device = devices[deviceidx];
				let connectedDevicesIdx = beacons[beaconidx].connectedDevices.findIndex( device => device.id == device_id );
				if (item.distance < beacons[beaconidx].distance) {
					if (connectedDevicesIdx == INVALID_INDEX) {
						beacons[beaconidx].connectedDevices.push(device);
						beacons[beaconidx].connectedUsers = beacons[beaconidx].connectedDevices.length;
					}
					rv_url = beacons[beaconidx].url;
					console.log("» item.distance: " + item.distance + " < beacons[beaconidx].distance: " + beacons[beaconidx].distance);
					break;
				} else if (connectedDevicesIdx != INVALID_INDEX) {
					beacons[beaconidx].connectedDevices.splice(connectedDevicesIdx, 1);
					beacons[beaconidx].connectedUsers = beacons[beaconidx].connectedDevices.length;
				}
		}
		if (rv_url == null)
			rv_url = environments[0].url == null ? "https://www.luoggo.com" : environments[0].url;
		//console.log("» rv_url: " + rv_url);
		
		return response.json({url:rv_url}).status(200);
	} catch (exception) {
		return response.json({url:"https://www.luoggo.com"}).status(200);
	}
}
app.post(DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE, DataCollectionByBeaconDevicePostRoute);

function DataCollectionByBeaconDevicePutRoute(request, response, next) {
	console.log("DataCollectionByBeaconDevicePutRoute");
	console.log("» beacon_id: " + request.params.beacon_id);
	console.log("» device_id: " + request.params.device_id);
	response.status(200).end();
}
app.put(DATA_COLLECTION_BY_BEACON_DEVICE_ROUTE, DataCollectionByBeaconDevicePutRoute);

// Data Collection By Service, Device and Session
const DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE = "/services/:service_id/devices/:device_id/sessions/:session_id/data";
function DataCollectionByServiceDeviceSessionDeleteRoute(request, response, next) {
	console.log("DataCollectionByServiceDeviceSessionDeleteRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.delete(DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE, DataCollectionByServiceDeviceSessionDeleteRoute);

function DataCollectionByServiceDeviceSessionGetRoute(request, response, next) {
	console.log("DataCollectionByServiceDeviceSessionGetRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.get(DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE, DataCollectionByServiceDeviceSessionGetRoute);

function DataCollectionByServiceDeviceSessionOptionsRoute(request, response, next) {
	console.log("DataCollectionByServiceDeviceSessionOptionsRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.options(DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE, DataCollectionByServiceDeviceSessionOptionsRoute);

function DataCollectionByServiceDeviceSessionPatchRoute(request, response, next) {
	console.log("DataCollectionByServiceDeviceSessionPatchRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.patch(DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE, DataCollectionByServiceDeviceSessionPatchRoute);

function DataCollectionByServiceDeviceSessionPostRoute(request, response, next) {
	console.log("DataCollectionByServiceDeviceSessionPostRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.post(DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE, DataCollectionByServiceDeviceSessionPostRoute);

function DataCollectionByServiceDeviceSessionPutRoute(request, response, next) {
	console.log("DataCollectionByServiceDeviceSessionPutRoute");
	console.log("» device_id: " + request.params.device_id);
	console.log("» service_id: " + request.params.service_id);
	console.log("» session_id: " + request.params.session_id);
	response.status(200).end();
}
app.put(DATA_COLLECTION_BY_SERVICE_DEVICE_SESSION_ROUTE, DataCollectionByServiceDeviceSessionPutRoute);

// Login
function LoginPostRoute (request, response) {
	console.log("LoginPostRoute: login requested");
	console.log("» request.headers.authorization: " + request.headers.authorization);
	let authorization_parts = request.headers.authorization?.split(" ");
	let credentials_b64 = authorization_parts[1];
	console.log("» credentials_b64: " + Buffer.from(credentials_b64, 'base64').toString());
	response.json({sessionId:123}).status(200).end();
}
app.post("/login", LoginPostRoute);

function BeaconPostRoute (request, response) {
        console.log("BeaconPostRoute");
        console.log("» publicId: " + request.body.id);
        console.log("» status: " + request.body.status);
        response.json({message:"OK"}).status(200).end();
}
app.post("/beacon", BeaconPostRoute);

function ServicePostRoute (request, response) {
	console.log("ServicePostRoute");
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
app.post("/service", ServicePostRoute);

// Config
function ConfigGetRoute (request, response) {
	var config = {
		rules: []
	};
	for(var merchant of merchants) {
		for(var facility of merchant.facilities) {
			for(var environment of facility.environments) {
				for(var beacon of environment.beacons) {
					config.rules.push(
						{
							"publicIdentifier": beacon.publicIdentifier,
							"maxDistance": beacon.distance,
							"url": beacon.url,
							"environment_url": environment.url,
							"priority": Number.parseInt(beacon.priority)
						}
					);
				}
			}
		}
	}
	response.json(config).status(200).end();
}
app.get("/config", ConfigGetRoute);

// Theme
app.set('view engine', 'ejs');
app.use('/views', express.static(__dirname + '/views'));

function ThemeGetRoute (request, response) {
	const themeId = request.params.themeId;
	console.log("ThemeGetRoute");
	console.log("» themeId: " + themeId);
	response.render(themeId + '/index.ejs', {folder:'/views/' + themeId});
}
app.get("/themes/:themeId", ThemeGetRoute);

var listener = app.listen(PORT, function () {
	console.log('Indoor Analytics listening on port ' + listener.address().port);
});
