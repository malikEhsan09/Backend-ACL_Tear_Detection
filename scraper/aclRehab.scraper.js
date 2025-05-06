// import { launch } from "puppeteer";

import axios from "axios";

export const scrapeAclRehabData = async () => {
  try {
    const { data } = await axios.get(
      "https://www.sportsinjuryclinic.net/rehabilitation-exercises/acl-injury-rehabilitation",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          Referer: "https://www.google.com",
          "Accept-Language": "en-US,en;q=0.9",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        },
      }
    );
    console.log(data); // Scrape the data with Cheerio
  } catch (error) {
    console.error("Error:", error.message);
  }
};

scrapeAclRehabData();
