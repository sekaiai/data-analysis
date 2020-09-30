<template>
    <div id="home-add" v-loading.lock="loading" element-loading-text="正在解析数据">
        <div @click="updateAllData">删除重复</div>
        <div class="title-line shrink0">导入受理清单</div>
        <div style="margin-bottom: 20px">本月已导入{{ monthLength }}条数据</div>
        <div class="form-line">
            <div class="flex">
                <el-button type="primary" @click="submitUpload">
                    <template v-if="datas.length">
                        <span>重新</span>
                    </template>
                    选择受理清单文件</el-button
                >
            </div>
        </div>
        <template v-if="logs.length">
            <div class="title-line">解析记录 ({{ logs.length }}) 条</div>
            <div id="masker">
                <p v-for="(v, i) in logs" :key="i" v-html="v"></p>
            </div>
        </template>
        <p>{{ btntext }}</p>
        <div class="form-line" style="margin-top: 20px" v-if="datas.length">
            <el-button :loading="insertStatus" type="success" @click="insertAccept">
                {{ btntext }}
            </el-button>
            <div style="margin-top: 20px;" v-if="false">
                <div>
                    写入成功 ({{ success.length }})条
                    <el-button v-if="!insertStatus" type="text" @click="handleAnalysisDownload(`success`)"
                        >导出Excel</el-button
                    >
                </div>
                <div>
                    写入失败 ({{ error.length }})条
                    <el-button v-if="!insertStatus" type="text" @click="handleAnalysisDownload(`error`)"
                        >导出Excel</el-button
                    >
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import download from '@/utils/download.js'
import dayjs from 'dayjs'
import xlsx from 'xlsx'
const fs = require('fs')
const { readFileSync } = fs

const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

import {
    SLinsertZhangqi,
    fetchTaocanItem2name,
    getAllTaocan,
    getAllFuka,
    createZhangqiSQL,
    createAcceptSQL,
    runSql2Arr,
    updateAllData,
    deleteReplaceData,
    computedZhangqiState2
} from '@/utils/zhangqi'
import { v4 as uuidv4 } from 'uuid'

