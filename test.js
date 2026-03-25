import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ejbmjedhaalltzluxfix.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYm1qZWRoYWFsbHR6bHV4Zml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODkxNTMsImV4cCI6MjA4OTk2NTE1M30.UPDwGUAAOvPzjX03XV_I2VERgvDQC57__WZXrMhqhW0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data, error } = await supabase
        .from('favorites')
        .select('*')

    if (error) {
        console.error("❌ Error:", error.message)
    } else {
        console.log("✅ Connected!", data)
    }
}

test()