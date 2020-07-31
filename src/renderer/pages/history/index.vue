<template>
    <div id="home">
        <div class="title-line shrink0">数据筛选</div>
        <div class="flex">
            <div class="flex-item">
                <div class="title">选择渠道名称</div>
                <el-select v-model="addr" placeholder="选择渠道名称" filterable>
                    <el-option :label="v" :value="v" v-for="(v, i) in addrs" :key="i"></el-option>
                </el-select>
            </div>

            <div class="flex-item">
                <div class="title">选择受理人</div>
                <el-select v-model="acceptor" placeholder="选择受理人" filterable>
                    <el-option :label="v" :value="v" v-for="(v, i) in acceptors" :key="i"></el-option>
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
                <div class="title">选择揽件人</div>
                <el-select v-model="user" placeholder="选择揽件人" filterable>
                    <el-option :label="v" :value="v" v-for="(v, i) in users" :key="i"></el-option>
                </el-select>
            </div>
        </div>
        <div class="flex line2">
            <!-- 业务动作 -->
            <!--   <div class="flex-item">
                <div class="title">选择业务动作</div>
                <el-select
                    v-model="action"
                    :remote-method="remoteMethod('action')"
                    placeholder="选择业务动作"
                    filterable
                >
                    <el-option :label="v" :value="v" v-for="(v, i) in actions" :key="i"></el-option>
                </el-select>
            </div> -->

            <!-- 业务号码 -->
            <div class="flex-item">
                <div class="title">业务号码</div>
                <el-input v-model="action_no" placeholder="业务号码，可输入部分" />
            </div>
            <!-- 受理时间  -->
            <div class="flex-item">
                <!-- 请选择受理时间 -->
                <div class="title">请选择受理时间</div>
                <el-date-picker
                    v-model="created"
                    type="daterange"
                    align="right"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions"
                >
                </el-date-picker>
            </div>
            <!-- 竣工时间  -->
            <div class="flex-item">
                <div class="title">请选择竣工时间</div>
                <!-- 请选择受理时间 -->
                <el-date-picker
                    v-model="date_end"
                    type="daterange"
                    align="right"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions"
                >
                </el-date-picker>

                <!-- <el-date-picker
                    v-model="date_end"
                    type="date"
                    :minTime="created"
                    placeholder="请选择受理时间"
                    align="right"
                    :picker-options="pickerOptions"
                >
                </el-date-picker> -->
            </div>

            <div class="flex-item">
                <div class="title">操作</div>

                <el-button @click="handleSearch" type="primary">查询</el-button>
                <el-button @click="handleSearch(`clear`)" type="default">清除</el-button>
            </div>
        </div>
        <div class="title-line shrink0">
            数据列表
            <small
                >共有<b>{{ total }}</b
                >条数据</small
            >
            <el-button style="margin-left: 20px;" @click="$router.push(`/history/add`)" type="primary" size="mini"
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
            <el-button style="margin-left: 10px;" :loading="deleteLoading" @click="handleDeleteDatas" size="mini"
                >清除查询结果(删除本地数据)</el-button
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

                            <el-form-item label="受理人">
                                <span>{{ props.row.acceptor }}</span>
                            </el-form-item>
                            <el-form-item label="业务动作">
                                <span>{{ props.row.action }}</span>
                            </el-form-item>

                            <el-form-item label="受理时间">
                                <span>{{ props.row.created | parseDate }}</span>
                            </el-form-item>
                            <el-form-item label="工单状态">
                                <span>{{ props.row.status }}</span>
                            </el-form-item>

                            <el-form-item label="竣工时间">
                                <span>{{ props.row.date_end | parseDate }}</span>
                            </el-form-item>

                            <el-form-item label="揽收人">
                                <span>{{ props.row.user }}</span>
                            </el-form-item>
                            <el-form-item label="导入时间">
                                <span>{{ props.row.import_date }}</span>
                            </el-form-item>
                            <el-form-item label="备注">
                                <span>{{ props.row.remark || '-' }}</span>
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column prop="action_no" label="业务号码"> </el-table-column>
                <el-table-column prop="product_name" label="产品名称"> </el-table-column>
                <el-table-column prop="product_type" label="角色名称"> </el-table-column>
                <el-table-column prop="product_main" label="所属主销售品"> </el-table-column>
                <el-table-column prop="area" label="地区"> </el-table-column>
                <el-table-column prop="addr" label="渠道名称"> </el-table-column>

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
            deleteLoading: false, //删除数据
            outputLoading: false,
            loading: false,
            qudao: '',
            analysisActiveName: 'all',
            fileList: [],
            datas: [],
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
        parseDate(v) {
            let date = new Date(v * 1)
            console.log(v, date)
            return `${date.getFullYear()}年${date.getMonth() +
                1}月${date.getDay()}日 ${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}秒`
        }
    },
    created() {
        this.onFetchDatas()
        this.onFetchCount()
        this.onFetchQudao()
        this.onFetchAcceptor()
        this.onFetchUser()
    },
    methods: {
        onFetchProductMain() {
            if (!this.product_mains.length) this.remoteMethod('product_name')
        },
        onFetchProductName() {
            if (!this.product_names.length) this.remoteMethod('product_name')
        },
        handleDeleteDatas() {
            this.$confirm(
                '删除前先点查询确认下是否是要删除的数据，该操作会删除所选条件下的所有数据且不可恢复。',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
                .then(() => {
                    let where = this.onParseSearchSQL()
                    console.log({ where })
                    if (!where) {
                        where = 'where true'
                    }

                    if (this.deleteLoading) {
                        return
                    }
                    this.deleteLoading = true

                    const sql = `delete from ITEMS ${where}`
                    this.$db.run(sql, (err, res) => {
                        console.log(err, res)
                        this.deleteLoading = false
                        this.$message({
                            type: err ? 'error' : 'success',
                            message: err ? '删除失败' : '数据已删除'
                        })
                        if (!err) {
                            this.handleSearch()
                        }
                    })
                })
                .catch(err => {
                    this.deleteLoading = false
                })
        },
        remoteMethod(key) {
            if (this[`${key}s`].length) {
                return
            }
            console.log('所属主销售品')
            const sql = `select ${key} as val from ITEMS group by ${key}`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e)
                    this.$set(this, `${key}s`, data)
                }
            })
        },
        handleCurrentChange(page) {
            console.log(page)
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
            if (this.user !== '') {
                where.push(`user='${this.user}'`)
            }
            if (this.addr !== '') {
                where.push(`addr='${this.addr}'`)
            }
            if (this.acceptor !== '') {
                where.push(`acceptor='${this.acceptor}'`)
            }

            // 查询开始结束
            if (this.created) {
                let [a, b] = this.created
                where.push(`created between ${a.getTime()} and ${b.getTime()}`)
            }
            if (this.date_end) {
                let [a, b] = this.date_end
                where.push(`date_end between ${a.getTime()} and ${b.getTime()}`)
            }
            // const a = false && this.created && this.created.getTime()
            // const b = false && this.date_end && this.date_end.getTime()
            // console.log(this.created)
            // if (a && b) {
            //     where.push(`created between ${a} and ${b}`)
            // } else if (a) {
            //     where.push(`created > ${a}`)
            // } else if (b) {
            //     where.push(`date_end < ${b}`)
            // }

            if (this.product_main) {
                where.push(`product_main='${this.product_main}'`)
            }
            if (this.action) {
                where.push(`action='${this.action}'`)
            }
            if (this.product_name) {
                where.push(`product_name='${this.product_name}'`)
            }
            if (this.action_no !== '') {
                where.push(`action_no like '%${this.action_no}%'`)
            }

            console.log({ where })
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
            console.log({ isClear })
            if (isClear == 'clear') {
                this.user = ''
                this.addr = ''
                this.acceptor = ''
                this.created = '' //受理时间
                this.date_end = '' //竣工时间
                this.product_main = '' //所属主销售品
                this.action = ''
                this.product_name = ''
            } else {
                where = this.onParseSearchSQL()
            }
            this.onFetchCount(where)
            this.onFetchDatas(where)
        },
        handleOutputDatas() {
            // 导出当前结果
            this.outputLoading = true
            const where = this.onParseSearchSQL()

            this.onFetchDatas(where, 0)
                .then(res => {
                    const datas = this.parseAoaData()
                    const name = `${where}`
                    const book_name = 'book_name'
                    console.log(datas)

                    download.excel2(datas, name, book_name).then(res => {
                        this.outputLoading = false

                        this.$message({
                            showClose: true,
                            message: `数据表格创建${!res ? '成功' : '失败'}`,
                            type: !res ? 'success' : 'error'
                        })
                    })
                })
                .catch(err => {
                    this.outputLoading = false
                })
        },
        parseAoaData() {
            const line1 = Object.values(this.items)
            const keys = Object.keys(this.items)
            console.log(line1, keys)
            const datas = this.datas.map(v => {
                return keys.map(k => v[k])
            })
            datas.unshift(line1)
            console.log(datas)
            return datas
        },
        onFetchUser() {
            // 查询揽件人
            const sql = `select user from ITEMS group by user`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                    // this.dataListTotalCount = res.totalCount;
                    this.users = res.map(e => e.user).filter(e => e)
                }
            })
        },
        onFetchAcceptor() {
            // 查询受理人
            const sql = `select acceptor from ITEMS group by acceptor`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                    // this.dataListTotalCount = res.totalCount;
                    this.acceptors = res.map(e => e.acceptor)
                }
            })
        },
        onFetchQudao() {
            // 查询渠道
            const sql = `select addr from ITEMS group by addr`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                    // this.dataListTotalCount = res.totalCount;
                    this.addrs = res.map(e => e.addr)
                }
            })
        },
        onFetchCount(whereSQL = '') {
            const sql = 'SELECT COUNT(id) AS totalCount from ITEMS ' + whereSQL
            this.$db.get(sql, (err, res) => {
                if (!err) {
                    this.total = res.totalCount
                }
            })
        },
        onFetchDatas(whereSQL = '', limit = 20) {
            console.log({ page: this.page })
            limit = limit ? `limit ${this.limit * (this.page - 1)}, ${this.limit}` : ''
            const sql = `select * from ITEMS ${whereSQL} ${limit}`

            console.log(sql)
            return new Promise((resolve, reject) => {
                this.$db.all(sql, (err, res) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        console.log(res)
                        // this.dataListTotalCount = res.totalCount;
                        this.datas = res
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
.flex-item {
    .title {
        font-size: 12px;
        color: #c0c4cc;
    }
}
</style>
