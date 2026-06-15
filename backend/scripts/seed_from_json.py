"""Create tables and seed PostgreSQL from platform/data/cms.json."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.schemas.cms import CmsDataSchema  # noqa: E402
from app.services.cms import load_cms, save_cms  # noqa: E402

CMS_JSON = ROOT.parent / "platform" / "data" / "cms.json"


def main() -> None:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    if not CMS_JSON.exists():
        print(f"Missing {CMS_JSON}")
        sys.exit(1)

    raw = json.loads(CMS_JSON.read_text(encoding="utf-8"))
    payload = CmsDataSchema.model_validate(raw)

    db = SessionLocal()
    try:
        print("Seeding CMS data...")
        save_cms(db, payload)
        result = load_cms(db)
        print(
            f"Done: {len(result.states)} states, {len(result.cities)} cities, "
            f"{len(result.lawyers)} lawyers"
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
