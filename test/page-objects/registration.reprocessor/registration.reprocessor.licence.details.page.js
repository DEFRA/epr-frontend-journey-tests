import { Page } from 'page-objects/page.js'

class RegistrationReprocessorLicenceDetailsPage extends Page {
  async permit(number) {
    await super.textInputElement(1).setValue(number)
  }

  async aluminium() {
    await super.checkboxInputElement(1).click()
  }

  async fibre() {
    await super.checkboxInputElement(2).click()
  }

  async glass() {
    await super.checkboxInputElement(3).click()
  }

  async paperOrBoard() {
    await super.checkboxInputElement(4).click()
  }

  async plastic() {
    await super.checkboxInputElement(5).click()
  }

  async steel() {
    await super.checkboxInputElement(6).click()
  }

  async wood() {
    await super.checkboxInputElement(7).click()
  }

  async tonnage(number) {
    await super.textInputElement(2).setValue(number)
  }

  async yearly() {
    await super.radioInputElement(1).click()
  }

  async monthly() {
    await super.radioInputElement(2).click()
  }

  async weekly() {
    await super.radioInputElement(3).click()
  }
}

export default new RegistrationReprocessorLicenceDetailsPage()
