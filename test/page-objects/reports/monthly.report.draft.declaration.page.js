import { $ } from '@wdio/globals'
import { checkDoubleClickPrevented } from '../../support/double-click.js'

class MonthlyReportDraftDeclarationPage {
  async reportsPageLink() {
    await $('a*=Reports').click()
  }

  async confirmAndSubmit() {
    const buttonElement = await $('#main-content button[type=submit]')
    await buttonElement.waitForClickable({ timeout: 5000 })
    await buttonElement.click()
  }

  async submitAndCheckDoubleClickPrevented() {
    await checkDoubleClickPrevented('#main-content button[type=submit]')
  }

  async deleteReport() {
    await $('a*=Delete report').click()
  }
}

export default new MonthlyReportDraftDeclarationPage()
