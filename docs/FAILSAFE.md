# EpidemiWatch – Fail‑Safe Manual

> If something breaks, do NOT panic. Use this guide to recover quickly.

---

## Principle

**Working demo > perfect system**

If a task takes more than 30 minutes, cut or replace it with a simpler version.

---

## Common Failures & Solutions

### 1. Quarkus won't start / Maven errors

**Fix:**

- Delete `backend/target` and `~/.m2/repository` (only if desperate)
- Run `./mvnw quarkus:dev` again
- If still broken, ask Bob: *"Fix Quarkus compilation errors in this project"* and paste the error.

**Fallback:** Skip Quarkus entirely? **No** – Quarkus is core for IBM stack. But you can switch to H2 database (in‑memory) instead of PostgreSQL.

### 2. PostgreSQL connection fails locally

**Fix:**
Use H2 for local dev. Change `application.properties`:

```properties
quarkus.datasource.db-kind=h2
quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb
quarkus.hibernate-orm.database.generation=update
```



**Fallback:** Keep H2 for entire hackathon – judges only see the demo, not your local DB. Deploy with PostgreSQL on OpenShift later.
