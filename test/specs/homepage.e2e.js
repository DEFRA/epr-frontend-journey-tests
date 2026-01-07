import HomePage from '../page-objects/homepage.js'

import { browser, expect } from '@wdio/globals'

describe('EPR Frontend', () => {
  // TODO: Re-enable when Welsh translations are available (PAE-793)
  it.skip('Should be able to navigate to Home Page via Welsh', async () => {
    await HomePage.open('/cy')
    const lang = await browser.$('html').getAttribute('lang')
    expect(lang).toBe('cy')
    await expect(browser).toHaveTitle(expect.stringContaining('Hafan'))
  })
})
