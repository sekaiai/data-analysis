<template>
    <div id="home-add" v-loading.lock="loading" element-loading-text="正在解析数据">
        <div class="title-line shrink0">导入受理清单</div>
        <div style="margin-bottom: 20px">本月已导入{{monthLength}}条数据</div>
        <div class="form-line">
            <div class="flex">
                <!-- <el-upload class="upload-demo" ref="upload" multiple accept='.xls,.xlsx' action="/" :auto-upload="false"> -->
                <!-- <el-button slot="trigger" size="small" type="primary">选取文件</el-button> -->
                <!-- <el-button slot="trigger" type="primary" :loading="loading">导入用户表<i class="el-icon-upload"></i></el-button> -->
                <!-- </el-upload> -->
                <el-button type="primary" @click="submitUpload">
                    <template v-if='datas.length'>
                        <span>重新</span>
                    </template>
                    选择受理清单文件</el-button>
                <!-- <div slot="tip" @click="logsVisible = true" class="el-upload__tip" v-if="logs.length">
                    解析记录
                </div> -->
            </div>
        </div>
        <template v-if="logs.length">
            <div class="title-line">解析记录 ({{ logs.length }}) 条</div>
            <div id="masker">
                <p v-for="(v, i) in logs" :key="i" v-html="v"></p>
            </div>
        </template>
        <div class="form-line" style="margin-top: 20px" v-if='datas.length'>
            <el-button :loading="insertStatus" type="success" @click="handleInsertData">
                开始写入数据库
            </el-button>
            <div style="margin-top: 20px;">
                <div>写入成功 ({{success.length}})条 <el-button v-if='!insertStatus' type="text" @click='handleAnalysisDownload(`success`)'>导出Excel</el-button>
                </div>
                <div>写入失败 ({{error.length}})条 <el-button v-if='!insertStatus' type="text" @click='handleAnalysisDownload(`error`)'>导出Excel</el-button>
                </div>
            </div>
        </div>
        <div class="data-analysis ">
            <!--           <el-tabs v-model="analysisActiveName" @tab-click="handleTabsChange">
                <el-tab-pane name="all">
                    <span slot="label">
                        数据总行数 <span class="link">({{ datas.length }})</span></span>
                </el-tab-pane>
                <el-tab-pane name="success">
                    <span slot="label">
                        成功数 <span class="link">({{ success.length }})</span></span>
                </el-tab-pane>
                <el-tab-pane name="error">
                    <span slot="label">
                        已存在 <span class="link">({{ error.length }})</span></span>
                </el-tab-pane>
            </el-tabs> -->
            <!-- <el-button class="button" type="success" @click="handleAnalysisDownload" size="mini">导出该分类数据</el-button> -->
        </div>
    </div>
</template>
<script>
import download from '@/utils/download.js'
import dayjs from 'dayjs'
import xlsx from 'xlsx'
const fs = require('fs')
const { readFileSync } = fs

