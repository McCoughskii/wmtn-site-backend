import fetch from "node-fetch";
import { app } from "../../api.js";
import dotenv from "dotenv";
dotenv.config();

let weather = {};
let lastUpdate = 0;

export default async function currentWeather() {
	app.get("/v1/weather", async (req, res) => {
		if (req.query.q) {
			const weather = await getWeather(req.query.q.toString());

			res.status(200).json(weather);
			return;
		}

		const weather = await getWeather();

		res.status(200).json(weather);
		return;
	});
}

async function getWeather(query?: string) {
	
	const now = Math.round(Date.now()/1000);

	// only update weather if it has been 15 minutes since last update
	if (now - lastUpdate < 900) {
		console.log("Returning cached weather");
		return weather;
	}

	console.log("Updating current weather");

	if (!query) {
		query = `${process.env.DEFAULT_LOCATION_LAT},${process.env.DEFAULT_LOCATION_LON}`;
	}

	const response = await fetch(
		`${process.env.WEATHER_BASE_URL}current.json?key=${process.env.WEATHER_API_KEY}&q=${query}&aqi=no`
	);

	const json = await response.json();

	weather = json;

	if(lastUpdate === json.current.last_updated_epoch) {
		console.log("Weather has not been updated yet");

		return weather;
	}

	lastUpdate = json.current.last_updated_epoch;

	return weather;
}
