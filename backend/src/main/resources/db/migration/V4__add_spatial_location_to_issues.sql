UPDATE issues
SET location = ST_SetSRID(
        ST_MakePoint(longitude, latitude),
        4326
               )
WHERE location IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL;

ALTER TABLE issues
    ALTER COLUMN location SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_issues_location
    ON issues
    USING GIST (location);