import puppeteer from "puppeteer";
import { app } from "../../api.js";
import { SongListData } from "../types/songList.js";
import dotenv from "dotenv";
dotenv.config();

let songListData: SongListData = {
	CurrentSong: "Waiting for song...",
	NextSong: "Waiting for song...",
	PreviousSongs: [],
};

setInterval(async () => {
	songListData = await getSongList().catch() || songListData;
}, 5000);

export default function songList() {
	app.get("/v1/songList", (_, res) => {

		if(songListData.CurrentSong === "Waiting for song...") {
			return;
		}

		res.send(songListData);
	});
}

async function getSongList() {

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(process.env.SONG_LIST_URL || "");

	// wait for all of the elements to load
	await page.waitForSelector(process.env.SONG_LIST_CURRENT_SELECTOR || "");
	await page.waitForSelector(process.env.SONG_LIST_NEXT_SELECTOR || "");
	await page.waitForSelector(process.env.SONG_LIST_PREVIOUS_SELECTOR || "");

	// get the current song from the page
	const currentSong = await page.$eval(process.env.SONG_LIST_CURRENT_SELECTOR || "", (el) => el.innerHTML);

	// get the next song from the page
	const nextSong = await page.$eval(process.env.SONG_LIST_NEXT_SELECTOR || "", (el) => el.innerHTML);

	// get the previous songs from the page
	const previousSongs = await page.$eval(process.env.SONG_LIST_PREVIOUS_SELECTOR || "", (el) => el.innerHTML);

	// split the previous songs into an array of strings by the SONG_LIST_PREVIOUS_SELECTOR_SPLIT env variable
	const previousSongsArray = previousSongs.split(process.env.SONG_LIST_PREVIOUS_SELECTOR_SPLIT || "");

	// close the browser
	await browser.close();

	// return the all the data from the songlist page
	return {
		CurrentSong: currentSong,
		NextSong: nextSong,
		PreviousSongs: previousSongsArray
	};
}