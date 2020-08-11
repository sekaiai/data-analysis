<template>
    <div id="pgk">
        <div class="title-line" v-if="product_mains.length">
            未添加套餐<el-button @click="fetchDatas" style="margin-left: 10px;" type="text" size="mini">
                刷新数据
            </el-button>
        </div>
        <div class="tags-box">
            <el-tag v-for="(item, i) in product_mains" :key="i" type="info" effect="plain" size="medium">
                {{ item }}
                <span @click="openAddTaocan(item)" class="span">添加</span>
            </el-tag>
        </div>
        <div class="title-line">
            套餐管理<el-button @click="isShowAddTaocan = true" style="margin-left: 10px;" type="text" size="mini">
                添加规则
            </el-button>
        </div>
        <div class="table-box flex1">
            <el-table :data="datas" height="60vh">
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <div class="flex-item">
                            <div class="title">结算说明</div>
                            <div class="desc">{{ props.row.law_desc || '-' }}</div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="name" label="发展套餐名称" width="300"> </el-table-column>
                <!-- <el-table-column prop="__count" label="本月待结算受理数"></el-table-column> -->
                <!-- <el-table-column prop="__nums" label="本月待受理清单"></el-table-column> -->
                <!-- <el-table-column prop="accept_count" label="关联受理清单"></el-table-column> -->
                <el-table-column prop="law_js" label="结算规律（结算清单）"> </el-table-column>
                <el-table-column prop="count_js" label="结算次数（结算清单）"> </el-table-column>
                <el-table-column prop="law_jf" label="结算规律（积分）"> </el-table-column>
                <el-table-column prop="count_jf" label="结算次数（积分）"> </el-table-column>
                <el-table-column fixed="right" label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button @click.native.prevent="deleteTaocan(scope.$index)" type="text" size="small">
                            删除
                        </el-button>
                        <el-button @click.native.prevent="editTaocan(scope.row)" type="text" size="small">
                            修改
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog
            title="提示"
            :visible.sync="isShowAddTaocan"
            width="500px"
            :before-close="
                () => {
                    isShowAddTaocan = false
                }
            "
            @close="isedit = 0"
        >
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item prop="name" label="发展套餐名称">
                    <div class="taocao-tip">*必须与受理清单表和结算表中的套餐名称一致！</div>
                    <el-input v-model="ruleForm['name']"></el-input>
                </el-form-item>
                <el-form-item prop="count_js" label="结算次数（结算清单）">
                    <!-- <el-input v-model="ruleForm['count']"></el-input> -->
                    <div class="el-input">
                        <el-input-number v-model="ruleForm['count_js']" :min="1"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item prop="law_js" label="结算规律（结算清单）">
                    <el-input v-model="ruleForm['law_js']"></el-input>
                </el-form-item>

                <el-form-item prop="count_jf" label="结算次数（积分）">
                    <!-- <el-input v-model="ruleForm['count']"></el-input> -->
                    <div class="el-input">
                        <el-input-number v-model="ruleForm['count_jf']" :min="1"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item prop="law_jf" label="结算规律（积分）">
                    <el-input v-model="ruleForm['law_jf']"></el-input>
                </el-form-item>

                <el-form-item prop="law_desc" label="备注信息、结算说明">
                    <el-input v-model="ruleForm['law_desc']" type="textarea"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
import dayjs from 'dayjs'

