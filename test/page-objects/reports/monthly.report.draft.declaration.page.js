import { $ } from '@wdio/globals'

class MonthlyReportDraftDeclarationPage {
  async reportsPageLink() {
    await $('a*=Reports').click()
  }

  async confirmAndSubmit() {
    await $('#main-content button[type=submit]').click()
  }

  async deleteReport() {
    await $('a*=Delete report').click()
  }
}

export default new MonthlyReportDraftDeclarationPage()
