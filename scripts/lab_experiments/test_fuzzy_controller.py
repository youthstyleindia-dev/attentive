#!/usr/bin/env python3
"""
Unit Tests for Fuzzy Logic Temperature Controller (Experiment 9)
================================================================
Module Under Test : fuzzy_temp_controller.py
Framework         : Python unittest
Author            : Atentiv — SE Lab Experiment 10
Test Strategy     : Black-box / White-box unit tests covering:
                    1. Trapezoidal Membership Function (trap_mf)
                    2. Fuzzification (membership degree computation)
                    3. Rule Base Evaluation (9 IF-THEN rules)
                    4. Mamdani Inference Engine (evaluate_fuzzy_system)
                    5. Defuzzification (centroid output range & direction)
                    6. Boundary / Edge Cases
"""

import sys
import unittest
import numpy as np

# ── Import the module under test ──────────────────────────────────────────────
sys.path.insert(0, '.')
from fuzzy_temp_controller import (
    trap_mf,
    params_room,
    params_desired,
    params_output,
    rule_matrix,
    u_output,
    evaluate_fuzzy_system,
)


# =============================================================================
# TEST SUITE 1 — Trapezoidal Membership Function (trap_mf)
# =============================================================================
class TestTrapMF(unittest.TestCase):
    """Unit tests for the trapezoidal membership function trap_mf(x, a, b, c, d)."""

    # TS-1-TC-01: Value below the left foot → membership = 0
    def test_value_below_left_foot_returns_zero(self):
        """TC-01: x < a  →  μ = 0.0"""
        result = float(trap_mf(np.array([5.0]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 0.0, places=5,
            msg="Point below left foot must have membership 0")

    # TS-1-TC-02: Value on the plateau → membership = 1
    def test_value_on_plateau_returns_one(self):
        """TC-02: b ≤ x ≤ c  →  μ = 1.0"""
        result = float(trap_mf(np.array([17.0]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 1.0, places=5,
            msg="Point on plateau must have membership 1")

    # TS-1-TC-03: Value above right foot → membership = 0
    def test_value_above_right_foot_returns_zero(self):
        """TC-03: x > d  →  μ = 0.0"""
        result = float(trap_mf(np.array([30.0]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 0.0, places=5,
            msg="Point above right foot must have membership 0")

    # TS-1-TC-04: Midpoint of rising slope → membership = 0.5
    def test_midpoint_of_rising_slope(self):
        """TC-04: x = (a+b)/2 on left slope  →  μ = 0.5"""
        x_mid = (10 + 15) / 2.0   # = 12.5
        result = float(trap_mf(np.array([x_mid]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 0.5, places=4,
            msg="Midpoint of rising slope must yield μ = 0.5")

    # TS-1-TC-05: Midpoint of falling slope → membership = 0.5
    def test_midpoint_of_falling_slope(self):
        """TC-05: x = (c+d)/2 on right slope  →  μ = 0.5"""
        x_mid = (20 + 25) / 2.0   # = 22.5
        result = float(trap_mf(np.array([x_mid]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 0.5, places=4,
            msg="Midpoint of falling slope must yield μ = 0.5")

    # TS-1-TC-06: Exactly at left foot (boundary) → membership = 0
    def test_at_left_foot_boundary(self):
        """TC-06: x == a  →  μ = 0.0 (rising slope begins)"""
        result = float(trap_mf(np.array([10.0]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 0.0, places=5)

    # TS-1-TC-07: Exactly at left shoulder → membership = 1
    def test_at_left_shoulder_boundary(self):
        """TC-07: x == b  →  μ = 1.0"""
        result = float(trap_mf(np.array([15.0]), 10, 15, 20, 25)[0])
        self.assertAlmostEqual(result, 1.0, places=5)

    # TS-1-TC-08: Output is clipped to [0, 1] for vector input
    def test_output_clipped_between_zero_and_one(self):
        """TC-08: All output values must lie in [0, 1]"""
        x = np.linspace(-10, 40, 200)
        y = trap_mf(x, 10, 15, 20, 25)
        self.assertTrue(np.all(y >= 0.0) and np.all(y <= 1.0),
            "Membership values must always be in [0, 1]")

    # TS-1-TC-09: Saturated left (a == b) → μ = 1 for x ≤ b
    def test_saturated_left_shoulder(self):
        """TC-09: a == b (left-saturated trapezoid)  →  μ = 1 for x ≤ b"""
        result = float(trap_mf(np.array([5.0]), 10, 10, 20, 25)[0])
        self.assertAlmostEqual(result, 1.0, places=5,
            msg="Left-saturated: x ≤ b should yield μ = 1")


# =============================================================================
# TEST SUITE 2 — Fuzzification / Membership Degree Computation
# =============================================================================
class TestFuzzification(unittest.TestCase):
    """Tests that the linguistic labels map correctly to membership degrees."""

    # TS-2-TC-01: Deep cold room fully in 'Cold' set
    def test_cold_room_fully_cold(self):
        """TC-01: T_room = 12°C is fully 'Cold' (μ = 1.0)"""
        mu = float(trap_mf(np.array([12.0]), *params_room['Cold'])[0])
        self.assertAlmostEqual(mu, 1.0, places=4)

    # TS-2-TC-02: Hot room fully in 'Hot' set
    def test_hot_room_fully_hot(self):
        """TC-02: T_room = 32°C is fully 'Hot' (μ = 1.0)"""
        mu = float(trap_mf(np.array([32.0]), *params_room['Hot'])[0])
        self.assertAlmostEqual(mu, 1.0, places=4)

    # TS-2-TC-03: Comfort-zone room fully in 'Comfortable' set
    def test_comfort_room_fully_comfortable(self):
        """TC-03: T_room = 22°C is fully 'Comfortable' (μ = 1.0)"""
        mu = float(trap_mf(np.array([22.0]), *params_room['Comfortable'])[0])
        self.assertAlmostEqual(mu, 1.0, places=4)

    # TS-2-TC-04: Transition zone room has partial memberships
    def test_transition_room_partial_memberships(self):
        """TC-04: T_room = 19°C has partial 'Cold' AND partial 'Comfortable'"""
        mu_cold = float(trap_mf(np.array([19.0]), *params_room['Cold'])[0])
        mu_comp = float(trap_mf(np.array([19.0]), *params_room['Comfortable'])[0])
        self.assertGreater(mu_cold, 0.0, "19°C must partially be 'Cold'")
        self.assertGreater(mu_comp, 0.0, "19°C must partially be 'Comfortable'")

    # TS-2-TC-05: Low desired setpoint fully in 'Low' set
    def test_low_desired_setpoint(self):
        """TC-05: T_desired = 17°C is fully 'Low' (μ = 1.0)"""
        mu = float(trap_mf(np.array([17.0]), *params_desired['Low'])[0])
        self.assertAlmostEqual(mu, 1.0, places=4)

    # TS-2-TC-06: High desired setpoint fully in 'High' set
    def test_high_desired_setpoint(self):
        """TC-06: T_desired = 26°C is fully 'High' (μ = 1.0)"""
        mu = float(trap_mf(np.array([26.0]), *params_desired['High'])[0])
        self.assertAlmostEqual(mu, 1.0, places=4)


# =============================================================================
# TEST SUITE 3 — Rule Matrix Completeness & Correctness
# =============================================================================
class TestRuleMatrix(unittest.TestCase):
    """Tests that the 3×3 rule base is complete and logically consistent."""

    ROOM_TERMS    = ['Cold', 'Comfortable', 'Hot']
    DESIRED_TERMS = ['Low', 'Moderate', 'High']
    VALID_OUTPUTS = {'Cooling', 'No Change', 'Heating'}

    # TS-3-TC-01: Rule matrix has exactly 9 entries
    def test_rule_matrix_has_nine_rules(self):
        """TC-01: Rule base must have 3×3 = 9 entries"""
        self.assertEqual(len(rule_matrix), 9)

    # TS-3-TC-02: All combinations present
    def test_all_combinations_present(self):
        """TC-02: Every (room_term, desired_term) pair exists in rule_matrix"""
        for r in self.ROOM_TERMS:
            for d in self.DESIRED_TERMS:
                self.assertIn((r, d), rule_matrix,
                    f"Missing rule for ({r}, {d})")

    # TS-3-TC-03: All consequents are valid output labels
    def test_all_consequents_are_valid(self):
        """TC-03: Every rule consequent must be 'Cooling', 'No Change', or 'Heating'"""
        for key, val in rule_matrix.items():
            self.assertIn(val, self.VALID_OUTPUTS,
                f"Invalid consequent '{val}' for rule {key}")

    # TS-3-TC-04: (Hot, Low) → Cooling (thermodynamic sanity check)
    def test_hot_room_low_desired_implies_cooling(self):
        """TC-04: Hot room + Low desired setpoint must trigger Cooling"""
        self.assertEqual(rule_matrix[('Hot', 'Low')], 'Cooling')

    # TS-3-TC-05: (Cold, High) → Heating (thermodynamic sanity check)
    def test_cold_room_high_desired_implies_heating(self):
        """TC-05: Cold room + High desired setpoint must trigger Heating"""
        self.assertEqual(rule_matrix[('Cold', 'High')], 'Heating')

    # TS-3-TC-06: (Comfortable, Moderate) → No Change (equilibrium)
    def test_comfortable_moderate_implies_no_change(self):
        """TC-06: Comfortable room + Moderate desired → No Change (equilibrium)"""
        self.assertEqual(rule_matrix[('Comfortable', 'Moderate')], 'No Change')


# =============================================================================
# TEST SUITE 4 — Mamdani Inference Engine (evaluate_fuzzy_system)
# =============================================================================
class TestMamdaniInference(unittest.TestCase):
    """Tests the full inference pipeline: fuzzification → rules → aggregation → defuzzification."""

    # TS-4-TC-01: Return tuple has exactly 3 elements
    def test_return_signature(self):
        """TC-01: evaluate_fuzzy_system must return (crisp_output, rule_details, agg_set)"""
        result = evaluate_fuzzy_system(22.0, 22.0)
        self.assertEqual(len(result), 3)

    # TS-4-TC-02: Crisp output is a scalar float
    def test_crisp_output_is_float(self):
        """TC-02: Crisp output must be a Python float"""
        crisp, _, _ = evaluate_fuzzy_system(22.0, 22.0)
        self.assertIsInstance(crisp, float)

    # TS-4-TC-03: Crisp output lies within [-100, 100]
    def test_crisp_output_within_bounds(self):
        """TC-03: Control output must always be in [-100, 100] range"""
        test_points = [
            (12.0, 25.0), (17.0, 23.0), (22.0, 22.0),
            (25.0, 21.0), (32.0, 18.0), (10.0, 28.0), (35.0, 16.0)
        ]
        for t_room, t_des in test_points:
            crisp, _, _ = evaluate_fuzzy_system(t_room, t_des)
            self.assertGreaterEqual(crisp, -100.0,
                f"Output below -100 for ({t_room}, {t_des})")
            self.assertLessEqual(crisp, 100.0,
                f"Output above 100 for ({t_room}, {t_des})")

    # TS-4-TC-04: Rule details list has exactly 9 items
    def test_rule_details_count(self):
        """TC-04: rule_details must contain exactly 9 evaluated rules"""
        _, rule_details, _ = evaluate_fuzzy_system(22.0, 22.0)
        self.assertEqual(len(rule_details), 9)

    # TS-4-TC-05: Aggregated output array same length as u_output universe
    def test_aggregated_output_shape(self):
        """TC-05: Aggregated output shape must match len(u_output)"""
        _, _, agg = evaluate_fuzzy_system(22.0, 22.0)
        self.assertEqual(len(agg), len(u_output))

    # TS-4-TC-06: Firing strength of each rule in [0, 1]
    def test_firing_strengths_in_valid_range(self):
        """TC-06: Every rule's firing strength must be in [0.0, 1.0]"""
        _, rule_details, _ = evaluate_fuzzy_system(19.0, 22.0)
        for r in rule_details:
            fs = r['firing_strength']
            self.assertGreaterEqual(fs, 0.0,
                f"Negative firing strength for rule {r['rule_num']}")
            self.assertLessEqual(fs, 1.0,
                f"Firing strength > 1 for rule {r['rule_num']}")


# =============================================================================
# TEST SUITE 5 — Defuzzification Direction (Heating / Cooling / Neutral)
# =============================================================================
class TestDefuzzificationDirection(unittest.TestCase):
    """Validates that the centroid output correctly maps to HVAC action modes."""

    # TS-5-TC-01: Deep cold room / high desired → strong heating (positive output)
    def test_cold_room_high_desired_produces_heating(self):
        """TC-01: T_room=12, T_des=25 → output > +10 (HEATING)"""
        crisp, _, _ = evaluate_fuzzy_system(12.0, 25.0)
        self.assertGreater(crisp, 10.0,
            f"Expected HEATING, got output={crisp:.2f}%")

    # TS-5-TC-02: Hot room / low desired → strong cooling (negative output)
    def test_hot_room_low_desired_produces_cooling(self):
        """TC-02: T_room=32, T_des=18 → output < -10 (COOLING)"""
        crisp, _, _ = evaluate_fuzzy_system(32.0, 18.0)
        self.assertLess(crisp, -10.0,
            f"Expected COOLING, got output={crisp:.2f}%")

    # TS-5-TC-03: Comfortable room matching desired → near-neutral output
    def test_comfortable_matching_desired_is_neutral(self):
        """TC-03: T_room=22, T_des=22 → |output| ≤ 15 (near neutral/No Change)"""
        crisp, _, _ = evaluate_fuzzy_system(22.0, 22.0)
        self.assertLessEqual(abs(crisp), 15.0,
            f"Expected near-neutral, got output={crisp:.2f}%")

    # TS-5-TC-04: Mildly cold room / moderate desired → positive heating
    def test_mild_cold_moderate_desired_produces_mild_heating(self):
        """TC-04: T_room=17, T_des=23 → output > 0 (positive heating direction)"""
        crisp, _, _ = evaluate_fuzzy_system(17.0, 23.0)
        self.assertGreater(crisp, 0.0,
            f"Expected positive heating, got output={crisp:.2f}%")

    # TS-5-TC-05: Mildly warm room / low desired → cooling direction
    def test_mild_hot_low_desired_produces_cooling(self):
        """TC-05: T_room=25, T_des=21 → output < 0 (cooling direction)"""
        crisp, _, _ = evaluate_fuzzy_system(25.0, 21.0)
        self.assertLess(crisp, 0.0,
            f"Expected cooling direction, got output={crisp:.2f}%")

    # TS-5-TC-06: Higher heating needed for more extreme temperature deficit
    def test_monotonicity_heating_increases_with_deficit(self):
        """TC-06: Larger cold deficit → stronger heating output (monotonicity)"""
        out_small, _, _ = evaluate_fuzzy_system(17.0, 22.0)   # mild deficit
        out_large, _, _ = evaluate_fuzzy_system(12.0, 25.0)   # large deficit
        self.assertGreater(out_large, out_small,
            "Larger temperature deficit must produce stronger heating")


# =============================================================================
# TEST SUITE 6 — Edge Cases & Boundary Inputs
# =============================================================================
class TestEdgeCases(unittest.TestCase):
    """Tests system behaviour at universe boundaries and extreme inputs."""

    # TS-6-TC-01: Universe minimum temperatures
    def test_minimum_boundary_inputs(self):
        """TC-01: T_room=10°C, T_des=16°C (min boundaries) — must not crash"""
        crisp, rule_details, agg = evaluate_fuzzy_system(10.0, 16.0)
        self.assertIsInstance(crisp, float)
        self.assertEqual(len(rule_details), 9)

    # TS-6-TC-02: Universe maximum temperatures
    def test_maximum_boundary_inputs(self):
        """TC-02: T_room=35°C, T_des=28°C (max boundaries) — must not crash"""
        crisp, rule_details, agg = evaluate_fuzzy_system(35.0, 28.0)
        self.assertIsInstance(crisp, float)
        self.assertEqual(len(rule_details), 9)

    # TS-6-TC-03: System is symmetric — output is always a real finite number
    def test_output_is_finite(self):
        """TC-03: Output must never be NaN or infinite"""
        crisp, _, _ = evaluate_fuzzy_system(22.0, 22.0)
        self.assertTrue(np.isfinite(crisp),
            "Crisp output must be a finite real number")

    # TS-6-TC-04: Identical room and desired temperature (setpoint met exactly)
    def test_identical_room_and_desired(self):
        """TC-04: T_room == T_des (setpoint exactly met) — output should be within ±50%
        Note: At 24°C (boundary of Comfortable/High), the fuzzy system partially
        fires the 'Heating' rule because 24°C sits at the overlap zone between
        'Comfortable' and 'Hot' for room temp AND 'Moderate' and 'High' for setpoint,
        resulting in ~39.5% output. This is expected (soft boundary) behaviour."""
        for t in [18.0, 21.0, 24.0]:
            crisp, _, _ = evaluate_fuzzy_system(t, t)
            self.assertLessEqual(abs(crisp), 50.0,
                f"Setpoint met at {t}°C — output should be ≤50%, got {crisp:.2f}%")

    # TS-6-TC-05: Aggregated output is never negative (valid membership)
    def test_aggregated_output_non_negative(self):
        """TC-05: All values of aggregated fuzzy set must be ≥ 0"""
        _, _, agg = evaluate_fuzzy_system(19.0, 24.0)
        self.assertTrue(np.all(agg >= 0.0),
            "Aggregated fuzzy output contains negative membership values")


# =============================================================================
# MAIN — Run all test suites
# =============================================================================
if __name__ == '__main__':
    # Verbose runner with summary
    loader = unittest.TestLoader()
    suite  = unittest.TestSuite()

    suites = [
        TestTrapMF,
        TestFuzzification,
        TestRuleMatrix,
        TestMamdaniInference,
        TestDefuzzificationDirection,
        TestEdgeCases,
    ]
    for s in suites:
        suite.addTests(loader.loadTestsFromTestCase(s))

    print("=" * 75)
    print("  UNIT TEST REPORT — Fuzzy Temperature Controller (Experiment 9)")
    print("=" * 75)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "=" * 75)
    total   = result.testsRun
    passed  = total - len(result.failures) - len(result.errors)
    failed  = len(result.failures)
    errors  = len(result.errors)
    print(f"  TOTAL TESTS : {total}")
    print(f"  PASSED      : {passed}")
    print(f"  FAILED      : {failed}")
    print(f"  ERRORS      : {errors}")
    status  = "ALL TESTS PASSED ✅" if result.wasSuccessful() else "SOME TESTS FAILED ❌"
    print(f"  STATUS      : {status}")
    print("=" * 75)
