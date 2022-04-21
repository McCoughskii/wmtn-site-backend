import express from "express";
import getCurrentWeather from "./v1/get/currentWeather.js";
import upcomingEvents from "./v1/get/events.js";
import getLiveIssues from "./v1/get/liveIssues.js";
import songList from "./v1/get/songList.js";

export const app = express();

export default function App() {
	app.use(express.static("public"));

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		// log data about the request
		console.log(`New request: ${req.method} ${req.url} from ${req.ip}`);

		next();
	});

	// send favicon
	app.get("/favicon.ico", (_, res) => {
		res.sendFile("favicon.ico", { root: process.env.__DIRNAME });
	});

	songList();
	upcomingEvents();
	getCurrentWeather();
	getLiveIssues();

	app.use((_req, res, next) => {
		res.sendStatus(404);
		next();
	});

	app.listen(process.env.PORT || 8080, () => {
		console.log("Server is running on port " + process.env.PORT || 8080);
	});
}
