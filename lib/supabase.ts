import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkvxjwovezmfpmpbhra.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrdnhqd292ZXh6bWZwbXBiaHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzQwODcsImV4cCI6MjEwMDQ1MDA4N30.oroycUrNPDDc8S-aNKhMLVjHfL3gveyq4pDg32dKp5o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
