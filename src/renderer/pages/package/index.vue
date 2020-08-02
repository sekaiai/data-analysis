<template>
    <div id="package">
        <div class="title-line">
            受理清单以有套餐<el-button @click="onRefersh" style="margin-left: 10px;" type="text" size="mini">
                刷新数据
            </el-button>
        </div>
        <div class="tags-box">
            <el-tag v-for="(item,i) in product_mains" :key="i" type="info" effect="plain" size="medium">
                {{ item.val }}
                <span @click='handleTags2add(item.val)' v-if='!item.has' class="span">添加</span>
            </el-tag>
        </div>
        <div class="title-line">
            套餐管理<el-button @click="dialogVisible = true" style="margin-left: 10px;" type="text" size="mini">
                添加规则
            </el-button>
        </div>
        <div class="table-box flex1" ref="tableBox">
            <el-table :data="datas" :height="tableHeight" v-if="tableHeight">
                <el-table-column prop="name" label="发展套餐名称"> </el-table-column>
                <el-table-column prop="__count" label="本月待结算受理数"></el-table-column>
                <el-table-column prop="__nums" label="本月待受理清单"></el-table-column>
                <el-table-column prop="accept_count" label="关联受理清单"></el-table-column>
                <el-table-column prop="law" label="结算规律"> </el-table-column>
                <el-table-column prop="count" label="结算次数"> </el-table-column>
                <el-table-column prop="law_desc" label="结算说明"> </el-table-column>
                <el-table-column fixed="right" label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button @click.native.prevent="handleDeleteRow(scope.$index)" type="text" size="small">
                            删除
                        </el-button>
                        <el-button @click.native.prevent="handleEditRow(scope.row)" type="text" size="small">
                            修改
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog title="提示" :visible.sync="dialogVisible" width="500px" :before-close="handleClose" @close='isedit = 0'>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item prop="name" label="发展套餐名称">
                    <div class="taocao-tip">*必须与受理清单表和结算表中的套餐名称一致！</div>
                    <el-input v-model="ruleForm['name']"></el-input>
                </el-form-item>
                <el-form-item prop="count" label="结算次数">
                    <!-- <el-input v-model="ruleForm['count']"></el-input> -->
                    <div class="el-input">
                        <el-input-number v-model="ruleForm['count']" :min="1"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item prop="law" label="结算规律">
                    <div class="taocao-tip">
                        <p>每次结算时间用半角逗号分隔。每个逗号代表每次结算的间隔。</p>
                        <p style="line-height: 1.4;">例：某套餐次月开结算，之后每月都结算共结算3次。 填写1,0,0。0可以不填写。所以填写一个1就行了。</p>
                        <p>例：某套餐次月开始结算，共结算3次，每次结算周期加一月则写。 1,1,1</p>
                    </div>
                    <el-input v-model="ruleForm['law']"></el-input>
                </el-form-item>
                <el-form-item prop="law_desc" label="备注信息、结算说明">
                    <el-input v-model="ruleForm['law_desc']" type='textarea'></el-input>
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
        return {
            product_mains: [], //所有套餐
            dialogVisible: false,
            isedit: false, //是否是修改。
            ruleForm: {
                name: '', //名称
                // begin: '', //开始结算月份
                count: '', //结算次数
                law: '', //结算规律
                law_desc: '', //规律说明
            },
            rules: {
                name: [
                    { required: true, message: '请输入发展套餐名称', trigger: 'blur' },
                ],
                count: [{ required: true, message: '请输入结算次数', trigger: 'change' }],
                law: [{ required: true, message: '请输入结算次数规律', trigger: 'blur' }],
            },
            datas: [],
            items: {
                id: '序号',
                name: '发展套餐名称',
                count: '结算次数',
                law: '结算规律',
                law_desc: '结算说明',
                accept_count: '待结算受理数',
            }
        }
    },
    created() {
        this.onFetchDatas()
    },
    methods: {
        onRefersh() {
            this.onFetchDatas()

        },
        handleTags2add(v) {
            // 从tag添加套餐
            this.ruleForm = {
                name: v, //名称
                // begin: '', //开始结算月份
                count: '', //结算次数
                law: '', //结算规律
                law_desc: '', //规律说明
            }
            this.dialogVisible = true
        },
        remoteMethod(datas = []) {

            const key = 'product_main'
            const hasd = datas.map(e => e.name)
            const sql = `select ${key} as val from accept group by ${key}`
            this.$db.all(sql, (err, res) => {
                if (err) {
                    console.log({ err })
                } else {
                    console.log('xxxxxxxxx', { res })
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e).map(e => {

                        return {
                            val: e,
                            has: hasd.includes(e)
                        }
                    })
                    this.$set(this, `${key}s`, data)
                }
            })
        },
        handleEditRow({ name, count, law, law_desc, id }) {
            // 修改套餐
            this.isedit = id

            this.ruleForm = {
                name,
                count,
                law,
                law_desc,
            }
            this.dialogVisible = true

        },
        onFetchDatas() {
            const sql = 'select p.*,(select count(*) from accept i where i.product_main = p.name) as accept_count from package p'

            this.$db.all(sql, (err, res) => {
                console.log(err, res)
                if (!err) {
                    this.datas = res
                    this.remoteMethod(res)
                    this.onFetchSettle(res)
                }


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
                const sql = `select a.date_end,a.js_count from  accept as a where a.js_count < ${count} and product_main='${name}'`
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

            this.$set(this.datas[idx], '__count', result)
            this.$set(this.datas[idx], '__nums', __nums)

        },
        submitForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.onInsertDatabase()
                } else {
                    console.log('error submit!!')
                    this.$message({
                        type: 'error',
                        message: '请检查输入的内容是否正确'
                    })
                    return false
                }
            })
        },
        onInsertDatabase() {

            // console.log(sql)

            let sql = ''
            if (this.isedit) {

                let params = []
                for (let k in this.ruleForm) {
                    let v = this.ruleForm[k]
                    console.log(v)
                    if (k === 'name') {

                        v = v.toString().trim()

                    }
                    params.push(`${k}='${v}'`)
                }
                params = params.join(',')
                sql = `update package set ${params} where id=${this.isedit}`
            } else {
                const keys = Object.keys(this.ruleForm)
                const values = Object.values(this.ruleForm).join(`','`)
                sql = `INSERT INTO package (${keys}) VALUES ('${values}')`
            }
            console.log(sql)
            this.$db.run(sql, err => {
                if (err) {
                    this.$message({
                        type: 'error',
                        message: '该套餐已存在'
                    })
                } else {
                    this.onFetchDatas()
                    this.dialogVisible = false
                }
                console.log(err)
            })
        },
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        handleClose() {
            this.dialogVisible = false
            // 关闭dialog
        },
        handleAddPackage() {
            this.dialogVisible = true
        },
        handleDeleteRow(index, rows) {
            console.log(index, rows)

            this.$confirm('确定要删除该套餐吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                .then(() => {
                    const { id } = this.datas[index]
                    const sql = `delete from package where id = ${id}`
                    this.$db.run(sql, (err, res) => {
                        this.$message({
                            type: err ? 'error' : 'success',
                            message: err ? '删除失败' : '删除成功!'
                        })
                        if (!err) {
                            // 清楚该数据
                            // this.datas.splice(index, 1)
                            this.onFetchDatas()
                        }
                    })
                })
                .catch(err => {
                    this.$message({
                        type: 'error',
                        message: '删除失败'
                    })
                })
        },
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

    .el-tag {
        margin: 5px;
    }

    .span {
        color: red;
        cursor: pointer;
    }
}
</style>