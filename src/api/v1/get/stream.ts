import { app } from "../../api.js";

export default async function getStream() {
	app.get("/v1/stream", async (req, res) => {

		res.status(301).redirect(process.env.STREAM_URL || "");
		return;
	});
}
