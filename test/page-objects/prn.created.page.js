import { $ } from '@wdio/globals'

class PRNCreatedPage {
  async messageText() {
    const bodyElement = await $('#main-content > div > div > div')

    await bodyElement.waitForExist({ timeout: 5000 })
    return await bodyElement.getText()
  }

  async returnToRegistrationPage() {
    await $('a*=Return to home').click()
  }
}

export default new PRNCreatedPage()
