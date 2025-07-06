-- Create backup_schedules table
CREATE TABLE IF NOT EXISTS backup_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    time TEXT NOT NULL, -- HH:MM format
    enabled BOOLEAN DEFAULT true,
    retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create backup_data table for storing backup content
CREATE TABLE IF NOT EXISTS backup_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_id UUID REFERENCES backups(id) ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_import_logs table
CREATE TABLE IF NOT EXISTS data_import_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    table_name TEXT NOT NULL,
    import_type TEXT NOT NULL CHECK (import_type IN ('csv', 'json', 'excel')),
    records_imported INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    errors JSONB,
    warnings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_retention_policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    table_name TEXT NOT NULL,
    retention_days INTEGER DEFAULT 365,
    auto_cleanup BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, table_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_backup_schedules_user_id ON backup_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_data_backup_id ON backup_data(backup_id);
CREATE INDEX IF NOT EXISTS idx_data_import_logs_user_id ON data_import_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_import_logs_created_at ON data_import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_user_id ON data_retention_policies(user_id);

-- Create RLS policies for backup_schedules
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backup schedules" ON backup_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup schedules" ON backup_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup schedules" ON backup_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backup schedules" ON backup_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for backup_data
ALTER TABLE backup_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backup data" ON backup_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM backups 
            WHERE backups.id = backup_data.backup_id 
            AND backups.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own backup data" ON backup_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM backups 
            WHERE backups.id = backup_data.backup_id 
            AND backups.user_id = auth.uid()
        )
    );

-- Create RLS policies for data_import_logs
ALTER TABLE data_import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own import logs" ON data_import_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import logs" ON data_import_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for data_retention_policies
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own retention policies" ON data_retention_policies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retention policies" ON data_retention_policies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retention policies" ON data_retention_policies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retention policies" ON data_retention_policies
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_backup_schedules_updated_at
    BEFORE UPDATE ON backup_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for automated backup scheduling
CREATE OR REPLACE FUNCTION check_backup_schedules()
RETURNS void AS $$
DECLARE
    schedule_record RECORD;
    current_time TIME := CURRENT_TIME;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Check for daily backups
    FOR schedule_record IN 
        SELECT * FROM backup_schedules 
        WHERE enabled = true 
        AND frequency = 'daily'
        AND time <= current_time
        AND (last_backup_date IS NULL OR last_backup_date < current_date)
    LOOP
        -- Here you would trigger the backup process
        -- For now, we'll just update the last_backup_date
        UPDATE backup_schedules 
        SET last_backup_date = current_date
        WHERE id = schedule_record.id;
    END LOOP;

    -- Check for weekly backups (on Sundays)
    IF EXTRACT(DOW FROM current_date) = 0 THEN
        FOR schedule_record IN 
            SELECT * FROM backup_schedules 
            WHERE enabled = true 
            AND frequency = 'weekly'
            AND time <= current_time
            AND (last_backup_date IS NULL OR last_backup_date < current_date - INTERVAL '7 days')
        LOOP
            UPDATE backup_schedules 
            SET last_backup_date = current_date
            WHERE id = schedule_record.id;
        END LOOP;
    END IF;

    -- Check for monthly backups (on the 1st of the month)
    IF EXTRACT(DAY FROM current_date) = 1 THEN
        FOR schedule_record IN 
            SELECT * FROM backup_schedules 
            WHERE enabled = true 
            AND frequency = 'monthly'
            AND time <= current_time
            AND (last_backup_date IS NULL OR last_backup_date < current_date - INTERVAL '30 days')
        LOOP
            UPDATE backup_schedules 
            SET last_backup_date = current_date
            WHERE id = schedule_record.id;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add last_backup_date column to backup_schedules
ALTER TABLE backup_schedules ADD COLUMN IF NOT EXISTS last_backup_date DATE;

-- Insert default retention policies for existing users
INSERT INTO data_retention_policies (user_id, table_name, retention_days, auto_cleanup)
SELECT 
    id as user_id,
    'audit_logs' as table_name,
    90 as retention_days,
    true as auto_cleanup
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM data_retention_policies WHERE table_name = 'audit_logs');

INSERT INTO data_retention_policies (user_id, table_name, retention_days, auto_cleanup)
SELECT 
    id as user_id,
    'backups' as table_name,
    365 as retention_days,
    true as auto_cleanup
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM data_retention_policies WHERE table_name = 'backups');

-- Create function to automatically clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
DECLARE
    policy_record RECORD;
    cutoff_date DATE;
BEGIN
    FOR policy_record IN 
        SELECT * FROM data_retention_policies 
        WHERE auto_cleanup = true
    LOOP
        cutoff_date := CURRENT_DATE - INTERVAL '1 day' * policy_record.retention_days;
        
        -- Clean up old audit logs
        IF policy_record.table_name = 'audit_logs' THEN
            DELETE FROM audit_logs 
            WHERE user_id = policy_record.user_id 
            AND created_at < cutoff_date;
        END IF;
        
        -- Clean up old backups
        IF policy_record.table_name = 'backups' THEN
            DELETE FROM backups 
            WHERE user_id = policy_record.user_id 
            AND created_at < cutoff_date;
        END IF;
        
        -- Add more tables as needed
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (this would be set up in your application)
-- For now, we'll create a function that can be called manually
CREATE OR REPLACE FUNCTION run_scheduled_tasks()
RETURNS void AS $$
BEGIN
    -- Check backup schedules
    PERFORM check_backup_schedules();
    
    -- Clean up old data
    PERFORM cleanup_old_data();
END;
$$ LANGUAGE plpgsql; 