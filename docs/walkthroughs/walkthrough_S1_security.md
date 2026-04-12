# Fixing S-1 Security Issue

We have implemented the approved plan to close the `S-1` security problem.

## What Was Done

- **Harden Git Ignore**: `backend/.gitignore` now uses the `.env*` wildcard out of an abundance of caution, ensuring that no `.env.local` or similar files will accidentally be committed by any developers in the future.
- **Example Environments Updated**: Fixed `backend/.env.example` by updating the placeholder database name from `gilded_heirloom` to `hindustanemb_db`.
- **Fixed CORS Configuration**: We've aligned the environment defaults. The `CORS_ORIGIN` inside `backend/.env.example` has been updated from port `5173` to port `3000`, resolving issue **S-2**.
- **Removed Leak artifacts**: Scrubbed stale log data artifacts (`backend/server.err.log`, `backend/server.out.log`, `backend/out.txt`).

## What's Next

> [!CAUTION]
> **Action Required**: Since the database password was inside `.env` in plaintext, you must manually rotate your password immediately.
> 
> Open your `PSQL` prompt or tool (e.g. pgAdmin/DBeaver) and run:
> ```sql
> ALTER USER postgres WITH PASSWORD 'a_new_strong_password';
> ```
> *Remember to update your `backend/.env` file with the NEW password afterwards, otherwise the application will fail to start.*
