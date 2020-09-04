<template>
    <div id="home" v-loading.lock="loading" :element-loading-text="`正在解析数据`">
        <!-- 受理清单 start-->
        <!--         <div @click="fetchLastId('jifen')">fetchLastId</div>
        <div @click="updateZhangqiJifenState('3521')">updateZhangqiJifenState</div>
        <div @click="fetchSlListsAll">fetchSlListsAll</div>
 -->
        <!-- <div @click="fetchSlListsAll">fetchSlListsAll</div> -->
        <!-- {{ formatDay(1597929875) }} -->
        <div>
            <div class="title-line">
                受理清单
                <!-- onResetAllZhagnqi -->
                <el-popconfirm title="不建议使用。 如果数据出错，可以执行这个。" @onConfirm="updateAllData">
                    <el-button :loading="allLoading" type="text" size="mini" slot="reference">重新统计</el-button>
                </el-popconfirm>
            </div>
            <!-- 添加一个总结 -->
            <el-table :data="slLists" border style="width: 100%;" max-height="280">
                <el-table-column prop="date" label="账期"> </el-table-column>
                <!--                 <el-table-column prop="ap" label="受理清单数量"> </el-table-column>
                <el-table-column prop="tc" label="套餐数量"> </el-table-column>
                <el-table-column prop="tc_none" label="未绑定套餐"> </el-table-column>
                <el-table-column prop="zq_count" label="需结算账期"> </el-table-column>
                <el-table-column prop="zq_suss" label="已结算(成功)"> </el-table-column>
                <el-table-column prop="zq_fail" label="已结算(失败)"> </el-table-column>
                <el-table-column prop="zq_none" label="未结算"> </el-table-column>
 -->
                <el-table-column label="总计">
                    <el-table-column label="总清单" width="80">
                        <template slot-scope="scope"> {{ scope.row.count ? scope.row.count + '条' : '-' }}</template>
                    </el-table-column>
                    <el-table-column label="结算成功" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.success ? scope.row.success + '条' : '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="结算失败" width="80">
                        <template slot-scope="scope">{{ scope.row.fail ? scope.row.fail + '条' : '-' }}</template>
                    </el-table-column>
                    <el-table-column label="未结算" width="80">
                        <template slot-scope="scope">{{ scope.row.none ? scope.row.none + '条' : '-' }}</template>
                    </el-table-column>
                </el-table-column>

                <el-table-column label="结算清单">
                    <el-table-column prop="js_count" label="总计" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.js_count ? scope.row.js_count + '条' : '-' }}</template
                        >
                    </el-table-column>
                    <el-table-column prop="js_success" label="成功" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.js_success ? scope.row.js_success + '条' : '-' }}</template
                        >
                    </el-table-column>
                    <el-table-column prop="js_fail" label="失败" width="80">
                        <template slot-scope="scope">{{ scope.row.js_fail ? scope.row.js_fail + '条' : '-' }}</template>
                    </el-table-column>
                    <el-table-column prop="js_none" label="未结算" width="80">
                        <template slot-scope="scope">{{ scope.row.js_none ? scope.row.js_none + '条' : '-' }}</template>
                    </el-table-column>
                </el-table-column>

                <el-table-column label="积分清单">
                    <el-table-column prop="jf_count" label="总计" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.jf_count ? scope.row.jf_count + '条' : '-' }}</template
                        >
                    </el-table-column>
                    <el-table-column prop="jf_success" label="成功" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.jf_success ? scope.row.jf_success + '条' : '-' }}</template
                        >
                    </el-table-column>
                    <el-table-column prop="jf_fail" label="失败" width="80">
                        <template slot-scope="scope">{{ scope.row.jf_fail ? scope.row.jf_fail + '条' : '-' }}</template>
                    </el-table-column>
                    <el-table-column prop="jf_none" label="未结算" width="80">
                        <template slot-scope="scope">{{ scope.row.jf_none ? scope.row.jf_none + '条' : '-' }}</template>
                    </el-table-column>
                </el-table-column>

                <el-table-column label="改速率">
                    <el-table-column prop="gs_count" label="总计" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.gs_count ? scope.row.gs_count + '条' : '-' }}</template
                        >
                    </el-table-column>
                    <el-table-column prop="gs_success" label="成功" width="80">
                        <template slot-scope="scope">
                            {{ scope.row.gs_success ? scope.row.gs_success + '条' : '-' }}</template
                        >
                    </el-table-column>
                    <el-table-column prop="gs_fail" label="失败" width="80">
                        <template slot-scope="scope">{{ scope.row.gs_fail ? scope.row.gs_fail + '条' : '-' }}</template>
                    </el-table-column>
                    <el-table-column prop="gs_none" label="未结算" width="80">
                        <template slot-scope="scope">{{ scope.row.gs_none ? scope.row.gs_none + '条' : '-' }}</template>
                    </el-table-column>
                </el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" :loading="downSlListLoading" @click="downloadSlList(scope.row.date)"
                            >下载</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 受理清单 end-->

        <!-- 结算清单 start-->
        <div>
            <div class="title-line">
                结算清单
                <el-button type="text" size="mini" @click="onRouterList('js')">查看全部</el-button>
            </div>

            <el-table :data="jsLists" border style="width: 100% ;" max-height="280">
                <el-table-column prop="date" label="账期" width="180"> </el-table-column>
                <el-table-column prop="count" label="共有">
                    <template slot-scope="scope"> {{ (scope.row.success | 0) + (scope.row.fail | 0) }}条 </template>
                </el-table-column>
                <el-table-column prop="success" label="结算成功">
                    <template slot-scope="scope"> {{ scope.row.success || 0 }}条 </template>
                </el-table-column>
                <el-table-column prop="success" label="结算成功(金额)">
                    <template slot-scope="scope"> ≈{{ scope.row.success_money || 0 }}元 </template>
                </el-table-column>
                <el-table-column prop="fail" label="结算失败">
                    <template slot-scope="scope"> {{ scope.row.fail || 0 }}条 </template>
                </el-table-column>
                <el-table-column prop="fail" label="结算失败(金额)">
                    <template slot-scope="scope"> ≈{{ scope.row.fail_money || 0 }}元 </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" @click="onRouterList('js', scope.row.date)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 结算清单 end-->

        <!-- 积分清单 start-->

        <div>
            <div class="title-line">
                <router-link to="/bill/jifen">积分清单</router-link>
                <!-- <el-button type="text" size="mini" @click="onRouterList('jf')">查看全部</el-button> -->
            </div>

            <el-table :data="jfLists" border style="width: 100%" max-height="280">
                <el-table-column prop="date" label="账期" width="180"> </el-table-column>
                <el-table-column prop="count" label="结算">
                    <template slot-scope="scope"> {{ scope.row.count }}条 </template>
                </el-table-column>
                <el-table-column prop="ydjf" label="总积分"> </el-table-column>
                <el-table-column prop="qs" label="清算积分"> </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" @click="onRouterList('jf', scope.row.date)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 积分清单 end-->

        <!-- 采集dialog start -->
        <div class="fetch-datas-box">
            <el-dialog :close-on-click-modal="false" title="登录" :visible.sync="loginVisible" width="380px">
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
                    <!--  <div class="flex-item">
                        <div class="title">工号</div>
                        <el-input v-model="member_id" placeholder="请输入工号" />
                    </div> -->
                    <div class="flex-item">
                        <div class="title">账期</div>
                        <el-date-picker v-model="fetchMonth" type="month" placeholder="选择月"> </el-date-picker>
                    </div>
                </div>
                <div class="flex" style="margin-top: 20px;">
                    <!-- <el-button @click="onParallelLimit(3)">获取数据</el-button> -->
                    <el-button @click="fetchWangdian">获取数据</el-button>
                </div>
            </el-dialog>
        </div>
        <!-- 采集dialog end -->

        <div class="title-line">结算分析</div>
        <div class="form-line">
            <el-button type="primary" @click="importJsLists" :loading="importJsLoading">导入结算清单</el-button>
            <el-button v-if="!isLogin" @click="loginVisible = true">登录</el-button>
            <el-button type="primary" :loading="fetchLoading" v-else="isLogin" @click="fetchBoxVisible = true">{{
                fetchLoading ? '正在采集数据' : '获取远程数据'
            }}</el-button>

            <el-button @click="uploadJifen" :loading="loadingJifen">导入积分清单</el-button>
        </div>

        <div class="title-line">导入结算表分析</div>

        <div class="logs">
            <div class="flex">
                <template v-if="!fetchLoading && fetchDatas.length > 0 && !ee.length">
                    <el-button type="danger" size="small" @click="onInsertFetchDatas">保存到数据库</el-button>
                    <el-button type="primary" size="small" @click="donwloadFetchDatas">下载excel</el-button>
                </template>

                <el-button type="default" size="small" @click="visibleErrorLogs = true">查看采集失败记录</el-button>

                <el-button type="default" size="small" @click="visibleSuccessLogs = true">查看采集成功记录</el-button>
            </div>

            <div>
                <p v-if="ee.length">
                    <b>有{{ ee.length }}页数据采集失败</b>
                    <el-button type="text" @click="fetchWangdianDatasHelp(ee)">采集失败数据</el-button>
                </p>
            </div>

            <el-dialog title="采集成功记录" :visible.sync="visibleSuccessLogs" max-height="550">
                <el-table :data="ss2">
                    <el-table-column property="k" label="网点" width="100"></el-table-column>
                    <el-table-column property="未结算" label="未结算" width="200"></el-table-column>
                    <el-table-column property="已结算" label="已结算"></el-table-column>
                </el-table>
            </el-dialog>
            <el-dialog title="采集失败记录" :visible.sync="visibleErrorLogs" max-height="550">
                <el-table :data="ee">
                    <el-table-column property="member_id" label="网点" width="100"></el-table-column>
                    <el-table-column property="type" label="类型" width="200">
                        <template slot-scope="scope">
                            {{ scope.row.type === 'broadBandUNSettledBillDetail' ? '未结算' : '已结算' }}
                        </template>
                    </el-table-column>
                    <el-table-column property="page" label="页数"></el-table-column>
                </el-table>
            </el-dialog>

            <p>采集到数据：{{ fetchDatas.length }}条</p>
        </div>

        <p>共导入{{ tableNum.length }}张表</p>
        <p>结算成功：{{ importSuccessCount }}</p>
        <p>结算数据：{{ importErrorCount }}</p>
        <p>共有数据：{{ datas.length }}</p>
        <p>写入积分清单：{{ insertJifenCount }}条</p>
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
import { v4 as uuidv4 } from 'uuid'

