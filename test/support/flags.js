/**
 * Single source of truth for feature-flag state inside the journey suite.
 *
 * Each key reads the SAME `FEATURE_FLAG_*` env var that is injected into the
 * frontend-under-test container, so the test view of a flag cannot drift from
 * the application's behaviour. The CI run-twice matrix exercises every flag in
 * both states; turning a flag on in production then becomes config-only, with
 * no test changes.
 *
 * Rule: every key here MUST map to a real `FEATURE_FLAG_*` var exported into
 * both the container and this runner process. No test-only invented flags, and
 * no flag string anywhere else in test code: branch on `flags.<key>` instead.
 */
export const flags = {
  closedPeriodAdjustments:
    process.env.FEATURE_FLAG_CLOSED_PERIOD_ADJUSTMENTS === 'true'
}
