import { $ } from '@wdio/globals'

class MonthlyReportDraftDeclarationPage {
  async reportsPageLink() {
    await $('a*=Reports').click()
  }

  async confirmAndSubmit() {
    const buttonElement = await $('#main-content button[type=submit]')
    await buttonElement.waitForExist({ timeout: 5000 })
    await buttonElement.click()
  }

  async deleteReport() {
    await $('a*=Delete report').click()
  }
}

export default new MonthlyReportDraftDeclarationPage()
