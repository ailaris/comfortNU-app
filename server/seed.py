import asyncio
import json
import re
from datetime import datetime
from typing import Optional

from sqlalchemy import func, select

import models
from database import AsyncSessionLocal, Base, engine

ATRIUM_RE = re.compile(
    r"Atrium:\s*🌡\s*([\d.]+)[°º]?[cC].*?💡\s*([A-Za-z ]+?)\s*🔉\s*([A-Za-z ]+)$"
)
OUTSIDE_RE = re.compile(r"Outside NU:\s*🌡\s*([\d.]+)")


def parse_message(text: str) -> Optional[dict]:
    text = text.strip()  # delet spaces

    if text.startswith("🏫") or "Atrium:" in text:  # inside info
        m = ATRIUM_RE.search(text)
        if not m:
            return None
        temperature, brightness_str, noise_str = m.groups()

        return {
            "location": "atrium",
            "temperature": float(temperature),
            "brightness": brightness_str.strip(),
            "noise": noise_str.strip(),
        }

    if text.startswith("🌆") or "Outside NU:" in text:  # outside info
        m = OUTSIDE_RE.search(text)
        if not m:
            return None
        temperature = m.group(1)
        return {
            "location": "outside",
            "temperature": float(temperature),
            "brightness": None,
            "noise": None,
        }

    return None


async def seed_readings(json_path: str = "result.json") -> None:
    # create tables if dont existn
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # check if db is empty
        count = await session.scalar(select(func.count()).select_from(models.Reading))
        if count:
            print("Readings already exist; skipping sample data.")
            return

        print("Reading sample data ...")
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            print("sample data is not found")
            return

        inserted = 0
        skipped = 0
        readings_to_add = []

        #  parsing messages
        for msg in data.get("messages", []):
            if msg.get("type") != "message":
                continue

            text = msg.get("text")
            if not isinstance(text, str):
                continue

            parsed = parse_message(text)
            if parsed is None:
                skipped += 1
                continue

            measured_at = datetime.fromisoformat(msg["date"])

            reading = models.Reading(
                measured_at=measured_at,
                location=parsed["location"],
                temperature=parsed["temperature"],
                brightness=parsed["brightness"],
                noise=parsed["noise"],
            )
            readings_to_add.append(reading)
            inserted += 1

        # save to db
        if readings_to_add:
            session.add_all(readings_to_add)
            await session.commit()
            print(
                f"Import completed! Added to database: {inserted} records. Skipped: {skipped}."
            )
        else:
            print("Failed to parse any messages.")


async def main() -> None:
    try:
        await seed_readings()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
