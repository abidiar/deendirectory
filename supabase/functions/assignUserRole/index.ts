import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.VITE_SUPABASE_URL || '';
const supabaseKey: string = process.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed, please use POST' });
        return;
    }

    const { userId, roleType } = req.body;

    if (!userId || !roleType) {
        res.status(400).json({ error: 'Missing userId or roleType in request body' });
        return;
    }

    try {
        const { data, error } = await supabase
            .from('user_roles')
            .update({ role: roleType })
            .eq('user_id', userId);

        if (error) throw new Error(error.message);

        res.status(200).json({ message: 'User role updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
