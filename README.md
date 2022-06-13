# WebScrappingMP3DownloaderPuppeteer

## Description / Descrição
A project who uses webscrapping for downloading musics!

--------------------------------------------------------------------------

Um projeto que usa raspagem de dados para baixar músicas!

## Tools / Libraries
- NodeJS
- Puppeteer
- Https
- FileSystem

## What you need to run / O que você precisa para executar
- A terminal / Um terminal
- NPM installed on the PC / NPM instalado no PC

## How to run / Como executar
1. Download the project:
```
git clone https://github.com/higorgardin/WebScrappingMP3DownloaderPuppeteer
```
2. Write the name of the musics you want to download in the **musicas/_nome_das_musicas.txt** file
3. Run it with NPM
```
npm install
npm start
```
--------------------------------------------------------------------------
1. Baixe o projeto:
```
git clone https://github.com/higorgardin/WebScrappingMP3DownloaderPuppeteer
```
2. Escreva o nome das músicas que você quer baixar dentro do arquivo **musicas/_nome_das_musicas.txt**
3. Execute com NPM
```
npm install
npm start
```

## Result / Resultado
You should see something like this at the end of the proccess:

--------------------------------------------------------------------------

Você deve ver algo como isso ao fim do processo de execução:

![PrintScreen](https://user-images.githubusercontent.com/85377553/173264796-1f8e8fab-a7af-42ff-bf9d-eb9cf3e1439b.JPG)

The downloaded musics will be located inside the **musicas** folder

--------------------------------------------------------------------------

As músicas baixadas estarão dentro da pasta **musicas**

![DownlaodedMusics](https://user-images.githubusercontent.com/85377553/173265230-7569e11e-9d35-4c9b-98fe-b8a933f616a5.JPG)

## Next steps / próximos passos

- [ ] Implement a resource to check if the music is already downloaded inside the folder, preventing re-downloaded
- [ ] Implement a resource to find the most accurate music. Because when we have a famous music, we can end downloading an accoustic version / live version / cover version of the music
- [ ] Implement features of assigning informations inside the MP3 file. Like author, genre, year, album, cover, etc.
--------------------------------------------------------------------------
- [ ] Implementar um recurso para verificar se a música já está baixada dentro da pasta, evitando baixa-la novamente
- [ ] Implementar um recurso para encontrar a música mais "correta". Porque quando a música é famosa, podemos acabar baixando uma versão acústica, ao vivo ou cover da música
- [ ] Implementar recursos para atribuir informações dentro do arquivo MP3. Como autor, gênero, ano, álbum, capa, etc.
