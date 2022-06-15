const puppeteer = require("puppeteer"); // PUPPETEER
const fs = require("fs"); // FILE SYSTEM
const https = require("https"); // HTTPS

// Constants
const _MIRRORS = ["https://myfreemp3juices.cc"];
const _ENDPOINT = _MIRRORS[0];
const _IS_HEADLESS = true;
const _OPTS = { waitUntil: "load", timeout: 0 };
const _NOT_FOUND = "NOT_FOUND";
const _FOLDER_LOCATION = "musicas";
const _READ_MUSIC_FILE = "_nome_das_musicas.txt";

/**
 * Starts an async runtime due to how puppeteer works
 *
 * @author Higor Gardin <higorgardin00@gmail.com>
 * @version 2.0
 */
(async () => {
  /**
   * This function gets the URL of the download page of the music
   *
   * @param {string} musicName
   * @returns {string} downloadUrlPage
   */
  async function getDownloadPageUrl(musicName) {
    const page = await browser.newPage();
    await page.goto(`${_ENDPOINT}`, _OPTS);

    await page.evaluate((musicName) => {
      const searchFieldElement = document.getElementById("query");
      const searchButton = document.getElementsByClassName(
        "btn btn-primary search"
      )[0];

      searchFieldElement.value = musicName;
      searchButton.click();
    }, musicName);

    try {
      await page.waitForSelector("li.list-group-item");
    } catch (error) {
      await page.close();
      return await getDownloadPageUrl(musicName);
    }

    const downloadUrlPage = await page.evaluate((_NOT_FOUND) => {
      const musicFoundList = [
        ...document.getElementsByClassName("list-group-item"),
      ];

      if (
        !musicFoundList ||
        !musicFoundList.length ||
        musicFoundList[0].innerHTML.includes("Your request was not found")
      ) {
        return _NOT_FOUND;
      }

      // Consider the first music in the list to download
      const musicIndex = 0;

      const actionsElement = musicFoundList[musicIndex].children[1];
      const downloadButtonElement = actionsElement.children[3];
      const buttonAction = downloadButtonElement.outerHTML;
      const downloadPageLink = buttonAction.split(`'`)[1];

      return downloadPageLink;
    }, _NOT_FOUND);

    await page.close();

    return downloadUrlPage;
  }

  /**
   * This function iterates through the list of musics
   * calling and awaiting the method of scrapping to find the
   * download page URL of the music
   *
   * @param {string[]} musicList
   * @returns
   */
  async function getDownloadPageUrlList(musicList) {
    const downloadPageUrlList = [];

    for (let i = 0; i < musicList.length; i++) {
      const url = await getDownloadPageUrl(musicList[i]);
      downloadPageUrlList.push(url);
    }

    return downloadPageUrlList;
  }

  /**
   * This function receives the download page URL of the music
   * and returns the link that contains the media file
   * we want to download it (.mp3)
   *
   * @param {string} downloadPageUrl
   * @returns {string} downloadLink
   */
  async function getDownloadLink(downloadPageUrl) {
    const page = await browser.newPage();
    await page.goto(downloadPageUrl, _OPTS);

    const downloadLink = await page.evaluate(() => {
      const downloadMp3ListButton = [
        ...document.getElementsByClassName("btn btn-lg btn-primary"),
      ][0];

      const buttonAction = downloadMp3ListButton.outerHTML;
      const downloadLink = buttonAction.split(`'`)[1];

      return downloadLink;
    });

    await page.close();

    return downloadLink;
  }

  /**
   * This function iterates through the list of musics
   * calling and awaiting the method of finding the
   * download link of the media file (.mp3)
   *
   * @param {string[]} musicList
   * @returns {string[]} downloadLinkList
   */
  async function getDownloadLinkList(musicList) {
    const downloadLinkList = [];

    for (let i = 0; i < musicList.length; i++) {
      const url = musicList[i] === _NOT_FOUND ? _NOT_FOUND : await getDownloadLink(musicList[i]);
      downloadLinkList.push(url);
    }

    return downloadLinkList;
  }

  /**
   * This function receives the list containing an object
   * with the music name and the download link URL. Then tries
   * download the media file (.mp3)
   *
   * @param {Object[]} musicLinkList
   * @returns {void}
   */
  async function downloadMp3List(musicLinkList) {
    const downloadMp3File = async (url, name) =>
      new Promise((resolve, reject) => {
        https.get(url, (res) => {
          const mp3Path = `./${_FOLDER_LOCATION}/${name}.mp3`;

          const filePath = fs.createWriteStream(mp3Path);

          res.pipe(filePath);

          filePath.on("finish", () => {
            filePath.close();
            resolve(`Download concluído: ${name}`);
          });

          filePath.on("error", (err) => {
            reject(`Falha no download: ${name}. Motivo: ${err}`);
          });
        });
      });

    for (let i = 0; i < musicLinkList.length; i++) {
      try {
        const response = await downloadMp3File(musicLinkList[i].url, musicLinkList[i].name);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }

    return Promise.resolve();
  }

  /**
   * This function just validate the music list and show some messages
   *
   * @param {string[]} musicList
   */
  function initialValidation(musicList) {
    if (!musicList.length) {
      console.log("\nNão há nenhuma música para ser baixada.");
      process.exit();
    }

    console.log("\nMúsicas a serem baixadas:");
    console.log(musicList);
    console.log("\nObtendo links para download. Aguarde... ");
  }

  /**
   * This function assigns the music name to the download link found
   *
   * @param {string[]} musicList
   * @param {string[]} downloadLinkList
   * @returns
   */
  function getMusicAssignedWithLinkList(musicList, downloadLinkList) {
    return downloadLinkList.map((item, idx) => {
      return {
        name: musicList[idx],
        url: item,
      };
    });
  }

  /**
   * This function just log some messaages of the musics that won't
   * be downloaded because of invalid or not found download link
   *
   * @param {Object[]} listWontDownload
   * @returns {void}
   */
  function printMusicListWontDownload(listWontDownload) {
    if (listWontDownload.length) {
      console.log(`\nAlgumas músicas não foram encontradas.`);
      console.log(
        `Verifique se o nome da música está correto e tente a busca manual no site.`
      );
      console.log(`Total: ${listWontDownload.length}.`);
      listWontDownload.forEach((musica, idx) =>
        console.log(`${idx + 1} - ${musica.name}`)
      );
    }
  }

  // ================================================================================
  // Main runtime
  // ================================================================================
  console.log("Lendo arquivo...");

  const musicList = fs
    .readFileSync(`./${_FOLDER_LOCATION}/${_READ_MUSIC_FILE}`, { encoding: "utf8" })
    .toString()
    .split('\r').join('')
    .split("\n");

  initialValidation(musicList);

  const browser = await puppeteer.launch({ headless: _IS_HEADLESS });

  const downloadPageUrlList = await getDownloadPageUrlList(musicList);
  const downloadLinkList = await getDownloadLinkList(downloadPageUrlList);

  const mappedList = getMusicAssignedWithLinkList(musicList, downloadLinkList);

  const listToDownload = mappedList.filter((elem) => elem.url !== _NOT_FOUND);
  const listWontDownload = mappedList.filter((elem) => elem.url === _NOT_FOUND);

  printMusicListWontDownload(listWontDownload);

  console.log(`\nBaixando ${listToDownload.length} músicas:`);

  await downloadMp3List(listToDownload);

  await browser.close();

})();
