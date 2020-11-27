<template>
    <div id="home">
        <div class="title-line shrink0">账期</div>
        <div class="flex">
            <div class="flex-item">
                <div class="title">状态</div>
                <el-select v-model="status" placeholder="状态" filterable>
                    <el-option :label="v.v" :value="v.i" v-for="(v, i) in status_arr" :key="i"></el-option>
                </el-select>
            </div>
            <div class="flex-item">
                <div class="title">账期类型</div>
                <el-select v-model="zq_types" placeholder="状态" filterable>
                    <el-option :label="v.v" :value="v.i" v-for="(v, i) in zq_types_arr" :key="i"></el-option>
                </el-select>
            </div>

            <!-- 产品名称 -->
            <div class="flex-item">
                <div class="title">选择产品名称</div>
                <el-select
                    v-model="product_name"
                    placeholder="选择产品名称"
                    @click.native="onFetchProductName"
                    filterable
                >
                    <el-option :label="v" :value="v" v-for="(v, i) in product_names" :key="i"></el-option>
                </el-select>
            </div>
            <!-- 产品名称 -->
            <div class="flex-item">
                <div class="title">选择所属主销售品</div>
                <el-select
                    v-model="product_main"
                    placeholder="选择所属主销售品"
                    filterable
                    @click.native="onFetchProductMain"
                >
                    <el-option :label="v" :value="v" v-for="(v, i) in product_mains" :key="i"></el-option>
                </el-select>
            </div>
            <div class="flex-item">
                <div class="title">业务号码</div>
                <el-input v-model="action_no" placeholder="可输入部分" />
            </div>
        </div>
        <div class="flex">
            <div class="flex-item">
                <div class="title">选择账期</div>
                <el-date-picker v-model="zhangqiDate" type="month" placeholder="选择账期"> </el-date-picker>
            </div>

            <div class="flex-item">
                <div class="title">操作</div>
                <el-button @click="handleSearch" type="primary">查询</el-button>
                <el-button @click="handleSearch(`clear`)" type="default">清除</el-button>
            </div>
        </div>

        <div class="title-line shrink0">
            账期列表
            <small
                >共有<b>{{ total }}</b
                >条数据</small
            >
            <el-button style="margin-left: 20px;" @click="$router.push(`/accept/add`)" type="primary" size="mini"
                >新增受理清单</el-button
            >
            <el-button
                style="margin-left: 10px;"
                type="success"
                :loading="outputLoading"
                @click="handleOutputDatas"
                size="mini"
                >导出查询结果</el-button
            >
        </div>
        <div class="table-box flex1" ref="tableBox">
            <el-table :data="datas" :height="tableHeight" v-if="tableHeight">
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <el-form-item label="购物车流水号">
                                <span>{{ props.row.no }}</span>
                            </el-form-item>
                            <el-form-item label="渠道名称">
                                <span>{{ props.row.addr || '-' }}</span>
                            </el-form-item>
                            <el-form-item label="副卡(结算号)">
                                <span>{{ props.row.action_r || '-' }}</span>
                            </el-form-item>
                            <el-form-item label="地区">
                                <span>{{ props.row.area }}</span>
                            </el-form-item>

                            <el-form-item label="角色名称">
                                <span>{{ props.row.product_type }}</span>
                            </el-form-item>
                            <el-form-item label="受理时间">
                                <span>{{ props.row.created | parseDate }}</span>
                            </el-form-item>
                            <el-form-item label="竣工时间">
                                <span>{{ props.row.date_end | parseDate }}</span>
                            </el-form-item>

                            <el-form-item label="工单状态">
                                <span>{{ props.row.status }}</span>
                            </el-form-item>

                            <el-form-item label="揽收人">
                                <span>{{ props.row.user }}</span>
                            </el-form-item>
                            <el-form-item label="导入时间">
                                <span>{{ props.row.import_date | parseDate }}</span>
                            </el-form-item>
                            <el-form-item label="备注" style="display: block;width: 100%">
                                <span>{{ props.row.remark || '-' }}</span>
                            </el-form-item>
                            <el-form-item label="对应清单ID" style="display: block;width: 100%">
                                <span>{{ props.row.qd_id || '-' }}</span>
                            </el-form-item>

                            <el-form-item label="相关结算清单">
                                <el-button type="text" v-if="!props.row.qd" @click="fetchQD(props)"
                                    >获取相关清单</el-button
                                >
                                <template v-else-if="props.row.qd.length < 1">
                                    没有相关清单
                                </template>
                                <template v-else> 共有相关清单{{ props.row.qd.length }}条 </template>
                            </el-form-item>

                            <el-table
                                :data="props.row.qd"
                                v-if="props.row.qd && props.row.zq_type != 2"
                                style="width: 100%;"
                            >
                                <el-table-column prop="id" label="id" width="300">
                                    <template slot-scope="scope">
                                        <el-button type="text" @click="openZhangqiInfo(scope.row.id)">
                                            {{ scope.row.id }}
                                        </el-button>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="date" label="账期"> </el-table-column>
                                <el-table-column prop="flag" label="结算状态">
                                    <template slot-scope="scope">
                                        {{ scope.row.flag == 1 ? '已结算' : '未结算' }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="commission_type" label="套餐类型"> </el-table-column>
                                <el-table-column prop="package_name" label="套餐名称"> </el-table-column>
                                <el-table-column prop="user_number" label="业务号码"> </el-table-column>
                                <el-table-column prop="status" label="状态">
                                    <template slot-scope="scope">
                                        {{ scope.row.status == 1 ? '结算成功' : '结算失败' }}
                                    </template>
                                </el-table-column>
                            </el-table>

                            <el-table
                                :data="props.row.qd"
                                v-if="props.row.qd && props.row.zq_type == 2"
                                style="width: 100%;"
                            >
                                <el-table-column prop="id" label="id" style="width: 280px;">
                                    <template slot-scope="scope">
                                        <el-button type="text" @click="openZhangqiInfo(scope.row.id)">
                                            {{ scope.row.id }}
                                        </el-button>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="date" label="账期"> </el-table-column>
                                <el-table-column prop="flag" label="结算状态">
                                    <template slot-scope="scope">
                                        {{ scope.row.flag == 1 ? '已结算' : '未结算' }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="package_name" label="套餐名称"> </el-table-column>
                                <el-table-column prop="user_number" label="业务号码"> </el-table-column>
                                <el-table-column prop="ydjf" label="应对积分"> </el-table-column>
                            </el-table>

                            <!--      <div style="width: 100%; position: relative;">
                                <el-table :data="datas">
                                    <el-table-column prop="action_no" label="业务号码"> </el-table-column>
                                    <el-table-column prop="product_main" label="所属主销售品"> </el-table-column>
                                    <el-table-column prop="addr" label="渠道名称"> </el-table-column>
                                </el-table>
                            </div> -->
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="账期"> </el-table-column>
                <el-table-column prop="zq_state" label="账期状态">
                    <template slot-scope="scope">
                        {{ scope.row.zq_state | parseZqState }}
                    </template>
                </el-table-column>
                <el-table-column prop="zq_type" label="账期类型">
                    <template slot-scope="scope">
                        {{ scope.row.zq_type == 2 ? '积分' : '清单' }}
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称"> </el-table-column>

                <el-table-column prop="action_no" label="业务号码"> </el-table-column>
                <el-table-column prop="action" label="业务动作"> </el-table-column>
                <el-table-column prop="product_main" label="所属主销售品"> </el-table-column>
                <!-- <el-table-column prop="js_count" label="已结算次数"> </el-table-column> -->
                <!--     <el-table-column v-for="(v, i) in items" :prop="i" :label="v"> </el-table-column> -->
                <!-- <el-table-column prop="no" label="购物车流水号"> </el-table-column> -->
            </el-table>
        </div>
        <el-pagination
            class="pagination shrink0"
            @current-change="handleCurrentChange"
            :hide-on-single-page="true"
            background
            layout="prev, pager, next"
            :current-page.sync="page"
            :total="total"
            :page-size="20"
        >
        </el-pagination>

        <el-dialog title="该清单对应的账期" :visible.sync="dialogVisible" width="90%" :before-close="handleClose">
            <el-table :data="dialogData">
                <el-table-column prop="date" label="账期"> </el-table-column>
                <el-table-column prop="zq_state" label="账期状态">
                    <template slot-scope="scope">
                        {{ scope.row.zq_state | parseZqState }}
                    </template>
                </el-table-column>
                <el-table-column prop="zq_type" label="账期类型">
                    <template slot-scope="scope">
                        {{ scope.row.zq_type == 2 ? '积分' : '清单' }}
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称"> </el-table-column>

                <el-table-column prop="action_no" label="业务号码"> </el-table-column>
                <el-table-column prop="action" label="业务动作"> </el-table-column>
                <el-table-column prop="product_main" label="所属主销售品"> </el-table-column>
                <el-table-column prop="no" label="购物车流水号"> </el-table-column>
                <el-table-column prop="addr" label="渠道名称"> </el-table-column>

                <el-table-column prop="area" label="地区"> </el-table-column>

                <el-table-column prop="product_type" label="角色名称"> </el-table-column>
                <el-table-column prop="created" label="受理时间">
                    <template slot-scope="scope">
                        {{ scope.row.created | parseDate }}
                    </template>
                </el-table-column>
                <el-table-column prop="date_end" label="竣工时间">
                    <template slot-scope="scope">
                        <span>{{ scope.row.date_end | parseDate }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="status" label="工单状态"> </el-table-column>

                <el-table-column prop="user" label="揽收人"> </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>
<script>
import download from '@/utils/download.js'
import dayjs from 'dayjs'
import xlsx from 'xlsx'
import { deleteZhangqi2accept } from '@/utils/zhangqi2'
const fs = require('fs')
const { readFileSync } = fs

export default {
    data() {
        return {
            dialogData: [],
            dialogVisible: false,
            deleteLoading: false, //删除数据
            outputLoading: false,
            loading: false,
            qudao: '',
            analysisActiveName: 'all',
            fileList: [],
            datas: [],
            zq_types: '',
            zq_types_arr: [
                { i: 1, v: '普通清单' },
                { i: 2, v: '积分清单' }
            ],
            status: '',
            status_arr: [
                { i: 1, v: '结算成功' },
                { i: -1, v: '结算失败' },
                { i: 0, v: '未结算' }
            ],
            zhangqiDate: '',
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
            items: {
                no: '购物车流水号',
                area: '地区',
                zhangqi: '账期',
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
            page: 1,
            total: 0,
            limit: 20,
            addr: '', //选中的渠道
            addrs: [], //渠道名称
            acceptor: '', //选中的受理人
            acceptors: [], //受理人
            user: '', //选中的揽件人
            users: [], //所有揽件人
            created: '', //受理时间
            date_end: '', //竣工时间
            product_main: '', //所属主销售品
            product_mains: [], //所属主销售品action
            action: '',
            actions: [],
            product_name: '',
            product_names: [],
            action_no: ''
        }
    },
    filters: {
        parseZqState(v) {
            v = v | 0
            if (v === 1) {
                return '结算成功'
            } else if (v === -1) {
                return '结算失败'
            } else {
                return '未结算'
            }
        },
        parseDate(v) {
            return dayjs(v * 1000).format('YYYY-MM-DD hh:ss:mm')
            // let date = new Date(v * 1)
            // return `${date.getFullYear()}年${date.getMonth() +
            //     1}月${date.getDay()}日 ${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}秒`
        }
    },
    created() {
        this.onFetchDatas()
        this.onFetchCount()
        // this.onFetchQudao()
        // this.onFetchAcceptor()
        // this.onFetchUser()
    },
    methods: {
        handleClose() {
            this.dialogVisible = false
        },
        openZhangqiInfo(id) {
            // 查找当前结算清单对应的账期。
            const sql = `select zq.date,zq.type as zq_type,zq.state as zq_state,a.* from zhangqi zq left join accept a on zq.list_id=a.uuid where zq.qd_id='${id}' `

            this.$db.get(sql, (err, res) => {
                this.dialogVisible = true
                console.log(err, res)
                if (res) {
                    this.dialogData = [res]
                }
            })
        },
        fetchQD({ row, $index }) {
            // 获取相关清单
            const user_number = row.action_r
                .split('#')
                .filter(e => e)
                .join("','")
            const sql = `select * from ${row.zq_type !== 2 ? 'bill' : 'jifen'} where user_number in ('${user_number}')`
            console.log(sql)
            this.$db.all(sql, (err, res) => {
                if (err) {
                } else {
                    console.log(res)
                    // const data = res.map(e => e.val).filter(e => e)
                    this.$set(this.datas[$index], 'qd', res)
                }
            })
        },
        onFetchUser() {
            // 查询揽件人
            if (!this.acceptor.length) {
                if (!this.users.length) this.remoteMethod('user')
            }
        },

        onFetchAcceptor() {
            if (!this.acceptors.length) {
                if (!this.acceptors.length) this.remoteMethod('acceptor')
                // 查询受理人
            }
        },
        onFetchAddrs() {
            if (!this.addrs.length) this.onFetchQudao()
        },
        onFetchProductMain() {
            if (!this.product_mains.length) this.remoteMethod('product_main')
        },
        onFetchProductName() {
            if (!this.product_names.length) this.remoteMethod('product_name')
        },
        remoteMethod(key) {
            if (this[`${key}s`].length) {
                return
            }
            const sql = `select ${key} as val from accept group by ${key}`
            this.$db.all(sql, (err, res) => {
                if (err) {
                } else {
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e)
                    this.$set(this, `${key}s`, data)
                }
            })
        },
        handleCurrentChange(page) {
            const where = this.onParseSearchSQL(page)
            this.onFetchDatas(where)
        },
        onParseSearchSQL(page = 1) {
            // 8、受理时间 开始－结束，如果只有开始，就是大于，只有结束，就是小于
            // 9、竣工时间同上 到天
            // 7、业务号码（模糊查询）
            this.page = page
            let where = []

            // 按条件查询查询
            if (this.status !== '') {
                where.push(`zq.state='${this.status}'`)
            }
            if (this.zhangqiDate !== '') {
                let a = dayjs(this.zhangqiDate).format('YYYYMM')
                where.push(`zq.date='${a}'`)
            }

            if (this.product_name !== '') {
                console.log('this.product_name', this.product_name)
                where.push(`a.product_name='${this.product_name}'`)
            }
            if (this.product_main !== '') {
                console.log('this.product_main', this.product_main)
                where.push(`a.product_main='${this.product_main}'`)
            }

            if (this.zq_types !== '') {
                where.push(`zq.type='${this.zq_types}'`)
            }

            if (this.action_no !== '') {
                where.push(`a.action_r like '%${this.action_no}%'`)
            }

            if (where.length > 0) {
                where = where.join(' and ')
                where = `where ${where}`
            } else {
                where = ''
            }
            return where
        },
        handleSearch(isClear) {
            let where = ''
            if (isClear == 'clear') {
                this.status = ''
                this.zhangqiDate = ''
                this.product_name = ''
                this.product_main = ''
                this.action_no = ''
            } else {
                where = this.onParseSearchSQL()
            }
            console.log(where)
            this.onFetchCount(where)
            this.onFetchDatas(where)
        },
        handleOutputDatas() {
            // 导出当前结果
            this.outputLoading = true
            const where = this.onParseSearchSQL()

            this.onFetchDatas(where, 0)
                .then(res => {
                    const datas = this.parseAoaData(res)
                    const date = this.zhangqiDate ? dayjs(this.zhangqiDate).format('YYYYMM') : ''
                    const data = [{ datas, bookName: `账期${date}` }]
                    download
                        .excel2(data, `${date}账期查询结果`)
                        .then(res => {
                            this.outputLoading = false

                            this.$message({
                                showClose: true,
                                message: `数据表格创建${!res ? '成功' : '失败'}`,
                                type: !res ? 'success' : 'error'
                            })
                        })
                        .catch(err => {
                            this.outputLoading = false

                            this.$message({
                                showClose: true,
                                message: err.message,
                                type: 'error'
                            })
                        })
                    this.outputLoading = false
                })
                .catch(err => {
                    console.log(err)
                    this.outputLoading = false
                })
        },
        parseAoaData(items) {
            const cloums = {
                qd_id: '结算清单ID',
                pgk_id: '套餐ID',
                date: '账期',
                zq_type: '账期类型',
                zq_state: '账期状态',
                ...this.items
            }
            const line1 = Object.values(cloums)
            const keys = Object.keys(cloums)

            const datas = items.map(v => {
                return keys.map(k => {
                    let val = v[k]
                    if (k === 'zq_type') {
                        val = val == 2 ? '积分' : '清单'
                    } else if (k === 'zq_state') {
                        if (val === 1) {
                            val = '结算成功'
                        } else if (val === -1) {
                            val = '结算失败'
                        } else {
                            val = '未结算'
                        }
                    } else if (k === 'date_end' || k === 'created' || k === 'import_date') {
                        val = dayjs.unix(val).format('YYYY-MM-DD')
                    }

                    return val
                })
            })
            datas.unshift(line1)
            return datas
        },

        onFetchQudao() {
            // 查询渠道
            const sql = `select addr from accept group by addr`
            this.$db.all(sql, (err, res) => {
                if (err) {
                } else {
                    // this.dataListTotalCount = res.totalCount;
                    this.addrs = res.map(e => e.addr)
                }
            })
        },
        onFetchCount(whereSQL = '') {
            // const sql = 'SELECT COUNT(uuid) AS totalCount from accept ' + whereSQL
            const sql = `select COUNT(1) as total from zhangqi zq left join accept a on zq.list_id=a.uuid ` + whereSQL
            this.$db.get(sql, (err, res) => {
                if (!err) {
                    console.log(res)
                    this.total = res.total
                }
            })
        },
        onFetchDatas(whereSQL = '', limit = 20) {
            return new Promise((resolve, reject) => {
                limit = limit ? `limit ${this.limit * (this.page - 1)}, ${this.limit}` : ''
                // const sql = `select * from accept ${whereSQL} ${limit}`

                const sql = `select zq.qd_id, zq.date,zq.type as zq_type,zq.state as zq_state,a.* from zhangqi zq left join accept a on zq.list_id=a.uuid ${whereSQL} ${limit}`

                this.$db.all(sql, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        // this.dataListTotalCount = res.totalCount;
                        if (limit) {
                            this.datas = res.map(e => {
                                e.qd = false
                                return e
                            })
                        }

                        resolve(res)
                    }
                })
            })
        }
    }
}
</script>
<style lang="less" scoped>
.line2 {
    padding-top: 10px;
}
</style>
