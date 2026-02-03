-- Add Facebook/vehicle catalog fields to inventory table
-- Using vehicle_condition instead of "condition" (SQL reserved word)

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS body_style text,
  ADD COLUMN IF NOT EXISTS transmission text,
  ADD COLUMN IF NOT EXISTS fuel_type text,
  ADD COLUMN IF NOT EXISTS latitude float,
  ADD COLUMN IF NOT EXISTS longitude float,
  ADD COLUMN IF NOT EXISTS vehicle_condition text,
  ADD COLUMN IF NOT EXISTS trim text,
  ADD COLUMN IF NOT EXISTS body_class text;
