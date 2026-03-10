import { $ } from '@wdio/globals'

class PrnSummaryPage {
  async selectYes() {
    await $('label[for=yes]').click()
  }

  async selectNo() {
    await $('label[for=no]').click()
  }
}

export default new PrnSummaryPage()
