// import EprFrontendHomePage from 'page-objects/homepage.js'
// import { browser } from '@wdio/globals'
//
// import AxeBuilder from '@axe-core/webdriverio'
// import WasteRecordsPage from 'page-objects/waste.records.page.js'
// import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
// import { logViolationsToAllure } from '../support/accessibility.js'
//
// function failOnViolationLevel(results) {
//   results.violations.forEach((violation) => {
//     if (violation.impact === 'critical' || violation.impact === 'serious') {
//       throw new Error(
//         'At least one Serious or Critical accessibility violation found'
//       )
//     }
//   })
// }
//
// describe('WCAG Accessibility', () => {
//   it('Should have no critical accessibility violations for Home Page', async () => {
//     await EprFrontendHomePage.open()
//
//     const builder = new AxeBuilder({ client: browser })
//     const results = await builder.analyze()
//     await logViolationsToAllure(results.violations)
//     failOnViolationLevel(results)
//   })
//
//   it('Should have no critical accessibility violations for Packaging Waste Records Page', async () => {
//     await WasteRecordsPage.open('123', '456')
//
//     const builder = new AxeBuilder({ client: browser })
//     const results = await builder.analyze()
//     await logViolationsToAllure(results.violations)
//     failOnViolationLevel(results)
//   })
//
//   it('Should have no critical accessibility violations for Upload Summary Logs Page', async () => {
//     await UploadSummaryLogPage.open('123', '456')
//
//     const builder = new AxeBuilder({ client: browser })
//     const results = await builder.analyze()
//     await logViolationsToAllure(results.violations)
//     failOnViolationLevel(results)
//   })
// })
