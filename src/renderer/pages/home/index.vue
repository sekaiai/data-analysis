<template>
    <div id="home" v-loading.lock="loading" :element-loading-text="`正在解析数据`">
        <div class="fetch-datas-box">
            <el-dialog title="登录" :visible.sync="loginVisible" width="380px">
                <div class="flex">
                    <el-input style="margin-right: 10px; flex:1" v-model="username" placeholder="请输入工号" />
                    <el-button @click="handleRequestCode" :loading="fetchCodeing === true">{{
                        fetchCodeing > 1 ? `已发送(${fetchCodeing})` : '获取验证码'
                    }}</el-button>
                </div>
                <div class="flex" style="margin-top: 16px; margin-bottom: 20px;">
                    <el-input v-model="vercode" placeholder="请输验证码" />
                </div>
                <div class="flex">
                    <el-button type="primary" @click="handleRequestLogin">登录</el-button>
                </div>
            </el-dialog>

            <el-dialog title="获取远程数据" :visible.sync="fetchBoxVisible" width="500px">
                <div class="flex">
                    <div class="flex-item">
                        <div class="title">工号</div>
                        <el-input v-model="member_id" placeholder="请输入工号" />
                    </div>
                    <div class="flex-item">
                        <div class="title">账期</div>
                        <el-date-picker v-model="fetchMonth" type="month" placeholder="选择月"> </el-date-picker>
                    </div>
                </div>
                <div class="flex" style="margin-top: 20px;">
                    <!-- <el-button @click="onParallelLimit(3)">获取数据</el-button> -->
                    <el-button @click="handleRequestDatasHelp">获取数据</el-button>
                </div>
            </el-dialog>
        </div>

        <div class="title-line">结算分析</div>
        <div class="form-line">
            <el-button type="primary" @click="submitUpload">导入结算清单</el-button>
            <el-button v-if="!isLogin" @click="loginVisible = true">登录</el-button>
            <el-button type="primary" :loading="fetchLoading" v-else="isLogin" @click="fetchBoxVisible = true">{{
                fetchLoading ? '正在采集数据' : '获取远程数据'
            }}</el-button>
        </div>
        <div class="title-line">导入结算表分析</div>

        <div class="logs" v-if="fetchLogs">
            <p v-for="(v, k) in fetchLogs" :key="k">{{ v }}</p>
            <p>采集到数据：{{ fetchDatas.length }}条</p>

            <template v-if="fetchDatas.length > 0">
                <div>{{ fetchLoading ? '正在采集数据中，采集完成后' : '采集完毕' }}可下载</div>
                <div v-if="!fetchLoading">
                    <el-button type="primary" @click="donwloadFetchDatas">下载excel</el-button>
                </div>
            </template>
        </div>

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
            >结算清单
        </p>
        <p>
            本月导入（成功）<span>{{ monthInsertSuccessCount }}</span>
            <el-button v-if="monthInsertSuccessCount" type="text" size="mini" @click="router2bill(`monthSuccess`)"
                >(查看)</el-button
            >结算清单
        </p>

        <p>
            本月导入（失败）<span>{{ monthInsertErrorCount }}</span>
            <el-button v-if="monthInsertErrorCount" type="text" size="mini" @click="router2bill(`monthError`)"
                >(查看)</el-button
            >结算清单
        </p>
        <p>
            本月结算（成功）<span>{{ monthOutSuccess }}</span>
            <el-button
                v-if="monthOutSuccess"
                :loading="outputLoading === 'monthOutSuccess'"
                type="text"
                size="mini"
                @click="handleAnalysisDownload('monthOutSuccess')"
                >(导出)</el-button
            >结算清单
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
            <el-button type="success" @click="handleUpdate" :loading="uploadloading">
                重新统计{{ uploadloading ? '中...' : '数据' }}
            </el-button>
            <el-button type="default" @click="onRouterList">查看历史数据</el-button>
            <el-button type="default" @click="handleClearData">删除所有数据(包括历史数据)</el-button>
        </div>
    </div>
</template>
<script>
import download from '@/utils/download.js'
import dayjs from 'dayjs'
import xlsx from 'xlsx'
import async from 'async'
const fs = require('fs')
// const { readFileSync } = fs

