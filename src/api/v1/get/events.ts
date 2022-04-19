import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";
import { app } from "../../api.js";

export default async function EventMain() {
	app.get("/v1/events", async (req, res) => {
		
		
		res.send(await getEvents());
	});
}

async function getEvents() {
	const events = await pullUpcomingEvents();
	
	// use the events we got from the rss feed and format them into a json object
	const eventList = events.map(event => {
		
		return CreateEvent(event);
	});

	return eventList;
}

async function pullUpcomingEvents() {
	// const response = await fetch("https://www.sasweb.org/calendar/calendar_361.rss");
	const response = await fetch(process.env.UPCOMING_EVENTS_URL || "");
	const xml = await response.text();
	
	const parser = new XMLParser();
	const json = parser.parse(xml);

	if(!json.rss) {
		return [];
	}

	if(!json.rss.channel) {
		return [];
	}

	const items = json.rss.channel.item;

	if (!items) {
		return [];
	}
	// check if there is more than one item
	if (items instanceof Array) {
		return items;
	}

	return [items];
}

function CreateEvent(item: { description: string; title: string; }) {
	
	const details: string[] = item.description.split("<br />");
	const Event: {[key:string]:string} = {};

	Event.title = item.title;
	Event.description = "no description provided.";

	details.forEach((detail: string) => {

		//remove \n\t\t\t\t from the string
		const trimmedDetail = detail.replace("\n\t\t\t\t", "");

		//split the string into key and value
		const splitDetail = trimmedDetail.split(": ");

		//check if the key is a Description
		if (splitDetail[0] === "Description") {
			Event.description = splitDetail[1];
			return;
		}

		//check if the key is a date
		if (splitDetail[0] === "Date") {
			Event.Date = splitDetail[1];
			return;
		}

		//check if the key is a Start Time
		if (splitDetail[0] === "Event Time") {
			Event.StartTime = splitDetail[1];
			return;
		}

		//check if the key is a Location
		if (splitDetail[0] === "Location") {
			Event.Location = splitDetail[1];
			return;
		}
	});

	return Event;
}