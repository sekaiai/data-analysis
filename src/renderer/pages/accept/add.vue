<template>
    <div id="home-add" v-loading.lock="loading" element-loading-text="正在解析数据">
        <!-- <div @click="updateAllData">删除重复</div> -->
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
    setSLPGKID,
    computedZhangqiState3
} from '@/utils/zhangqi2'
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

            // action_r VARCHAR(255),

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
                import_date: '导入时间',
                user_number: '业务号码',
                action_r: '关联副卡'
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

            const fukaArr = await getAllFuka()
            let items = []

            // 格式化数据，并且插入数据库
            for (var i = this.datas.length - 1; i >= 0; i--) {
                let item = this.datas[i]
                let uuid = uuidv4()
                let _item = {}

                for (let x in this.items) {
                    let e = this.items[x]
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
                        _item[x] = isNaN(v) ? 0 : v
                    } else if (e === '导入时间') {
                        _item.import_date = now
                    } else if (e === 'uuid') {
                        _item.uuid = uuid
                    } else if (e === '关联副卡') {
                        let _fuka = `#${item['业务号码']}#`
                        let _t = fukaArr.find(tt => {
                            return tt.indexOf(_fuka) > -1
                        })
                        if (_t) _fuka = _t
                        _item.action_r = _fuka
                    } else {
                        _item[x] = v
                    }
                }
                items.push(_item)
            }

            console.log('items', items)
            // runSql2Arr(arr)
            setSLPGKID(items).then(pgk_ids => {
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
                    console.log('pgk_ids', pgk_ids)
                    // 开始更新账期
                    computedZhangqiState3(pgk_ids).then(res => {
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
