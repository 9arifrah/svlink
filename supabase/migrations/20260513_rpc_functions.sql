-- ============================================================
-- SVLINK - RPC FUNCTIONS FOR SUPABASE
-- ============================================================
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Paste → Run
-- Ini berisi semua fungsi RPC yang dipakai oleh aplikasi
-- ============================================================

-- 1. Increment link click count (thread-safe)
DROP FUNCTION IF EXISTS increment_click_count(TEXT);
DROP FUNCTION IF EXISTS increment_click_count(UUID);
CREATE OR REPLACE FUNCTION increment_click_count(p_link_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE links 
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Increment public page click count (thread-safe)
DROP FUNCTION IF EXISTS increment_public_page_clicks(TEXT);
DROP FUNCTION IF EXISTS increment_public_page_clicks(UUID);
CREATE OR REPLACE FUNCTION increment_public_page_clicks(p_page_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public_pages 
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = p_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Generate unique slug from display name
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
    counter INTEGER := 0;
BEGIN
    slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug := regexp_replace(slug, '\s+', '-', 'g');
    slug := regexp_replace(slug, '-+', '-', 'g');
    slug := trim(both '-' from slug);

    WHILE EXISTS (SELECT 1 FROM users WHERE custom_slug = slug) LOOP
        counter := counter + 1;
        slug := base_name || '-' || counter;
        slug := lower(regexp_replace(slug, '[^a-zA-Z0-9\s-]', '', 'g'));
        slug := regexp_replace(slug, '\s+', '-', 'g');
    END LOOP;

    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS — Auto-update updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_public_pages_updated_at ON public_pages;
CREATE TRIGGER update_public_pages_updated_at
    BEFORE UPDATE ON public_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Auth di-handle di application layer (custom JWT, bukan Supabase Auth)
-- ============================================================
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_page_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all on users" ON users;
DROP POLICY IF EXISTS "Allow all on user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow all on categories" ON categories;
DROP POLICY IF EXISTS "Allow all on links" ON links;
DROP POLICY IF EXISTS "Allow all on public_pages" ON public_pages;
DROP POLICY IF EXISTS "Allow all on public_page_links" ON public_page_links;
DROP POLICY IF EXISTS "Allow all on audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow all on announcements" ON announcements;

-- Create permissive policies (app-layer auth)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on links" ON links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on public_pages" ON public_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on public_page_links" ON public_page_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Setelah run ini, cek:
-- 1. SELECT count(*) FROM links; -- pastikan data ada
-- 2. SELECT count(*) FROM categories; -- pastikan categories ada
-- 3. Test increment_click_count: SELECT increment_click_count('test-uuid');
-- ============================================================
