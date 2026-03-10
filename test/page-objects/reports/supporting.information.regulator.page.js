import { $ } from '@wdio/globals'

class SupportingInformationPage {
  async enterComment(comment) {
    await $('#comment').setValue(comment)
  }

  async continue() {
    await $('#main-content button[type=submit]').click()
  }

  async saveAndComeBackLater() {
    await $('a*=Save and come back later').click()
  }

  async cancelAndReturnToAccreditationDashboard() {
    await $('a*=Cancel and return to accreditation dashboard').click()
  }
}

export default new SupportingInformationPage()
