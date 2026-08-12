CREATE INDEX idx_issues_location_geography
    ON issues
    USING GIST ((location::geography));