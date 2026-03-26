require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or Supabase key in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/favorites', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('city')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            favorites: data.map((item) => item.city)
        });
    } catch (err) {
        console.error('GET favorites error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/favorites', async (req, res) => {
    try {
        const city = String(req.body.city || '').trim();

        if (!city) {
            return res.status(400).json({ success: false, error: 'City is required' });
        }

        const { data: existing, error: existingError } = await supabase
            .from('favorites')
            .select('city')
            .eq('city', city)
            .maybeSingle();

        if (existingError) throw existingError;

        if (!existing) {
            const { error } = await supabase
                .from('favorites')
                .insert([{ city, created_at: new Date().toISOString() }]);

            if (error) throw error;
        }

        res.json({ success: true });
    } catch (err) {
        console.error('POST favorite error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

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

app.get('/api/weather', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('weather')
            .select('city, temperature, condition');

        if (error) throw error;

        res.json({
            success: true,
            savedLocations: (data || []).reverse()
        });
    } catch (err) {
        console.error('GET weather error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/weather', async (req, res) => {
    try {
        const city = String(req.body.city || '').trim();
        const temperature = Number(req.body.temperature);
        const condition = String(req.body.condition || '').trim();

        if (!city || Number.isNaN(temperature) || !condition) {
            return res.status(400).json({
                success: false,
                error: 'City, temperature, and condition are required'
            });
        }

        const { data, error } = await supabase
            .from('weather')
            .insert([{ city, temperature, condition }])
            .select('city, temperature, condition')
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, savedLocation: data });
    } catch (err) {
        console.error('POST weather error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        time: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Health: http://localhost:${port}/health`);
});
