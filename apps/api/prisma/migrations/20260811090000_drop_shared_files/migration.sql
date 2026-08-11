-- Announcements replaced file uploads, so nothing writes or reads this table any more.
-- The files it pointed at lived on the API container's own disk, which is wiped on
-- every redeploy, so the rows were already unreliable in a hosted environment.
-- DROP TABLE takes its indexes and foreign keys with it.
DROP TABLE IF EXISTS "shared_files";
