-- ============================================================
-- SVLINK - RPC FUNCTION FIXES
-- Date: 2026-05-20
-- Description:
--   1. Fix audit stats aggregation (was broken — no GROUP BY in app code)
--   2. Normalize click counter parameter names to link_id/page_id
--      (consistent with 20260416_sync_schema.sql)
-- ============================================================

-- ============================================================
-- 1. AUDIT STATS RPC — aggregasi dengan GROUP BY
-- ============================================================
DROP FUNCTION IF EXISTS get_audit_stats(integer);
DROP FUNCTION IF EXISTS get_audit_stats(days_count integer);
CREATE OR REPLACE FUNCTION get_audit_stats(days_count integer DEFAULT 7)
RETURNS JSON AS $$
DECLARE
    since_date TIMESTAMP WITH TIME ZONE;
    total_actions bigint;
    actions_by_type JSON;
    top_users JSON;
BEGIN
    since_date := NOW() - (days_count || ' days')::INTERVAL;

    -- Total actions in period
    SELECT COUNT(*) INTO total_actions
    FROM audit_logs
    WHERE created_at >= since_date;

    -- Actions grouped by type
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::JSON) INTO actions_by_type
    FROM (
        SELECT action, COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= since_date
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
    ) t;

    -- Top users by activity
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::JSON) INTO top_users
    FROM (
        SELECT al.user_id as "userId", u.email, COUNT(*) as count
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.created_at >= since_date
        GROUP BY al.user_id, u.email
        ORDER BY count DESC
        LIMIT 10
    ) t;

    RETURN json_build_object(
        'totalActions', total_actions,
        'actionsByType', actions_by_type,
        'topUsers', top_users
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. CLICK COUNTERS — normalisasi parameter names
--    Pastikan konsisten dengan 20260416: link_id, page_id
--    (bukan p_link_id / p_page_id dari 20260513 yang tidak match)
-- ============================================================

-- increment_click_count (normalized)
DROP FUNCTION IF EXISTS increment_click_count(p_link_id UUID);
DROP FUNCTION IF EXISTS increment_click_count(TEXT);
DROP FUNCTION IF EXISTS increment_click_count(UUID);
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE links
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- increment_public_page_clicks (normalized)
DROP FUNCTION IF EXISTS increment_public_page_clicks(p_page_id UUID);
DROP FUNCTION IF EXISTS increment_public_page_clicks(TEXT);
DROP FUNCTION IF EXISTS increment_public_page_clicks(UUID);
CREATE OR REPLACE FUNCTION increment_public_page_clicks(page_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public_pages
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Cara pakai: Buka Supabase Dashboard → SQL Editor → Paste → Run
--
-- Verifikasi:
--   1. SELECT get_audit_stats(7);  -- harus return JSON
--   2. SELECT increment_click_count('00000000-0000-0000-0000-000000000001');
--   3. SELECT increment_public_page_clicks('00000000-0000-0000-0000-000000000001');
-- ============================================================
