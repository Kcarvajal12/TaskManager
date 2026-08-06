const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('HU-04 - Actualizar tarea', function () {
    this.timeout(120000);

    let driver;
    const baseUrl = 'http://localhost:3000';
    const screenshotFolder = path.join(__dirname, '..', 'screenshots', 'update');

    before(async function () {
        if (!fs.existsSync(screenshotFolder)) {
            fs.mkdirSync(screenshotFolder, { recursive: true });
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

    async function screenshot(name) {
        const image = await driver.takeScreenshot();

        fs.writeFileSync(
            path.join(screenshotFolder, `${name}.png`),
            image,
            'base64'
        );
    }

    async function login() {
        await driver.get(`${baseUrl}/login`);

        await driver.findElement(By.id('username')).sendKeys('admin');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.id('btnLogin')).click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );
    }

    async function createTask() {
        await driver.get(`${baseUrl}/tasks/create`);

        await driver.findElement(By.id('title'))
            .sendKeys('Tarea para editar');

        await driver.findElement(By.id('description'))
            .sendKeys('Esta tarea será modificada con Selenium.');

        await driver.findElement(By.id('dueDate'))
            .sendKeys('08/25/2026');

        await driver.findElement(By.id('priority'))
            .sendKeys('Media');

        await driver.findElement(By.id('status'))
            .sendKeys('Pendiente');

        await driver.findElement(By.id('btnSaveTask')).click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );
    }

    it('Camino feliz - Actualizar tarea correctamente', async function () {
        await login();
        await createTask();

        const rows = await driver.findElements(
            By.css('#tasksTable tbody tr')
        );

        assert.ok(rows.length > 0);

        const lastRow = rows[rows.length - 1];

        const editButton = await lastRow.findElement(
            By.css('.btn-edit')
        );

        await editButton.click();

        await driver.wait(
            until.urlContains('/tasks/edit/'),
            10000
        );

        const title = await driver.findElement(By.id('title'));
        await title.clear();
        await title.sendKeys('Tarea actualizada Selenium');

        const description = await driver.findElement(
            By.id('description')
        );

        await description.clear();
        await description.sendKeys(
            'Descripción actualizada automáticamente.'
        );

        await driver.findElement(By.id('priority'))
            .sendKeys('Alta');

        await driver.findElement(By.id('status'))
            .sendKeys('Completada');

        await driver.findElement(By.id('btnUpdateTask')).click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );

        const body = await driver.findElement(By.tagName('body')).getText();

        assert.ok(
            body.includes('Tarea actualizada Selenium')
        );

        await screenshot('01-actualizar-tarea-correcta');
    });

    it('Prueba negativa - Actualizar tarea con título vacío', async function () {
        const rows = await driver.findElements(
            By.css('#tasksTable tbody tr')
        );

        const lastRow = rows[rows.length - 1];

        const editButton = await lastRow.findElement(
            By.css('.btn-edit')
        );

        await editButton.click();

        await driver.wait(
            until.urlContains('/tasks/edit/'),
            10000
        );

        const title = await driver.findElement(By.id('title'));
        await title.clear();

        await driver.findElement(By.id('btnUpdateTask')).click();

        const error = await driver.wait(
            until.elementLocated(By.id('taskError')),
            10000
        );

        const message = await error.getText();

        assert.strictEqual(
            message,
            'Todos los campos son obligatorios.'
        );

        await screenshot('02-actualizar-sin-titulo');
    });

    it('Prueba de límites - Título menor de 3 caracteres', async function () {
        const title = await driver.findElement(By.id('title'));

        await title.clear();
        await title.sendKeys('AB');

        await driver.findElement(By.id('btnUpdateTask')).click();

        const error = await driver.wait(
            until.elementLocated(By.id('taskError')),
            10000
        );

        const message = await error.getText();

        assert.strictEqual(
            message,
            'El título debe contener entre 3 y 100 caracteres.'
        );

        await screenshot('03-actualizar-limite-titulo');
    });
});