<template>
    <div id="pgk" v-loading.lock="loading">
        <div class="title-line" v-if="product_mains.length">
            未添加套餐<el-button @click="fetchDatas" style="margin-left: 10px;" type="text" size="mini">
                刷新数据
            </el-button>
        </div>
        <div class="tags-box" v-if="product_mains.length">
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
                        <el-button @click.native.prevent="deleteTaocan(scope.row.id)" type="text" size="small">
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
                        <el-input-number v-model="ruleForm['count_js']" :min="0"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item prop="law_js" label="结算规律（结算清单）">
                    <el-input v-model="ruleForm['law_js']"></el-input>
                </el-form-item>

                <el-form-item prop="count_jf" label="结算次数（积分）">
                    <!-- <el-input v-model="ruleForm['count']"></el-input> -->
                    <div class="el-input">
                        <el-input-number v-model="ruleForm['count_jf']" :min="0"></el-input-number>
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
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(customParseFormat)
import { insertZhangqi, updateZhangqi, deleteZhangqi } from '@/utils/zhangqi'

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
            dateFormatArr: ['YYYY/M/D HH:mm:ss', 'YYYY-M-D HH:mm:ss'],
            loading: false,
            page: 1,
            product_mains: [], //所有套餐
            isShowAddTaocan: false,
            isedit: false, //是否是修改。
            ruleForm: {
                name: '', //名称
                // begin: '', //开始结算月份
                count_js: 0, //结算次数
                law_js: '', //结算规律
                count_jf: 0, //结算次数
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
                count_js: 0, //结算次数
                law_js: '', //结算规律
                law_jf: '', //结算规律
                count_jf: 0, //结算次数
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
            this.loading = true
            this.$db.run(sql, (err, res) => {
                if (err) {
                    this.loading = false

                    this.$message({
                        type: 'error',
                        message: err.message
                    })
                } else {
                    if (!this.isedit) {
                        this.$db.get(`select last_insert_rowid() as id from pgk`, (err, res) => {
                            updateZhangqi(res.id).then(res => {
                                this.loading = false
                            })
                        })
                    } else {
                        updateZhangqi(this.isedit).then(res => {
                            this.loading = false
                        })
                    }

                    this.isShowAddTaocan = false

                    // 更新账期数据
                    this.fetchDatas()
                }
                this.$logger(err)
            })
        },

        /*
         * 重写账期，以及更新账期state
         * 1. 先删除当前套餐关联的说有账期
         * 2. 根据套餐添加新账期
         * 3. 根据结算清单和积分清单 重新统计账期
         * id => 套餐id
         */
        updateZhangqi(id) {
            console.log('updateZhangqi')
            // todo: 计算 结算清单和积分清单

            // updateZhangqi(id).then(res => {
            //     console.log('fakdjflkadf',res)
            // })
            const x = updateZhangqi(id).then(res => {
                this.loading = false
            })
            console.log('xxxxxxxxxxxxxxxxx', x)
        },

        // 重置form内容
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },

        // 删除套餐，id: 套餐ID
        deleteTaocan(id) {
            this.$confirm('确定要删除该套餐吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    // const { id } = this.datas[index]
                    const sql = `delete from pgk where id = ${id}`
                    this.$db.run(sql, (err, res) => {
                        console.log(err, res)

                        this.$message({
                            type: err ? 'error' : 'success',
                            message: err ? '删除失败：' + err.message : '删除成功!'
                        })
                        if (!err) {
                            // 清楚该数据
                            // this.datas.splice(index, 1)
                            this.fetchDatas()
                            // 删除相关账期数据
                            deleteZhangqi(id)
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
