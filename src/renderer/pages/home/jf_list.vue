<template>
    <div class="home-list">
        <div class="title-line shrink0">积分清单</div>
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
                <div class="title">用户ID</div>
                <el-input v-model="user_id" placeholder="可输入部分" />
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
                <div class="title">销售实例ID</div>
                <el-input v-model="xs_instance_id" placeholder="可输入部分" />
            </div>

            <!-- 受理时间  -->
            <div class="flex-item">
                <!-- 请选择受理时间 -->
                <div class="title">账期</div>
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
            <el-button
                v-if="total > 0"
                style="margin-left: 10px;"
                type="success"
                :loading="outputLoading"
                @click="handleOutputDatas"
                size="mini"
                >导出查询结果</el-button
            >
            <el-button
                v-if="total > 0"
                style="margin-left: 10px;"
                type="success"
                :loading="outputLoading"
                @click="handleDeleteDatas"
                size="mini"
                >删除查询的数据(删了就没了)</el-button
            >
        </div>

        <div class="table-box flex1" ref="tableBox">
            <template v-if="tableHeight">
                <el-table :data="datas" style="width: 100%" :height="tableHeight">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="本地网">
                                    <span>{{ props.row.local }}</span>
                                </el-form-item>
                                <el-form-item label="应兑换积分">
                                    <span>{{ props.row.ydjf }}</span>
                                </el-form-item>
                                <el-form-item label="清算">
                                    <span>{{ props.row.qs || 0 }}</span>
                                </el-form-item>
                                <el-form-item label="本期兑换">
                                    <span>{{ props.row.bqdh }}</span>
                                </el-form-item>
                                <el-form-item label="结算积分">
                                    <span>{{ props.row.jf_jiesuan }}</span>
                                </el-form-item>
                                <el-form-item label="合约计划">
                                    <span>{{ props.row.hyjh || '-' }}</span>
                                </el-form-item>
                                <el-form-item label="入网时间">
                                    <span>{{ props.row.rw_date | parseDate }}</span>
                                </el-form-item>
                                <el-form-item label="积分规则名称">
                                    <span>{{ props.row.jf_name }}</span>
                                </el-form-item>
                                <el-form-item label="积分类型">
                                    <span>{{ props.row.jf_type }}</span>
                                </el-form-item>
                                <el-form-item label="县公司">
                                    <span>{{ props.row.company }}</span>
                                </el-form-item>

                                <el-form-item label="销售人员">
                                    <span>{{ props.row.xs_name }}</span>
                                </el-form-item>
                                <el-form-item label="销售人员工号">
                                    <span>{{ props.row.xs_id }}</span>
                                </el-form-item>
                                <el-form-item label="活动名称">
                                    <span>{{ props.row.event_name }}</span>
                                </el-form-item>

                                <el-form-item label="用户ID">
                                    <span>{{ props.row.user_id }}</span>
                                </el-form-item>
                                <el-form-item label="产品名称">
                                    <span>{{ props.row.cp_type }}</span>
                                </el-form-item>
                                <el-form-item label="门店名称">
                                    <span>{{ props.row.md_name }}</span>
                                </el-form-item>
                                <el-form-item label="门店编码">
                                    <span>{{ props.row.md_code }}</span>
                                </el-form-item>
                                <el-form-item label="门店工号">
                                    <span>{{ props.row.md_id }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column v-for="(v, i) in columns" :key="i" :prop="i" :label="v"> </el-table-column>
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
import download from '@/utils/download.js'
import { deleteZhangqi2Qingdan } from '@/utils/zhangqi.js'
export default {
    name: 'blist',
    data() {
        return {
            outputLoading: false, //导出中
            datas: [],
            total: 0,
            page: 1,
            user_id: '', //用户ID
            not_found_user: '', //没有找到业务ID
            date: '', //账期
            created: '', //创建时间
            branch: '', //网点
            xs_instance_id: '',
            user_number: '', //业务号码
            package_name: '',
            package_name_arr: [],
            order_id: '', //订单号码
            columns: {
                date: '账期',
                xs_instance_id: '销售实例ID',
                user_number: '用户号码',
                package_name: '入网套餐',
                md_name: '门店名称',
                acceptor: '受理人',
                user: '揽收人',
                acno: '是否有受理清单'
            }
        }
    },
    filters: {
        parseDate(v) {
            return dayjs.unix(v).format('YYYY-MM-DD hh:ss:mm')
        }
    },
    created() {
        this.onFetchDatas()
        this.onFetchDatasCount()
    },
    methods: {
        handleDeleteDatas() {
            // 删除山鹑的结果
            this.$confirm('该操作会删除所选条件下的所有数据且不可恢复!', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    let where = this.onParseSearchSQL()

                    let delSql = `select id from jifen b where ${where}`
                    this.$db.all(delSql, (err, res) => {
                        if (res.length) {
                            let ids = res.map(e => e.id)
                            console.log(delSql, ids)
                            let sql = `delete from jifen where id in (${ids.join(',')})`

                            this.$db.run(sql, (err, res) => {
                                if (!err) {
                                    this.$message({
                                        message: '数据已删除',
                                        type: 'success'
                                    })
                                }
                                deleteZhangqi2Qingdan(ids, 'jifen')
                                this.onFetchDatas()
                            })
                        }
                    })

                    /*let sql = `delete from jifen where  ${where}`

                    this.$db.run(sql, (err, res) => {
                        console.log(err, res)
                        if (!err) {
                            this.$message({
                                message: '数据已删除',
                                type: 'success'
                            })
                        }
                        this.datas = []
                    })*/
                })
                .catch(err => {
                    console.log(err)
                })
        },
        handleOutputDatas() {
            this.outputLoading = true
            let where = this.onParseSearchSQL()
            const sql = `select b.*,a.acceptor,a.user,a.action_no as acno from jifen j left join accept a on (a.user_number=b.user_number or a.action_no=b.user_number) where ${where}`
            this.$db.all(sql, (err, res = []) => {
                this.$logger({ res, sql })
                // this.datas = res
                if (res && res.length > 0) {
                    let json = {
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
                        ydjf: '应兑换积分',
                        acceptor: '受理人',
                        user: '揽收人',
                        acno: '是否结算成功（是否有对应受理清单）'
                    }

                    let datas = this.parseAoaData(res, json)
                    const name = `查询 结算清单`

                    this.onDownload([{ datas }], name)
                } else {
                    this.$message({
                        showClose: true,
                        message: `没有相关数据或获取数据失败`,
                        type: 'error'
                    })
                    this.outputLoading = false
                }
            })
        },
        onDownload(datas, name) {
            download
                .excel2(datas, name)
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
        handleCurrentChange(page) {
            this.page = page
            this.onFetchDatas()
        },
        onParseSearchSQL() {
            // 8、受理时间 开始－结束，如果只有开始，就是大于，只有结束，就是小于
            // 9、竣工时间同上 到天
            // 7、业务号码（模糊查询）
            let where = []
            if (this.user_id && this.user_id !== '') {
                where.push(`b.user_id like '%${this.user_id}%'`)
            }
            if (this.date && this.date !== '') {
                let a = dayjs(this.date).format('YYYYMM')
                where.push(`b.date = ${a}`)
            }
            if (this.created && this.created !== '') {
                let date = this.created
                let a = dayjs(date)
                    .startOf('month')
                    .unix()
                let b = dayjs(date)
                    .endOf('month')
                    .unix()
                where.push(`b.created between ${a} and ${b}`)
            }
            if (this.not_found_user && this.not_found_user !== '') {
                where.push(`b.not_found_user = 1`)
            }
            if (this.package_name !== '') {
                where.push(`b.package_name = '${this.package_name}'`)
            }

            if (this.user_number !== '') {
                where.push(`b.user_number like '%${this.user_number}%'`)
            }
            if (this.order_id !== '') {
                where.push(`b.order_id like '%${this.order_id}%'`)
            }

            // 查询开始结束
            if (this.branch) {
                where.push(`b.branch = '${this.branch}'`)
            }

            if (where.length > 0) {
                where = where.join(' and ')
                where = `${where}`
            } else {
                where = 'true'
            }
            return where
        },
        onFetchDatas() {
            let start = (this.page - 1) * 20
            let limit = `limit ${start}, 20`
            let where = this.onParseSearchSQL()
            // const sql = `select b.* from jifen b where ${where} ${limit}`
            const sql = `select b.*,a.acceptor,a.user,a.action_no as acno from jifen b left join accept a on (a.user_number=b.user_number or a.action_no=b.user_number) where  ${where} ${limit}`

            this.$db.all(sql, (err, res = []) => {
                this.$logger({ res, sql })
                this.datas = res
            })
        },
        onFetchDatasCount() {
            let where = this.onParseSearchSQL()
            const sql = `select count(*) as total from jifen b where ${where}`

            this.$db.get(sql, (err, res) => {
                this.$logger({ count: res, err })
                if (!err && res) {
                    this.total = res.total
                }
            })
        },
        onSearch(flag) {
            if (flag === 'clear') {
                this.date = '' //账期
                this.created = '' //创建时间
                this.branch = '' //网点
                this.user_number = '' //业务号码
                this.not_found_user = ''
                this.package_name = ''
                this.user_number = ''
                this.order_id = ''
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
                    this.$logger(err)
                } else {
                    this.$logger(res)
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e)
                    this.$set(this, `package_name_arr`, data)
                }
            })
        }
    }
}
</script>
