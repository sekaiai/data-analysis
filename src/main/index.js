import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import fs from 'fs'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development' ?
    'http://localhost:9080' :
    `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        // frame: false,
        useContentSize: true,
        width: 1366,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        show: false,
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 加载好html再呈现window，避免白屏
    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // mainWindow.webContents.openDevTools({ detach: true });
}

app.on('ready', () => {
    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdatesAndNotify();
    // autoUpdater.checkForUpdatesAndNotify();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/**
 * 边框
 */
// 窗口最小化
ipcMain.on('min-window', () => {
    mainWindow.minimize();
});
// 窗口最大化
ipcMain.on('max-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.restore();
    } else {
        mainWindow.maximize();
    }
});
// 关闭
ipcMain.on('close-window', () => {
    mainWindow.close();
});

/**
 * 导出下载
 */
ipcMain.on('download', (event, downloadPath) => {
    mainWindow.webContents.downloadURL(downloadPath);
    mainWindow.webContents.session.once('will-download', (event, item) => {
        item.once('done', (event, state) => {
            // 成功的话 state为completed 取消的话 state为cancelled
            mainWindow.webContents.send('downstate', state);
        });
    });
});


/**
 * 自动更新
 */

function sendUpdateMessage(message, data) {
    mainWindow.webContents.send('update-message', { message, data });
}

// 阻止程序关闭自动安装升级
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('error', data => {
    sendUpdateMessage('error', data);
});

/* // 检查更新
autoUpdater.on('checking-for-update', data => {
  sendUpdateMessage('checking-for-update', data);
});*/

// 有可用更新
autoUpdater.on('update-available', data => {
    sendUpdateMessage('update-available', data);
});

// 已经最新
autoUpdater.on('update-not-available', data => {
    sendUpdateMessage('update-not-available', data);
});

// 更新下载进度事件
autoUpdater.on('download-progress', data => {
    sendUpdateMessage('download-progress', data);
});
// 更新下载完成事件(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate)
autoUpdater.on('update-downloaded', () => {
    sendUpdateMessage('update-downloaded', {});
    ipcMain.once('update-now', () => {
        autoUpdater.quitAndInstall();
    });
});



//在主线程下，通过ipcMain对象监听渲染线程传过来的saveDialog事件
ipcMain.on('outputExcel', (event, { filename, datas }) => {
    // 打开弹窗
    dialog.showSaveDialog({
            properties: ['openFile', 'openDirectory'],
            defaultPath: filename
        },
        filePath => {
            console.log({ filePath })
            if (filePath) {
                // filePath存在则为保存路径 否为undefined
                // 去掉头部无用字段并将base64转码成buffer
                fs.writeFile(filePath, datas, err => {
                    // 返回状态
                    mainWindow.webContents.send('outputExcelState', err)
                })
            }else{
                    mainWindow.webContents.send('outputExcelState', true)

            }
        }
    )
})