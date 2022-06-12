const puppeteer = require("puppeteer"); // PUPPETEER WEBSCRAPPING
const fs = require("fs"); // FILE SYSTEM
// const http = require("http"); // HTTPS
const https = require("https"); // HTTPS

// const cliProgress = require("cli-progress");

const _MIRRORS = ["https://myfreemp3juices.cc"];
const _ENDPOINT = _MIRRORS[0];

const _IS_HEADLESS = true;

// const _BAR = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

(async () => {
  async function getUrlMusica(nomeMusica) {
    const mainPage = await browser.newPage();
    await mainPage.goto(`${_ENDPOINT}`, { waitUntil: "load", timeout: 0 });

    await mainPage.evaluate((nomeMusica) => {
      const textFieldElement = document.getElementById("query");
      const searchButton = document.getElementsByClassName(
        "btn btn-primary search"
      )[0];

      textFieldElement.value = nomeMusica;

      searchButton.click();
    }, nomeMusica);

    try {
      await mainPage.waitForSelector("li.list-group-item");
    } catch (err) {
      await mainPage.close();
      return await getUrlMusica(nomeMusica);
    }

    const result = await mainPage.evaluate(() => {
      const resultList = [
        ...document.getElementsByClassName("list-group-item"),
      ];

      if (
        !resultList ||
        !resultList.length ||
        resultList[0].innerHTML.includes("Your request was not found")
      ) {
        return "NAO_ENCONTRADO";
      }

      const actionsElement = resultList[0].children[1];
      const downloadButtonElement = actionsElement.children[3];
      const buttonAction = downloadButtonElement.outerHTML;
      const downloadPageLink = buttonAction.split(`'`)[1];

      return downloadPageLink;
    });

    await mainPage.close();
    return result;
  }

  async function getUrlMusicaDownloadList(musicaList) {
    const urlList = [];

    for (let i = 0; i < musicaList.length; i++) {
      const url =
        musicaList[i] === "NAO_ENCONTRADO"
          ? "NAO_ENCONTRADO"
          : await getUrlMusica(musicaList[i]);
      urlList.push(url);
    }

    return urlList;
  }

  async function getTrueUrlDownload(urlDownloadPage) {
    const mainPage = await browser.newPage();
    await mainPage.goto(urlDownloadPage, { waitUntil: "load", timeout: 0 });

    const result = await mainPage.evaluate(() => {
      const downloadMp3Element = [
        ...document.getElementsByClassName("btn btn-lg btn-primary"),
      ][0];

      const buttonAction = downloadMp3Element.outerHTML;
      const downloadPageLink = buttonAction.split(`'`)[1];

      console.log(downloadPageLink);

      return downloadPageLink;
    });

    await mainPage.close();
    return result;
  }

  async function getTrueUrlMusicaDownloadList(musicaList) {
    const urlList = [];

    for (let i = 0; i < musicaList.length; i++) {
      const url =
        musicaList[i] === "NAO_ENCONTRADO"
          ? "NAO_ENCONTRADO"
          : await getTrueUrlDownload(musicaList[i]);
      urlList.push(url);
    }

    return urlList;
  }

  async function downloadMp3(list) {
    const downloadMusic = async (url, name) =>
      new Promise((resolve, reject) => {
        https.get(url, (res) => {
          const path = `./musicas/${name}.mp3`;
          const filePath = fs.createWriteStream(path);
          res.pipe(filePath);
          filePath.on("finish", () => {
            filePath.close();
            console.log(`Download concluído: ${name}`);
            resolve();
          });

          filePath.on("error", (err) => {
            reject(`Falha no download: ${name}. Motivo: ${err}`);
          });
        });
      });

    for (let i = 0; i < list.length; i++) {
      try {
        await downloadMusic(list[i].url, list[i].name);
      } catch (err) {
        console.log("Erro ao baixar", list[i].name, "Causa:", err);
      }
    }

    return Promise.resolve(list);
  }

  console.log("Lendo arquivo...");

  const musicaList = fs
    .readFileSync("./musicas/_nome_das_musicas.txt", { encoding: "utf8" })
    .toString()
    .split("\r\n");

  if (!musicaList.length) {
    console.log("\nNão há nenhuma música para ser baixada.");
    process.exit();
  }

  console.log("\nMúsicas a serem baixadas:");
  console.log(musicaList);

  console.log("\nObtendo links para download. Aguarde... ");

  const browser = await puppeteer.launch({ headless: _IS_HEADLESS });

  const urlMusicaDownloadList = await getUrlMusicaDownloadList(musicaList);

  const trueUrlMusicaDownloadList = await getTrueUrlMusicaDownloadList(urlMusicaDownloadList);

  const mappedList = trueUrlMusicaDownloadList.map((item, idx) => {
    return {
      name: musicaList[idx],
      url: item,
    };
  });

  const listToDownload = mappedList.filter(
    (elem) => elem.url !== "NAO_ENCONTRADO"
  );
  const listWontDownload = mappedList.filter(
    (elem) => elem.url === "NAO_ENCONTRADO"
  );

  if (listWontDownload.length) {
    console.log(`\nAlgumas músicas não foram encontradas.`);
    console.log(`Verifique se o nome da música está correto e tente a busca manual no site.`);
    console.log(`Total: ${listWontDownload.length}.`);
    listWontDownload.forEach((musica, idx) => console.log(`${idx + 1} - ${musica.name}`));
  }

  console.log(`\nBaixando ${listToDownload.length} músicas:`);

  await downloadMp3(listToDownload);

  // console.log("Obtendo URL das páginas...");
  // const urls = await getAllUrlList();

  // console.log("Obtendo URL das sub-páginas...");
  // const urlImagens = await getUrlsSubPaginas(urls);

  // // console.log('Imagens: ', urlImagens);
  // console.log("Total de imagens: ", urlImagens.length);

  // console.log("Baixando...");

  // const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  // function splitarray(input, spacing) {
  //   var output = [];

  //   for (var i = 0; i < input.length; i += spacing) {
  //     output[output.length] = input.slice(i, i + spacing);
  //   }

  //   return output;
  // }

  // const partitionSize = 30;
  // let count = 0;
  // splitArrayImgs = splitarray(urlImagens, partitionSize);

  // _BAR.start(urlImagens.length, 0);

  // for (let i = 0; i < splitArrayImgs.length; i++) {
  //   downloadImages(splitArrayImgs[i]);

  //   count += splitArrayImgs[i].length;

  //   await timer(20000);

  //   _BAR.update(count);
  // }

  // _BAR.stop();

  // console.log("Finalizado");

  await browser.close();
})();
