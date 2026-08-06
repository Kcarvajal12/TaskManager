const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('HU-01 - Inicio de sesión', function () {

    this.timeout(120000);

    let driver;

    const baseUrl = 'http://localhost:3000';

    const screenshotFolder = path.join(
        __dirname,
        '..',
        'screenshots',
        'login'
    );

    before(async function () {

        if (!fs.existsSync(screenshotFolder)) {
            fs.mkdirSync(screenshotFolder, {
                recursive: true
            });
        }

        driver = await new Builder()
            .forBrowser('chrome')
            .build();

        await driver.manage().window().maximize();

    });

    after(async function () {

        if (driver) {
            await driver.quit();
        }

    });

    async function takeScreenshot(name) {

        const image = await driver.takeScreenshot();

        fs.writeFileSync(
            path.join(
                screenshotFolder,
                `${name}.png`
            ),
            image,
            'base64'
        );

    }

    it('Camino feliz - Login con credenciales válidas', async function () {

        await driver.get(`${baseUrl}/login`);

        await driver
            .findElement(By.id('username'))
            .sendKeys('admin');

        await driver
            .findElement(By.id('password'))
            .sendKeys('123456');

        await driver
            .findElement(By.id('btnLogin'))
            .click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );

        const url = await driver.getCurrentUrl();

        assert.ok(
            url.includes('/tasks')
        );

        const welcome = await driver.findElement(
            By.id('welcomeUser')
        );

        const text = await welcome.getText();

        assert.ok(
            text.includes('admin')
        );

        await takeScreenshot(
            '01-login-correcto'
        );

    });

    it('Prueba negativa - Contraseña incorrecta', async function () {

        await driver.get(`${baseUrl}/logout`);

        await driver.wait(
            until.urlContains('/login'),
            10000
        );

        await driver
            .findElement(By.id('username'))
            .sendKeys('admin');

        await driver
            .findElement(By.id('password'))
            .sendKeys('incorrecta');

        await driver
            .findElement(By.id('btnLogin'))
            .click();

        const error = await driver.wait(
            until.elementLocated(
                By.id('loginError')
            ),
            10000
        );

        const text = await error.getText();

        assert.strictEqual(
            text,
            'Usuario o contraseña incorrectos.'
        );

        await takeScreenshot(
            '02-login-incorrecto'
        );

    });

    it('Prueba de límites - Campos vacíos', async function () {

        await driver.get(`${baseUrl}/login`);

        await driver
            .findElement(By.id('btnLogin'))
            .click();

        const error = await driver.wait(
            until.elementLocated(
                By.id('loginError')
            ),
            10000
        );

        const text = await error.getText();

        assert.strictEqual(
            text,
            'Debe completar usuario y contraseña.'
        );

        await takeScreenshot(
            '03-login-campos-vacios'
        );

    });

});