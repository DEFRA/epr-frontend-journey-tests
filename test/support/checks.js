import { browser } from '@wdio/globals'

export async function checkBodyText(message, timeoutInSeconds) {
  await browser.waitUntil(
    async () =>
      browser.execute((msg) => document.body.innerText.includes(msg), message),
    {
      timeout: timeoutInSeconds * 1000,
      timeoutMsg: `Expected text "${message}" to be present on the page within ${timeoutInSeconds} seconds`
    }
  )
}

export async function checkUploadErrorText(
  selector,
  message,
  timeoutInSeconds
) {
  await browser.waitUntil(
    async () => {
      const errorText = await browser.$(selector).getText()
      return errorText.includes(message)
    },
    {
      timeout: timeoutInSeconds * 1000,
      timeoutMsg: `Expected error message "${message}" to be present on the page within ${timeoutInSeconds} seconds`
    }
  )
}
