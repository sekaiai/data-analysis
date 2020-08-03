<template>
    <div id="home" v-loading.lock="loading" :element-loading-text="`正在解析数据`">
        <div class="clear" @click="handleClearData">清空数据表</div>
        <div class="title-line">结算分析</div>
        <div class="form-line">
            <el-button type="primary" @click="submitUpload">导入结算清单</el-button>
        </div>
        <div class="title-line">导入结算表分析</div>
        <p>共导入{{ tableNum.length }}张表</p>
        <p>结算成功：{{ importSuccessCount }}</p>
        <p>结算数据：{{ importErrorCount }}</p>
        <p>共有数据：{{ datas.length }}</p>
        <p>写入数据成功：{{ insertSuccessCount }}条</p>
        <p>
            写入失败数据：{{ insertError.length }}条
            <el-button
                v-if="insertError.length"
                :loading="outputLoading === 'insertError'"
                type="text"
                size="mini"
                @click="handleAnalysisDownload(`insertError`)"
                >(导出)</el-button
            >
        </p>
        <div class="title-line">账期分析</div>
        <p>
            本月需要结算的清单数量<span>{{ accept_count }}</span>
            <el-button
                v-if="accept_count"
                :loading="outputLoading === 'accept_count'"
                type="text"
                size="mini"
                @click="onFetchAccept('accept_count')"
            >
                (导出)
            </el-button>
            条
        </p>
        <p>
            本月需要结算受理清单<span>{{ accept_length }}</span>
            <el-button
                v-if="accept_count"
                :loading="outputLoading === 'accept_length'"
                type="text"
                size="mini"
                @click="onFetchAccept('accept_length')"
                >(导出)
            </el-button>
            条
        </p>
        <p>
            本月已导入<span
                >{{ monthInsertSuccessCount + monthInsertErrorCount
                }}<el-button v-if="monthInsertSuccessCount" type="text" size="mini" @click="router2bill(`month`)"
                    >(查看)</el-button
                ></span
            >条清单
        </p>
        <p>
            本月已导入结算成功清单<span>{{ monthInsertSuccessCount }}</span>
            <el-button v-if="monthInsertSuccessCount" type="text" size="mini" @click="router2bill(`monthSuccess`)"
                >(查看)</el-button
            >条清单
        </p>
        <p>
            本月已导入结算失败清单<span>{{ monthInsertErrorCount }}</span>
            <el-button v-if="monthInsertErrorCount" type="text" size="mini" @click="router2bill(`monthError`)"
                >(查看)</el-button
            >条清单
        </p>
        <p>
            所有结算未找到受理用户<span>{{ notFoundUserCount }}</span>
            <el-button
                v-if="notFoundUserCount"
                type="text"
                size="mini"
                :loading="outputLoading === 'notFoundUserCount'"
                @click="handleAnalysisDownload(`notFoundUserCount`)"
                >(导出)</el-button
            >条
        </p>
        <!-- <p>
    未结算清单数量<span>{{accept_count}}</span>条<el-button v-if='!loading' type="text" size='mini' @click='handleAnalysisDownload(`success`)'>导出</el-button>
