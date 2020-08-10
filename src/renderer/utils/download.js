import fs from 'fs'
// import fse from 'fs-extra'
import path from 'path'
import os from 'os'
import day from 'dayjs'
import { ipcRenderer } from 'electron'
import xlsx from 'xlsx'

// const tmpPath = path.join(os.tmpdir(), 'easy-invoices')
// fse.ensureDirSync(tmpPath)

/**
 * 导出Excel
 * @param  {Array} datas      [{datas, name = '', book_name = 'sheet1}]
 * @param  {String} filename  文件名
 * @param  {String} book_name [description]
 * @return {[type]}           [description]
 */
const excel2 = (datas, name = '') => {
    return new Promise((resolve, reject) => {
        // 1. data转成表
        // aoa_to_sheet 数组转表
        // json_to_sheet
        // const sheet = []
        const workBook = xlsx.utils.book_new()

        for (var i = 0; i < datas.length; i++) {
            const { datas: data, type = 'aoa', bookName = `sheet${i + 1}` } = datas[i]

            let _sheet
            if (type === 'aoa') {
                _sheet = xlsx.utils.aoa_to_sheet(data)
            } else {
                _sheet = xlsx.utils.json_to_sheet(data)
            }

            xlsx.utils.book_append_sheet(workBook, _sheet, bookName)
        }

        const sheet = xlsx.write(workBook, {
            bookType: 'xlsx', // 输出的文件类型
            type: 'buffer', // 输出的数据类型
            compression: true // 开启zip压缩
        })
        // 表格数据拟定为 data
        const excelModel = new Blob([sheet], { type: 'application/octet-stream' })

        // 创建一个FileReader的实例
        const reader = new FileReader()

        // 开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个data: URL格式的Base64字符串以表示所读取文件的内容。
        reader.readAsDataURL(excelModel)

        // 处理 load 事件。该事件在读取操作完成时触发
        reader.addEventListener('loadend', () => {
            // reader.result 包含被转化为类型数组 typed array 的 blob
            // 向主进程发送下载excel消息
            const filename = `${name} ${day().format('YYYY-MM-DD HH-mm-ss')}.xlsx`
            const dataBuffer = Buffer.from(reader.result.split('base64,')[1], 'base64')

            ipcRenderer.send('outputExcel', {
                datas: dataBuffer,
                filename
            })
            // 接收主进程发送回来的下载成功回调
            ipcRenderer.once('outputExcelState', (event, arg) => {
                // 成功回调
                console.log({ arg })
                resolve(arg)
            })
        })
    })
}
/**
 * 导出excel
 * @param {String} filename 文件名
 * @param {Object} excelOption 表格配置([{name:<String>,data:<Array>}])
 * @return {Promise} 导出回调
 */
const excel = (filename, excelOption) => {
    return new Promise((resolve, reject) => {
        const buffer = xlsx.build(excelOption)

        const fileName = `${day().format('YYYY-MM-DD_HH-mm-ss')}_${filename}.xlsx`
        const filePath = path.join(tmpPath, fileName)
        // logger('tmp:' + filePath)
        fs.writeFileSync(filePath, buffer)
        ipcRenderer.send('download', filePath)
        ipcRenderer.once('downstate', (event, arg) => {
            if (arg === 'completed' || arg === 'cancelled') {
                resolve(arg)
            } else {
                reject(arg)
            }
            fse.remove(filePath)
        })
    })
}

export default {
    excel,
    excel2
}