export default {
    data() {
        return {
            btntext: '开始写入数据库',
            errorDate: [],
            dateFormatArr: ['YYYY/M/D HH:mm:ss', 'YYYY-M-D HH:mm:ss'],
            monthLength: 0,
            insertStatus: false, //是否正在写入数据
            logsVisible: false, //显示解析记录
            loading: false,
            logs: [], //操作记录
            qudao: '',
            analysisActiveName: 'all',
            fileList: [],
            datas: [], //所有的列
            error: [], //失败的列表
            success: [], //成功的列表
            page: 1, //当前页
            showItem: ['购物车流水号', '地区', '渠道名称', '受理人', '产品名称', '所属主销售品', '业务号码', '揽收人'],
            items: {
                uuid: 'uuid',
                pgk_id: 'pgk_id',
                action_r: 'action_r',
                no: '购物车流水号',
                area: '地区',
                addr: '渠道名称',
                acceptor: '受理人',
                product_name: '产品名称',
                product_type: '角色名称',
                product_main: '所属主销售品',
                action: '业务动作',
                action_no: '业务号码',
                created: '受理时间',
                status: '工单状态',
                date_end: '竣工时间',
                user: '揽收人',
                remark: '备注',
                import_date: '导入时间'
            }
        }
    },
    watch: {},
    computed: {
        datas2() {
            const key = this.analysisActiveName
            if (key === 'all') {
                return this.datas
            } else if (key === 'success') {
                return this.success
            }
            return this.error
        },
        splitDatas() {
            // 分页显示数据
            const limit = 100
            let start = (this.page - 1) * limit - 1
            if (start < 0) {
                start = 0
            }

            return this.datas2.slice(start, start + limit)
        }
    },
    created() {
        this.onFetchMonthLength()
    },
    methods: {
        updateAllData,
        // 本月已导入数据
        onFetchMonthLength() {
            const firstDay = dayjs()
                .startOf('month')
                .unix()
            const lastDay = dayjs()
                .endOf('month')
                .unix()

            const sql = `select count(*) as count from accept where import_date between ${firstDay} and ${lastDay}`

            this.$db.get(sql, (err, res) => {
                if (err) {
                    this.$logger(err)
                } else {
                    this.$logger(res)
                    this.monthLength = res.count
                    // this.dataListTotalCount = res.totalCount;
                }
            })
        },
        handleAnalysisDownload(type) {
            // const type = this.analysisActiveName
            let txt = '全部'
            let datas = this[type]

            if (datas.length < 1) {
                return this.$message({
                    showClose: true,
                    message: '当前分类下面没有数据哦',
                    type: 'warning'
                })
            }

            if (type === 'success') {
                txt = '写入成功'
            } else if (type === 'error') {
                txt = '写入失败（已存在）'
            }

            download.excel2([{ datas, name: txt, bookName: txt, type: 'json' }])
        },

        submitUpload() {
            this.logs = []
            this.datas = []
            this.success = []
            this.error = []

            let fileList = this.$electron.remote.dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: { name: 'xlsx', extensions: ['xlsx', 'xls'] }
            })
            if (!fileList || fileList.length < 1) {
                this.$message({
                    message: '没有获取到相关文件',
                    type: 'error'
                })

                return
            }
            this.loading = true
            setTimeout(() => {
                this.logs.push(`选取${fileList.length}张数据表, 开始解析`)

                fileList.forEach((e, i) => {
                    try {
                        this.onOpenFile(e, i)
                    } catch (err) {
                        this.$confirm(`解析文件出现错误文件[${e}], 是否重试?`, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        })
                            .then(() => {
                                this.onOpenFile(e)
                            })
                            .catch(() => {})
                    }
                })
                this.loading = false
                this.logs.push(`数据解析完毕，共解析${fileList.length}张数据表，取得数据${this.datas.length}条。`)
                let obj = {}
                // this.datas.forEach(e => {
                //     e.
                // })

                // this.onOpenFile(input.files)
            }, 100)
        },
        onOpenFile(path, i) {
            this.logs.push(`[开始解析]：<span>${path}</span>数据表`)

            // 获取数据
            const excelBuffer = readFileSync(path)

            // 解析数据
            const result = xlsx.read(excelBuffer, {
                type: 'buffer',
                cellHTML: false
            })

            this.$logger('TCL: result', result)

            let _datas = xlsx.utils.sheet_to_json(result.Sheets[result.SheetNames[0]])

            this.logs.push(`[解析完成]：<span>${path}</span>数据表，共有${_datas.length}条数据`)
            this.logs.push(`[过滤数据]：<span>${path}</span>数据表`)
            //  )
            _datas = _datas.filter(
                e => (e['业务动作'] === '新装' || e['业务动作'] === '改速率') && e['工单状态'] === '已归档'
            )
            this.datas.push(..._datas)

            this.logs.push(`[过滤完成]：<span>${path}</span>数据表，取得「改速率」和「新装」数据共${_datas.length}条`)
        },
        onEachInsert(keys, item) {
            const acceptItem = {}
            keys.split(',').forEach((e, i) => {
                acceptItem[e] = item[i]
            })
            // select * from accept  GROUP by action_no,product_main,action order by date_end asc,action asc

            // 1. 先查询是否有相同的数据
            // 2. 如果有相同的就判断业务动作 新装和改数率， 优先保留时间靠前和新装

            let sql = `select * from accept where action_no='${acceptItem.action_no}' and product_name='${acceptItem.product_name}'`

            return new Promise(resolve => {
                this.$db.get(sql, async (err, res) => {
                    // console.log('查询的数据', err, res)
                    if (res && res.id) {
                        // 新装时间一定比改速率靠前
                        const list_id = res.id

                        if (acceptItem.action == '新装' || acceptItem.created < res.created) {
                            let dsql = `delete from accept where id = '${list_id}'`
                            this.$db.run(dsql, async (err, res) => {
                                // console.log('删除对应的受理清单', { err, res }) // 删除对应的账期
                                this.$db.run(`delete from zhangqi where list_id=${list_id}`, (err, res) => {
                                    // console.log('删除对应的账期完成', err, res)
                                })

                                let taocan = await fetchTaocanItem2name(acceptItem.product_main)
                                // console.log({ taocan })
                                if (taocan && taocan.id) {
                                    acceptItem.pgk_id = taocan.id
                                }
                                const vals = `'${Object.values(acceptItem).join("','")}'`
                                const keys2 = `'${Object.keys(acceptItem).join("','")}'`
                                const insertSQL = `INSERT INTO accept (${keys2}) VALUES (${vals})`

                                this.$db.run(insertSQL, (err, res) => {
                                    this.$logger('accept 更改数据插入完成', { err, res })
                                    resolve(err)
                                })
                            })
                        } else {
                            resolve(null)
                        }
                    } else {
                        let taocan = await fetchTaocanItem2name(acceptItem.product_main)
                        if (taocan && taocan.id) {
                            acceptItem.pgk_id = taocan.id
                        }
                        const vals = `'${Object.values(acceptItem).join("','")}'`
                        const keys2 = `'${Object.keys(acceptItem).join("','")}'`
                        const insertSQL = `INSERT INTO accept (${keys2}) VALUES (${vals})`

                        this.$db.run(insertSQL, (err, res) => {
                            this.$logger('accept 插入完成', { err, res })
                            resolve(err)
                        })
                    }
                })
            })
        },
        async insertAccept() {
            // return false

            if (this.insertStatus) return
            this.insertStatus = true
            const now = dayjs().unix()

            const key = Object.keys(this.items)
            const values = Object.values(this.items)
            let arr = []
            const taocanArr = await getAllTaocan()
            // console.log(taocanArr)
            const taocanList = []
            const fukaArr = await getAllFuka()
            // console.log(fukaArr)
            const zqArr = [] //账期sql arr
            const pgk_ids = new Set()
            // console.log(taocanArr, fukaArr)

            for (var i = this.datas.length - 1; i >= 0; i--) {
                let item = this.datas[i]
                let uuid = uuidv4()

                let restItem = values.map(e => {
                    let v = item[e]

                    if (e === '竣工时间' || e === '受理时间') {
                        if (!v) {
                            v = item['受理时间']
                        }
                        // excel的时间格式是number
                        if (typeof v === 'number') {
                            v = new Date((v - 25569) * 86400 * 1000)
                        }

                        v = dayjs(v).unix()
                        return isNaN(v) ? 0 : v
                    } else if (e === '导入时间') {
                        return now
                    } else if (e === 'uuid') {
                        return uuid
                    } else if (e === 'pgk_id') {
                        let pgk_id = 0
                        let t = taocanArr.find(t2 => {
                            // console.log(t2.val, item['所属主销售品'])
                            return t2.val.indexOf(`#${item['所属主销售品']}`) > -1
                        })
                        if (t) {
                            pgk_id = t.id
                            pgk_ids.add(t.id)

                            let date = item['竣工时间'] || item['受理时间']
                            if (typeof date === 'number') {
                                date = new Date((date - 25569) * 86400 * 1000)
                                date = dayjs(date).unix()
                                // console.log('number date', date, dayjs.unix(date).format('YYYYMM'))
                            }

                            let a = {
                                date_end: date,
                                uuid,
                                action: item['业务动作']
                            }

                            zqArr.push(...createZhangqiSQL(t, a))
                        }
                        return pgk_id
                    } else if (e === 'action_r') {
                        let _ac = `#${item['业务号码']}#`

                        let _t = fukaArr.find(tt => {
                            return tt.indexOf(_ac) > -1
                        })
                        // console.log('ac,t', _ac, _t)
                        if (_t) _ac = _t

                        return _ac
                    } else {
                        return item[e] || ''
                    }
                })
                arr.push(restItem)
            }
            // console.log('arr1', arr, key)

            // 生成插入受理清单sql
            arr = createAcceptSQL(key, arr)
            // console.log('arr2', arr)
            // runSql2Arr(arr)
            runSql2Arr([...arr, ...zqArr]).then(res => {
                // console.log('runSql2Arr over', res)
                this.btntext = '正在查找重复数据'
                this.$notify.info({
                    duration: 20000,
                    title: '受理清单导入完成！',
                    message: '开始查找重复数据。'
                })
                deleteReplaceData().then(res => {
                    // console.log('重复数据删除完成')
                    this.btntext = '正在更新账期信息'
                    this.onFetchMonthLength()

                    this.$notify.info({
                        duration: 20000,
                        title: '重复数据删除完成！',
                        message: '开始更新账期信息。'
                    })

                    // 开始更新账期
                    computedZhangqiState2(Array.from(pgk_ids)).then(res => {
                        this.datas = []
                        this.insertStatus = false
                        this.btntext = '写入完成'
                        this.$notify.success({
                            duration: 20000,
                            title: '完成',
                            message: '账期更新完毕，所有操作结束！'
                        })
                    })
                })

                /*         runSql2Arr(zqArr).then(res => {
                    console.log('添加账期完成', res)

                    
                })*/
            })

            // console.log('zqArr', zqArr)

            // 批量插入数据

            /*      this.onFetchMonthLength()
            SLinsertZhangqi(max_id).then(res => {
                this.insertStatus = false
                console.log('SLinsertZhangqixxxxxxxxx', res)
            })*/
        },
        async handleInsertData(e) {
            // return false

            if (this.insertStatus) return
            this.insertStatus = true
            // const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
            const now = dayjs().unix()

            const key = Object.keys(this.items).join(',')
            const values = Object.values(this.items)

            /**
            更新账期
            1. 查询出最大ID
            2.
            **/
            let max_id = await new Promise(resolve => {
                this.$db.get(`select id from accept order by id desc limit 1`, (err, res) => {
                    let id = (res && res.id) | 0
                    resolve(id)
                })
            })

            for (var i = this.datas.length - 1; i >= 0; i--) {
                let item = { ...this.datas[i] }
                let restitem = values.map(e => {
                    if (e === '竣工时间' || e == '受理时间') {
                        let date = item[e]
                        if (!date) {
                            // const fromat_date = ['YYYY/M/D HH:mm:ss', 'YYYY-M-D HH:mm:ss']
                            // date = dayjs(item['受理时间'], fromat_date).unix()
                            date = item['受理时间']
                        }
                        // excel的时间格式是number
                        if (typeof date === 'number') {
                            date = new Date((date - 25569) * 86400 * 1000)
                            // console.log(date)
                        }

                        date = dayjs(date).unix()
                        return isNaN(date) ? 0 : date
                    } else if (e == '导入时间') {
                        return now
                    } else {
                        return item[e] || ''
                    }
                })

                // if (i == 1) {
                // this.$logger(now)
                // console.log(key, restitem)

                let flag = await this.onEachInsert(key, restitem)

                let result = {}
                restitem.forEach((e, i) => {
                    result[values[i]] = e
                })
                // this.$logger(item.created, item.date_end, _d)
                // _d=null 则成功。反之返回错误信息
                // data.push({...this.datas[i], isok: !_d})
                if (!flag) {
                    this.success.push(result)
                } else {
                    flag = flag.toString()
                    if (/UNIQUE/i.test(flag)) {
                        flag = '业务号码已存在'
                    }
                    result['失败原因'] = flag

                    this.error.push(result)
                }
            }
            this.onFetchMonthLength()
            SLinsertZhangqi(max_id).then(res => {
                this.insertStatus = false
                // console.log('SLinsertZhangqixxxxxxxxx', res)
            })
        }
    }
}
</script>
<style lang="less">
.el-upload__tip {
    margin-left: 20px;
    cursor: pointer;
}

#masker {
    overflow: auto;
}
</style>
