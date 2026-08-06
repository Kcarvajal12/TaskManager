const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('HU-02 - Crear tarea', function () {

    this.timeout(120000);

    let driver;

    const baseUrl = 'http://localhost:3000';

    const screenshotFolder = path.join(
        __dirname,
        '..',
        'screenshots',
        'create'
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

    async function login() {

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

    }

    it('Camino feliz - Crear tarea correctamente', async function () {

        await login();

        await driver
            .findElement(By.id('btnNewTask'))
            .click();

        await driver.wait(
            until.urlContains('/tasks/create'),
            10000
        );

        await driver
            .findElement(By.id('title'))
            .sendKeys('Tarea Selenium');

        await driver
            .findElement(By.id('description'))
            .sendKeys(
                'Tarea creada automáticamente con Selenium WebDriver.'
            );

        await driver
            .findElement(By.id('dueDate'))
            .sendKeys('08/20/2026');

        await driver
            .findElement(By.id('priority'))
            .sendKeys('Alta');

        await driver
            .findElement(By.id('status'))
            .sendKeys('Pendiente');

        await driver
            .findElement(By.id('btnSaveTask'))
            .click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );

        const bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            bodyText.includes('Tarea Selenium')
        );

        await takeScreenshot(
            '01-crear-tarea-correcta'
        );

    });

    it('Prueba negativa - Crear tarea sin título', async function () {

        await driver.get(`${baseUrl}/tasks/create`);

        await driver
            .findElement(By.id('description'))
            .sendKeys('Descripción sin título');

        await driver
            .findElement(By.id('dueDate'))
            .sendKeys('08/20/2026');

        await driver
            .findElement(By.id('priority'))
            .sendKeys('Media');

        await driver
            .findElement(By.id('status'))
            .sendKeys('Pendiente');

        await driver
            .findElement(By.id('btnSaveTask'))
            .click();

        const error = await driver.wait(
            until.elementLocated(
                By.id('taskError')
            ),
            10000
        );

        assert.strictEqual(
            await error.getText(),
            'Todos los campos son obligatorios.'
        );

        await takeScreenshot(
            '02-crear-sin-titulo'
        );

    });

    it('Prueba de límites - Título con menos de 3 caracteres', async function () {

        await driver.get(`${baseUrl}/tasks/create`);

        await driver
            .findElement(By.id('title'))
            .sendKeys('AB');

        await driver
            .findElement(By.id('description'))
            .sendKeys(
                'Prueba para validar límite mínimo del título.'
            );

        await driver
            .findElement(By.id('dueDate'))
            .sendKeys('08/20/2026');

        await driver
            .findElement(By.id('priority'))
            .sendKeys('Baja');

        await driver
            .findElement(By.id('status'))
            .sendKeys('Pendiente');

        await driver
            .findElement(By.id('btnSaveTask'))
            .click();

        const error = await driver.wait(
            until.elementLocated(
                By.id('taskError')
            ),
            10000
        );

        assert.strictEqual(
            await error.getText(),
            'El título debe tener mínimo 3 caracteres.'
        );

        await takeScreenshot(
            '03-titulo-menor-3'
        );

    });

});