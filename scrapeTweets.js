const { chromium } = require("playwright");
const dayjs = require("dayjs");
const { timeout } = require("puppeteer-core");
const filterContent = (str, length) => {
  const regex = length == 3 ? /\$[^\d\s]{3}\s/g : /\$[^\d\s]{4}\s/g;
  str.split("/n").join("");
  return str.match(regex) ?? "";
};
exports.scrapeTweets = async (url, durationInMinutes, length) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await browser.newContext(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  // Disable images and fonts to speed up loading
  await page.route("**/*", (route) => {
    const request = route.request();
    const resourceType = request.resourceType();

    // Block images and fonts
    if (resourceType === "image" || resourceType === "font") {
      route.abort();
    } else {
      route.continue();
    }
  });
  // Go to the Twitter profile
  await page.goto(url, { waitUntil: "domcontentloaded" }, { timeout: 6000 });
  try {
    const startTime = dayjs();
    const endTime = startTime.add(durationInMinutes, "minute");

    // Array to store scraped tweets
    const scrapedTweets = [];

    let hasMoreTweets = true;

    while (hasMoreTweets) {
      const currentTime = dayjs();
      if (currentTime.isAfter(endTime)) {
        // Stop scraping after the specified duration
        break;
      }

      // Scroll to the bottom to load more tweets
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(5000); // Wait for new tweets to load

      // Extract tweet data
      const tweets = await page.evaluate(() => {
        const elements = document.querySelectorAll("article");
        return Array.from(elements).map((element) => {
          const content = element.querySelector("div[lang]")?.textContent || "";
          const timestamp =
            element.querySelector("time")?.getAttribute("datetime") || "";
          //let currentstamp = dayjs();
          return {
            content,
            timestamp: timestamp,
          };
        });
      });

      // Add tweets to the array
      const newTweets = tweets
        .filter((tweet) => tweet.content !== "")
        .map((tweet) => ({
          content: filterContent(tweet.content, length),
          timestamp: tweet.timestamp,
        }));
      //console.log(tweets);
      scrapedTweets.push(...newTweets);
    }

    await browser.close();
    return scrapedTweets;
  } catch (err) {
    console.log("ERROR", err);
  }
};