import {
    updateZhangqiJifenState,
    updateZhangqi,
    getAllTaocan,
    runSql2Arr,
    computedZhangqiState2,
    updateAllData,
    sqlAll
} from '@/utils/zhangqi'

export default {
    name: 'bill',
    data() {
        return {
            slqdlist: [],
            downSlListLoading: false, //
            importJsLoading: false, //导入清单
            allLoading: false,
            slLists: [], // 受理清单lists
            jsLists: [],
            jfLists: [],
            ss: {},
            ss2: [],
            ee: [],
            visibleSuccessLogs: false,
            visibleErrorLogs: false,
            lostLogs: [],
            wangdian: [], //所有网点
            fetchLoading: false, //是否采集中
            fetchLogs: [], //采集日志数据
            fetchLogs2: {}, //采集日志数据
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
                remark: '备注'
            },
            columns: {
                pgk_id: 'pgk_id',
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
            },
            loadingJifen: false,
            insertJifenCount: 0,
            insertJFError: [],
            jifenColumns: {
                pgk_id: 'pgk_id',
                date: '账期',
                local: '本地网',
                company: '县公司',
                jf_type: '积分类型',
                jf_name: '积分规则名称',
                event_name: '活动名称',
                xs_id: '销售人员工号',
                xs_name: '销售人员',
                md_id: '门店工号',
                md_code: '门店编码',
                md_name: '门店名称',
                cp_type: '产品名称',
                user_id: '用户ID',
                user_number: '用户号码',
                xs_instance_id: '销售品实例ID',
                package_name: '入网套餐',
                rw_date: '入网时间',
                hyjh: '合约计划',
                jf_jiesuan: '结算积分',
                bqdh: '本期兑换',
                qs: '清算',
                ydjf: '应兑换积分'
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
        // let data = JSON.parse(localStorage.getItem('localdata'))
        // if (data) {
        //     this.fetchDatas = data
        // }

        // 获取结算清单数据
        this.onInit()
    },
    methods: {
        async updateAllData() {
            this.allLoading = true
            await updateAllData()
            this.onInit()

            this.allLoading = false
        },
        formatDay(date) {
            return dayjs.unix(date).format('YYYY-MM-DD HH:mm:ss')
        },
        onInit() {
            console.log('onInit')
            this.fetchJsLists()
            this.fetchJfLists()
            this.fetchSlLists()
        },
        // 重新统计所有数据
        onResetAllZhagnqi() {
            // 1.查询出所有套餐
            this.allLoading = true

            /*this.$db.run(`delete from zhangqi`, (err, res) => {
                const sql = `select id from pgk `

                this.$db.all(sql, async (err, res = []) => {
                    for (var i = 0; i < res.length; i++) {
                        let v = res[i]
                        console.log('onResetAllZhagnqi', v)
                        const x = await updateZhangqi(v.id)
                    }
                    this.allLoading = false
                    this.onInit()
                })
            })*/

            // 2. 更新账期 computedZhangqiState
        },
        async downloadSlList(date) {
            this.downSlListLoading = true
            let zq_where = true
            let bi_where = true
            let ji_where = true
            if (date !== '总计') {
                zq_where = `zq.date=${date}`
                bi_where = `b.date=${date}`
                ji_where = `j.date=${date}`
            }

            let sql = [
                `select zq.date,zq.type as zq_type,zq.state as zq_state,a.* from zhangqi zq left join accept a on zq.list_id=a.uuid where ${zq_where}`,
                `select b.*,zq.state,zq.type as zq_type from bill b left join zhangqi zq on b.id=zq.qd_id where ${bi_where}`,
                `select j.*,zq.type as zq_type, zq.state as zq_state from jifen j left join zhangqi zq on zq.qd_id=j.id where ${ji_where}`
            ]
            console.log(sql)
            this.$db.serialize(() => {
                this.$db.run('BEGIN TRANSACTION;')

                sql = sql.map(e => {
                    return new Promise(resolve => {
                        this.$db.all(e, (err, res = []) => {
                            resolve(res)
                        })
                    })
                })

                Promise.all(sql).then(([zhangqi, js_list, jf_list]) => {
                    this.$db.run('COMMIT TRANSACTION;')
                    console.log('数据请求完成', Date.now(), zhangqi.length, js_list.length, jf_list.length, js_list)
                    // 组装数据
                    zhangqi = this.formatAllDatas(zhangqi)
                    js_list = this.formatJsList(js_list)
                    jf_list = this.formatJFList(jf_list)
                    this.onDownload([...zhangqi, ...js_list, ...jf_list], `${date}受理清单结算信息`)

                    this.downSlListLoading = false
                })
            })
        },
        async downloadSlList2(date) {
            // 下载受理清单
            this.downSlListLoading = true

            let where = `${date === '总计' ? true : 'zq.date=' + date}`

            let sql = [
                // 账期受理清单
                `select zq.type as zq_type,zq.list_id, zq.state as zq_state,a.* from zhangqi zq left join accept a on zq.list_id=a.uuid where ${where}`,

                // 结算清单
                `select zq.type as zq_type, zq.state as zq_state,a.*,b.date as b_date,b.branch as b_branch,b.commission_money as b_money,b.order_id as b_order_id,b.user_number as b_user_member from zhangqi zq left join accept a on zq.list_id=a.uuid left join bill b on b.id = zq.qd_id where ${where} and zq.type=1`,
                `select zq.type as zq_type, zq.state as zq_state,a.*,b.date as b_date,b.branch as b_branch,b.commission_money as b_money,b.order_id as b_order_id,b.user_number as b_user_member from zhangqi zq left join accept a on zq.list_id=a.uuid left join bill b on b.id = zq.qd_id where ${where} and zq.type=3`,
                // 积分清单
                `select zq.type as zq_type, zq.state as zq_state,zq.date as zq_date,a.*,j.* from zhangqi zq left join accept a on zq.list_id=a.uuid left join jifen j on j.id = zq.qd_id where ${where} and zq.type=2`
            ]
            console.log(sql)

            this.$db.serialize(() => {
                this.$db.run('BEGIN TRANSACTION;')

                sql = sql.map(e => {
                    return new Promise(resolve => {
                        this.$db.all(e, (err, res = []) => {
                            resolve(res)
                        })
                    })
                })

                Promise.all(sql).then(([all, js_list, gs_list, jf_list]) => {
                    this.$db.run('COMMIT TRANSACTION;')
                    console.log('数据请求完成', Date.now())
                    // 组装数据
                    all = this.formatAllDatas(all)
                    js_list = this.formatJsList(js_list)
                    jf_list = this.formatJFList(jf_list)
                    gs_list = this.formatJsList(gs_list, '改速率')

                    // 下载
                    this.onDownload([all, ...js_list, ...jf_list, ...gs_list], `${date}受理清单结算信息`)
                    this.downSlListLoading = false
                })
            })
            /*            // 账期受理清单
            sql = sql.map(e => {
                return new Promise(resolve => {
                    this.$db.all(e, (err, res = []) => {
                        resolve(res)
                    })
                })
            })

            Promise.all(sql).then(([all, js_list, gs_list, jf_list]) => {
                console.log('数据请求完成')
 
            })*/
        },
        formatJFList(jf_list) {
            let suss = [],
                none = [],
                fail = []

            let json = {
                ...this.jifenColumns
            }

            jf_list.forEach(e => {
                e.date_end = dayjs.unix(e.date_end).format('YYYY-MM-DD')
                e.created = dayjs.unix(e.created).format('YYYY-MM-DD')

                if (e.zq_state == 1) {
                    suss.push(e)
                } else if (e.zq_state == -1) {
                    fail.push(e)
                } else {
                    none.push(e)
                }
            })

            suss = this.parseAoaData(suss, json)
            none = this.parseAoaData(none, json)
            fail = this.parseAoaData(fail, json)
            return [
                { datas: suss, bookName: '积分结算(成功)' },
                { datas: fail, bookName: '积分结算(失败)' },
                { datas: none, bookName: '积分结算(未结算)' }
            ]
        },
        // 导出结算清单
        formatJsList(js_list = []) {
            let suss = [],
                fail = [],
                none = [],
                all = []

            let json = {
                zq_type: '结算类型',
                ...this.columns
            }

            js_list.forEach(e => {
                // e.date_end = dayjs.unix(e.date_end).format('YYYY-MM-DD')
                // e.created = dayjs.unix(e.created).format('YYYY-MM-DD')
                // e.import_date = dayjs.unix(e.import_date).format('YYYY-MM-DD')
                e.status = e.status == 1 ? '结算成功' : '结算失败'
                e.zq_type = e.zq_type == 1 ? '结算清单' : '改速率'
                // e.state = e.zq_state == -1 ? '结算失败' : e.zq_state == 1 ? '结算成功' : '没有结算信息'
                if (e.state == 1) {
                    suss.push(e)
                } else if (e.zq_state == -1) {
                    fail.push(e)
                }
                if (e.flag != 1) {
                    none.push(e)
                }

                all.push(e)
            })
            all = this.parseAoaData(all, json)
            suss = this.parseAoaData(suss, json)
            fail = this.parseAoaData(fail, json)
            none = this.parseAoaData(none, json)
            return [
                { datas: all, bookName: `全部结算清单` },
                { datas: suss, bookName: `清单(成功)` },
                { datas: fail, bookName: `清单(失败)` },
                { datas: none, bookName: `清单(未结算)` }
            ]
        },
        formatAllDatas(all) {
            // 账期 门店工号 门店名称 销售人员 用户ID 套餐名称 业务动作 业务号码 结算号码 揽收人
            let json = {
                date: '账期',
                type: '账期类型',
                stat: '状态',
                action_r: '副卡信息',
                ...this.notfoundItems
                // zq_type: '结算类型', // 1:结算清单 2.积分清单
                // zq_state: '结算状态' //0:没有结算清单,1:结算成功, -1:结算失败
            }

            let jf = []
            let jf_suss = []
            let jf_fail = []
            let jf_none = []

            let js = []
            let js_suss = []
            let js_fail = []
            let js_none = []

            let result = []

            all.forEach(e => {
                // e.zq_type = e.zq_type == 2 ? '积分结算' : '结算清单'
                // e.zq_state = e.zq_state == -1 ? '结算失败' : e.zq_state == 1 ? '结算成功' : '没有结算信息'
                e.created = dayjs.unix(e.created).format('YYYY-MM-DD HH:mm:ss')
                e.date_end = dayjs.unix(e.date_end).format('YYYY-MM-DD HH:mm:ss')

                if (e.zq_type == 2) {
                    e.type = '积分清单'
                    jf.push(e)
                    if (e.zq_state == -1) {
                        e.stat = '结算失败'
                        jf_fail.push(e)
                    } else if (e.zq_state == 1) {
                        e.stat = '结算成功'
                        jf_suss.push(e)
                    } else {
                        e.stat = '未结算'
                        jf_none.push(e)
                    }
                } else {
                    e.type = '结算清单'
                    js.push(e)
                    if (e.zq_state == -1) {
                        e.stat = '结算失败'
                        js_fail.push(e)
                    } else if (e.zq_state == 1) {
                        e.stat = '结算成功'
                        js_suss.push(e)
                    } else {
                        e.stat = '未结算'
                        js_none.push(e)
                    }
                }
            })

            jf = {
                datas: this.parseAoaData(jf, json),
                bookName: '全部积分账期'
            }

            jf_suss = {
                datas: this.parseAoaData(jf_suss, json),
                bookName: '积分（成功）'
            }
            jf_fail = {
                datas: this.parseAoaData(jf_fail, json),
                bookName: '积分（失败）'
            }
            jf_none = {
                datas: this.parseAoaData(jf_none, json),
                bookName: '积分（未结算）'
            }

            js = {
                datas: this.parseAoaData(js, json),
                bookName: '全部结算账期'
            }
            js_suss = {
                datas: this.parseAoaData(js_suss, json),
                bookName: '结算（成功）'
            }
            js_fail = {
                datas: this.parseAoaData(js_fail, json),
                bookName: '结算（失败）'
            }
            js_none = {
                datas: this.parseAoaData(js_none, json),
                bookName: '结算（未结算）'
            }

            return [js, js_suss, js_fail, js_none, jf, jf_suss, jf_fail, jf_none]
        },
        fetchSlListsAll() {
            // 查找所有未结算的
            const max = dayjs().format('YYYYMM')

            return new Promise(resolve => {
                const sql = [0, 1, -1]
                    .map(e => {
                        return [1, 2, 3]
                            .map(e2 => {
                                return `select count(*) as count,state,type from zhangqi where state=${e} and type=${e2} and date < ${max} group by state,type`
                            })
                            .join(' union all ')
                    })
                    .join(' union all ')

                this.$db.all(sql, (err, res) => {
                    // arr[e.date].count = success + none + fail + jf_success + jf_fail
                    // arr[e.date].count_fail = none + jf_fail
                    // arr[e.date].count_succ = success + fail + jf_success

                    let data = {
                        date: '总计', //账期
                        count: 0, //总需要结算
                        none: 0, //总：未结算
                        success: 0, //总：结算成功
                        fail: 0, //总：结算失败

                        js_fail: 0,
                        js_none: 0,
                        js_success: 0,
                        js_count: 0,

                        jf_count: 0,
                        jf_success: 0,
                        jf_none: 0,

                        gs_count: 0,
                        gs_fail: 0,
                        gs_success: 0,
                        gs_none: 0
                    }
                    res.forEach(e => {
                        let count = e.count | 0
                        data.count += count

                        if (e.state == 1) {
                            data.success += count

                            if (e.type == 1) {
                                data.js_success += count
                                data.js_count += count
                            } else if (e.type == 2) {
                                data.jf_success += count
                                data.jf_count += count
                            } else {
                                data.gs_success += count
                                data.gs_count += count
                            }
                        } else if (e.state == 0) {
                            data.none += count

                            if (e.type == 1) {
                                data.js_none += count
                                data.js_count += count
                            } else if (e.type == 2) {
                                data.jf_count += count
                                data.jf_none += count
                            } else {
                                data.gs_count += count
                                data.gs_none += count
                            }
                        } else {
                            data.fail += count

                            if (e.type == 1) {
                                data.js_fail += count
                                data.js_count += count
                            } else if (e.type == 2) {
                                data.jf_fail += count
                                data.jf_count += count
                            }
                        }
                    })

                    resolve(data)
                })
            })
        },
        async fetchSlLists2() {
            console.log('fetchSlLists')
            // 账期  需结算 结算成功    结算失败    没有结算清单  积分清单    没有积分清单  操作

            let result = {}
            const max = dayjs().format('YYYYMM')
            // 获取所有清单，判断清单是否有清单ID
            const slsql = `select pgk_id,created,date_end from accept`
            const aps = await sqlAll(slsql)

            const zqsql = `select state,date from zhangqi where date <= ?`
            const zq = await sqlAll(zqsql, max)
            console.log(aps, zq)
            for (let i = 0; i < aps.length; i++) {
                let { date_end, pgk_id, created } = aps[i]
                let date = date_end || created
                date = dayjs.unix(date).format('YYYYMM')
                if (!result[date]) {
                    result[date] = {
                        ap: 0,
                        tc: new Set(),
                        tc_none: 0,
                        zq_count: 0,
                        zq_suss: 0,
                        zq_fail: 0,
                        zq_none: 0
                    }
                }
                result[date].ap++
                if (pgk_id) {
                    result[date].tc.add(pgk_id)
                } else {
                    result[date].tc_none++
                }
            }

            for (var i = 0; i < zq.length; i++) {
                let { date, state } = zq[i]
                if (!result[date]) {
                    result[date] = {
                        ap: 0,
                        tc: new Set(),
                        tc_none: 0,
                        zq_count: 0,
                        zq_suss: 0,
                        zq_fail: 0,
                        zq_none: 0
                    }
                }

                result[date].zq_count++
                if (state == 0) {
                    result[date].zq_none++
                } else if (state == -1) {
                    result[date].zq_fail++
                } else {
                    result[date].zq_suss++
                }
            }
            console.log(result)
            let arr2 = []
            for (let x in result) {
                let x2 = result[x]
                x2.date = x
                console.log('x2.tc', x2.tc)
                x2.tc = Array.from(x2.tc).filter(e => e && e != 0).length
                arr2.push(x2)
            }
            this.slqdlist = arr2
            return false

            let notTC = []
            let hasTC = []
            for (var i = 0; i < aps.length; i++) {
                let { pgk_id, created, date_end } = aps[i]
                let date = created || date_end
            }
            /*const min = dayjs()
                .subtract(3, 'month')
                .format('YYYYMM')*/
            const sql = [0, 1, -1]
                .map(e => {
                    return [1, 2, 3]
                        .map(e2 => {
                            return `select count(*) as count,date,state,type from zhangqi where date < ${max} and state=${e} and type=${e2} group by date`
                        })
                        .join(' union all ')
                })
                .join(' union all ')

            this.$db.all(sql, (err, res) => {
                console.log('fetchSlLists', res)
                if (!res) return
                const arr = {}
                res.forEach(e => {
                    if (!arr[e.date]) {
                        arr[e.date] = {
                            count: 0,
                            success: 0,
                            fail: 0,
                            none: 0,
                            date: e.date,
                            js_none: 0,
                            js_fail: 0,
                            js_success: 0
                        }
                    }

                    arr[e.date].count += e.count

                    if (e.type == 1) {
                        if (e.state == 1) {
                            arr[e.date].success += e.count
                            arr[e.date].js_success += e.count
                        } else if (e.state == -1) {
                            arr[e.date].fail += e.count
                            arr[e.date].js_fail += e.count
                        } else {
                            arr[e.date].none += e.count
                            arr[e.date].js_none += e.count
                        }
                    } else if (e.type == 2) {
                        if (e.state == 1) {
                            arr[e.date].success += e.count
                            arr[e.date].jf_success += e.count
                        } else {
                            arr[e.date].none += e.count
                            arr[e.date].jf_none += e.count
                        }
                    } else if (e.type == 3) {
                        if (e.state == 1) {
                            arr[e.date].gs_success += e.count
                            arr[e.date].success += e.count
                        } else if (e.state == -1) {
                            arr[e.date].fail += e.count
                            arr[e.date].gs_fail += e.count
                        } else {
                            arr[e.date].none += e.count
                            arr[e.date].gs_none += e.count
                        }
                    }
                })
                this.fetchSlListsAll().then(res => {
                    let lists = Object.values(arr).sort((a, b) => b.date - a.date)
                    lists.unshift(res)
                    this.slLists = lists
                })
            })
        },
        // 获取受理清单
        fetchSlLists() {
            console.log('fetchSlLists')
            // 账期  需结算 结算成功    结算失败    没有结算清单  积分清单    没有积分清单  操作

            const max = dayjs().format('YYYYMM')
            /*const min = dayjs()
                .subtract(3, 'month')
                .format('YYYYMM')*/
            const sql = [0, 1, -1]
                .map(e => {
                    return [1, 2, 3]
                        .map(e2 => {
                            return `select count(*) as count,date,state,type from zhangqi where date < ${max} and state=${e} and type=${e2} group by date  `
                        })
                        .join(' union all ')
                })
                .join(' union all ')

            this.$db.all(sql, (err, res) => {
                console.log('fetchSlLists', res)
                if (!res) return
                const arr = {}
                res.forEach(e => {
                    if (!arr[e.date]) {
                        arr[e.date] = {
                            count: 0,
                            success: 0,
                            fail: 0,
                            none: 0,
                            date: e.date,
                            jf_count: 0,
                            jf_none: 0,
                            jf_success: 0,
                            jf_fail: 0,
                            js_count: 0,
                            js_none: 0,
                            js_fail: 0,
                            js_success: 0,
                            gs_count: 0,
                            gs_success: 0,
                            gs_fail: 0,
                            gs_none: 0
                        }
                    }

                    arr[e.date].count += e.count

                    if (e.type == 1) {
                        arr[e.date].js_count += e.count
                        if (e.state == 1) {
                            arr[e.date].success += e.count
                            arr[e.date].js_success += e.count
                        } else if (e.state == -1) {
                            arr[e.date].fail += e.count
                            arr[e.date].js_fail += e.count
                        } else {
                            arr[e.date].none += e.count
                            arr[e.date].js_none += e.count
                        }
                    } else if (e.type == 2) {
                        arr[e.date].jf_count += e.count
                        if (e.state == 1) {
                            arr[e.date].success += e.count
                            arr[e.date].jf_success += e.count
                        } else {
                            arr[e.date].none += e.count
                            arr[e.date].jf_none += e.count
                        }
                    } else if (e.type == 3) {
                        arr[e.date].gs_count += e.count

                        if (e.state == 1) {
                            arr[e.date].gs_success += e.count
                            arr[e.date].success += e.count
                        } else if (e.state == -1) {
                            arr[e.date].fail += e.count
                            arr[e.date].gs_fail += e.count
                        } else {
                            arr[e.date].none += e.count
                            arr[e.date].gs_none += e.count
                        }
                    }

                    /*// 结算清单
                    if (e.type == 1) {

                        let key = 'js_none'
                        if (e.state == 1) {
                            key = 'js_success'
                        } else if (e.state == -1) {
                            key = 'js_fail'
                        }
                        arr[e.date][key] = e.count | 0
                    } else {
                        if (e.state == 1) {
                            arr[e.date].jf_success = e.count | 0
                        } else {
                            // 没有积分清单
                            arr[e.date].jf_none = e.count | 0
                        }
                    }
                    const { js_success = 0, js_none = 0, js_fail = 0, jf_success = 0, jf_none = 0 } = arr[e.date]

                    // arr[e.date].count = js_success + js_none + js_fail + jf_success + jf_none
                    // arr[e.date].fail = js_fail + jf_none
                    arr[e.date].none = js_none + jf_none
                    arr[e.date].success = js_success + jf_success*/
                })
                this.fetchSlListsAll().then(res => {
                    let lists = Object.values(arr).sort((a, b) => b.date - a.date)
                    lists.unshift(res)
                    this.slLists = lists
                })
            })
        },
        // 获取积分清单
        fetchJfLists() {
            const max = dayjs().format('YYYYMM')
            /*const min = dayjs()
                .subtract(5, 'month')
                .format('YYYYMM')*/
            const sql = `select count(*) as count,date,sum(ydjf) as ydjf,sum(qs) as qs from jifen where date < ${max}  group by date`
            this.$db.all(sql, (err, res) => {
                if (res) {
                    this.jfLists = res
                }
            })
        },
        // 获取结算清单的账单统计
        fetchJsLists() {
            const max = dayjs().format('YYYYMM')
            /*const min = dayjs()
                .subtract(5, 'month')
                .format('YYYYMM')*/
            let where = `date < ${max}`
            const sql = `select count(status) as count,date,status,sum(commission_money) as money from bill where ${where} and status=1 group by date union all select count(status) as count,date,status,sum(commission_money) as money  from bill where ${where} and status<>1 group by date`
            this.$db.all(sql, (err, res) => {
                if (res) {
                    const arr = {}
                    res.forEach(e => {
                        if (!arr[e.date]) {
                            arr[e.date] = { date: e.date }
                        }
                        arr[e.date][e.status ? 'success' : 'fail'] = e.count
                        arr[e.date][e.status ? 'success_money' : 'fail_money'] = e.money.toFixed(2)
                    })
                    this.jsLists = Object.values(arr)
                }
            })
        },
        // 获取最后插入的ID
        fetchLastId(table) {
            return new Promise(resolve => {
                let sql = `select id from ${table} order by id desc limit 1`
                this.$db.get(sql, (err, res) => {
                    let id = (res && res.id) | 0
                    resolve(id)
                })
            })
        },
        async uploadJifen() {
            // 上传积分
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
            this.loadingJifen = true

            this.tableNum = fileList
            const taocanArr = await getAllTaocan()

            let sqlArr = []
            let tcArr = []

            for (var i = 0; i < fileList.length; i++) {
                let { jf_sql, tc_ids } = this.openJfExcel(fileList[i], taocanArr)
                console.log({ jf_sql, tc_ids })
                sqlArr.push(...jf_sql)
                tcArr.push(...tc_ids)
            }

            // 写入数据
            runSql2Arr(sqlArr).then(res => {
                tcArr = Array.from(tcArr)
                console.log({ tcArr })

                computedZhangqiState2(tcArr)

                this.loadingJifen = false
                this.onInit()
            })
        },

        openJfExcel(path, taocanArr) {
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
            const jf_sql = []
            const tc_ids = new Set()

            // let keys = Object.keys(this.jifenColumns).join(',')
            // 先获取最大的积分清单的ID

            // const last_jf_id = await this.fetchLastId('jifen')
            result.SheetNames.forEach(key => {
                let json = xlsx.utils.sheet_to_json(result.Sheets[key])

                json.forEach(e => {
                    let id = uuidv4()
                    if (e['入网套餐'] && (e['账期'] || e['帐期'])) {
                        let obj = {
                            id,
                            pgk_id: 0,
                            created_at: now
                        }
                        for (let k in this.jifenColumns) {
                            let v = this.jifenColumns[k]
                            if (k === 'ydjf') {
                                obj.ydjf = e['应兑换积分'] || e['本月兑换金额']
                            } else if (k === 'pgk_id') {
                                let t = taocanArr.find(t2 => {
                                    console.log(t2, e['入网套餐'])
                                    return t2.val.indexOf(`#${e['入网套餐']}#`) > -1
                                })
                                if (t) {
                                    obj.pgk_id = t.id
                                    tc_ids.add(t.id)
                                }
                            } else if (k === 'date') {
                                obj.date = e['账期'] || e['帐期']
                            } else if (k === 'rw_date') {
                                obj.rw_date = dayjs(e[v]).unix()
                            } else {
                                obj[k] = e[v]
                            }
                        }

                        jf_sql.push(this.insertJifenSQL(obj))
                    }
                })
            })

            return { jf_sql, tc_ids }
        },
        insertJifenSQL(datas) {
            let keys = Object.keys(datas).join(',')
            let values = Object.values(datas).join(`','`)

            // 插入数据库
            const sql = `insert into jifen (${keys}) values ('${values}')`

            return sql

            /*          return new Promise(resolve => {
                let keys = Object.keys(datas).join(',')
                let values = Object.values(datas).join(`','`)

                // 插入数据库
                const sql = `insert into jifen (${keys}) values ('${values}')`
                // let { id, name, count_js, count_jf, law_jf, law_js } = zq_item

                this.$db.run(sql, err => {
                    if (err) {
                        this.$logger('插入数据错误', err)
                        // datas.error = err.toString()
                        // this.insertJFError.push(datas)
                    } else {
                        this.insertJifenCount++
                    }
                    resolve(err)
                })
            })*/
        },
        // 先获取所有网点
        fetchWangdian() {
            if (!this.fetchMonth) {
                return this.$message({
                    message: '请选择周期',
                    type: 'error'
                })
            }
            let url = `http://service.gz.189.cn/wtcommission/index.php/api/index/broadBandUNSettledBillDetail/default.shtml`
            this.fetchLoading = true
            this.fetchBoxVisible = false
            var cookiejar = rp.jar()
            cookiejar.setCookie(this.cookies, 'http://service.gz.189.cn')

            const options = {
                url,
                jar: cookiejar,
                method: 'GET',
                headers: {
                    'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8'
                }
            }
            rp(options)
                .then(async res => {
                    // this.$logger(res)
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
                            localStorage.removeItem('cookies')
                        }, 300)
                        this.fetchLoading = false
                    } else {
                        this.wangdian = Array.from($('#AgentPointCode option'))
                            .map(e => $(e).val())
                            .slice(1)
                        this.fetchWangdianDatas(this.wangdian)
                        // 写入数据库
                        // this.onInsertFetchDatas(vals)

                        // 1. 先获取页数。
                        // 2. 循环获取数据，记录获取成功和失败。
                    }
                })
                .catch(err => {
                    this.$notify.error({
                        title: '获取数据失败',
                        message: err.error
                    })
                    this.fetchLoading = false
                })
        },
        fetchWangdianDatas(lists) {
            // 1. 获取所有网点
            let fetchMonth = dayjs(this.fetchMonth).format('YYYYMM')
            let arr = []

            lists.forEach(e => {
                let obj = { page: 1, fetchMonth, member_id: e }
                arr.push({ ...obj, type: 'broadBandSettledBillDetail' })
                arr.push({ ...obj, type: 'broadBandUNSettledBillDetail' })
            })
            this.$logger(arr)

            this.fetchWangdianDatasHelp(arr)
        },
        fetchWangdianDatasHelp(arr) {
            this.fetchLoading = true
            this.ee = []
            let limit = 4

            async.mapLimit(arr, limit, this.handleRequestDatas, (err, result) => {
                this.fetchLoading = false
                this.formatSS2()
            })
        },
        formatSS2() {
            let arr = []
            for (let x in this.ss) {
                let v = this.ss[x]
                arr.push({ k: x, ...v })
            }
            this.ss2 = arr
        },
        donwloadFetchDatas() {
            // 下载采集数据到本地。

            // datas = this.parseAoaData(datas, json)
            var tit = [
                '是否结算',
                '订单号',
                '用户号码',
                '套餐',
                '佣金账期',
                '结算金额',
                '佣金政策',
                '受理日期',
                '竣工日期',
                '发展人',
                '发展人编码',
                '一级',
                '二级',
                '三级',
                '网点名称',
                '网点编号'
            ]
            // const datas = [tit, ...this.fetchDatas]

            // 下载
            let date = ''
            try {
                date = this.fetchDatas[0][4]
            } catch (err) {
                date = '-'
            }
            const name = `采集${date}受理清单`

            // 分离出已结算和未结算

            const success_list = []
            const error_list = []
            // 分离出成功和失败
            this.fetchDatas.forEach((e, i) => {
                if (i === 0) {
                    error_list.push(tit)
                    success_list.push(tit)
                }

                if (e[0]) {
                    success_list.push(e)
                } else {
                    error_list.push(e)
                }
            })
            const params = [
                { datas: success_list, bookName: '已结算' },
                { datas: error_list, bookName: '未结算' }
            ]

            this.onDownload(params, name)
        },
        onInsertFetchDatas() {
            let datas = this.fetchDatas
            const now = dayjs().unix()
            this.$logger('datas.length', datas.length)
            let js_sql = datas.map(e => {
                // 受理日期： e[7]

                let _datas = {
                    date: e[4], //'账期',
                    order_id: e[1], //'订单号',
                    complete_date: e[8], //'订单竣工时间',
                    commission_policy: `${e[11]}-${e[12]}-${e[13]}`, //'佣金结算策略',
                    commission_type: e[6], //'佣金结算类型',
                    commission_money: e[5], //'佣金结算金额（元）',
                    package_name: e[3], //'发展套餐名',
                    // product_name: '产品类型',
                    // user_id: '用户ID',
                    user_number: e[2], // '用户号码',
                    status: e[0], //'是否成功结算',
                    // cause: '原因',
                    branch: e[14],
                    created: now,
                    id: uuidv4()
                }

                // let keys = Object.keys(datas).join(',')
                // let values = Object.values(datas).join(`','`)
                // // 插入数据库
                // const sql = `insert into bill (${keys}) values ('${values}')`

                return insertJsSQL(_datas)
            })

            runSql2Arr(js_sql).then(res => {
                console.log('runSql2Arr over', res)
                // 更新账期
            })
        },
        async handleRequestDatasHelp() {
            this.fetchLoading = true

            let params = { page: 1, fetchMonth: dayjs(this.fetchMonth).format('YYYYMM'), member_id: this.member_id }
            await this.handleRequestDatas({ ...params, type: 'broadBandSettledBillDetail' })
            await this.handleRequestDatas({ ...params, type: 'broadBandUNSettledBillDetail' })
            this.fetchLoading = false
        },
        // broadBandSettledBillDetail: 已结算
        // broadBandUNSettledBillDetail: 未结算
        handleRequestDatas(params, callback) {
            let { page, type, fetchMonth, member_id } = params
            // layui-laypage-last
            if (!member_id || !fetchMonth) {
                this.$logger({ page, type, fetchMonth, member_id })
                return this.$message({
                    message: '请填写账期和工号',
                    type: 'error'
                })
            }
            const type_status = (type === 'broadBandSettledBillDetail') * 1
            const type_text = type_status ? '已结算' : '未结算'

            // const fetchMonth = dayjs(this.fetchMonth).format('YYYYMM')

            const url = `http://service.gz.189.cn/wtcommission/index.php/api/index/${type}/AgentPointCode/${member_id}/BillingCycleID/${fetchMonth}/PageNBR/${page}`
            this.$logger(url)
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
                // this.fetchLogs = `${type_text}：开始采集工号${member_id}账期${fetchMonth}的数据`
                this.fetchBoxVisible = false

                /*this.$notify({
                    title: '提示',
                    message: `开始采集${type_text}网点${member_id}数据`,
                    type: 'warning'
                })*/
            }
            this.$logger(`${type_text}:${member_id}: 开始采集第${page}页数据`)
            // this.fetchLogs = `${type_text}:${member_id}: 开始采集第${page}页数据`

            rp(options)
                .then(async res => {
                    // this.$logger(res)

                    var $ = cheerio.load(res)
                    let title = $('title').text()

                    this.$logger(`${type_text}:${member_id}: 开始采集第${page}页数据 - ${title}`)
                    // this.$logger(res)

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
                        // 获取网点名称
                        let branch_title = $('.card-query > div')
                            .eq(2)
                            .find('.layui-input-inline')
                            .text()

                        var vals = Array.from($('table.cartable').find('tr'))
                            .map(tr => {
                                let data = Array.from($(tr).find('.car-text')).map(e => $(e).text())
                                let js = (type === 'broadBandSettledBillDetail') * 1
                                data.splice(0, 1, type_status)
                                data.push(branch_title, member_id)
                                return data
                            })
                            .slice(2)

                        let log = `${type_text}:${member_id}: 第${page}页获取到${vals.length}条数据`
                        if (!vals[0] || vals[0].length < 8) {
                            log = `${type_text}:${member_id}: 没有数据`
                            vals = []
                        }
                        this.$logger(log)
                        // 写入数据库
                        // this.onInsertFetchDatas(vals)

                        this.fetchDatas.push(...vals)
                        // this.fetchLogs = log

                        if (page === 1) {
                            // 获取总页数
                            let last_page = $('.layui-laypage-last').attr('data-page')
                            // this.fetchLogs = `${type_text}:${member_id}: 共有${last_page || page}页数据`
                            /*if (!this.fetchLogs2[member_id]) {
                                this.fetchLogs2[member_id] = {}
                            }*/
                            if (!this.ee[member_id]) {
                                this.ss[member_id] = {}
                            }

                            this.ss[member_id][type_text] = vals.length

                            /*this.fetchLogs2[member_id][type_text] = {
                                id: member_id,
                                date: fetchMonth,
                                last_page: last_page,
                                page: [{ page, len: vals.length }]
                            }*/

                            // return vals
                            let data = []
                            if (last_page > 1) {
                                if (vals.length === 0) {
                                    this.ee.push(params)
                                }
                                data = await this.onParallelLimit(last_page, { fetchMonth, member_id, type })
                                // this.fetchDatas.push(...data)
                            }
                            callback(null, [...vals, ...data])
                        } else {
                            try {
                                if (!this.ss[member_id]) {
                                    this.ss[member_id] = {}
                                }
                                this.ss[member_id][type_text] = (this.ss[member_id][type_text] | 0) + vals.length

                                if (vals.length === 0) {
                                    this.ee.push(params)
                                }

                                // this.fetchLogs2[member_id][type_text].page.push({ page, len: vals.length })
                            } catch (err) {
                                this.$logger('error', err)
                            }

                            callback(null, vals)
                        }

                        // 1. 先获取页数。
                        // 2. 循环获取数据，记录获取成功和失败。
                    }
                })
                .catch(err => {
                    this.ee.push(params)

                    if (page === 1) {
                        callback(null, { member_id, page, type: false })
                    } else {
                        callback(null, [])
                    }
                    this.$logger('2222222222222', err)

                    /*if (!this.fetchLogs2[member_id]) {
                        this.fetchLogs2[member_id] = {}
                    }*/
                    /*try {
                        if (page === 1) {
                            this.fetchLogs2[member_id][type_text] = {
                                id: member_id,
                                date: fetchMonth,
                                page: [{ page, error: err.error }]
                            }
                        } else {
                            this.fetchLogs2[member_id][type_text].page.push({ page, error: err.error })
                        }
                    } catch (err) {
                        this.$logger('error', err)
                    }*/

                    this.$notify.error({
                        title: '获取数据失败',
                        message: err.error
                    })
                })
        },

        onParallelLimit(page, params) {
            return new Promise(resolve => {
                let limit = 1
                let pages = Array(page - 1)
                    .fill()
                    .map((e, i) => ({ page: i + 2, ...params }))

                async.mapLimit(pages, limit, this.handleRequestDatas, (err, result) => {
                    let arr = []
                    result.forEach(e => arr.push(...e))
                    this.$logger(err, result)
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
                    }, 1000)
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
                    this.$logger(err)
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
            this.$logger({
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
                    this.$logger(body)
                    if (body) {
                        let $ = cheerio.load(body)
                        let title = $('h1').text()
                        let message = $('h2').text()
                        this.$logger(title, message)
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
                    this.$logger(err)
                    this.$logger(err.statusCode)
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
            const sql = `select user_number,count(user_number) as count,package_name from bill group by user_number,package_name union all select user_number,count(user_number) as count,package_name as package_name from jifen group by user_number,package_name`

            const bills = await new Promise(resolve => {
                this.$db.all(sql, (err, res = []) => {
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
        onRouterList(v, date) {
            if (v === 'jf') {
                v = `/bill/jifen?date=${date}`
            } else {
                v = `/bill/list?date=${date}`
            }
            this.$router.push(v)
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
                this.$logger('notfound', { err, res })
                if (res) this.notFoundUserCount = res.count
            })
            // 获取本月结算成功的。
            let oq = `select count(b.id) as count from bill b left join accept a on (a.user_number=b.user_number or a.action_no=b.user_number) where a.action_no is not null and b.created between ${this.firstDay} and ${this.lastDay}`
            this.$db.get(oq, (err, res) => {
                this.$logger({ res, err })
                if (res) this.monthOutSuccess = res.count
            })
        },

        /*
         * 获取本月待计算受理数
         * vals  所有套餐
         **/
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
        /*
         * 统计本月需要计算的数量
         * item objtct 单个套餐
         * vals arry 当前套餐下所有受理清单
         **/
        async onCalcCountColums(item, vals) {
            //
            // this.$logger({ item })
            let accept_count_arr = []
            /**
             * name: 套餐名称
             * count： 结算次数
             * law: 结算规律
             * id: id
             */
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
                            let sql = `select date from bill where user_number='${e.action_no}' and status=1 and package_name='${e.package_name}' union all select date from jifen where user_number='${e.action_no}' and package_name='${e.package_name}'`

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
                let day = dayjs.unix(e.date_end).format('YYYYMM')

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
            try {
                let accept_count_arr = []
                if (this.package.length) {
                    this.outputLoading = flag
                    accept_count_arr = await this.onFetchSettle(this.package)
                } else {
                    return
                }

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
                this.onDownload([{ datas }], title)
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
                title = `${dayjs().format('YYYYMM')} 结算成功 `

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
            this.$logger(datas)

            this.onDownload([{ datas }], title)
        },
        /*
         * 下载excel表格
         * datas array 表格数据
         * name string 表格名称
         */
        onDownload(datas, name) {
            download
                .excel2(datas, name)
                .then(res => {
                    this.outputLoading = ''
                    this.$message({
                        showClose: true,
                        message: `数据表格创建${!res ? '成功' : '失败'}`,
                        type: !res ? 'success' : 'error'
                    })
                })
                .catch(err => {
                    this.outputLoading = ''
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
        async importJsLists() {
            this.importJsLoading = true
            let fileList = this.$electron.remote.dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: { name: 'xlsx', extensions: ['xlsx', 'xls'] }
            })

            if (!fileList || fileList.length < 1) {
                this.$message({
                    message: '没有获取到相关文件',
                    type: 'error'
                })
                this.importJsLoading = false
                return
            }
            const taocanArr = await getAllTaocan()
            this.tableNum = fileList
            let sqlArr = []
            let tcArr = []

            for (var i = 0; i < fileList.length; i++) {
                let { js_sql, tc_ids } = this.onOpenFile(fileList[i], taocanArr)
                console.log({ js_sql, tc_ids })
                sqlArr.push(...js_sql)
                tcArr.push(...tc_ids)
            }

            runSql2Arr(sqlArr).then(res => {
                console.log('runSql2Arr over', res, { tcArr })
                tcArr = Array.from(tcArr)
                console.log({ tcArr })

                computedZhangqiState2(tcArr)

                this.importJsLoading = false
                this.onInit()
                // 更新账期
            })

            // this.loading = false
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
        onOpenFile(path, taocanArr) {
            // 获取数据
            const excelBuffer = fs.readFileSync(path)
            let _this = this

            // 解析数据
            var result = xlsx.read(excelBuffer, {
                type: 'buffer',
                cellHTML: false
            })

            // this.result = result
            const now = dayjs().unix()

            const js_sql = []
            // const taocanArr = await getAllTaocan()
            const tc_ids = new Set()

            // 分析数据
            result.SheetNames.forEach(key => {
                let json = xlsx.utils.sheet_to_json(result.Sheets[key])

                json.forEach(e => {
                    // this.$logger(e)
                    if (e['发展套餐名'] || e['账期'] || e['帐期']) {
                        let obj = {
                            id: uuidv4(),
                            created: now
                        }
                        for (let k in this.columns) {
                            let v = this.columns[k]
                            if (k === 'pgk_id') {
                                let t = taocanArr.find(t2 => {
                                    console.log(t2, e['发展套餐名'])
                                    return t2.val.indexOf(`#${e['发展套餐名']}#`) > -1
                                })
                                if (t) {
                                    obj.pgk_id = t.id
                                    tc_ids.add(t.id)
                                }
                            } else if (k === 'date') {
                                obj.date = e['账期'] || e['帐期']
                            } else if (v === '是否成功结算') {
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
                        js_sql.push(this.insertJsSQL(obj))
                    }
                })
            })

            return { js_sql, tc_ids }

            /*return runSql2Arr(js_sql).then(res => {
                console.log('runSql2Arr over', res)
                // 更新账期
            })*/
        },
        // 插入结算清单
        insertJsSQL(datas) {
            let keys = Object.keys(datas).join(',')
            let values = Object.values(datas).join(`','`)
            // 插入数据库
            const sql = `insert into bill (${keys}) values ('${values}')`
            // this.$logger(sql)
            return sql
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
            // this.$logger({ user })
            // 1.获取所有数据，然后再从user中未找到accept中不存在的数据

            // 查询未找到的数据
            const sql = `select * from accept where action_no in (${user})`
            this.$db.all(sql, (err, res) => {
                this.notfound = res
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
