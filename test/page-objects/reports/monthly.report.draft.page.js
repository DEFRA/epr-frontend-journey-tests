import { $ } from '@wdio/globals'

class MonthlyReportDraftPage {
  async reportsPageLink() {
    await $('a*=Reports').click()
  }
}

export default new MonthlyReportDraftPage()
