import EprFrontendHomePage from '../page-objects/homepage.js'

import { browser, expect } from '@wdio/globals'

describe('EPR Frontend', () => {
  it('Should be able to navigate to Home Page', async () => {
    await EprFrontendHomePage.open()
    await expect(browser).toHaveTitle(expect.stringContaining('Home'))
  })
})
