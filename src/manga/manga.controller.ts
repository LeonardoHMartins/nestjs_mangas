import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MangaService } from './manga.service';

@Controller('manga')
export class MangaController {
    constructor(private readonly mangaService: MangaService) {}


    //http://localhost:3000/manga/search?manga=uno
    @Get('search')
    search(
        @Query('manga') search: string,
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
     @Get('images')
     getChaptersImages(
         @Body('url') url: string,
     ){
         return this.mangaService.getChaptersImages(url);
     }

     //http://localhost:3000/manga/releases?page=2
     @Get('releases')
     releases(
         @Query('page') page?: string,
     ){
         return this.mangaService.getReleases(page);
     }
 
}