import json
import pytest
from model.pipeline import normalize_and_join_composite_text

def test_golden_preprocessing_parity():
    """Verify that Python's preprocessing implementation matches the golden fixtures character-for-character."""
    with open("tests/fixtures/golden_preprocessing.json", "r", encoding="utf-8") as f:
        fixtures = json.load(f)

    assert len(fixtures) == 200, f"Expected 200 golden fixtures, got {len(fixtures)}"

    mismatches = []
    for idx, fixture in enumerate(fixtures):
        raw = fixture["raw"]
        expected = fixture["expectedNormalized"]
        
        computed = normalize_and_join_composite_text(
            title=raw.get("title", ""),
            description=raw.get("description", ""),
            headings=raw.get("headings", []),
            main_text=raw.get("mainText", "")
        )

        if computed != expected:
            mismatches.append({
                "idx": idx,
                "id": fixture.get("id"),
                "expected": expected,
                "computed": computed
            })

    assert len(mismatches) == 0, f"Found {len(mismatches)} parity mismatches out of {len(fixtures)}"
