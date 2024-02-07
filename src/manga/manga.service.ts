import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class MangaService {
  
    async getChaptersImages(url:string): Promise<any> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);


        const script = await page.$$('script[src*="data:text/javascript;base64,"]');
        let base : string;

            const element = script[2];
            const src = await page.evaluate(script => script.src, element);
            const base64 = src.split('base64,')[1];
            base = base64;

        const caps = Buffer.from(base, 'base64').toString('ascii')

        // Extract the relevant part of the string containing the links:
        const linksPart = caps.substring(caps.indexOf('[') + 1, caps.lastIndexOf(']')).replaceAll("\\", "");

        // Split the string into an array of links:
        const links = linksPart.split('","');

        // Remove extra quotes from each link:
        const cleanLinks = links.map(link => link.replace(/"/g, ''));

        await browser.close();
    
        return cleanLinks;
      }

      async searchMangas(search:string,): Promise<any> {
        console.log(`https://lermanga.org/?s=${search}`)
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://lermanga.org/?s=${search}`);


        let caps = await page.$$eval('.flw-item', (el) => el.map((el) => el.querySelectorAll('a')[1].href));

        await browser.close();
    
        return caps;
      }

      async getChapters(url:string,): Promise<any> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);


        let capitulos = [];
        let caps = await page.$$eval('.single-chapter', (el) => el.map((el) => el.querySelectorAll('a')[0].href));
        let date = await page.$$eval('.single-chapter', (el) => el.map((el) => el.querySelector('small[title^="Capítulo adicionado ao site em"]').textContent.replaceAll("\n", "")));
        for(let i = 0; i < caps.length; i++){
          let split = caps[i].split('-');
          let capNumber = split[split.length - 1].replaceAll("/", "") 
          
          capitulos.push(
            {
              [capNumber]: {
              url: caps[i],
              data_lançamento: date[i]
            }
          })
        }


        await browser.close();
    
        return capitulos;
      }


      async getReleases(pageNumber?:string): Promise<any> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        if(pageNumber){
          await page.goto(`https://lermanga.org/capitulos/page/${pageNumber}/`);
        } else {
          await page.goto("https://lermanga.org/capitulos/");
        }



        let capitulos = [];
        let caps = await page.$$eval('.single-chapter', (el) => el.map((el) => el.querySelectorAll('a')[0].href));
        let date = await page.$$eval('.single-chapter', (el) => el.map((el) => el.querySelector('small[title^="Capítulo adicionado ao site em"]').textContent.replaceAll("\n", "")));
        for(let i = 0; i < caps.length; i++){
          let split = caps[i].split('-');
          let capNumber = split[split.length - 1].replaceAll("/", "") 
          
          capitulos.push(
            {
              [capNumber]: {
              url: caps[i],
              data_lançamento: date[i]
            }
          })
        }


        await browser.close();
    
        return capitulos;
      }

}

