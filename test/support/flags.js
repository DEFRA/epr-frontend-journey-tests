/**
 * Single source of truth for feature-flag state inside the journey suite.
 *
 * When a spec needs to branch on a flag, add a key here that reads the SAME
 * `FEATURE_FLAG_*` env var injected into the frontend-under-test container, so
 * the test view of a flag cannot drift from the application's behaviour. Branch
 * on `flags.<key>` in specs: no flag string appears anywhere else in test code,
 * and no test-only invented flags.
 *
 * The baseline CI pass runs the configured defaults; a matrix leg overrides a
 * single flag to pin the other state (see the README "Feature flags in journey
 * tests"). Currently empty: no spec branches on a flag.
 */
export const flags = {}