export default {
    data() {
        return {
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
        },
    },
    created() {
        this.onFetchMonthLength()
    },
    methods: {
        onFetchMonthLength() {

            const firstDay = dayjs().startOf('month').unix()
            const lastDay = dayjs().endOf('month').unix()

            const sql = `select count(*) as count from accept where import_date between ${firstDay} and ${lastDay}`

            this.$db.get(sql, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                    this.monthLength = res.count
                    // this.dataListTotalCount = res.totalCount;
                }
            })
        },
        handleDisplayLogs() {
            // 显示解析记录
        },
        handleCurrentChange(page) {
            this.page = page
        },
        handleTabsChange(e) {
            // tabs 切换
            console.log(e)
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
            console.log(type, datas)
            console.log('handleAnalysisDownload')

            const name = `[${txt}]`
            const book_name = 'book_name'
            console.log(datas)

            download.excel2(datas, name, book_name, 'json')

            /*     this.$confirm(`要下载「${txt}」xlsx吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info '
            }).then(() => {
                // 下载
                // datas = this.parseAoaData(datas)
      
            })*/
        },
        parseAoaData(datas) {
            const line1 = Object.values(this.items)
            const keys = Object.keys(this.items)
            console.log({ line1, keys })
            console.log({ datas })
            datas = datas.map(v => {
                return keys.map(k => v[k])
            })
            datas.unshift(line1)
            console.log(datas)
            return datas
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
                console.log('loading', this.loading)
                this.logs.push(`选取${fileList.length}张数据表, 开始解析`)

                console.log(fileList)
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

            console.log('TCL: result', result)

            let _datas = xlsx.utils.sheet_to_json(result.Sheets[result.SheetNames[0]])

            this.logs.push(`[解析完成]：<span>${path}</span>数据表，共有${_datas.length}条数据`)
            this.logs.push(`[过滤数据]：<span>${path}</span>数据表`)
            //  )
            _datas = _datas.filter(e => ((e['业务动作'] === '新装' || e['业务动作'] === '改速率') && e['工单状态'] === '已归档'))
            this.datas.push(..._datas)

            this.logs.push(`[过滤完成]：<span>${path}</span>数据表，取得「改速率」和「新装」数据共${_datas.length}条`)

            /*
            // const table_values = Object.values(this.items)
            // const table_keys = Object.keys(this.items)
            从有数据的第一行开始查找
            json.forEach((e, i) => {
                const values = Object.values(e)
                console.log(e)

                const action = e['__EMPTY_6']
                if (e.length > 2 && action === '新装') {
                    // arr.push(values)
                    console.log(e)

                    let _data = {
                        no: values[0],
                        area: e['__EMPTY'],
                        addr: e['__EMPTY_1'],
                        acceptor: e['__EMPTY_2'], //'受理人',
                        product_name: e['__EMPTY_3'], // '产品名称',
                        product_type: e['__EMPTY_4'], // '角色名称',
                        product_main: e['__EMPTY_5'], // '所属主销售品',
                        action, // '业务动作',
                        action_no: e['__EMPTY_7'], // '业务号码',
                        created: e['__EMPTY_8'], // '受理时间',
                        status: e['__EMPTY_9'], // '工单状态',
                        date_end: e['__EMPTY_10'], // '竣工时间',
                        user: e['__EMPTY_11'], // '揽收人',
                        remark: e['__EMPTY_12'], // '备注',
                    }
                    arr.push(_data)
                }
            })
*/
            /*
            多数据过滤
                    const datas = []
                        const _arr = [...this.datas, ...arr]
                        _arr.forEach(e => {
                            const idx = datas.findIndex(v => e.no == v.no)
                            if (idx === -1) {
                                datas.push(e)
                            }
                        })
                        this.datas = datas
            */

            // this.datas.push(...arr)
            // console.log({ arr: arr.length })
            // resolve()

            // 插入数据库
            // })

            // download.excel('xxx.xlsx', result2)
        },
        onEachInsert(keys, values) {
            const sql = `INSERT INTO accept (${keys}) VALUES (${values})`
            // console.log(sql)
            return new Promise(resolve => {
                this.$db.run(sql, err => {
                    if (err) {
                        console.log(err)
                    }
                    resolve(err)
                })
            })
        },
        async handleInsertData(e) {
            if (this.insertStatus) return
            this.insertStatus = true
            // const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
            const now = dayjs().unix()

            const key = Object.keys(this.items).join(',')
            const values = Object.values(this.items)

            for (var i = this.datas.length - 1; i >= 0; i--) {
                let item = this.datas[i]
                item = values.map(e => {
                    if (e == '受理时间' || e == '竣工时间') {
                        let date = dayjs(item[e]).unix()
                        console.log(e, date)

                        // let date = new Date(`${item[e]}`).getTime()
                        return isNaN(date) ? 0 : date


                    } else if (e == '导入时间') {
                        return now
                    } else {
                        return item[e] || ''
                    }
                })

                // if (i == 1) {
                console.log(now)
                // }

                // item['受理时间'] =
                // item['竣工时间'] = new Date(item['竣工时间']).getTime() | 0
                let flag = await this.onEachInsert(key, `'${item.join("','")}'`)
                // const result = item.map((e, i) => ({
                //     [values[i]]: e
                // }))
                let result = {}
                item.forEach((e, i) => {
                    result[values[i]] = e
                })
                // console.log(item.created, item.date_end, _d)
                // _d=null 则成功。反之返回错误信息
                // data.push({...this.datas[i], isok: !_d})
                if (!flag) {
                    this.success.push(result)
                } else {
                    flag = flag.toString()
                    if ((/UNIQUE/i).test(flag)) {
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