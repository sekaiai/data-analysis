<template>
    <div id='home' v-loading.lock="loading" element-loading-text="正在解析数据">
        <div class="clear" @click='handleClearData'>清空数据表</div>
        <div class="title-line">结算分析</div>
        <div class="form-line">
            <!-- <div class="flex">
                <el-upload class="upload-demo" :on-change='onChange' ref="upload" multiple accept='.xls,.xlsx' action="/" :auto-upload="false">
                    <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    <el-button slot="trigger" type="primary" :loading="loading">请选择要筛选的文件<i class="el-icon-upload"></i></el-button>
                    <el-button style="margin-left: 10px;" type="success" @click="submitUpload">开始分析</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传xls/xlxs文件，且不超过500M</div>
                </el-upload>
            </div> -->
            <el-button type="primary" @click="submitUpload">导入结算清单</el-button>
        </div>
        <div class="title-line">导入结算表分析</div>
        <p>共导入{{tableNum.length}}张表</p>
        <p>结算成功：{{success.length}}</p>
        <p>结算数据：{{errors.length}}</p>
        <p>共有数据：{{datas.length}}</p>
        <p>写入数据成功：{{insertSuccess.length}}条
            <el-button v-if='insertSuccess.length' type="text" size='mini' @click='handleAnalysisDownload(`insertSuccess`)'>(导出)</el-button>
        </p>
        <p>写入失败数据：{{insertError.length}}条
            <el-button v-if='insertError.length' type="text" size='mini' @click='handleAnalysisDownload(`insertError`)'>(导出)</el-button>
        </p>
        <div class="title-line">账期分析</div>
        <p>
            本月需要结算的清单数量<span>{{accept_count}}</span>，本月需要处理的受理清单<span>{{accept_length}}</span>
        </p>
        <p>
            本月已导入<span>{{monthInsertData.length}}</span>条清单,
        </p>
        <p>
            结算成功清单<span>{{monthInsertSuccess.length}}</span>
            <el-button v-if='monthInsertSuccess.length' type="text" size='mini' @click='handleAnalysisDownload(`success`)'>(导出)</el-button>条清单
        </p>
        <p>
            结算失败清单<span>{{monthInsertError.length}}</span>
            <el-button v-if='monthInsertError.length' type="text" size='mini' @click='handleAnalysisDownload(`success`)'>(导出)</el-button>条清单
        </p>
        <p>
            未找到受理用户<span>{{monthInsertLose.length}}</span>
            <el-button v-if='monthInsertLose.length' type="text" size='mini' @click='handleAnalysisDownload(`success`)'>(导出)</el-button>条
        </p>
        <!-- <p>
    未结算清单数量<span>{{accept_count}}</span>条<el-button v-if='!loading' type="text" size='mini' @click='handleAnalysisDownload(`success`)'>导出</el-button>
</p> -->
        <!--         <p>
            实际结算<span>{{success.length}}</span>条<el-button v-if='!loading' type="text" size='mini' @click='handleAnalysisDownload(`error`)'>导出</el-button>。
        </p> -->
        <p>
            未结算清单<span>999</span>条<el-button v-if='!loading' type="text" size='mini' @click='handleAnalysisDownload(`lose`)'>导出</el-button>
        </p>
        <div>
            <el-button type="success" @click="submitUpload">更新数据</el-button>
            <el-button type="default" @click="onRouterList">查看历史数据</el-button>
        </div>
        <!--         <div class="data-analysis">
    <el-tabs v-model="analysisActiveName" @tab-click="handleAnalysisClick">
        <el-tab-pane :label="`全部数据 (${datas.length})`" name="all">
        </el-tab-pane>
        <el-tab-pane :label="`成功数据 (${success.length})`" name="success">
        </el-tab-pane>
        <el-tab-pane :label="`失败数据 (${errors.length})`" name="errors">
        </el-tab-pane>
        <el-tab-pane :label="`未找到数据 (${notfound.length})`" name="lose">
        </el-tab-pane>
    </el-tabs>
    <el-button class='button' :loading='outputLoading' type="success" @click="handleAnalysisDownload" size='mini'>导出该分类数据</el-button>
</div>
<div class="table-box flex1" ref='tableBox'>
    <template v-if='tableHeight'>
        <el-table :data="splitDatas" style="width: 100%" :height="tableHeight" v-if='analysisActiveName !== "lose"'>
            <el-table-column v-for="(v, i) in items" :prop="i" :label="i"> </el-table-column>
            <el-table-column prop="no" label="购物车流水号"> </el-table-column>
        </el-table>
        <el-table :data="splitDatas" style="width: 100%" :height="tableHeight" v-else>
            <el-table-column v-for="(v, i) in notfoundItems" :prop="i" :label="v"> </el-table-column>
            <el-table-column prop="no" label="购物车流水号"> </el-table-column>
        </el-table>
    </template>
