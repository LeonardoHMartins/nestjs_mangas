import { Module } from '@nestjs/common';
import { MangaController } from './manga.controller';
import { MangaService } from './manga.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Module({
  controllers: [MangaController],
  providers: [MangaService,
  
    {
      provide: SupabaseClient,
      useFactory: () => {
        return new SupabaseClient(
          "https://fvpdbgxsmgsbwvwpsrrn.supabase.co",
           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cGRiZ3hzbWdzYnd2d3BzcnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1ODU5NjQsImV4cCI6MjAyMzE2MTk2NH0.z5XIRS9JbCld7M010ZjvN_25kilWYKlO0_OtVt2o5M4",
        );
      },
    },],
})
export class MangaModule {}
