# Backup & restore drill (GAP-072 / NFR-018)

Procedure for **Windows LocalDB** / SQL Server. Do **not** run backups in CI; this is an ops/dev drill runbook.

## Prerequisites

- SQL Server or LocalDB installed
- Connection string for the Happy Veggie database (see `ConnectionStrings:DefaultConnection`)
- `sqlcmd` on PATH (or use SSMS / Azure Data Studio)

## Identify LocalDB instance

```powershell
sqllocaldb info
sqllocaldb start MSSQLLocalDB
```

Typical LocalDB connection:

```text
Server=(localdb)\MSSQLLocalDB;Database=HappyVeggie;Trusted_Connection=True;TrustServerCertificate=True
```

## Backup (full)

Replace `HappyVeggie` and paths as needed:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "BACKUP DATABASE [HappyVeggie] TO DISK = N'D:\backups\HappyVeggie_full.bak' WITH FORMAT, INIT, NAME = N'HappyVeggie-full'"
```

SQL Server (named instance / remote):

```powershell
sqlcmd -S "localhost" -d master -Q "BACKUP DATABASE [HappyVeggie] TO DISK = N'D:\backups\HappyVeggie_full.bak' WITH FORMAT, INIT"
```

## Restore drill

1. Stop the API (and any other clients using the DB).
2. Restore into a **drill** database name first when possible:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "RESTORE DATABASE [HappyVeggie_Drill] FROM DISK = N'D:\backups\HappyVeggie_full.bak' WITH MOVE N'HappyVeggie' TO N'D:\backups\HappyVeggie_Drill.mdf', MOVE N'HappyVeggie_log' TO N'D:\backups\HappyVeggie_Drill_log.ldf', REPLACE"
```

Logical file names may differ — inspect with:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "RESTORE FILELISTONLY FROM DISK = N'D:\backups\HappyVeggie_full.bak'"
```

3. Point a local `appsettings.Local.json` connection string at `HappyVeggie_Drill` and run:

```powershell
dotnet ef database update --project src/HappyVeggie.Infrastructure --startup-project src/HappyVeggie.Api
```

(Only if the restore is behind migrations; otherwise verify schema matches.)

4. Smoke: `GET /api/v1/system/health` → `dbReachable: true`; login / list farms on drill DB.

5. Drop drill DB when finished:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "DROP DATABASE [HappyVeggie_Drill]"
```

## Overwrite restore (destructive — local only)

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "ALTER DATABASE [HappyVeggie] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE [HappyVeggie] FROM DISK = N'D:\backups\HappyVeggie_full.bak' WITH REPLACE; ALTER DATABASE [HappyVeggie] SET MULTI_USER"
```

## RPO / RTO (document for ops)

| Item | Value |
|------|--------|
| RPO intent | **TBD** (hosting backup cadence) |
| RTO intent | **TBD** (restore drill timing) |
| Schema source of truth | EF Core migrations under `HappyVeggie.Infrastructure` |

## CI note

Automated backup/restore is **out of scope for CI**. Keep this runbook as the evidence artifact for GAP-072 / TASK-151.
