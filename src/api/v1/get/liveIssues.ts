import fetch from "node-fetch";
import { app } from "../../api.js";

export default async function getLiveIssues() {
	app.get("/v1/liveIssues", async (req, res) => {
		const url = `https://api.statuspage.io/v1/pages/${process.env.STATUSPAGE_PAGE_ID}/incidents/unresolved`;

		const response = await fetch(url, {
			headers: {
				Authorization: `OAuth ${process.env.STATUSPAGE_API_KEY}`
			}
		});

		const data = await response.json();

		res.json(data);
		return;
	});
}
