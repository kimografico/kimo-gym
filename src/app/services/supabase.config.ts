import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://cwzpsygjdufttsqfgsgt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3enBzeWdqZHVmdHRzcWZnc2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTk0MzgsImV4cCI6MjA3MTI3NTQzOH0.z8FC-x9pzEOkswN2BbG2TkFE6PhYR-SXsVmLbILiEyg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
