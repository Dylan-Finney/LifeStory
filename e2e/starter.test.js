// describe('Example', () => {
//   beforeAll(async () => {
//     await device.launchApp();
//   });

//   beforeEach(async () => {
//     await device.reloadReactNative();
//   });

//   it('should have welcome screen', async () => {
//     await expect(element(by.id('welcome'))).toBeVisible();
//   });

//   it('should show hello screen after tap', async () => {
//     await element(by.id('hello_button')).tap();
//     await expect(element(by.text('Hello!!!'))).toBeVisible();
//   });

//   it('should show world screen after tap', async () => {
//     await element(by.id('world_button')).tap();
//     await expect(element(by.text('World!!!'))).toBeVisible();
//   });
// });

const {device} = require('detox');

describe('Example', () => {
  beforeAll(async () => {
    // await detox.init();
    //Get Past Onboarding
    await device.launchApp({
      permissions: {
        calendar: 'YES',
        notifications: 'YES',
        location: 'always',
        photos: 'YES',
      },
    });
    await element(by.text('Next')).tap();
    await element(by.text('Next')).tap();
    await element(by.text('Next')).tap();
    await element(by.text('Grant Permissions')).tap();
    await element(by.text('No')).tap();
    await element(by.text('No')).tap();
    await element(by.text('8 AM')).tap();
  });

  beforeEach(async () => {});

  it('check for create entry button', async () => {
    await element(by.id('CreateManualEntryButton')).tap();
  });
});
