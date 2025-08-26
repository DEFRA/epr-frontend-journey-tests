import { browser, $ } from '@wdio/globals'

class Page {
  get pageHeading() {
    return $('h1')
  }

  open(path) {
    return browser.url(path)
  }

  continue() {
    const continueButton = $('#main-content div.govuk-button-group > button')
    continueButton.waitForClickable({ timeout: 3000 })
    continueButton.click()
  }

  fieldsetTextInputElement(index) {
    return $(
      `#main-content fieldset.govuk-fieldset div.govuk-form-group:nth-of-type(${index}) input`
    )
  }

  textInputElement(index) {
    return $(`#main-content div.govuk-form-group:nth-of-type(${index}) input`)
  }

  radioInputElement(index) {
    return $(`#main-content div.govuk-radios__item:nth-of-type(${index}) input`)
  }

  textAreaElement(index) {
    return $(
      `#main-content div.govuk-form-group:nth-of-type(${index}) textarea`
    )
  }

  checkboxInputElement(index) {
    return $(
      `#main-content div.govuk-checkboxes__item:nth-of-type(${index}) input`
    )
  }
}

export { Page }
