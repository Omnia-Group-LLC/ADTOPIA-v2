-- Create admin_activity_log table for tracking admin actions
-- Used for batch optimize, AI ad generation, and other admin operations

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
  ON admin_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON admin_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Users can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
  ON admin_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert activity logs (for Edge Functions)
CREATE POLICY "Service role can insert activity logs"
  ON admin_activity_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create activity_log table if it doesn't exist (for AI ad realtime)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_log
CREATE POLICY "Users can view own activity log"
  ON activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity log"
  ON activity_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Enable realtime for activity_log
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

