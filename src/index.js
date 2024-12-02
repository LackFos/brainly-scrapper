import { open } from "lmdb";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";

(async () => {
  puppeteer.use(pluginStealth());
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://brainly.ph/");
  await page.setCookie({
    name: "Zadanepl_cookie[Token][Long]",
    value: "-wF93Ot3twcP7UK_Ich13n9UqET6wnidFT_NaSC91Ko%3D",
  });

  const DB = open({ path: "./src/data/index.db", compression: true });

  let currentId = 30161334;

  while (true) {
    const html = await page.evaluate(async (currentId) => {
      try {
        const response = await fetch(`https://brainly.ph/question/${currentId}`);

        if (response.ok) {
          return await response.text(); // Return response body as text
        } else {
          console.error("Failed to fetch:", response.status, response.statusText);
          return null;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        return null;
      }
    }, currentId);

    if (html) {
      console.log("currentId", currentId);

      // Use Cheerio to parse the HTML content
      const $ = cheerio.load(html);
      const questionText = $("[data-testid='question_box_text']").text().trim();
      const questionImages = $("[data-testid='question_box_attachments'] img").toArray();
      const questionImageUrls = questionImages.map((img) => $(img).attr("src"));

      const answerText = $("[data-testid='answer_box_text']").text().trim();
      const answerImages = $("[data-testid='answer_box_attachments'] img").toArray();
      const answerImageUrls = answerImages.map((img) => $(img).attr("src"));

      const newData = {
        question: { text: questionText, images: questionImageUrls },
        answer: { text: answerText, images: answerImageUrls },
      };

      await DB.put(currentId, newData);
    } else {
      console.error("No HTML content retrieved.");
    }

    currentId += 1;
  }
})();
