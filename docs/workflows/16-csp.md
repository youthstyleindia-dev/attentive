# Workflow 16 — Context Switch Penalty (CSP)
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-11)

## 1. Mathematical Formula
$$CSP = \sum (SW \times CU)$$

## 2. Switch Weight ($SW$)
$$SW = \begin{cases} 1.5 & \text{if elapsed time since last switch} \le 45\text{ seconds} \\ 1.0 & \text{otherwise} \end{cases}$$

## 3. Category Unrelatedness ($CU$)
$$CU = \begin{cases} 0 & \text{same Workstream or same tab} \\ 1 & \text{same category} \\ 2 & \text{related categories or missing category} \\ 4 & \text{unrelated categories} \end{cases}$$

$CSP$ is strictly non-negative. If no context switches occur, $CSP = 0$.