</p> -->
        <!--         <p>
            实际结算<span>{{success.length}}</span>条<el-button v-if='!loading' type="text" size='mini' @click='handleAnalysisDownload(`error`)'>导出</el-button>。
        </p> -->
        <!--         <p>
            未结算清单<span>{{accept_count - }}</span>条<el-button
                v-if="!loading"
                type="text"
                size="mini"
                @click="handleAnalysisDownload(`lose`)"
                >导出</el-button
            >
        </p> -->
        <div>
            <el-button type="success" @click="handleUpdate">更新数据</el-button>
            <el-button type="default" @click="onRouterList">查看历史数据</el-button>
        </div>
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
            monthInsertSuccessCount: 0, //当月插入成功数
            monthInsertErrorCount: 0, //当月插入失败数
            notFoundUserCount: 0, //没有找到受理用户的结算清单
            importSuccessCount: 0, //导入成功数量
            importErrorCount: 0, //导入失败
            package: [], //需要结算的受理清单套餐
            // outputLoading: '', //用来判断是否需要组装下载数据
            accept_count_arr: [], //本月结算的清单
            insertSuccessCount: 0, //写入成功的条数
            insertError: [], //插入失败的数据

            notFoundUserMember: [], //没有找到action_id的数据
            monthInsertData: [], //本月导入的数据
            outputLoading: false,
            loading: false,
            qudao: '',
            analysisActiveName: 'all',
            tableNum: [], //导入的xlxs
            fileList: [],
            datas: [], //所有
            success: [], //成功条数
            errors: [], //错误的条数
            notfound: [], //没找到数据
            accept_count: 0, //需要返款的清单条数
            accept_length: 0, //需要受理的清单数
            page: 1,
            items: {
                产品类型: '',
                佣金结算段落: '',
                佣金结算策略: '',
                佣金结算类型: '',
                '佣金结算金额（元）': '',
                原因: '',
                发展套餐名: '',
                是否成功结算: '',
                用户ID: '',
                用户号码: '',
                订单号: '',
                订单竣工时间: '',
                账期: ''
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
        firstDay() {
            return dayjs()
                .startOf('month')
                .unix()
        },
        // 获取本月导入成功的数据
        lastDay() {
            return dayjs()
                .endOf('month')
                .unix()
        }
    },
    created() {
        this.onFetchPackageDatas()
    },
    methods: {
        router2bill(type) {
            const query = {
                created: new Date().toString()
            }

            if (type === 'monthSuccess') {
                query.status = 1
            } else if (type === 'monthError') {
                query.status = 0
            }
            this.$router.push({ name: 'bill.list', query })
        },
        handleUpdate() {
            // 更新所有数据
        },
        onRouterList() {
            this.$router.push('/bill/list')
        },
        handleClearData() {
            // 清空数据库
            this.$db.run(`delete from bill where id > 0`, (err, res) => {
                console.log({ err, res })
            })
        },
        // 获取本月待计算受理数
        onFetchPackageDatas() {
            const sql = 'select * from package'
            this.$db.all(sql, (err, res) => {
                console.log(err, res)
                if (!err) {
                    this.package = res
                    this.onFetchSettle(res)
                }
            })

            this.onFetchMonthCount()
        },
        onFetchMonthCount() {
            // 获取本月导入的数据条数

            const month_sql = `select count(*) as count from bill where created between ${this.firstDay} and ${this.lastDay}`

            this.$db.get(`${month_sql} and status=1`, (err, res = []) => {
                this.monthInsertSuccessCount = res.count
            })

            this.$db.get(`${month_sql} and status=0`, (err, res = []) => {
                this.monthInsertErrorCount = res.count
            })
            // 获取没有找到对于业务号码的结算数据
            this.$db.get(`${month_sql} and not_found_user=1`, (err, res = []) => {
                this.notFoundUserCount = res.count
            })
        },

        // 获取本月待计算受理数
        async onFetchSettle(vals) {
            // 1. 先通过套餐获取对应的受理清单（结算次数）
            // 2. 循环所有，判断月份
            let accept_arr = []
            for (var i = vals.length - 1; i >= 0; i--) {
                let { name, count } = vals[i]
                // console.log(name, count)
                // a.date_end,a.js_count
                const sql = `select a.* from accept as a where a.js_count < ${count} and product_main='${name}'`
                const data = await new Promise(resolve => {
                    this.$db.all(sql, (err, res = []) => {
                        if (!err) {
                            // console.log({ vals }, i)
                            resolve(res)
                            // console.log(day, now, law, count)
                        } else {
                            resolve([])
                        }
                    })
                })

                if (this.outputLoading === 'accept_count' || this.outputLoading === 'accept_length') {
                    // 再获取当前acton所有结算清单
                    let _data = await this.onCalcCountColums(vals[i], data)
                    accept_arr.push(..._data)
                } else {
                    this.onCalcCount(vals[i], data)
                }
            }
            console.log({ accept_arr })
            return accept_arr
        },
        async onCalcCountColums(item, vals) {
            // 统计本月需要计算的数量
            // console.log({ item })
            let accept_count_arr = []
            let { name, count, law, id } = item

            const now = dayjs().format('YYYYMM')

            // 组装每月结算间隔
            law = law.toString().split(',')
            law.length = count
            law = Array.from(law).map(e => e | 0 || 1)
            console.log({ law })
            let result = 0 //总结算次数
            let __nums = 0 //总结算清单数

            // count 导出有月份的清单
            let __flag = this.outputLoading === 'accept_count'
            // 重置一下
            console.log({ vals })
            try {
                for (let i = 0; i < vals.length; i++) {
                    let e = vals[i]

                    // 竣工时间
                    let day = dayjs(e.date_end * 1000).format('YYYYMM')

                    // 计算本月该数据该计算几次，暂时按照个月结算。月月结算
                    // let _count = now - day

                    // 判断计算次数, 和对应规则。以及判断是否对应结算规则
                    let _law = law.slice(0, count)

                    // 结算次数
                    let __count = __flag ? [] : 0

                    for (let i = 0; i < _law.length; i++) {
                        day = (day | 0) + (_law[i] | 0)
                        let flag = day <= now

                        // 月份小于规则，结算数量就+1，反之跳出
                        if (flag) {
                            if (__flag) {
                                __count.push(day)
                            } else {
                                __count++
                            }
                        } else {
                            break
                        }
                    }

                    e.import_date = dayjs.unix(e.import_date).format('YYYY-MM-DD hh:ss:mm')
                    e.created = dayjs.unix(e.created).format('YYYY-MM-DD hh:ss:mm')
                    e.date_end = dayjs.unix(e.date_end).format('YYYY-MM-DD hh:ss:mm')

                    if (__flag) {
                        // console.log('找出结算成功的数据 __count', __count)
                        if (__count.length) {
                            // 找出结算成功的数据
                            let sql = `select date from bill where user_number='${e.action_no}' and status=1`

                            const qd = await new Promise(resolve => {
                                this.$db.all(sql, (err, res) => {
                                    // console.log('找出结算成功的数据', sql, res)

                                    if (!err) {
                                        // console.log({ vals }, i)
                                        resolve(res.map(e => e.date * 1))
                                        // console.log(day, now, law, count)
                                    } else {
                                        resolve([])
                                    }
                                })
                            })
                            // 筛选出已存在的
                            __count = __count.filter(e => !qd.includes(e * 1))

                            // console.log('找出结算成功的数据', qd, __count)
                            accept_count_arr.push(
                                ...__count.map(e2 => {
                                    e.date = e2
                                    return e
                                })
                            )
                        }
                    } else {
                        // 减去以结算的
                        __count = __count - e.js_count

                        if (__count > 0) {
                            accept_count_arr.push(e)
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }

            return accept_count_arr
        },
        onCalcCount(item, vals) {
            // 统计本月需要计算的数量
            // console.log({ item })
            let { name, count, law, id } = item

            const now = dayjs().format('YYYYMM')

            // 组装每月结算间隔
            law = law.toString().split(',')
            law.length = count
            law = Array.from(law).map(e => e | 0 || 1)
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

                    // 月份小于规则，结算数量就+1，反之跳出
                    if (flag) {
                        __count++
                    } else {
                        break
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
        async onFetchAccept(flag) {
            // 本月需要处理的受理清单
            // flag = 'accept_count', 'accept_length'
            // 获取受理清单
            console.log({ flag })
            try {
                let accept_count_arr = []
                if (this.package.length) {
                    this.outputLoading = flag
                    accept_count_arr = await this.onFetchSettle(this.package)
                } else {
                    return
                }
                console.log({ accept_count_arr })

                let __flag = flag === 'accept_count'

                const json = { ...this.notfoundItems, user_number: '副卡(结算号)', js_count: '已结算次数' }
                let title = ''
                if (__flag) {
                    json['date'] = '账期'
                    title = '带月份的受理清单'
                } else {
                    title = '需要结算的清单'
                }
                //

                if (accept_count_arr.length < 1) {
                    return this.$message({
                        showClose: true,
                        message: '当前分类下面没有数据哦',
                        type: 'warning'
                    })
                }

                let datas = this.parseAoaData(accept_count_arr, json)

                // 下载
                this.onDownload(datas, `[${title}]`)
            } catch (err) {
                this.outputLoading = ''
            }
        },
        async handleAnalysisDownload(type) {
            console.log('handleAnalysisDownload', type)
            let title = ''
            let datas = []
            if (type === 'insertError') {
                // 受理清单
                title = '[结算清单写入失败数据]'
                datas = this.insertError
            } else if (type === 'notFoundUserCount') {
                title = '[有结算清单,没有受理清单]'

                const sql = `select * from bill where not_found_user = 1`
                datas = await new Promise(resolve => {
                    this.$db.run(sql, (err, res) => {
                        console.log('onNotFoundUserMember', { err, res })
                        resolve(res || [])
                    })
                })
            }
            // return false

            if (datas.length < 1) {
                return this.$message({
                    showClose: true,
                    message: '当前分类下面没有数据哦',
                    type: 'warning'
                })
            }
            this.outputLoading = type

            // let excelType = 'json'
            const json = {
                ...this.columns,
                error: '失败原因'
            }
            datas = this.parseAoaData(datas, json)

            // 下载
            const name = `[${title}]`
            const book_name = 'book_name'
            console.log(datas)

            this.onDownload(datas, name)
        },
        onDownload(datas, name, book_name = 'book_name', excelType = 'aoa') {
            download
                .excel2(datas, name, book_name, excelType)
                .then(res => {
                    this.outputLoading = ''
                    console.log(res)
                    this.$message({
                        showClose: true,
                        message: `数据表格创建${!res ? '成功' : '失败'}`,
                        type: !res ? 'success' : 'error'
                    })
                })
                .catch(err => {
                    this.outputLoading = ''
                    console.log(err)
                })
        },
        parseAoaData(datas, json = '') {
            // json转成execl需要的数组

            const line1 = Object.values(json || this.notfoundItems)
            const keys = Object.keys(json || this.notfoundItems)
            // console.log(line1, keys)
            // console.log(datas)
            datas = datas.map(v => {
                return keys.map(k => {
                    console.log({ k })
                    if (k === 'error') {
                        if (/UNIQUE/i.test(v[k])) {
                            return '数据已存在'
                        }
                    }
                    return v[k]
                })
            })
            datas.unshift(line1)
            // console.log(datas)
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

            this.tableNum = fileList

            fileList.forEach((e, i) => {
                this.onOpenFile(e, i)
            })

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
            // 获取数据
            const excelBuffer = fs.readFileSync(path)

            // 解析数据
            var result = xlsx.read(excelBuffer, {
                type: 'buffer',
                cellHTML: false
            })

            // this.result = result
            const now = dayjs().unix()

            // 分析数据
            const _data = []
            result.SheetNames.forEach(key => {
                let json = xlsx.utils.sheet_to_json(result.Sheets[key])

                json = json.map(e => {
                    console.log(e)
                    let obj = {}
                    for (let k in this.columns) {
                        let v = this.columns[k]
                        if (v === '是否成功结算') {
                            let flag = (e[v] === '成功') * 1
                            obj[k] = flag
                            if (flag) {
                                this.importSuccessCount++
                            } else {
                                this.importErrorCount++
                            }
                        } else {
                            obj[k] = e[v]
                        }
                    }
                    this.onInsertDatas(obj, now)
                    return obj
                })

                // 插入数据库

                if (key === '成功' || key === '失败') {
                    // if (key === '成功') {
                    // } else if (key === '失败') {
                    //     // console.log({ json })
                    // }
                    _data.push(...json)
                }
                // console.log({ json })
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
            this.loading = false
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
                    this.insertSuccessCount++

                    // 更新acceptjs_count
                    const id = datas.user_number
                    const sql = `update accept set js_count=js_count+1 where action_no='${id}' or user_number='${id}'`
                    this.$db.run(sql, err => {
                        if (err) {
                            console.log(id, '更新js_count失败')
                            // 判断数据是否在副卡中
                            const sql2 = `select a1 from related_user where a2='${id}' or a3='${id}' or a4='${id}' or a5='${id}' or a6='${id}'`
                            this.$db.get(sql2, (err, res) => {
                                console.log(id, '查找副卡', res, err)

                                if (err) {
                                    // 不在副卡中就标记为未找到受理用户
                                    this.onNotFoundUserMember(datas)
                                } else {
                                    // 找到就更新结算条数, js_count
                                    const sql = `update accept set js_count=js_count+1, user_number='${id}' where action_no='${res.a1}'`
                                    console.log('添加绑定副卡', res, sql)
                                    this.$db.run(sql, err => {
                                        // console.log(err)
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
        }
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
