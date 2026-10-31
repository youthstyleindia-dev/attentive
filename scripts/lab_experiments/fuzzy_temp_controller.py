#!/usr/bin/env python3
"""
Fuzzy Logic Controller for Room Temperature Control
===================================================
Author: AI Coding Assistant & Control Systems Engineering
Purpose: Maintain thermal comfort and optimize energy efficiency using
         Mamdani Fuzzy Inference with Centroid Defuzzification.
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Configure matplotlib style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Helvetica', 'Arial', 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cccccc'
plt.rcParams['axes.linewidth'] = 0.8

# ==========================================
# 1. TRAPEZOIDAL MEMBERSHIP FUNCTION DEFINITION
# ==========================================
def trap_mf(x, a, b, c, d):
    """
    Evaluates trapezoidal membership function for input array x.
    Parameters:
      a: left foot
      b: left shoulder
      c: right shoulder
      d: right foot
    """
    x = np.asarray(x, dtype=float)
    y = np.zeros_like(x)
    
    # Left slope
    if b > a:
        idx_up = (x >= a) & (x < b)
        y[idx_up] = (x[idx_up] - a) / (b - a)
    elif b == a:
        y[x <= b] = 1.0  # left unbounded / saturated

    # Top plateau
    idx_top = (x >= b) & (x <= c)
    y[idx_top] = 1.0
    
    # Right slope
    if d > c:
        idx_down = (x > c) & (x <= d)
        y[idx_down] = (d - x[idx_down]) / (d - c)
    elif d == c:
        y[x >= c] = 1.0  # right unbounded / saturated

    return np.clip(y, 0.0, 1.0)


# ==========================================
# 2. SYSTEM SPECIFICATIONS & LINGUISTIC LABELS
# ==========================================
# Universes of discourse
u_room = np.linspace(10, 35, 1000)      # Room Temp (°C)
u_desired = np.linspace(16, 28, 1000)   # Desired Temp (°C)
u_output = np.linspace(-100, 100, 1000) # Control Action (%: -100=Max Cooling, +100=Max Heating)

# Trapezoidal parameters (a, b, c, d)
params_room = {
    'Cold':        (10, 10, 16, 20),
    'Comfortable': (18, 21, 23, 26),
    'Hot':         (24, 27, 35, 35)
}

params_desired = {
    'Low':      (16, 16, 18, 20),
    'Moderate': (19, 21, 23, 25),
    'High':     (23, 25, 28, 28)
}

params_output = {
    'Cooling':   (-100, -100, -50, 0),
    'No Change': (-25, -10, 10, 25),
    'Heating':   (0, 50, 100, 100)
}

# 3x3 Rule Base Matrix
# Rows: Room Temp (Cold, Comfortable, Hot)
# Cols: Desired Temp (Low, Moderate, High)
# Output: Linguistic Label
rule_matrix = {
    ('Cold', 'Low'):        'No Change', # Room cold but user set low; minimal/no heating
    ('Cold', 'Moderate'):   'Heating',
    ('Cold', 'High'):       'Heating',
    ('Comfortable', 'Low'): 'Cooling',
    ('Comfortable', 'Moderate'): 'No Change',
    ('Comfortable', 'High'): 'Heating',
    ('Hot', 'Low'):         'Cooling',
    ('Hot', 'Moderate'):    'Cooling',
    ('Hot', 'High'):        'No Change'  # Room already hot, target high (~26); passive or no change
}


# ==========================================
# 3. MAMDANI INFERENCE ENGINE
# ==========================================
def evaluate_fuzzy_system(t_room_val, t_des_val, u_out=u_output, verbose=False):
    """
    Performs full Mamdani fuzzy inference for given crisp inputs.
    Returns:
      crisp_output: Centroid defuzzified output
      rule_details: Dictionary containing firing strengths & clipped sets
      aggregated_output: The combined fuzzy output set
    """
    # Step 1: Fuzzification
    room_memberships = {
        term: float(trap_mf(np.array([t_room_val]), *p)[0])
        for term, p in params_room.items()
    }
    desired_memberships = {
        term: float(trap_mf(np.array([t_des_val]), *p)[0])
        for term, p in params_desired.items()
    }
    
    if verbose:
        print(f"--- Fuzzification for T_room = {t_room_val}°C, T_desired = {t_des_val}°C ---")
        print("  Room Temperature Memberships:")
        for k, v in room_memberships.items():
            print(f"    - {k:12s}: {v:.4f}")
        print("  Desired Temperature Memberships:")
        for k, v in desired_memberships.items():
            print(f"    - {k:12s}: {v:.4f}")

    # Step 2 & 3: Rule Evaluation & Implication (Min-T-norm)
    aggregated_output = np.zeros_like(u_out)
    rule_details = []
    
    if verbose:
        print("\n--- Rule Evaluation & Implication (Mamdani Min) ---")

    rule_num = 1
    for r_term in ['Cold', 'Comfortable', 'Hot']:
        for d_term in ['Low', 'Moderate', 'High']:
            consequent = rule_matrix[(r_term, d_term)]
            mu_r = room_memberships[r_term]
            mu_d = desired_memberships[d_term]
            firing_strength = min(mu_r, mu_d)
            
            # Consequent membership curve
            cons_curve = trap_mf(u_out, *params_output[consequent])
            # Implication (clipping)
            clipped_curve = np.minimum(firing_strength, cons_curve)
            
            rule_details.append({
                'rule_num': rule_num,
                'r_term': r_term,
                'd_term': d_term,
                'consequent': consequent,
                'mu_r': mu_r,
                'mu_d': mu_d,
                'firing_strength': firing_strength,
                'clipped_curve': clipped_curve
            })
            
            if verbose and firing_strength > 0:
                print(f"  R{rule_num:02d}: IF Room is {r_term:11s} AND Desired is {d_term:8s} THEN Output is {consequent:10s} "
                      f"| w = min({mu_r:.3f}, {mu_d:.3f}) = {firing_strength:.4f}")

            # Step 4: Aggregation (Max-S-norm)
            aggregated_output = np.maximum(aggregated_output, clipped_curve)
            rule_num += 1

    # Step 5: Centroid Defuzzification
    numerator = np.sum(u_out * aggregated_output)
    denominator = np.sum(aggregated_output)
    
    if denominator == 0:
        crisp_output = 0.0
    else:
        crisp_output = numerator / denominator

    if verbose:
        print(f"\n--- Defuzzification (Centroid Method) ---")
        print(f"  Numerator   (Σ [u * μ_agg(u)]): {numerator:.4f}")
        print(f"  Denominator (Σ [μ_agg(u)])    : {denominator:.4f}")
        print(f"  Crisp Control Output (z*)     : {crisp_output:.2f}%")
        if crisp_output > 10:
            print(f"  Action Summary               : HEATING active at {abs(crisp_output):.1f}% intensity")
        elif crisp_output < -10:
            print(f"  Action Summary               : COOLING active at {abs(crisp_output):.1f}% intensity")
        else:
            print(f"  Action Summary               : NO CHANGE (Near neutral / deadband {crisp_output:.1f}%)")

    return crisp_output, rule_details, aggregated_output


# ==========================================
# 4. PLOTTING & VISUALIZATION FUNCTIONS
# ==========================================
def plot_membership_functions(save_path='fuzzy_membership_functions.png'):
    fig, axes = plt.subplots(3, 1, figsize=(10, 9), constrained_layout=True)
    
    # 1. Room Temperature
    ax = axes[0]
    colors_room = {'Cold': '#1f77b4', 'Comfortable': '#2ca02c', 'Hot': '#d62728'}
    for term, p in params_room.items():
        y = trap_mf(u_room, *p)
        ax.plot(u_room, y, label=term, color=colors_room[term], lw=2.5)
        ax.fill_between(u_room, 0, y, color=colors_room[term], alpha=0.15)
    ax.set_title('(a) Room Temperature Membership Functions ($T_{room}$)', fontsize=12, fontweight='bold')
    ax.set_xlabel('Room Temperature (°C)', fontsize=10)
    ax.set_ylabel('Membership Degree (μ)', fontsize=10)
    ax.set_ylim(-0.05, 1.1)
    ax.legend(loc='center right', frameon=True)
    ax.grid(True, linestyle='--', alpha=0.6)

    # 2. Desired Temperature
    ax = axes[1]
    colors_des = {'Low': '#3b528b', 'Moderate': '#5dc863', 'High': '#fde725'}
    for term, p in params_desired.items():
        y = trap_mf(u_desired, *p)
        ax.plot(u_desired, y, label=term, color=colors_des[term], lw=2.5)
        ax.fill_between(u_desired, 0, y, color=colors_des[term], alpha=0.15)
    ax.set_title('(b) Desired Temperature Membership Functions ($T_{desired}$)', fontsize=12, fontweight='bold')
    ax.set_xlabel('Desired Setpoint Temperature (°C)', fontsize=10)
    ax.set_ylabel('Membership Degree (μ)', fontsize=10)
    ax.set_ylim(-0.05, 1.1)
    ax.legend(loc='center right', frameon=True)
    ax.grid(True, linestyle='--', alpha=0.6)

    # 3. Control Output
    ax = axes[2]
    colors_out = {'Cooling': '#0077b6', 'No Change': '#6c757d', 'Heating': '#e63946'}
    for term, p in params_output.items():
        y = trap_mf(u_output, *p)
        ax.plot(u_output, y, label=term, color=colors_out[term], lw=2.5)
        ax.fill_between(u_output, 0, y, color=colors_out[term], alpha=0.15)
    ax.set_title('(c) Control Output Membership Functions (HVAC Intensity)', fontsize=12, fontweight='bold')
    ax.set_xlabel('Control Output (%) [-100: Max Cooling, 0: Standby, +100: Max Heating]', fontsize=10)
    ax.set_ylabel('Membership Degree (μ)', fontsize=10)
    ax.set_ylim(-0.05, 1.1)
    ax.legend(loc='center right', frameon=True)
    ax.grid(True, linestyle='--', alpha=0.6)

    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved: {save_path}")


def plot_inference_walkthrough(t_room=15.0, t_des=24.0, save_path='fuzzy_inference_case.png'):
    crisp_out, rule_details, agg_out = evaluate_fuzzy_system(t_room, t_des, verbose=False)
    
    # Filter active rules
    active_rules = [r for r in rule_details if r['firing_strength'] > 0]
    n_active = len(active_rules)
    
    fig, axes = plt.subplots(n_active + 1, 1, figsize=(10, 2.5 * (n_active + 1)), constrained_layout=True)
    if n_active == 0:
        axes = [axes]
    
    for idx, r in enumerate(active_rules):
        ax = axes[idx]
        out_base = trap_mf(u_output, *params_output[r['consequent']])
        ax.plot(u_output, out_base, '--', color='#aaaaaa', lw=1.2, label=f"Consequent: {r['consequent']}")
        ax.plot(u_output, r['clipped_curve'], color='#d62728', lw=2, label=f"Clipped (w={r['firing_strength']:.3f})")
        ax.fill_between(u_output, 0, r['clipped_curve'], color='#d62728', alpha=0.25)
        ax.axhline(r['firing_strength'], color='blue', linestyle=':', alpha=0.7, label=f"Firing level")
        ax.set_title(f"Rule R{r['rule_num']}: IF Room is {r['r_term']} (μ={r['mu_r']:.2f}) AND Desired is {r['d_term']} (μ={r['mu_d']:.2f}) "
                     f"THEN Output is {r['consequent']} | w={r['firing_strength']:.3f}", fontsize=10, fontweight='bold')
        ax.set_ylabel('μ', fontsize=9)
        ax.set_ylim(-0.05, 1.1)
        ax.legend(loc='upper right', fontsize=8)
        ax.grid(True, linestyle='--', alpha=0.5)

    # Aggregated & Centroid defuzzification
    ax_agg = axes[-1]
    ax_agg.plot(u_output, agg_out, color='#1b4965', lw=2.5, label=r'Aggregated Fuzzy Set $\mu_{agg}(u)$')
    ax_agg.fill_between(u_output, 0, agg_out, color='#62b6cb', alpha=0.45)
    ax_agg.axvline(crisp_out, color='#e63946', lw=3, linestyle='-', label=f'Centroid Crisp Output: z* = {crisp_out:.2f}%')
    ax_agg.set_title(rf"Aggregated Fuzzy Output & Centroid Defuzzification ($T_{{room}}={t_room}^\circ$C, $T_{{des}}={t_des}^\circ$C)", fontsize=11, fontweight='bold')
    ax_agg.set_xlabel('Control Output (%)', fontsize=10)
    ax_agg.set_ylabel(r'$\mu_{agg}(u)$', fontsize=10)
    ax_agg.set_ylim(-0.05, 1.1)
    ax_agg.legend(loc='upper right', fontsize=9)
    ax_agg.grid(True, linestyle='--', alpha=0.5)

    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved: {save_path}")


def plot_control_surface(save_path='fuzzy_control_surface.png'):
    grid_room = np.linspace(10, 35, 45)
    grid_desired = np.linspace(16, 28, 45)
    R, D = np.meshgrid(grid_room, grid_desired)
    Z = np.zeros_like(R)

    for i in range(R.shape[0]):
        for j in range(R.shape[1]):
            val, _, _ = evaluate_fuzzy_system(R[i, j], D[i, j])
            Z[i, j] = val

    fig = plt.figure(figsize=(11, 7))
    ax = fig.add_subplot(111, projection='3d')
    surf = ax.plot_surface(R, D, Z, cmap='coolwarm', edgecolor='none', alpha=0.9, antialiased=True)
    cbar = fig.colorbar(surf, ax=ax, shrink=0.55, aspect=12, pad=0.08)
    cbar.set_label('Control Output (%)\n[-100: Cooling, +100: Heating]', fontsize=10)

    ax.set_title('3D Fuzzy Control Surface\nRoom Temp & Desired Temp vs. Control Output Intensity', fontsize=12, fontweight='bold', pad=15)
    ax.set_xlabel('$T_{room}$ (°C)', fontsize=10, labelpad=8)
    ax.set_ylabel('$T_{desired}$ (°C)', fontsize=10, labelpad=8)
    ax.set_zlabel('Control Action (%)', fontsize=10, labelpad=8)
    ax.view_init(elev=28, azim=-125)

    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved: {save_path}")


def plot_scenario_dashboard(scenarios, save_path='fuzzy_controller_dashboard.png'):
    labels = [s['name'] for s in scenarios]
    t_rooms = [s['t_room'] for s in scenarios]
    t_des = [s['t_des'] for s in scenarios]
    outputs = [s['output'] for s in scenarios]
    colors = ['#e63946' if o > 10 else ('#0077b6' if o < -10 else '#2a9d8f') for o in outputs]

    x = np.arange(len(labels))
    width = 0.28

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 8), constrained_layout=True)

    # Subplot 1: Temperatures
    rects1 = ax1.bar(x - width/2, t_rooms, width, label='Room Temp (°C)', color='#f4a261')
    rects2 = ax1.bar(x + width/2, t_des, width, label='Desired Temp (°C)', color='#264653')
    ax1.set_title('Operational Test Scenarios: Room Temperature vs. Setpoint', fontsize=12, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(labels, fontsize=10)
    ax1.set_ylabel('Temperature (°C)', fontsize=10)
    ax1.legend(loc='upper right')
    ax1.grid(True, linestyle='--', alpha=0.5)
    
    # Add values on top of bars
    for r in rects1:
        h = r.get_height()
        ax1.annotate(f'{h:.1f}°', xy=(r.get_x() + r.get_width()/2, h), xytext=(0, 3),
                     textcoords="offset points", ha='center', va='bottom', fontsize=8)
    for r in rects2:
        h = r.get_height()
        ax1.annotate(f'{h:.1f}°', xy=(r.get_x() + r.get_width()/2, h), xytext=(0, 3),
                     textcoords="offset points", ha='center', va='bottom', fontsize=8)

    # Subplot 2: Resulting Controller Output
    bars = ax2.bar(x, outputs, width=0.45, color=colors, edgecolor='#333333', linewidth=1)
    ax2.axhline(0, color='black', lw=1.2)
    ax2.axhspan(-10, 10, color='gray', alpha=0.15, label='Deadband / Neutral Region')
    ax2.set_title('Crisp Fuzzy Controller Action (Heating / Cooling Intensity %)', fontsize=12, fontweight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(labels, fontsize=10)
    ax2.set_ylabel('Control Output (%)', fontsize=10)
    ax2.set_ylim(-110, 110)
    ax2.grid(True, linestyle='--', alpha=0.5)

    for bar, o in zip(bars, outputs):
        y_pos = o + (4 if o >= 0 else -10)
        label_text = f"{o:+.1f}%\n({'HEATING' if o > 10 else ('COOLING' if o < -10 else 'NO CHANGE')})"
        ax2.annotate(label_text, xy=(bar.get_x() + bar.get_width()/2, y_pos),
                     ha='center', va='center', fontsize=8, fontweight='bold')

    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved: {save_path}")


# ==========================================
# 5. MAIN EXECUTION & EXPERIMENT DEMO
# ==========================================
if __name__ == '__main__':
    print("="*75)
    print("  FUZZY LOGIC CONTROLLER FOR ROOM TEMPERATURE REGULATION")
    print("  Mamdani Inference Engine with Centroid Defuzzification")
    print("="*75)

    # Generate Plot 1: Membership Functions
    plot_membership_functions('fuzzy_membership_functions.png')

    # Detailed Step-by-Step Numerical Run for Scenario: Transition Room (19°C), Desired Warm (24°C)
    print("\n" + "#"*70)
    print("DEMO CASE 1: NUMERICAL WALKTHROUGH (T_room = 19.0°C, T_desired = 24.0°C)")
    print("#"*70)
    evaluate_fuzzy_system(19.0, 24.0, verbose=True)
    plot_inference_walkthrough(19.0, 24.0, 'fuzzy_inference_case.png')

    # 3D Control Surface
    print("\nGenerating 3D Control Surface Plot...")
    plot_control_surface('fuzzy_control_surface.png')

    # Scenario Testing Matrix
    test_scenarios = [
        {'name': 'Case 1: Deep Cold\n(High Heating Need)',  't_room': 12.0, 't_des': 25.0},
        {'name': 'Case 2: Mild Cold\n(Moderate Heating)',    't_room': 17.0, 't_des': 23.0},
        {'name': 'Case 3: In Comfort\n(Equilibrium/Neutral)','t_room': 22.0, 't_des': 22.0},
        {'name': 'Case 4: Mild Warm\n(Gentle Cooling)',     't_room': 25.0, 't_des': 21.0},
        {'name': 'Case 5: Extreme Hot\n(Maximum Cooling)',   't_room': 32.0, 't_des': 18.0},
    ]

    print("\n" + "="*80)
    print(f"{'Scenario':<25} | {'T_room':<8} | {'T_desired':<10} | {'Output (%)':<12} | {'Action Mode'}")
    print("="*80)

    for sc in test_scenarios:
        out_val, _, _ = evaluate_fuzzy_system(sc['t_room'], sc['t_des'])
        sc['output'] = out_val
        if out_val > 10:
            mode = f"HEATING ({abs(out_val):.1f}%)"
        elif out_val < -10:
            mode = f"COOLING ({abs(out_val):.1f}%)"
        else:
            mode = f"NO CHANGE / STANDBY ({out_val:.1f}%)"
        print(f"{sc['name'].splitlines()[0]:<25} | {sc['t_room']:>6.1f}°C | {sc['t_des']:>8.1f}°C | {out_val:>10.2f}% | {mode}")
    print("="*80)

    plot_scenario_dashboard(test_scenarios, 'fuzzy_controller_dashboard.png')
    print("\nAll simulations completed and plots saved successfully!")