</div>
<el-pagination class='pagination' @current-change='handleCurrentChange' :hide-on-single-page="false" background layout="prev, pager, next" :current-page.sync='page' :total="splitDatas.length">
</el-pagination> -->
    </div>
</template>
<script>
import download from '@/utils/download.js'
import dayjs from 'dayjs'
import xlsx from 'xlsx'
const fs = require('fs')
// const { readFileSync } = fs


export default {
    data() {
        return {
            notFoundUserMember: [], //没有找到action_id的数据
            monthInsertData: [], //本月导入的数据
            outputLoading: false,
            loading: false,
            qudao: '',
            analysisActiveName: 'all',
            tableNum: [], //导入的xlxs
            insertError: [], //插入失败的数据
            insertSuccess: [], //插入成功的数据
            fileList: [],
            datas: [], //所有
            success: [], //成功条数
            errors: [], //错误的条数
            notfound: [], //没找到数据
            accept_count: 0, //需要返款的清单条数
            accept_length: 0, //需要受理的清单数
            page: 1,
            items: {
                '产品类型': '',
                '佣金结算段落': '',
                '佣金结算策略': '',
                '佣金结算类型': '',
                '佣金结算金额（元）': '',
                '原因': '',
                '发展套餐名': '',
                '是否成功结算': '',
                '用户ID': '',
                '用户号码': '',
                '订单号': '',
                '订单竣工时间': '',
                '账期': '',
            },
            notfoundItems: {
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
            },
            columns: {
                date: '账期',
                order_id: '订单号',
                complete_date: '订单竣工时间',
                commission_policy: '佣金结算策略',
                commission_type: '佣金结算类型',
                commission_money: '佣金结算金额（元）',
                package_name: '发展套餐名',
                product_name: '产品类型',
                user_id: '用户ID',
                user_number: '用户号码',
                status: '是否成功结算',
                cause: '原因',
                branch: '网点名称'
            }
        }
    },
    computed: {
        monthInsertError() {
            // 该月写入的失败数据
            return this.monthInsertData.filter(e => e.status == 0)
        },
        monthInsertSuccess() {
            // 该月写入的成功数据
            return this.monthInsertData.filter(e => e.status == 1)
        },
        monthInsertLose() {
            // 该月写入的没找到action_id的数据
            return this.monthInsertData.filter(e => e.not_found_user == 1)
        },
        /* currentData() {
             // 显示的数据粗
             const k = this.analysisActiveName
             if (k === 'success') {
                 return this.success
             } else if (k === 'errors') {
                 return this.errors
             } else if (k === 'all') {
                 // 没有找到的数据
                 return this.datas
             } else {
                 return this.notfound
             }
         },*/
        /* splitDatas() {
             // 分页显示数据
             const limit = 100
             let start = (this.page - 1) * limit - 1
             if (start < 0) {
                 start = 0
             }


             return this.currentData.slice(start, start + limit)
         },*/
    },
    created() {
        this.onFetchPackageDatas()
    },
    methods: {
        onRouterList() {
            this.$router.push('/bill/list')
        },
        handleClearData() {
            // 清空数据库
            this.$db.run(`delete from bill where id > 0`, (err, res) => {
                console.log({ err, res })
            })
        },
        onFetchPackageDatas() {
            const sql = 'select * from package'

            this.$db.all(sql, (err, res) => {
                console.log(err, res)
                if (!err) {
                    this.onFetchSettle(res)
                }
            })
            // 获取本月导入成功的数据

            const firstDay = dayjs().startOf('month').unix()
            const lastDay = dayjs().endOf('month').unix()

            const month_sql = `select * from bill where created between ${firstDay} and ${lastDay}`
            this.$db.all(month_sql, (err, res = []) => {
                console.log('----------------------', err, res)
                this.monthInsertData = res
            })
        },

        async onFetchSettle(vals) {
            // 获取本月待计算受理数
            // 1. 先通过套餐获取对应的受理清单（结算次数）
            // 2. 循环所有，判断月份


            console.log('onFetchSettle', vals)
            for (var i = vals.length - 1; i >= 0; i--) {

                let { name, count } = vals[i]
                console.log(name, count)
                const sql = `select a.date_end,a.js_count from accept as a where a.js_count < ${count} and product_main='${name}'`
                const data = await new Promise(resolve => {
                    this.$db.all(sql, (err, res) => {
                        if (!err) {
                            // console.log({ vals }, i)
                            resolve(res)
                            // console.log(day, now, law, count)

                        } else {
                            resolve([])
                        }

                    })

                })

                console.log({ data }, i)
                this.onCalcCount(vals[i], data)

            }

        },
        onCalcCount(item, vals) {
            // 统计本月需要计算的数量
            console.log({ item })
            let { name, count, law, id } = item

            const now = dayjs().format('YYYYMM')

            // 组装每月结算间隔
            law = law.toString().split(',')
            law.length = count
            law = Array.from(law).map(e => ((e | 0) || 1))
            console.log({ law })
            let result = 0 //总结算次数
            let __nums = 0 //总结算清单数

            vals.forEach(e => {

                // 竣工时间
                let day = dayjs(e.date_end * 1000).format('YYYYMM')

                // 计算本月该数据该计算几次，暂时按照个月结算。月月结算
                // let _count = now - day

                // 判断计算次数, 和对应规则。以及判断是否对应结算规则
                let _law = law.slice(0, count)

                // 结算次数
                let __count = 0
                for (let i = 0; i < _law.length; i++) {
                    day = (day | 0) + (_law[i] | 0)
                    let flag = day <= now

                    if (name === '5G畅享199元套餐201910') {

                        console.log('5G畅享199元套餐201910------------', (day | 0) + (_law[i] | 0), day, flag)
                    }
                    // 月份小于规则，结算数量就+1，反之跳出
                    if (flag) {
                        __count++
                    } else {
                        break;

                    }
                }


                // 减去以结算的
                __count = __count - e.js_count

                if (__count > 0) {
                    __nums++
                    result += __count
                }
            })
            // 获取当前查询套餐的INDEX
            const idx = this.datas.findIndex(e => e.id == id)
            console.log({ result, len: vals.length, idx })
            this.accept_count += result
            this.accept_length += __nums
            // this.$set(this.datas[idx], '__count', result)
            // this.$set(this.datas[idx], '__nums', __nums)

        },
        handleCurrentChange(page) {
            this.page = page
        },
        handleAnalysisDownload() {
            const type = this.analysisActiveName
            let datas = this.currentData


            if (datas.length < 1) {
                return this.$message({
                    showClose: true,
                    message: '当前分类下面没有数据哦',
                    type: 'warning'
                });
            }
            this.outputLoading = true
            let txt = '分析数据-'


            if (type === 'all') {
                txt += '全部数据'
            } else if (type === 'success') {
                txt += '成功数据'
            } else if (type === 'errors') {
                txt += '失败数据'
            } else if (type === 'lose') {
                txt += '未找到数据'
            }


            let excelType = 'json'
            if (type === 'lose') {

                datas = this.parseAoaData(datas)
                excelType = 'aoa'

            } else {
                // datas = this.parseJsonData(datas)
            }
            // 下载
            const name = `[${txt}]`
            const book_name = 'book_name'
            console.log(datas)

            download.excel2(datas, name, book_name, excelType).then(res => {
                this.outputLoading = false
                console.log(res)
                this.$message({
                    showClose: true,
                    message: `数据表格创建${!res ? '成功' : '失败'}`,
                    type: !res ? 'success' : 'error'
                });

            }).catch(err => {
                this.outputLoading = false
                console.log(err)
            })


        },
        parseAoaData(datas) {
            // json转成execl需要的数组

            const line1 = Object.values(this.notfoundItems)
            const keys = Object.keys(this.notfoundItems)
            console.log(line1, keys)
            datas = datas.map(v => {
                return keys.map(k => v[k])
            })
            datas.unshift(line1)
            console.log(datas)
            return datas
        },
        parseJsonData() {
            // json转数据

        },
        onChange(e) {
            // 文件发生变化
            console.log('onChange', e)
        },
        submitUpload() {

            /*console.log(this.$refs.upload)
            const upload = this.$refs.upload

            const input = upload.$el.querySelector('.el-upload__input')
            console.log(input.files)
            window.inputs = input

            this.fileList = input.files
*/
            let fileList = this.$electron.remote.dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: { name: 'xlsx', extensions: ['xlsx', 'xls'] }
            })

            if (!fileList || fileList.length < 1) {
                this.$message({
                    message: '没有获取到相关文件',
                    type: 'error'
                });
                return
            }
            this.loading = true
            this.tableNum = fileList

            fileList.forEach((e, i) => {
                this.onOpenFile(e, i)
            })

            this.loading = false
            this.$message({
                showClose: true,
                message: '数据解析完毕',
                type: 'success'
            });

            // this.onOpenFile(input.files)

        },
        onParseSuccess(key) {


            let arr = []
            const json = xlsx.utils.sheet_to_json(this.result.Sheets[key])

            if (key === '成功') {
                this.success = json
            } else {
                this.errors = json
                console.log({ json })
            }

        },
        onOpenFile(path, i) {
            // return new Promise((resolve, reject) => {

            // this.$electron.shell.openItem(path)
            /*    let x = this.$electron.remote.dialog.showOpenDialog({
                    properties: ['openFile'],
                    filters: { name: 'xlxs', extensions: ['xlsx', 'xls'] }
                })
                console.log(x, xlsx)
                if (!x) {
                    return
                }*/
            // 获取数据
            const excelBuffer = fs.readFileSync(path)

            // 解析数据
            var result = xlsx.read(excelBuffer, {
                type: 'buffer',
                cellHTML: false
            })

            console.log('result', result)

            this.result = result
            // const keys = Object.keys(result)
            // const values = Object.values(result)

            const now = dayjs().unix()
            // 插入数据库

            // 分析数据
            // this.onParseSuccess()
            console.log(result)
            const _data = []
            result.SheetNames.forEach(key => {
                console.log('TCL: result', key)
                // const data = this.onParseSuccess(e)
                // console.log(data)
                // _data.push(...this.onParseSuccess(e))

                let json = xlsx.utils.sheet_to_json(result.Sheets[key])

                json = json.map(e => {
                    console.log(e)
                    let obj = {}
                    for (let k in this.columns) {
                        let v = this.columns[k]
                        if (v === '是否成功结算') {
                            obj[k] = (e[v] === '成功') * 1
                        } else {
                            obj[k] = e[v]
                        }
                    }
                    this.onInsertDatas(obj, now)
                    return obj
                })

                // 插入数据库


                if (key === '成功' || key === '失败') {
                    if (key === '成功') {
                        this.success = json
                    } else if (key === '失败') {
                        this.errors = json
                        console.log({ json })
                    }
                    _data.push(...json)

                }
                console.log({ json })

            })

            // 分析未找到数据
            this.datas = _data
            /*
             * date: 账期
             * order_id: 订单号
             * complete_date: 竣工时间
             * commission_policy: 佣金结算策略
             * commission_type: 佣金结算类型
             * commission_money: 佣金金额
             * package_name: 套餐名称
             * product_name: 产品名称
             * user_id: 用户ID
             * user_number: 用户号码
             * status: 是否结算成功
             * cause: 原因
             * branch: 网点
             */
            // 返回用户号码，用来做查询

            // 筛选数据
            this.handleParseLose()
            // })

            // download.excel('xxx.xlxs', result2)
        },
        onInsertDatas(datas, now) {
            datas.created = now
            let keys = Object.keys(datas).join(',')
            let values = Object.values(datas).join(`','`)
            // 插入数据库
            const sql = `insert into bill (${keys}) values ('${values}')`
            // console.log(sql)
            this.$db.run(sql, err => {
                if (err) {
                    console.log(err)
                    datas.error = err.toString()
                    this.insertError.push(datas)
                } else {
                    this.insertSuccess.push(datas)
                    // 更新acceptjs_count
                    const id = datas.user_number
                    const sql = `update accept set js_count=js_count+1 where action_no='${id}'`
                    this.$db.run(sql, (err) => {
                        if (err) {
                            const sql2 = `select a1 from related_user where a2='${id}' or a3='${id}' or a4='${id}'`
                            this.$db.get(sql2, (err, res) => {
                                if (err) {
                                    this.onNotFoundUserMember(datas)
                                } else {
                                    this.$db.run(sql, (err) => {
                                        console.log(err)
                                        if (err) {
                                            this.onNotFoundUserMember(datas)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        },
        onNotFoundUserMember(datas) {
            this.notFoundUserMember.push(datas)
            const sql = `update bill set not_found_user = 1 where user_number = '${datas.user_number}' `
            this.$db.run(sql, (err, res) => {
                console.log('onNotFoundUserMember', { err, res })
            })
        },
        handleParseLose() {
            let user = this.datas.map(e => e['user_number']).join(`','`)
            user = `'${user}'`
            console.log({ user })
            // 1.获取所有数据，然后再从user中未找到accept中不存在的数据

            // 查询未找到的数据
            const sql = `select * from accept where action_no  in (${user})`
            this.$db.all(sql, (err, res) => {
                console.log({ err })
                console.log(res)

                // {
                //                 no: '购物车流水号',
                //                 area: '地区',
                //                 addr: '渠道名称',
                //                 acceptor: '受理人',
                //                 product_name: '产品名称',
                //                 product_type: '角色名称',
                //                 product_main: '所属主销售品',
                //                 action: '业务动作',
                //                 action_no: '业务号码',
                //                 created: '受理时间',
                //                 status: '工单状态',
                //                 date_end: '竣工时间',
                //                 user: '揽收人',
                //                 remark: '备注',
                //                 import_date: '导入时间'
                //             }

                this.notfound = res
            })
        },
        handleAnalysisClick(e) {
            console.log(e)
            // 数据分析tab点击事件
        },
    }
}
</script>
<style lang="less">
p {
    span {
        font-weight: bold;
    }
}
</style>