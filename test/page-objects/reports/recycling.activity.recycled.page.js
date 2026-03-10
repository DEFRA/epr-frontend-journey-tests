import { $ } from '@wdio/globals'

class RecyclingActivityRecycledPage {
  async enterTonnes(tonnes) {
    await $('#tonnes').setValue(tonnes)
  }

  async continue() {
    await $('#main-content button[type=submit]').click()
  }

  async saveAndComeBackLater() {
    await $('a*=Save and come back later').click()
  }
}

export default new RecyclingActivityRecycledPage()
