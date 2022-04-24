import puppeteer from "puppeteer";
import { app } from "../../api.js";
import { SongListData } from "../types/songList.js";
import dotenv from "dotenv";
dotenv.config();

const songListDataDefault: SongListData = {
	CurrentSong: "Waiting for song...",
	NextSong: "Waiting for song...",
	PreviousSongs: []
};

export default function setup() {
	new SongList();
	return;
}

class SongList {
	songListData: SongListData;
	browser?: puppeteer.Browser;
	page?: puppeteer.Page;
	constructor() {

		this.songListData = songListDataDefault;
		this.browser = undefined;
		this.page = undefined;

		this.updateSongList().catch(async (err) => {
			console.error(err);
			await this.browser?.close();
			this.updateSongList();
		});

		app.get("/v1/songList", (_req, res) => {
			res.json(this.songListData);
			return;
		});
	}

	async updateSongList() {

		if (!this.browser) {
			this.browser = await puppeteer.launch();
			this.page = await this.browser.newPage();
			await this.page.goto(process.env.SONG_LIST_URL || "");
		}

		if (!this.page) {
			this.page = await this.browser.newPage();
			await this.page.goto(process.env.SONG_LIST_URL || "");
		}

		// wait for all of the elements to load
		await this.page.waitForSelector(process.env.SONG_LIST_CURRENT_SELECTOR || "");
		await this.page.waitForSelector(process.env.SONG_LIST_NEXT_SELECTOR || "");
		await this.page.waitForSelector(process.env.SONG_LIST_PREVIOUS_SELECTOR || "");

		// get the current song from the page
		const currentSong = await this.page.$eval(
			process.env.SONG_LIST_CURRENT_SELECTOR || "",
			(el) => el.innerHTML
		);

		// get the next song from the page
		const nextSong = await this.page.$eval(
			process.env.SONG_LIST_NEXT_SELECTOR || "",
			(el) => el.innerHTML
		);

		// get the previous songs from the page
		const previousSongs = await this.page.$eval(
			process.env.SONG_LIST_PREVIOUS_SELECTOR || "",
			(el) => el.innerHTML
		);

		// split the previous songs into an array of strings by the SONG_LIST_PREVIOUS_SELECTOR_SPLIT env variable
		const previousSongsArray = previousSongs.split(
			process.env.SONG_LIST_PREVIOUS_SELECTOR_SPLIT || ""
		);

		// update the song list data
		this.songListData = {
			CurrentSong: currentSong,
			NextSong: nextSong,
			PreviousSongs: previousSongsArray
		};

		console.log("Updated song list");

		await this.page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });

		// add some recursion
		this.updateSongList().catch(async (err) => {
			console.error(err);
			await this.browser?.close();
			this.updateSongList();
		});

		return;
	}
}
