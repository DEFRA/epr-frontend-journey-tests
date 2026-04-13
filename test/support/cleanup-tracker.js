import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const filePath = resolve(
  process.env.CLEANUP_ID_FILE ??
    join(process.cwd(), 'test-artifacts', 'created-org-ids.txt')
)

export const cleanupFilePath = filePath

/**
 * Appends an orgId to the cleanup file. Called on every successful org creation
 * so the CI cleanup step can delete them after the run.
 *
 * Uses appendFileSync because POSIX guarantees atomic writes for small payloads
 * under PIPE_BUF (4096 bytes). A 6-digit orgId + newline is 7 bytes, so
 * appends are safe even under concurrent workers.
 *
 * Swallows write errors — never fail a test because the tracker couldn't write.
 */
export function trackCreatedOrgId(orgId) {
  try {
    mkdirSync(dirname(filePath), { recursive: true })
    appendFileSync(filePath, `${orgId}\n`)
  } catch (err) {
    console.warn(
      `cleanup-tracker: failed to write orgId ${orgId}:`,
      err.message
    )
  }
}

/**
 * Wipes the cleanup file at the start of a run. Prevents stale IDs from a
 * previous local run appearing in the cleanup log.
 */
export function resetTracker() {
  try {
    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, '')
  } catch (err) {
    console.warn('cleanup-tracker: failed to reset tracker:', err.message)
  }
}
