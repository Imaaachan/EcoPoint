import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ysnrwxcbsyzrqgrcwgxj.supabase.co'
const supabaseKey = 'sb_publishable_YxcjMuSw-eD7-V7fhhOkJw_Xe4l3Eg1'

export const supabase = createClient(supabaseUrl, supabaseKey)