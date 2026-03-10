import { $ } from '@wdio/globals'

class MonthlyReportPage {
  async uploadUpdatedSummaryLogLink() {
    await $('a*=Upload an updated summary log').click()
  }

  async continue() {
    await $('#main-content button[type=submit]').click()
  }

  async uploadNewSummaryLogButton() {
    await $('button*=Upload new summary log').click()
  }
}

export default new MonthlyReportPage()
