-- Function to safely increment job progress concurrently
CREATE OR REPLACE FUNCTION increment_job_progress(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sticker_jobs
  SET progress = progress + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
