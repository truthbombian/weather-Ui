require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

/* =========================
   🔐 Supabase Config
========================= */
const supabaseUrl = 'https://ejbmjedhaalltzluxfix.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    console.error('❌ Missing SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/* =========================
   ⚙️ Middleware
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =========================
   🌐 API ROUTES
========================= */

/* ✅ Get all favorite cities */
app.get('/api/favorites', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('city')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            favorites: data.map(item => item.city)
        });

    } catch (err) {
        console.error('GET favorites error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ✅ Add a favorite city */
app.post('/api/favorites', async (req, res) => {
    try {
        const { city } = req.body;

        if (!city || !city.trim()) {
            return res.status(400).json({
                success: false,
                error: 'City is required'
            });
        }

        // Check if already exists
        const { data: existing } = await supabase
            .from('favorites')
            .select('city')
            .eq('city', city)
            .maybeSingle();

        if (!existing) {
            const { error } = await supabase
                .from('favorites')
                .insert([{
                    city,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
        }

        res.json({ success: true });

    } catch (err) {
        console.error('POST favorite error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ✅ Delete a favorite city */
app.delete('/api/favorites/:city', async (req, res) => {
    try {
        const city = decodeURIComponent(req.params.city);

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('city', city);

        if (error) throw error;

        res.json({ success: true });

    } catch (err) {
        console.error('DELETE favorite error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* =========================
   ❤️ Health Check
========================= */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        time: new Date().toISOString()
    });
});


/* =========================
   ❌ Error Handling
========================= */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

/* =========================
   🚀 Start Server
========================= */
app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log(`📱 App: http://localhost:${port}`);
        console.log(`🔍 Health: http://localhost:${port}/health`);
    });

