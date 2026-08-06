const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('HU-03 - Consultar tareas', function () {

    this.timeout(120000);

    let driver;

    const baseUrl = 'http://localhost:3000';

    const screenshotFolder = path.join(
        __dirname,
        '..',
        'screenshots',
        'read'
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

    async function createTask() {

        await driver.get(`${baseUrl}/tasks/create`);

        await driver
            .findElement(By.id('title'))
            .sendKeys('Consulta Selenium');

        await driver
            .findElement(By.id('description'))
            .sendKeys(
                'Tarea creada para validar la consulta de tareas.'
            );

        await driver
            .findElement(By.id('dueDate'))
            .sendKeys('08/25/2026');

        await driver
            .findElement(By.id('priority'))
            .sendKeys('Media');

        await driver
            .findElement(By.id('status'))
            .sendKeys('En progreso');

        await driver
            .findElement(By.id('btnSaveTask'))
            .click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );

    }

    it('Camino feliz - Visualizar tareas registradas', async function () {

        await login();

        await createTask();

        const table = await driver.wait(
            until.elementLocated(
                By.id('tasksTable')
            ),
            10000
        );

        assert.ok(
            await table.isDisplayed()
        );

        const bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            bodyText.includes('Consulta Selenium')
        );

        await takeScreenshot(
            '01-consultar-tareas'
        );

    });

    it('Prueba negativa - Consultar una tarea inexistente', async function () {

        await driver.get(`${baseUrl}/tasks`);

        const bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            !bodyText.includes('Tarea Inexistente XYZ')
        );

        await takeScreenshot(
            '02-tarea-inexistente'
        );

    });

    it('Prueba de límites - Validar listado con múltiples tareas', async function () {

        await driver.get(`${baseUrl}/tasks/create`);

        await driver
            .findElement(By.id('title'))
            .sendKeys('Tarea adicional');

        await driver
            .findElement(By.id('description'))
            .sendKeys(
                'Segunda tarea para validar el listado.'
            );

        await driver
            .findElement(By.id('dueDate'))
            .sendKeys('08/30/2026');

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

        const rows = await driver.findElements(
            By.css('#tasksTable tbody tr')
        );

        assert.ok(
            rows.length >= 2
        );

        await takeScreenshot(
            '03-multiples-tareas'
        );

    });

});