import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

class SupabaseClient {
  supabase: any;
  constructor(configService: ConfigService) {
    this.supabase = createClient(
      configService.get('SUPABASE_URL')!,
      configService.get('SUPABASE_SECRET')!,
    );
  }
}

export default SupabaseClient;
