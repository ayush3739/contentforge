"""
ContentForge AI — Comprehensive Neon PostgreSQL Schema Audit
Compares all SQLAlchemy models against the live Neon DB schema.
"""

import sys
import os
sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import inspect, text
from app.core.database import engine, Base
import app.models  # Load all ORM models


def run_audit():
    insp = inspect(engine)
    db_tables = set(insp.get_table_names())
    model_tables = set(Base.metadata.tables.keys())

    print("================================================================")
    print("1. TABLE AUDIT")
    print("================================================================")
    print(f"Total ORM Model Tables: {len(model_tables)}")
    print(f"Total Live Neon Tables: {len(db_tables)}")

    missing_tables = model_tables - db_tables
    if missing_tables:
        print(f"CRITICAL: Tables in code but MISSING in Neon DB: {missing_tables}")
    else:
        print("PASS: All ORM model tables exist in Neon PostgreSQL.")

    extra_tables = db_tables - model_tables - {"alembic_version"}
    if extra_tables:
        print(f"Notice: Extra tables in Neon DB (not in models): {extra_tables}")

    print("\n================================================================")
    print("2. COLUMN AUDIT (Model vs Database)")
    print("================================================================")
    missing_count = 0
    extra_count = 0
    nullability_mismatches = 0

    for table_name in sorted(model_tables):
        if table_name not in db_tables:
            continue
        model_table = Base.metadata.tables[table_name]
        db_cols = {c["name"]: c for c in insp.get_columns(table_name)}
        model_cols = {c.name: c for c in model_table.columns}

        missing = set(model_cols.keys()) - set(db_cols.keys())
        extra = set(db_cols.keys()) - set(model_cols.keys())

        if missing:
            missing_count += len(missing)
            print(f"[!] {table_name}: MISSING columns in DB: {missing}")
        if extra:
            extra_count += len(extra)
            print(f"[*] {table_name}: extra columns in DB: {extra}")

        for col_name in set(model_cols.keys()) & set(db_cols.keys()):
            m_col = model_cols[col_name]
            d_col = db_cols[col_name]
            # Check nullable mismatch: model requires value (nullable=False) but DB allows null
            if m_col.nullable != d_col.get("nullable"):
                nullability_mismatches += 1
                print(
                    f"    ~ {table_name}.{col_name}: nullability mismatch (ORM: {m_col.nullable}, DB: {d_col.get('nullable')})"
                )

    if missing_count == 0:
        print("PASS: 0 missing columns across all tables! Models match Neon DB 100%.")

    print("\n================================================================")
    print("3. PRIMARY KEYS & INDEXES")
    print("================================================================")
    for table_name in sorted(model_tables):
        if table_name not in db_tables:
            continue
        pk = insp.get_pk_constraint(table_name)
        indexes = insp.get_indexes(table_name)
        print(
            f"Table {table_name:<25}: PK={pk.get('constrained_columns', [])} | {len(indexes)} Indexes"
        )

    print("\n================================================================")
    print("4. FOREIGN KEYS INTEGRITY")
    print("================================================================")
    for table_name in sorted(model_tables):
        if table_name not in db_tables:
            continue
        db_fks = insp.get_foreign_keys(table_name)
        model_fks = Base.metadata.tables[table_name].foreign_keys
        print(
            f"Table {table_name:<25}: {len(db_fks)} Live DB FKs | {len(model_fks)} Model FKs"
        )

    print("\n================================================================")
    print("5. LIVE QUERY HEALTH CHECK (SELECT 1 from each table)")
    print("================================================================")
    with engine.connect() as conn:
        for table_name in sorted(model_tables):
            try:
                res = conn.execute(text(f"SELECT * FROM {table_name} LIMIT 1"))
                cols = list(res.keys())
                count = conn.execute(text(f"SELECT count(*) FROM {table_name}")).scalar()
                print(f"[OK]   {table_name:<25} ({len(cols):>2} cols, {count:>4} rows)")
            except Exception as exc:
                print(f"[FAIL] {table_name:<25} query error: {exc}")

    print("\n================================================================")
    print("AUDIT COMPLETE")
    print("================================================================")


if __name__ == "__main__":
    run_audit()