export default {
    data() {
        var validatePass = (rule, value, callback) => {
            if (!/^(\d|,)+$/.test(value)) {
                callback(new Error('只能输入数字和半角逗号，不能包含括号'))
            } else {
                callback()
            }
        }
        var validateInt = (rule, value, callback) => {
            if (!/^\d+$/.test(value)) {
                callback(new Error('请输入数字'))
            } else {
                callback()
            }
        }
        return {
            page: 1,
            product_mains: [], //所有套餐
            isShowAddTaocan: false,
            isedit: false, //是否是修改。
            ruleForm: {
                name: '', //名称
                // begin: '', //开始结算月份
                count_js: 1, //结算次数
                law_js: '', //结算规律
                count_jf: 1, //结算次数
                law_jf: '', //结算规律
                law_desc: '' //规律说明
            },
            rules: {
                name: [{ required: true, message: '请输入发展套餐名称', trigger: 'blur' }],
                count_js: [{ required: true, message: '请输入结算次数', trigger: 'blur' }],
                count_jf: [{ required: true, message: '请输入结算次数', trigger: 'blur' }],
                law_jf: [
                    { required: true, message: '请输入结算次数规律', trigger: 'blur' },
                    { validator: validatePass }
                ],
                law_js: [
                    { required: true, message: '请输入结算次数规律', trigger: 'blur' },
                    { validator: validatePass }
                ]
            },
            datas: []
        }
    },
    created() {
        this.fetchDatas()
    },
    methods: {
        openAddTaocan(v) {
            // 从tag添加套餐
            this.ruleForm = {
                name: v, //名称
                // begin: '', //开始结算月份
                count_js: 1, //结算次数
                law_js: '', //结算规律
                law_jf: '', //结算规律
                count_jf: 1, //结算次数
                law_desc: '' //规律说明
            }
            this.isShowAddTaocan = true
        },
        // 获取所有套餐，然后匹配出没有添加的套餐
        getTaocan(datas = []) {
            const key = 'product_main'
            const hasd = datas.map(e => e.name)
            const sql = `select ${key} as val from accept group by ${key}`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    this.$logger(err)
                } else {
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e && !hasd.includes(e))
                    this.$set(this, `${key}s`, data)
                }
            })
        },
        editTaocan(datas) {
            const { name, count, law, law_desc, id } = datas
            // 修改套餐
            this.isedit = id

            this.ruleForm = datas
            this.isShowAddTaocan = true
        },
        fetchDatas() {
            const sql = 'select p.* from pgk p'

            this.$db.all(sql, (err, res) => {
                this.$logger(err, res)
                if (!err) {
                    this.datas = res
                    this.getTaocan(res)
                }
            })
        },
        submitForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.addTaocan()
                } else {
                    this.$message({
                        type: 'error',
                        message: '请检查输入的内容是否正确'
                    })
                    return false
                }
            })
        },
        addTaocan() {
            let sql = ''
            if (this.isedit) {
                let params = []
                for (let k in this.ruleForm) {
                    let v = this.ruleForm[k]
                    if (k === 'name') {
                        v = v.toString().trim()
                    }
                    params.push(`${k}='${v}'`)
                }
                params = params.join(',')
                sql = `update pgk set ${params} where id=${this.isedit}`
            } else {
                const keys = Object.keys(this.ruleForm)
                const values = Object.values(this.ruleForm).join(`','`)
                sql = `INSERT INTO pgk (${keys}) VALUES ('${values}')`
            }
            this.$db.run(sql, (err, res) => {
                console.log('---------------', err, res)
                if (err) {
                    this.$message({
                        type: 'error',
                        message: err.message
                    })
                } else {
                    if (!this.isedit) {
                        this.$db.get(`select last_insert_rowid() as id from pgk`, (err, res) => {
                            console.log(err, res)
                            this.updateZhangqi(res.id)
                        })
                    } else {
                        this.updateZhangqi(this.isedit)
                    }

                    this.isShowAddTaocan = false

                    // 更新账期数据
                    this.fetchDatas()
                }
                this.$logger(err)
            })
        },
        // 获取单个套餐内容
        fetchTaocanItem(id) {
            return new Promise(reslove => {
                this.$db.get(`select * from pgk where id=${id}`, (err, res = {}) => {
                    reslove(res)
                })
            })
        },
        // 获取受理清单列表， name = 套餐名称
        fetchAcceptLists(name) {
            return new Promise(reslove => {
                const sql = `select * from accept where product_main = '${name}'`
                this.$db.get(sql, (err, res = []) => {
                    console.log('fetchAcceptLists', err, res)
                    reslove([res])
                })
            })
        },
        /*
         * 更新账期数据
         * id 套餐id
         * law 结算周期
         * count 结算次数
         */
        async updateZhangqi(id) {
            // const  = res

            let { name, count_js, count_jf, law_jf, law_js } = await this.fetchTaocanItem(id)

            let accepts = await this.fetchAcceptLists(name)

            // 组装每月结算间隔
            law_js = law_js.toString().split(',')
            law_js.length = count_js
            law_js = Array.from(law_js, e => e | 0 || 1)

            // 组装每月结算间隔
            law_jf = law_jf.toString().split(',')
            law_jf.length = count_js
            law_jf = Array.from(law_jf, e => e | 0 || 1)

            console.log({ law_js, accepts })

            for (let i = 0; i < accepts.length; i++) {
                let { date_end, id: accept_id } = accepts[i]
                let date_jf = dayjs.unix(date_end).format('YYYYMM')
                let date_js = date_jf

                // 创建结算(js)清单账期数据
                for (let i = 0; i < law_js.length; i++) {
                    date_js = dayjs(date_js, 'YYYYMM')
                        .add(law_js[i], 'month')
                        .format('YYYYMM')

                    this.$db.run(
                        `insert into zhangqi (list_id, pgk_id, date, type) values (${accept_id},${id},${date_js}, 1)`,
                        (err, res) => {
                            console.log('zhangqi', err, res)
                        }
                    )
                }

                // 创建结算积分(jf)账期数据
                for (let i = 0; i < law_jf.length; i++) {
                    date_jf = dayjs(date_jf, 'YYYYMM')
                        .add(law_jf[i], 'month')
                        .format('YYYYMM')

                    this.$db.run(
                        `insert into zhangqi (list_id, pgk_id, date, type) values (${accept_id},${id},${date_jf}, 2)`,
                        (err, res) => {
                            console.log('zhangqi ', err, res)
                        }
                    )
                }
            }
        },
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        /**
         * 删除账期
         * id int 套餐ID
         */
        deleteZhangqi(id) {
            const sql = `delete from zhangqi where pgk_id=${id}`
            this.$db.run(sql, (err, res) => {
                console.log(err, res)
            })
        },
        deleteTaocan(index, rows) {
            this.$confirm('确定要删除该套餐吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    const { id } = this.datas[index]
                    const sql = `delete from pgk where id = ${id}`
                    this.$db.run(sql, (err, res) => {
                        this.$message({
                            type: err ? 'error' : 'success',
                            message: err ? '删除失败' : '删除成功!'
                        })
                        if (!err) {
                            // 清楚该数据
                            // this.datas.splice(index, 1)
                            this.fetchDatas()
                            // 删除相关账期数据
                            this.deleteZhangqi(id)
                        }
                    })
                })
                .catch(err => {
                    this.$message({
                        type: 'error',
                        message: '删除失败'
                    })
                })
        }
    }
}
</script>
<style lang="less">
.taocao-tip {
    font-size: smaller;
    color: red;
}

.tags-box {
    display: flex;
    flex-wrap: wrap;
    margin-left: -5px;
    margin-right: -5px;
    overflow: auto;
    height: calc(40vh - 156px);

    .el-tag {
        margin: 5px;
    }

    .span {
        color: red;
        cursor: pointer;
    }
}
</style>
