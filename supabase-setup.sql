-- Create recipes table for Chef AI app
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own recipes
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own recipes
CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recipes
CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own recipes
CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some test data (replace with actual user IDs from your auth.users)
-- Note: You need to get real user IDs from Supabase Dashboard > Authentication > Users
-- For now, these are placeholder - replace with actual UUIDs
-- INSERT INTO recipes (user_id, title, ingredients, instructions) VALUES
-- ('user-id-1', 'Pasta Carbonara', 'Pasta, eggs, bacon, cheese', 'Cook pasta, mix with sauce'),
-- ('user-id-2', 'Chicken Stir Fry', 'Chicken, vegetables, soy sauce', 'Stir fry chicken and veggies'),
-- ('user-id-3', 'Chocolate Cake', 'Flour, sugar, chocolate, eggs', 'Bake at 350F for 30 mins');