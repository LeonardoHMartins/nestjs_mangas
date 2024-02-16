import { Injectable, Options } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { User, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import puppeteer, { Page } from 'puppeteer';
import * as fs from 'fs';
import { userInfo } from 'os';
import { image } from 'image-downloader';
@Injectable()
export class MangaService {
  constructor(private supabase: SupabaseClient) {}
  
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
              capNumber,
              url: caps[i],
              data_lancamento: date[i]
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
        for (const capitulo of await this.getInfos(page)) {
          capitulos.push(capitulo);
        }


        await browser.close();
    
        return capitulos;
      }


      async getReleasesToDB(pages:string = '2'): Promise<any> {
        const prisma = new PrismaClient()
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const pagesNumber = parseInt(pages);
        let resp;

        let capitulos = [];
        await page.goto("https://lermanga.org/capitulos/");

        for (const capitulo of await this.getInfos(page)) {
          capitulos.push({capitulo: capitulo.capNumber, nome: capitulo.nome, url: capitulo.url, data_lancamento: capitulo.data_lancamento, created_at: new Date()});
        }   
        if(pagesNumber > 1){

        for(let i = 2; i < (pagesNumber + 1); i++){
          await page.goto(`https://lermanga.org/capitulos/page/${i}/`);

          for (const capitulo of await this.getInfos(page)) {
            capitulos.push({capitulo: capitulo.capNumber, nome: capitulo.nome,url: capitulo.url, data_lancamento: capitulo.data_lancamento, created_at: new Date()});
          }
          setTimeout(() => {
          }, 1000);
        }
        resp =await prisma.manga_releases.createMany(
          {
            data:
              capitulos,
              skipDuplicates: true,
          }
        )
      } else {
        resp = await prisma.manga_releases.createMany(
          {
            data:
              capitulos,
              skipDuplicates: true,
          }
        );
      }
      
      await browser.close();   

        return {
          success: `${resp.count} Dados inseridos na tabela com sucesso!`
        };
      }


      async downloadImage(url: string[]) {
        try {
          for (let i = 0; i < url.length; i++) {
            const response = await axios.get(url[i], {
              responseType: 'arraybuffer',
            });
            const part = url[i].split('/');
            const path = `${part[4]}/${part[5]}`
    
            // fs.mkdirSync(`D:/NestProjects/nestjs_mangas/images/${path}`,{recursive: true})
            let buffer = Buffer.from(response.data);
            // fs.writeFileSync(`D:/NestProjects/nestjs_mangas/images/${path}/${part[6]}`, buffer);
            await this.uploadImage(`${path}/${part[6]}`,buffer);
              
          }
        } catch (error) {
          throw new Error(error.message);
        }
        return `${url.length} arquivos foram salvos com sucesso!`;
      }
    
      async uploadImage(filename: string,buffer: Buffer): Promise<string> {
        const { data, error } = await this.supabase.storage.from('images').upload(
          filename,
          buffer,
          {
            contentType: 'image/jpeg',
          },
        );
    
        if (error) {
          throw new Error(error.message);
        }
    
        return data.path;
      }

      async getReleasesFromDB(manga:string, download:boolean = false): Promise<any> {
        const prisma = new PrismaClient() 
        let resp;
        let mangas= [];
        let search = [];
        mangas = manga.split(",");
        for (let index = 0; index < mangas.length; index++) {
          const element = mangas[index].trim();
          if(element){
            let resp: any = {[element] : await prisma.manga_releases.findMany({
              where: {
                nome: {
                  contains: element,
                }
              }
            }
            )
          };
          if(resp){
            search.push(resp);
          }

          if(download === true && resp[element] !== undefined){
            let images = [];
            for (let index = 0; index < resp[element].length; index++) {
              const a = resp[element][index];
              images.push(await this.downloadImage(await this.getChaptersImages(a.url)));
            }
            if(images.length > 0){
              await this.downloadImage(images);
              return {success: 'Imagens baixadas com sucesso!'}
            }
          }
          
        }
          
        }
        if(search !== undefined && search.length > 0){
          return search;
        }

        return resp; 
      }




      async getInfos(page: Page): Promise<any> {
        let capitulos = [];
        let caps = await page.$$eval('.single-chapter', (el) => el.map((el) => el.querySelectorAll('a')[0].href));
        let date = await page.$$eval('.single-chapter', (el) => el.map((el) => el.querySelector('small[title^="Capítulo adicionado ao site em"]').textContent.replaceAll("\n", "")));
        let name = await page.$$eval('.single-chapter a.dynamic-visited', (el) => el.map((el) => el.textContent.trim()));
        for(let i = 0; i < caps.length; i++){
          let split = caps[i].split('-');
          let splitName = name[i].split('–');
          let capNumber = split[split.length - 1].replaceAll("/", "") 
          
          capitulos.push(
              {
              capNumber,
              nome: splitName[0],
              url: caps[i],
              data_lancamento: date[i]
          })
        }
        return Promise.resolve(capitulos);
      }

}

