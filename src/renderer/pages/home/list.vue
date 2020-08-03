<template>
    <div class="home-list">
        <div class="title-line shrink0">结算清单</div>
        <div class="flex">
            <!-- 产品名称 -->
            <div class="flex-item">
                <div class="title">选择套餐名称</div>
                <el-select
                    v-model="package_name"
                    placeholder="选择套餐名称"
                    filterable
                    @click.native="onFetchProductMain"
                >
                    <el-option :label="v" :value="v" v-for="(v, i) in package_name_arr" :key="i"></el-option>
                </el-select>
            </div>
            <div class="flex-item">
                <div class="title">状态</div>
                <el-select v-model="status" placeholder="状态" filterable>
                    <el-option :label="v.v" :value="v.i" v-for="(v, i) in status_arr" :key="i"></el-option>
                </el-select>
            </div>
            <div class="flex-item">
                <div class="title">其他</div>
                <el-select v-model="not_found_user" placeholder="其他" filterable>
                    <el-option label="未找到业务ID" value="1"></el-option>
                </el-select>
            </div>
            <div class="flex-item">
                <div class="title">业务号码</div>
                <el-input v-model="user_number" placeholder="可输入部分" />
            </div>
        </div>
        <div class="flex">
            <div class="flex-item">
                <div class="title">订单号码</div>
                <el-input v-model="order_id" placeholder="可输入部分" />
            </div>

            <!-- 受理时间  -->
            <div class="flex-item">
                <!-- 请选择受理时间 -->
                <div class="title">账期</div>
                <!--                <el-date-picker v-model="created" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions">
                </el-date-picker> -->
                <el-date-picker v-model="date" type="month" placeholder="选择月"> </el-date-picker>
            </div>
            <!-- 竣工时间  -->
            <div class="flex-item">
                <div class="title">写入时间</div>
                <el-date-picker v-model="created" type="month" placeholder="选择月"> </el-date-picker>
            </div>
            <div class="flex-item">
                <div class="title">操作</div>
                <el-button @click="onSearch" type="primary">查询</el-button>
                <el-button @click="onSearch(`clear`)" type="default">清除</el-button>
            </div>
        </div>
        <div class="title-line shrink0">
            结算清单列表
            <small
                >共有<b>{{ total }}</b
                >条数据</small
            >
        </div>

        <div class="table-box flex1" ref="tableBox">
            <template v-if="tableHeight">
                <el-table :data="datas" style="width: 100%" :height="tableHeight">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="订单号">
                                    <span>{{ props.row.order_id }}</span>
                                </el-form-item>
                                <el-form-item label="竣工时间">
                                    <span>{{ props.row.complete_date }}</span>
                                </el-form-item>
                                <el-form-item label="佣金结算策略">
                                    <span>{{ props.row.commission_policy }}</span>
                                </el-form-item>
                                <el-form-item label="佣金结算类型">
                                    <span>{{ props.row.commission_type }}</span>
                                </el-form-item>
                                <el-form-item label="佣金金额">
                                    <span>{{ props.row.commission_money }}</span>
                                </el-form-item>
                                <el-form-item label="原因">
                                    <span>{{ props.row.cause }}</span>
                                </el-form-item>
                                <el-form-item label="写入时间">
                                    <span>{{ props.row.created | parseDate }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column v-for="(v, i) in columns" :prop="i" :label="v"> </el-table-column>
                    <!-- <el-table-column prop="no" label="购物车流水号"> </el-table-column> -->
                </el-table>
            </template>
        </div>
        <el-pagination
            class="pagination"
            @current-change="handleCurrentChange"
            :hide-on-single-page="false"
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
import dayjs from 'dayjs'
export default {
    name: 'blist',
    data() {
        return {
            datas: [],
            total: 0,
            page: 1,
            not_found_user: '', //没有找到业务ID
            status: '', //-1:全部，1:成功,0失败，2:没找到业务ID
            status_arr: [
                { i: -1, v: '全部' },
                { i: 1, v: '结算成功' },
                { i: 0, v: '结算失败' }
            ],
            date: '', //账期
            created: '', //创建时间
            branch: '', //网点
            user_number: '', //业务号码
            package_name: '',
            package_name_arr: [],
            order_id: '', //订单号码
            columns: {
                date: '账期',
                // order_id: '订单号',
                // complete_date: '竣工时间',
                // commission_policy: '佣金结算策略',
                // commission_type: '佣金结算类型',
                // commission_money: '佣金金额',
                package_name: '套餐名称',
                product_name: '产品名称',
                user_id: '用户ID',
                user_number: '用户号码',
                status: '是否结算成功',
                // cause: '原因',
                // not_found_user: '没有找到业务ID',
                branch: '网点'
                // created: '写入时间'
            }
        }
    },
    filters: {
        parseDate(v) {
            return dayjs(v * 1000).format('YYYY-MM-DD hh:ss:mm')
            // let date = new Date(v * 1)
            // console.log(v, date)
            // return `${date.getFullYear()}年${date.getMonth() +
            //     1}月${date.getDay()}日 ${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}秒`
        }
    },
    created() {
        const { created, status } = this.$route.query
        console.log('xxxxxxxx', this.$route)
        if (created) {
            this.created = created
        }
        if (status !== undefined) {
            this.status = status
        }
        this.onFetchDatas()
        this.onFetchDatasCount()
    },
    methods: {
        handleCurrentChange(page) {
            this.page = page
            this.onFetchDatas()
        },
        onParseSearchSQL() {
            // 8、受理时间 开始－结束，如果只有开始，就是大于，只有结束，就是小于
            // 9、竣工时间同上 到天
            // 7、业务号码（模糊查询）
            let where = []
            // 按条件查询查询
            if (this.status !== '') {
                where.push(`status='${this.status}'`)
            }
            if (this.date && this.date !== '') {
                let a = dayjs(this.date).format('YYYYMM')
                where.push(`date = ${a}`)
            }
            if (this.created && this.created !== '') {
                let date = this.created
                let a = dayjs(date)
                    .startOf('month')
                    .unix()
                let b = dayjs(date)
                    .endOf('month')
                    .unix()
                where.push(`created between ${a} and ${b}`)
            }
            if (this.not_found_user && this.not_found_user !== '') {
                where.push(`not_found_user = 1`)
            }
            if (this.package_name !== '') {
                where.push(`package_name = '${this.package_name}'`)
            }

            if (this.user_number !== '') {
                where.push(`user_number like '%${this.user_number}%'`)
            }
            if (this.order_id !== '') {
                where.push(`order_id like '%${this.order_id}%'`)
            }

            // 查询开始结束
            if (this.branch) {
                where.push(`branch = '${this.branch}'`)
            }

            if (where.length > 0) {
                where = where.join(' and ')
                where = `where ${where}`
            } else {
                where = ''
            }
            return where
        },
        onFetchDatas() {
            let start = (this.page - 1) * 20
            let limit = `limit ${start}, 20`
            let where = this.onParseSearchSQL()
            const sql = `select * from bill ${where} ${limit}`
            this.$db.all(sql, (err, res = []) => {
                console.log({ res, sql })
                this.datas = res
            })
        },
        onFetchDatasCount() {
            let where = this.onParseSearchSQL()
            const sql = `select count(*) as total from bill ${where}`

            this.$db.get(sql, (err, res) => {
                // console.log({ count: res })
                if (!err && res) {
                    this.total = res.total
                }
            })
        },
        onSearch(flag) {
            if (flag === 'clear') {
                this.status = '' //-1:全部，1:成功,0失败，2:没找到业务ID
                this.date = '' //账期
                this.created = '' //创建时间
                this.branch = '' //网点
                this.user_number = '' //业务号码
            }
            this.page = 1

            this.onFetchDatas()
            this.onFetchDatasCount()
        },
        onFetchProductMain() {
            if (this.package_name_arr.length > 0) {
                return
            }
            const sql = `select package_name as val from bill group by package_name`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(res)
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e)
                    this.$set(this, `package_name_arr`, data)
                }
            })
        }
    }
}
</script>
