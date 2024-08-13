const dayjs = require("dayjs");
const { scrapeTweets } = require("./scrapeTweets");
const accounts = [
  "https://twitter.com/Mr_Derivatives",
  "https://twitter.com/warrior_0719",
  "https://twitter.com/ChartingProdigy",
  "https://twitter.com/allstarcharts",
  "https://twitter.com/yuriymatso",
  "https://twitter.com/TriggerTrades",
  "https://twitter.com/AdamMancini4",
  "https://twitter.com/CordovaTrades",
  "https://twitter.com/Barchart",
  "https://twitter.com/RoyLMa ttox",
];
const scrapeAccounts = async (twitterAcc, tokenLength) => {
  try {
    const freqency = new Map();
    const promiseArray = twitterAcc.map((element) =>
      scrapeTweets(element, 1, tokenLength)
    );
    const finalResult = await Promise.all(promiseArray);
    for (let i = 0; i < finalResult.length; i++) {
      for (
        let retrivedTweetPerPage = 0;
        retrivedTweetPerPage < finalResult[i].length;
        retrivedTweetPerPage++
      ) {
        if (finalResult[i][retrivedTweetPerPage].content === "") continue;
        const tokenArray = finalResult[i][retrivedTweetPerPage].content;
        tokenArray.forEach((element) => {
          if (freqency.has(element)) {
            freqency.set(element, freqency.get(element) + 1);
          } else {
            freqency.set(element, 1);
          }
        });
      }
    }

    console.log(freqency);
    freqency.forEach((value, key) => {
      console.log(`${key} is mentioned ${value} times`);
    });
    return freqency;
  } catch (err) {
    console.log("Timeout...");
  }
};
const runScraper = async (accounts, tokenLength, interval) => {
  // const retrievedTokens = await scrapeAccounts(accounts, tokenLength);
  setInterval(() => {
    console.log(`Scraping at ${dayjs().format()}`);
    const retrievedTokens = scrapeAccounts(accounts, tokenLength)
      .then((res) =>
        res.forEach((value, key) => {
          console.log(
            `${key} is mentioned ${value} times in the last ${interval} minutes`
          );
        })
      )
      .catch((err) => err.message);
  }, interval * 60 * 1000);
};
scrapeAccounts(accounts, 3);
//runScraper(accounts, 3, 0.5);
