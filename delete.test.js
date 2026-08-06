const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('HU-05 - Eliminar tarea', function () {
    this.timeout(120000);

    let driver;

    const baseUrl = 'http://localhost:3000';

    const screenshotFolder = path.join(
        __dirname,
        '..',
        'screenshots',
        'delete'
    );

    before(async function () {
        if (!fs.existsSync(screenshotFolder)) {
            fs.mkdirSync(
                screenshotFolder,
                { recursive: true }
            );
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

    async function createTask(title) {
        await driver.get(`${baseUrl}/tasks/create`);

        await driver
            .findElement(By.id('title'))
            .sendKeys(title);

        await driver
            .findElement(By.id('description'))
            .sendKeys(
                'Tarea creada para validar la eliminación con Selenium.'
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
    }

    it('Camino feliz - Eliminar tarea correctamente', async function () {
        await login();

        const taskName = 'Tarea para eliminar';

        await createTask(taskName);

        let bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            bodyText.includes(taskName)
        );

        const rows = await driver.findElements(
            By.css('#tasksTable tbody tr')
        );

        const lastRow = rows[rows.length - 1];

        const deleteButton = await lastRow.findElement(
            By.css('.btn-delete')
        );

        await deleteButton.click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );

        bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            !bodyText.includes(taskName)
        );

        await screenshot(
            '01-eliminar-tarea-correcta'
        );
    });

    it('Prueba negativa - Intentar acceder a una tarea eliminada', async function () {
        await driver.get(
            `${baseUrl}/tasks/edit/999999`
        );

        const bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            bodyText.includes('Tarea no encontrada')
        );

        await screenshot(
            '02-tarea-no-encontrada'
        );
    });

    it('Prueba de límites - Eliminar una tarea cuando existe una sola coincidencia', async function () {
        await driver.get(`${baseUrl}/tasks`);

        const taskName = 'Tarea única eliminación';

        await createTask(taskName);

        const rowsBefore = await driver.findElements(
            By.css('#tasksTable tbody tr')
        );

        assert.ok(
            rowsBefore.length >= 1
        );

        const matchingRows = [];

        for (const row of rowsBefore) {
            const text = await row.getText();

            if (text.includes(taskName)) {
                matchingRows.push(row);
            }
        }

        assert.strictEqual(
            matchingRows.length,
            1
        );

        const deleteButton = await matchingRows[0].findElement(
            By.css('.btn-delete')
        );

        await deleteButton.click();

        await driver.wait(
            until.urlContains('/tasks'),
            10000
        );

        const bodyText = await driver
            .findElement(By.tagName('body'))
            .getText();

        assert.ok(
            !bodyText.includes(taskName)
        );

        await screenshot(
            '03-eliminar-unica-tarea'
        );
    });
});