const request = require('request')
const rp = require('request-promise')
const tough = require('tough-cookie')
var Cookie = tough.Cookie
const cheerio = require('cheerio')

export default {
    name: 'bill',
    data() {
        return {
            fetchLoading: false, //是否采集中
            fetchLogs: [], //采集日志数据
            fetchDatas: [], //采集的数据
            fetchMonth: '', //账期
            branch_title: '', //网点名称
            member_id: 'WS5240', //工号
            username: 'D00094',
            fetchBoxVisible: false, //获取数据框
            vercode: '',
            isLogin: false, //是否登录成功
            cookies: [],
            token: '', //登录用的token
            loginVisible: false, //打开登录窗口
            fetchCodeing: false, //获取验证码 状态和时间

            uploadloading: false, //重新统计的加载按钮
            monthInsertSuccessCount: 0, //当月插入成功数
            monthOutSuccess: 0, //本月导入结算成功的清单数量
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
    watch: {
        loginVisible(v) {
            if (v) {
                this.handleRequestLoginInfo()
            }
        }
    },
    created() {
        let cookies = localStorage.getItem('cookies')
        if (cookies) {
            // this.cookies = new tough.Cookie(JSON.parse(cookies)[0])
            // localStorage.setItem('cookies', this.cookies)

            this.cookies = cookies
            this.isLogin = true
        }
        this.onFetchPackageDatas()
    },
    methods: {
        donwloadFetchDatas() {
            // 下载采集数据到本地。
        },
        onInsertFetchDatas(datas) {
            const now = dayjs().unix()
            datas.forEach(e => {
                // 受理日期： e[7]

                datas = {
                    date: e[10], //'账期',
                    order_id: e[1], //'订单号',
                    complete_date: e[8], //'订单竣工时间',
                    commission_policy: `${e[11]}-${e[12]}-${e[13]}`, //'佣金结算策略',
                    commission_type: e[6], //'佣金结算类型',
                    commission_money: e[5], //'佣金结算金额（元）',
                    package_name: e[3], //'发展套餐名',
                    // product_name: '产品类型',
                    // user_id: '用户ID',
                    user_number: e[2], // '用户号码',
                    status: 1, //'是否成功结算',
                    // cause: '原因',
                    branch: this.branch_title
                }

                // let keys = Object.keys(datas).join(',')
                // let values = Object.values(datas).join(`','`)
                // // 插入数据库
                // const sql = `insert into bill (${keys}) values ('${values}')`

                this.onInsertDatas(datas, now)
            })
        },
        async handleRequestDatasHelp() {
            this.fetchLoading = true
            await this.handleRequestDatas({ page: 1, type: 'broadBandSettledBillDetail' })
            await this.handleRequestDatas({ page: 1, type: 'broadBandUNSettledBillDetail' })
        },
        // broadBandSettledBillDetail: 已结算
        // broadBandUNSettledBillDetail: 未结算
        handleRequestDatas({ page, type }, callback) {
            // layui-laypage-last
            if (!this.member_id || !this.fetchMonth) {
                return this.$message({
                    message: '请填写账期和工号',
                    type: 'error'
                })
            }
            const type_text = type == 'broadBandSettledBillDetail' ? '已结算' : '未结算'

            const fetchMonth = dayjs(this.fetchMonth).format('YYYYMM')

            const url = `http://service.gz.189.cn/wtcommission/index.php/api/index/${type}/AgentPointCode/${this.member_id}/BillingCycleID/${fetchMonth}/PageNBR/${page}`

            // 未结算数据
            // const url2 = `http://service.gz.189.cn/wtcommission/index.php/api/index/broadBandUNSettledBillDetail/AgentPointCode/WS5240/BillingCycleID/202006/PageNBR/1`

            var cookiejar = rp.jar()
            cookiejar.setCookie(this.cookies, 'http://service.gz.189.cn')

            const options = {
                jar: cookiejar,
                method: 'GET',
                url,
                headers: {
                    'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8'
                }
            }
            if (page === 1) {
                this.fetchLogs.push(`开始采集工号${this.member_id}账期${fetchMonth}的数据`)
                this.fetchBoxVisible = false

                this.$notify({
                    title: '提示',
                    message: `开始采集${type_text}数据`,
                    type: 'warning'
                })
            }
            console.log(`${type_text}: 开始采集第${page}页数据`)
            this.fetchLogs.push(`${type_text}: 开始采集第${page}页数据`)

            rp(options)
                .then(async res => {
                    console.log(res)
                    var $ = cheerio.load(res)
                    let title = $('title').text()
                    if (title === '登陆' || title === '登录') {
                        this.isLogin = false
                        this.loginVisible = true
                        this.fetchBoxVisible = false
                        setTimeout(() => {
                            this.$message({
                                message: '登录信息过期了，请重新登录',
                                type: 'error'
                            })
                        }, 300)
                    } else {
                        var vals = Array.from($('table.cartable').find('tr'))
                            .map(tr => {
                                return Array.from($(tr).find('.car-text')).map(e => $(e).text())
                            })
                            .slice(2)

                        this.fetchLogs.push(`${type_text}: 第${page}页获取到${vals.length}条数据`)

                        if (page === 1) {
                            // 获取总页数
                            let last_page = $('.layui-laypage-last').attr('data-page')
                            this.fetchLogs.push(`${type_text}: 共有${last_page}页数据`)
                            // 获取网点名称
                            this.branch_title = $('.card-query > div')
                                .eq(2)
                                .find('.layui-input-inline')
                                .text()

                            // return vals
                            this.fetchDatas.push(...vals)
                            if (last_page > 1) {
                                let data = await this.onParallelLimit(last_page, type)
                                this.fetchDatas.push(...data)
                            }
                        } else {
                            callback(null, vals)
                        }
                        // 写入数据库
                        this.onInsertFetchDatas(vals)

                        // 1. 先获取页数。
                        // 2. 循环获取数据，记录获取成功和失败。
                    }
                })
                .catch(err => {
                    this.$notify.error({
                        title: '获取数据失败',
                        message: err.error
                    })
                })
        },

        onParallelLimit(page, type) {
            return new Promise(resolve => {
                let limit = 5
                let pages = Array(page - 1)
                    .fill()
                    .map((e, i) => ({ page: i + 2, type }))

                async.mapLimit(pages, limit, this.handleRequestDatas, (err, result) => {
                    let arr = []
                    result.forEach(e => arr.push(...e))
                    console.log(err, result)
                    resolve(arr)
                })
            })
        },
        // 获取验证码
        handleRequestCode() {
            var cookiejar = rp.jar()
            cookiejar.setCookie(this.cookies, 'http://service.gz.189.cn')

            if (this.fetchCodeing) return
            this.fetchCodeing = true

            const url = 'http://service.gz.189.cn/wtcommission/index.php/api/popedom/sendMes/default.shtml'
            const options = {
                jar: cookiejar,
                method: 'POST',
                url,
                headers: {
                    'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8'
                },
                json: true,
                form: {
                    username: this.username
                }
                // proxy: process.env.NODE_ENV === 'development' && 'http://127.0.0.1:1087'
            }
            rp(options)
                .then(res => {
                    this.fetchCodeing = 120
                    this.fetchCodeTimeout = setTimeout(() => {
                        this.fetchCodeing--
                        if (this.fetchCodeing < 1) {
                            this.fetchCodeing = false
                            clearTimeout(this.fetchCodeTimeout)
                        }
                    })
                    this.$message({
                        message: res.msg,
                        type: res.code === 1 ? 'success' : 'error'
                    })
                })
                .catch(err => {
                    this.$message({
                        message: err.msg || err.message || '189.cn拒绝访问',
                        type: 'error'
                    })
                })
        },
        // 获取登录信息，PHPSESSID
        handleRequestLoginInfo() {
            const url = 'http://service.gz.189.cn/wtcommission/index.php/api/popedom/login/default.shtml'
            const options = {
                method: 'GET',
                url,
                headers: {
                    'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8'
                },
                transform: function(body, res) {
                    let cookies
                    if (res.headers['set-cookie'] instanceof Array)
                        cookies = res.headers['set-cookie'].map(Cookie.parse)
                    else cookies = [Cookie.parse(res.headers['set-cookie'])]

                    cookies = cookies.filter(e => e.key === 'PHPSESSID')[0]
                    // let cookie = res.headers['set-cookie'].map(Cookie.parse)
                    return { body, cookies }
                }

                // proxy: process.env.NODE_ENV === 'development' && 'http://127.0.0.1:1087'
            }
            rp(options)
                .then(({ body, cookies }) => {
                    let $ = cheerio.load(body)
                    this.token = $('#input_token').val()
                    this.cookies = new tough.Cookie(cookies).toString()
                })
                .catch(err => {
                    console.log(err)
                })
        },
        // 登录
        handleRequestLogin() {
            if (!this.username || !this.vercode) {
                return this.$message({
                    message: '请填写用户名和验证码',
                    type: 'error'
                })
            }
            console.log({
                userName: this.username,
                password: '',
                token: this.token,
                username: this.username,
                VerCode: this.vercode
            })
            var cookiejar = rp.jar()
            cookiejar.setCookie(this.cookies, 'http://service.gz.189.cn')

            const url = 'http://service.gz.189.cn/wtcommission/index.php/api/popedom/isLogin/default.shtml'
            const options = {
                jar: cookiejar,
                method: 'POST',
                url,
                headers: {
                    'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8'
                },
                form: {
                    userName: this.username,
                    password: '',
                    token: this.token,
                    username: this.username,
                    VerCode: this.vercode
                }
            }
            rp(options)
                .then(body => {
                    console.log(body)
                    if (body) {
                        let $ = cheerio.load(body)
                        let title = $('h1').text()
                        let message = $('h2').text()
                        console.log(title, message)
                        if (title === '错误提示') {
                            this.$message({
                                message: `${title}: ${message}`,
                                type: 'error'
                            })
                            this.fetchCodeTimeout = 1
                            // 重新获取token和cookie
                            this.handleRequestLoginInfo()
                        }
                    }
                })
                .catch(err => {
                    console.log(err)
                    console.log(err.statusCode)
                    if (err.statusCode === 302) {
                        this.$message({
                            message: '登录成功',
                            type: 'success'
                        })
                        this.fetchBoxVisible = true
                        // 登录成功了
                        this.isLogin = true
                        this.loginVisible = false
                        // 把cookie从本地。免得刷新
                        localStorage.setItem('cookies', this.cookies)
                    }
                })
        },
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
            this.$confirm('该操作会根据现有的结算清单重新统计受理表的结算次数和副卡信息。', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    this.onUpdate()
                })
                .catch(() => {})
        },
        async onUpdate() {
            this.uploadloading = true
            // 更新所有数据
            const sql = `select user_number,count(user_number) as count from bill group by user_number`
            const bills = await new Promise(resolve => {
                this.$db.all(sql, (err, res = []) => {
                    this.$logger(err, res)
                    // let _sql = ``
                    resolve(res)
                })
            })
            for (var i = 0; i < bills.length; i++) {
                let item = bills[i]
                this.$logger({ item })
                // 1. 先查询受理清单是否存在
                let hasdata = await new Promise(resolve => {
                    const _sql = `select action_no from accept where action_no=${item.user_number}`

                    this.$db.get(_sql, (err, res) => {
                        this.$logger('111hasdata', res)
                        resolve(res)
                    })
                })
                this.$logger('222hasdata', hasdata)
                // 存在更新数据
                if (hasdata) {
                    let _sql = `update accept set js_count = ${item.count} where action_no = ${item.user_number}`
                    this.$db.run(_sql, (err, res) => {
                        this.$logger('update data', { res, err })
                    })
                } else {
                    // 从关联表查询

                    let _sql = `select a1 from related_user where a2='${item.user_number}' or a3='${item.user_number}' or a4='${item.user_number}' or a5='${item.user_number}' or a6='${item.user_number}'`
                    this.$db.get(_sql, (err, res) => {
                        this.$logger('related_user44444444', { err, res })
                        if (res) {
                            let _sql = `update accept set js_count=${item.count},user_number='${item.user_number}' where action_no = '${res.a1}'`
                            this.$db.run(_sql, (err, res) => {
                                this.$logger('update related_user', { err, res })
                            })
                        } else if (!err) {
                            // 没有找到受理清单
                            this.onNotFoundUserMember({ user_number: item.user_number })
                        }
                    })
                }
            }

            // 更新没有找到受理清单的数据
            this.handleUpdateNotFoundUserMember()

            // 更新完以后重新获取分析信息
            setTimeout(() => {
                this.uploadloading = false
                this.onFetchPackageDatas()
            }, 600)
        },
        handleUpdateNotFoundUserMember() {
            // 1.查询出所有没有找到的
            let sql = `select user_number from bill where not_found_user=1`
            this.$db.all(sql, (err, res) => {
                if (!err && res) {
                    res.forEach(e => {
                        this.$logger('res.forEach', e)
                        let v = e.user_number
                        let sql = `select a.action_no from accept a left join related_user r on r.a1=a.action_no where a.action_no='${v}' or a2='${v}' or a3='${v}' or a4='${v}' or a5='${v}' or a6='${v}'`
                        this.$db.get(sql, (err, res) => {
                            if (res && res.action_no) {
                                // 删除node_found_user
                                let upBill = `update bill set not_found_user = 0 where user_number = '${v}' `
                                this.$db.run(upBill, (err, res) => {
                                    this.$logger('onNotFoundUserMember', { err, res })
                                })
                                // 更新accept副卡信息
                                if (res.action_no != v) {
                                    let upAcc = `update accept set user_number='${v}' where action_no='${res.action_no}'`
                                    this.$db.run(upBill, (err, res) => {
                                        this.$logger('onNotFoundUserMember update accept', { err, res })
                                    })
                                }
                            }
                        })
                    })
                }
            })
        },
        onRouterList() {
            this.$router.push('/bill/list')
        },
        handleClearData() {
            this.$confirm(`这个会删除本地所有已保存的清单列表。`, '提示', {
                confirmButtonText: '删除',
                cancelButtonText: '不删除',
                type: 'info '
            }).then(() => {
                // 清空数据库
                this.$db.run(`delete from bill where id > 0`, (err, res) => {
                    this.$logger({ err, res })
                })
            })
        },

        // 获取本月待计算受理数
        onFetchPackageDatas() {
            this.accept_count = 0
            this.accept_length = 0
            const sql = 'select * from package'
            this.$db.all(sql, (err, res) => {
                this.$logger(err, res)
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
                if (res) this.monthInsertSuccessCount = res.count
            })

            this.$db.get(`${month_sql} and status=0`, (err, res = []) => {
                if (res) this.monthInsertErrorCount = res.count
            })
            // 获取没有找到对于业务号码的结算数据
            this.$db.get(`select count(*) as count from bill where not_found_user=1`, (err, res = []) => {
                console.log('notfound', { err, res })
                if (res) this.notFoundUserCount = res.count
            })
            // 获取本月结算成公的。
            let oq = `select count(b.id) as count from bill b left join accept a on (a.user_number=b.user_number or a.action_no=b.user_number) where a.action_no is not null and b.created between ${this.firstDay} and ${this.lastDay}`
            this.$db.get(oq, (err, res) => {
                console.log({ res, err })
                if (res) this.monthOutSuccess = res.count
            })
        },

        // 获取本月待计算受理数
        async onFetchSettle(vals) {
            // 1. 先通过套餐获取对应的受理清单（结算次数）
            // 2. 循环所有，判断月份
            let accept_arr = []
            for (var i = vals.length - 1; i >= 0; i--) {
                let { name, count } = vals[i]
                // this.$logger(name, count)
                // a.date_end,a.js_count
                const sql = `select a.* from accept as a where a.js_count < ${count} and product_main='${name}'`
                const data = await new Promise(resolve => {
                    this.$db.all(sql, (err, res = []) => {
                        if (!err) {
                            // this.$logger({ vals }, i)
                            resolve(res)
                            // this.$logger(day, now, law, count)
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
            this.$logger({ accept_arr })
            return accept_arr
        },
        async onCalcCountColums(item, vals) {
            // 统计本月需要计算的数量
            // this.$logger({ item })
            let accept_count_arr = []
            let { name, count, law, id } = item

            const now = dayjs().format('YYYYMM')

            // 组装每月结算间隔
            law = law.toString().split(',')
            law.length = count
            law = Array.from(law).map(e => e | 0 || 1)
            this.$logger({ law })
            let result = 0 //总结算次数
            let __nums = 0 //总结算清单数

            // count 导出有月份的清单
            let __flag = this.outputLoading === 'accept_count'
            // 重置一下
            this.$logger({ vals })
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
                        // this.$logger('找出结算成功的数据 __count', __count)
                        if (__count.length) {
                            // 找出结算成功的数据
                            let sql = `select date from bill where user_number='${e.action_no}' and status=1`

                            const qd = await new Promise(resolve => {
                                this.$db.all(sql, (err, res) => {
                                    // this.$logger('找出结算成功的数据', sql, res)

                                    if (!err) {
                                        // this.$logger({ vals }, i)
                                        resolve(res.map(e => e.date * 1))
                                        // this.$logger(day, now, law, count)
                                    } else {
                                        resolve([])
                                    }
                                })
                            })
                            // 筛选出已存在的
                            __count = __count.filter(e => !qd.includes(e * 1))

                            // this.$logger('找出结算成功的数据', qd, __count)
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
                this.$logger(err)
            }

            return accept_count_arr
        },
        onCalcCount(item, vals) {
            // 统计本月需要计算的数量
            // this.$logger({ item })
            let { name, count, law, id } = item

            const now = dayjs().format('YYYYMM')

            // 组装每月结算间隔
            law = law.toString().split(',')
            law.length = count
            law = Array.from(law).map(e => e | 0 || 1)
            this.$logger({ law })
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
            this.$logger({ result, len: vals.length, idx })
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
            this.$logger({ flag })
            try {
                let accept_count_arr = []
                if (this.package.length) {
                    this.outputLoading = flag
                    accept_count_arr = await this.onFetchSettle(this.package)
                } else {
                    return
                }
                this.$logger({ accept_count_arr })

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
            this.outputLoading = type
            this.$logger('handleAnalysisDownload', type)

            let json = {
                ...this.columns
            }

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
                    this.$db.all(sql, (err, res) => {
                        this.$logger('onNotFoundUserMember', { err, res })
                        resolve(res || [])
                    })
                })
            } else if (type === 'monthOutSuccess') {
                title = `[${dayjs().format('YYYYMM')}导入结算清单，结算成功]`

                const sql = `select b.*,a.acceptor,a.user from bill b left join accept a on (a.user_number=b.user_number or a.action_no=b.user_number) where a.acceptor is not null and b.created between ${this.firstDay} and ${this.lastDay} group by b.id`

                datas = await new Promise(resolve => {
                    this.$db.all(sql, (err, res) => {
                        this.$logger('导入结算清单，结算成功', { err, res })
                        resolve(res || [])
                    })
                })
            }
            // return false

            if (datas.length < 1) {
                this.outputLoading = ''
                return this.$message({
                    showClose: true,
                    message: '当前分类下面没有数据哦',
                    type: 'warning'
                })
            }
            if (type !== 'monthOutSuccess') {
                json.error = '失败原因'
            } else {
                json = { ...json, acceptor: '受理人', user: '揽收人' }
            }

            datas = this.parseAoaData(datas, json)

            // 下载
            const name = `[${title}]`
            const book_name = 'book_name'
            this.$logger(datas)

            this.onDownload(datas, name)
        },
        onDownload(datas, name, book_name = 'book_name', excelType = 'aoa') {
            download
                .excel2(datas, name, book_name, excelType)
                .then(res => {
                    this.outputLoading = ''
                    this.$logger(res)
                    this.$message({
                        showClose: true,
                        message: `数据表格创建${!res ? '成功' : '失败'}`,
                        type: !res ? 'success' : 'error'
                    })
                })
                .catch(err => {
                    this.outputLoading = ''
                    this.$logger(err)
                })
        },
        parseAoaData(datas, json = '') {
            // json转成execl需要的数组

            const line1 = Object.values(json || this.notfoundItems)
            const keys = Object.keys(json || this.notfoundItems)
            // this.$logger(line1, keys)
            // this.$logger(datas)
            datas = datas.map(v => {
                return keys.map(k => {
                    this.$logger({ k })
                    if (k === 'error') {
                        if (/UNIQUE/i.test(v[k])) {
                            return '数据已存在'
                        }
                    }
                    return v[k]
                })
            })
            datas.unshift(line1)
            // this.$logger(datas)
            return datas
        },
        parseJsonData() {
            // json转数据
        },
        onChange(e) {
            // 文件发生变化
            this.$logger('onChange', e)
        },
        async submitUpload() {
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

            for (var i = 0; i < fileList.length; i++) {
                await this.onOpenFile(fileList[i], i)
            }
            // fileList.forEach((e, i) => {
            //     this.onOpenFile(e, i)
            // })
            this.loading = false

            // this.onOpenFile(input.files)
        },
        onParseSuccess(key) {
            let arr = []
            const json = xlsx.utils.sheet_to_json(this.result.Sheets[key])

            if (key === '成功') {
                this.success = json
            } else {
                this.errors = json
                this.$logger({ json })
            }
        },
        async onOpenFile(path, i) {
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
            const fun = []
            result.SheetNames.forEach(key => {
                let json = xlsx.utils.sheet_to_json(result.Sheets[key])

                json = json.map(e => {
                    this.$logger(e)
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
                    fun.push(this.onInsertDatas(obj, now))
                    return obj
                })

                // 插入数据库

                if (key === '成功' || key === '失败') {
                    // if (key === '成功') {
                    // } else if (key === '失败') {
                    //     // this.$logger({ json })
                    // }
                    _data.push(...json)
                }
                // this.$logger({ json })
            })

            var promiseData = await Promise.all(fun)
            this.$logger('Promise', promiseData)

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
            return new Promise(resolve => {
                datas.created = now
                let keys = Object.keys(datas).join(',')
                let values = Object.values(datas).join(`','`)
                // 插入数据库
                const sql = `insert into bill (${keys}) values ('${values}')`
                // this.$logger(sql)
                this.$db.run(sql, err => {
                    if (err) {
                        this.$logger(err)
                        datas.error = err.toString()
                        this.insertError.push(datas)
                    } else {
                        this.insertSuccessCount++

                        // 更新acceptjs_count
                        const id = datas.user_number
                        const sql = `update accept set js_count=js_count+1 where action_no='${id}' or user_number='${id}'`
                        this.$db.run(sql, err => {
                            if (err) {
                                this.$logger(id, '更新js_count失败')
                                // 判断数据是否在副卡中
                                const sql2 = `select a1 from related_user where a2='${id}' or a3='${id}' or a4='${id}' or a5='${id}' or a6='${id}'`
                                this.$db.get(sql2, (err, res) => {
                                    this.$logger(id, '查找副卡', res, err)

                                    if (err) {
                                        // 不在副卡中就标记为未找到受理用户
                                        this.onNotFoundUserMember(datas)
                                    } else {
                                        // 找到就更新结算条数, js_count
                                        const sql = `update accept set js_count=js_count+1, user_number='${id}' where action_no='${res.a1}'`
                                        this.$logger('添加绑定副卡', res, sql)
                                        this.$db.run(sql, err => {
                                            // this.$logger(err)
                                            if (err) {
                                                this.onNotFoundUserMember(datas)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                    resolve(err)
                })
            })
        },
        onNotFoundUserMember(datas) {
            // this.notFoundUserMember.push(datas)
            const sql = `update bill set not_found_user = 1 where user_number = '${datas.user_number}' `
            this.$db.run(sql, (err, res) => {
                this.$logger('onNotFoundUserMember', { err, res })
            })
        },
        handleParseLose() {
            let user = this.datas.map(e => e['user_number']).join(`','`)
            user = `'${user}'`
            this.$logger({ user })
            // 1.获取所有数据，然后再从user中未找到accept中不存在的数据

            // 查询未找到的数据
            const sql = `select * from accept where action_no  in (${user})`
            this.$db.all(sql, (err, res) => {
                this.$logger({ err })
                this.$logger(res)

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
            this.$logger(e)
            // 数据分析tab点击事件
        },
        handleMonthAccept() {
            // 本月已结算的
            // 1. 查询所有本月结算清单关联结算表
            // const month_sql = `select *  from(select b.*,a.acceptor,a.user from bill b left join accept a on a.action_no=b.user_number where b.date=202006 union select b.*,a.acceptor,a.user from bill b left join accept a on a.user_number=b.user_number where b.date=202006 ) where created between ${this.firstDay} and ${this.lastDay} group by id`
            const s = `select b.*,a.acceptor,a.user from bill b left join accept a on (a.user_number=b.user_number or a.action_no=b.user_number) where a.action_no is not null and b.created between ${this.firstDay} and ${this.lastDay} group by b.id`
            this.$db.all(s, (err, res) => {
                console.log(err, res)
            })
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
