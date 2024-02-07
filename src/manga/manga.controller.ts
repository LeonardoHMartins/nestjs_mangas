import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MangaService } from './manga.service';

@Controller('manga')
export class MangaController {
    constructor(private readonly mangaService: MangaService) {}


    //http://localhost:3000/manga/search
    @Post('search')
    search(
        @Body('manga') search: string,
    ){
        return this.mangaService.searchMangas(search);
    }

    //http://localhost:3000/manga/chapters
    @Post('chapters')
    getChapters(
        @Body('url') url:string
    ){
        return this.mangaService.getChapters(url);
    }
    

     //http://localhost:3000/manga/getchaptersimages
     @Post('images')
     getChaptersImages(
         @Body('url') url: string,
     ){
         return this.mangaService.getChaptersImages(url);
     }

     //http://localhost:3000/manga/releases || ?page=2
     @Get('releases')
     releases(
         @Query('page') page?: string,
     ){
         return this.mangaService.getReleases(page);
     }


     //http://localhost:3000/manga/releases-db?pages=5
     @Get('releases-db')
     releasesToDB(
         @Query('pages') pages?: string,
     ){
         return this.mangaService.getReleasesToDB(pages);
     }

      //http://localhost:3000/manga/releases-from-db?manga=naruto
      @Get('releases-from-db')
      releasesFromDB(
          @Query('manga') manga: string,
      ){
          return this.mangaService.getReleasesFromDB(manga);
      }
 
}