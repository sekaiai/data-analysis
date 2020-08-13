<template>
    <div id="home-add" v-loading.lock="loading" element-loading-text="正在解析数据">
        <div @click="testParseDate">车市testParseDate</div>
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
        <div class="form-line" style="margin-top: 20px" v-if="datas.length">
            <el-button :loading="insertStatus" type="success" @click="handleInsertData">
                开始写入数据库
            </el-button>
            <div style="margin-top: 20px;">
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

export default {
    data() {
        return {
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
        testParseDate() {
            let d1 = '2020/5/3 13:55:21'
            let d2 = '2020/5/3 14:03:13'
            let d3 = '2020/5/4 17:28:39'

            var x = ['YYYY/M/D HH:mm:ss', 'YYYY-M-D HH:mm:ss']
            d1 = dayjs(d1, this.dateFormatArr).unix()
            d2 = dayjs(d2, x).format('YYYY-MM-DD HH:mm:ss')
            d3 = dayjs(d3, x).format('YYYY-MM-DD HH:mm:ss')

            console.log(d1, d2, d3)
        },
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
        handleCurrentChange(page) {
            this.page = page
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
                this.$logger('loading', this.loading)
                this.logs.push(`选取${fileList.length}张数据表, 开始解析`)

                this.$logger(fileList)
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
            const vals = `'${item.join("','")}'`
            const sql = `INSERT INTO accept (${keys}) VALUES (${vals})`

            return new Promise(resolve => {
                this.$db.run(sql, err => {
                    if (err) {
                        const values = {}
                        keys.split(',').forEach((e, i) => {
                            values[e] = item[i]
                        })

                        // 根据插入失败原因，判断是否更新数据
                        let ssql = `select id,no,created from accept where action_no = '${values.action_no}' and product_name='${values.product_name}'`
                        this.$db.get(ssql, (err, res) => {
                            // this.$logger({ res, err })
                            if (res) {
                                // 如果受理清单是新装则保留新装
                                // 非新装取时间考前的
                                if ((values.action == '新装' && res.no !== values.no) || values.created < res.created) {
                                    let dsql = `delete from accept where id = '${res.id}'`
                                    this.$db.run(dsql, (err, res) => {
                                        if (!err) {
                                            this.$db.run(sql, (err, res) => {
                                                // this.$logger('该插入成功', { err, res })
                                            })
                                        }
                                        // this.$logger('删除数据', { err, res })
                                    })
                                } else {
                                    // 不做处理
                                }
                            }
                        })
                    }
                    resolve(err)
                })
            })
        },
        async handleInsertData(e) {
            // return false

            if (this.insertStatus) return
            this.insertStatus = true
            // const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
            const now = dayjs().unix()

            const key = Object.keys(this.items).join(',')
            const values = Object.values(this.items)

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
            this.insertStatus = false
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
