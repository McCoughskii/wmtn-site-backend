import { app } from "../../api.js";

export default async function getStream() {
	app.get("/v1/stream", async (req, res) => {

		res.redirect(process.env.STREAM_URL || "", 301);
		return;
	});
}
