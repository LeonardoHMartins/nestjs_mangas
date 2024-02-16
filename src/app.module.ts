import { Module } from '@nestjs/common';
import { MangaModule } from './manga/manga.module';
import { SupabaseClient, createClient } from '@supabase/supabase-js'

@Module({
  imports: [MangaModule],
  controllers: [],
  providers: [
    
  ],
})
export class AppModule {
}
