const electron = require('electron');
const {app, BrowserWindow, ipcMain, dialog, Tray, Menu, clipboard} = require('electron');
const request = require('superagent');
const getTitle = require('get-title');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, './data.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH).toString());

let win = null;

app.on('ready', () => {
    const tray = new Tray(path.join(__dirname, './icon.png'));

    tray.setContextMenu(Menu.buildFromTemplate(template.tray));
    Menu.setApplicationMenu(Menu.buildFromTemplate(template.menu));

    const bounds = tray.getBounds();

    win = new BrowserWindow({
        width: 400,
        height: 400,
        x: Math.round(bounds.x - 200 + (bounds.width / 2)),
        y: (process.platform === 'darwin') ? bounds.y + bounds.height + 10 : bounds.y - 400 - 10,
        show: false,
        resizable: false,
        movable: false,
        acceptFirstMouse: true,
        frame: false
    });

    win.loadURL(`file://${__dirname}/index.html`);
    // win.webContents.openDevTools();

    win.once('ready-to-show', () => {
        win.webContents.send('data', data);
    });

    if (process.platform === 'darwin') {
        win.on('blur', () => win.hide());
    }

    if (process.platform === 'darwin') {
        tray.on('right-click', () => toggle());
    } else {
        tray.on('click', () => toggle());
    }

    ipcMain.on('remove', (event, index) => {
        data.splice(index, 1);
        win.webContents.send('data', data);
        fs.writeFileSync(DATA_PATH, JSON.stringify(data));
    });

    ipcMain.on('paste', (event, item) => {
        saveItem(item);
    });
});

const template = {
    tray: [
        {
            label: 'Open',
            click: () => {
                win.show()
            }
        },
        {
            label: 'Save',
            submenu: [
                {
                    label: 'Home',
                    click: () => {
                        saveItem({type: 'home', url: clipboard.readText()});
                    }
                },
                {
                    label: 'Github',
                    click: () => {
                        saveItem({type: 'github', url: clipboard.readText()});
                    }
                }
            ]
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ],
    menu: [
        {
            label: app.getName(),
            submenu: [
                {role: 'paste'},
                {type: 'separator'},
                {
                    label: 'Quit',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }
    ]
};

function saveItem(item) {
    const type = item.type;
    const url = item.url;
    if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
        dialog.showErrorBox('url 오류', 'url 이 유효하지 않습니다.');
        return;
    }
    request.get(url)
        .end((err, response) => {
            if (err) {
                dialog.showErrorBox('url 오류', 'url 이 유효하지 않습니다.');
                return;
            }
            getTitle(response.res.text).then(title => {
                data.push({type, url, title});
                win.webContents.send('data', data);
                fs.writeFileSync(DATA_PATH, JSON.stringify(data));
            });
        });
}


function toggle() {
    if (win.isVisible()) {
        win.hide();
    } else {
        win.show();
    }
}