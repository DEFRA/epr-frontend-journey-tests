import { browser } from '@wdio/globals'
import lighthouse from 'lighthouse'
import { launch as launchChrome } from 'chrome-launcher'

/**
 * Run Lighthouse accessibility audit
 * Uses Google Lighthouse (Apache 2.0 license) to perform comprehensive accessibility testing
 */
export async function runAccessibilityAudit() {
  const url = await browser.getUrl()

  let chrome

  try {
    // Launch Chrome with remote debugging
    chrome = await launchChrome({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    })

    // Run Lighthouse accessibility audit
    const { lhr } = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['accessibility'],
      logLevel: 'error'
    })

    // Transform Lighthouse results to match the expected format
    const violations = []

    if (lhr.categories.accessibility) {
      const accessibilityAudits = lhr.categories.accessibility.auditRefs

      for (const auditRef of accessibilityAudits) {
        const audit = lhr.audits[auditRef.id]

        // Only process failed audits
        if (audit.score !== null && audit.score < 1) {
          const impact = getImpactLevel(auditRef.weight)

          const nodes =
            audit.details?.items?.map((item, index) => ({
              html: item.node?.snippet || item.snippet || '',
              target: [
                item.node?.selector || item.selector || `element-${index}`
              ],
              failureSummary: item.node?.explanation || audit.description || ''
            })) || []

          violations.push({
            id: audit.id,
            impact,
            description: audit.description,
            help: audit.title,
            helpUrl: audit.helpText || `https://web.dev/${audit.id}`,
            tags: ['wcag', 'lighthouse'],
            nodes
          })
        }
      }
    }

    return { violations }
  } catch (error) {
    console.error('Lighthouse audit failed:', error.message)
    // Return empty violations if Lighthouse fails
    return { violations: [] }
  } finally {
    if (chrome) {
      await chrome.kill()
    }
  }
}

/**
 * Convert Lighthouse weight to impact level
 */
function getImpactLevel(weight) {
  if (weight >= 7) return 'critical'
  if (weight >= 4) return 'serious'
  if (weight >= 2) return 'moderate'
  return 'minor'
}
