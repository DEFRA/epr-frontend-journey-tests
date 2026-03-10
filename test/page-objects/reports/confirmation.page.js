import { $ } from '@wdio/globals'

class ConfirmationPage {
  async goToReports() {
    await $('#main-content button[type=submit]').click()
  }

  async viewDraftReport() {
    await $('a*=View draft report').click()
  }

  async reportsPageLink() {
    await $('a*=Reports').click()
  }
}

export default new ConfirmationPage()
