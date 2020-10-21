<template>
    <div id="pgk" v-loading.lock="loading">
        <!-- <div @click="computedZhangqiState2()">computedZhangqiState2</div> -->
        <div @click="addTaocan2">立即创建</div>
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
            <el-button @click="importTaocan" style="margin-left: 10px;" type="text" size="mini">
                导入规则
            </el-button>
            <el-button @click="deleteAllTaocan" style="margin-left: 10px;" type="text" size="mini">
                删除全部套餐
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

                <el-table-column prop="name" label="发展套餐名称" width="200"> </el-table-column>
                <el-table-column prop="alias" label="套餐别名" width="200">
                    <template slot-scope="props">
                        <template v-if="props.row.alias">
                            <p v-for="(v, i) in formatAlias(props.row.alias)" :key="i">{{ v }}</p>
                        </template>
                        <template v-else>-</template>
                    </template>
                </el-table-column>

                <el-table-column prop="type" label="结算类型" width="200">
                    <template slot-scope="props">
                        <template v-if="props.row.type == 1">
                            普通结算
                        </template>
                        <template v-else>
                            积分结算
                        </template>
                    </template>
                </el-table-column>
                <el-table-column prop="fuka" label="关联副卡" width="200">
                    <template slot-scope="props">
                        <template v-if="props.row.fuka == 1">
                            是
                        </template>
                        <template v-else>
                            否
                        </template>
                    </template>
                </el-table-column>

                <el-table-column prop="alias" label="账期规则" width="200">
                    <template slot-scope="props">
                        <p v-for="(v, i) in formatRules(props.row.rules)" :key="i">{{ v }}</p>
                    </template>
                </el-table-column>
                <el-table-column prop="alias" label="结算规则" width="200">
                    <template slot-scope="props">
                        <p v-for="(v, i) in formatRules(props.row.js_rules)" :key="i">{{ v }}</p>
                    </template>
                </el-table-column>

                <!-- <el-table-column prop="__count" label="本月待结算受理数"></el-table-column> -->
                <!-- <el-table-column prop="__nums" label="本月待受理清单"></el-table-column> -->
                <el-table-column prop="accept_count" label="统计">
                    <el-table-column prop="accept_count" label="需要结算"></el-table-column>
                    <el-table-column prop="yjs" label="已结算"></el-table-column>
                </el-table-column>

                <el-table-column prop="accept_count" label="结算规律">
                    <el-table-column prop="count_js" label="次数"> </el-table-column>
                    <el-table-column prop="law_js" label="规律"> </el-table-column>
                </el-table-column>

                <el-table-column fixed="right" label="操作" width="160">
                    <template slot-scope="scope">
                        <el-button @click.native.prevent="deleteTaocan(scope.row.id)" type="text" size="small">
                            删除
                        </el-button>
                        <el-button @click.native.prevent="editTaocan(scope.row)" type="text" size="small">
                            修改
                        </el-button>
                        <el-button
                            style="margin-left: 0"
                            @click.native.prevent="openNoneDatas(scope.row)"
                            type="text"
                            size="small"
                        >
                            导出出错数据
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog
            title="提示"
            :visible.sync="isShowAddTaocan"
            width="800px"
            :before-close="
                () => {
                    isShowAddTaocan = false
                }
            "
            @close="isedit = 0"
        >
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item prop="type" label="套餐结算类型">
                    <el-radio-group v-model="ruleForm['type']">
                        <el-radio :label="1">普通结算</el-radio>
                        <el-radio :label="2">积分结算</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item prop="fuka" label="是否关联副卡">
                    <el-radio-group v-model="ruleForm['fuka']">
                        <el-radio :label="1">关联</el-radio>
                        <el-radio :label="2">不关联</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item prop="name" label="发展套餐名称">
                    <div class="taocao-tip">*必须与受理清单表和结算表中的套餐名称一致！</div>
                    <el-input v-model="ruleForm['name']"></el-input>
                </el-form-item>
                <el-form-item prop="alias" label="发展套餐别名">
                    <div class="taocao-tip">多个套餐别名用回车换行</div>
                    <el-input v-model="ruleForm['alias']" type="textarea"></el-input>
                </el-form-item>
                <ul class="alias">
                    <li v-for="(v, i) in aliasList" :key="i">{{ v }}</li>
                </ul>
                <div class="title-line">结算规则</div>

                <el-form-item prop="count" label="结算次数（结算清单）">
                    <!-- <el-input v-model="ruleForm['count']"></el-input> -->
                    <div class="el-input">
                        <el-input-number v-model="ruleForm['count']" :min="0"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item prop="law" label="结算规律（结算清单）">
                    <el-input v-model="ruleForm['law']"></el-input>
                </el-form-item>

                <div class="title-line">账期条件</div>

                <el-form-item
                    label="结算次数"
                    v-for="(domain, index) in ruleForm.rules"
                    :label="'条件' + (index + 1)"
                    :key="domain.key"
                    :prop="'rules.' + index"
                >
                    <div class="flex">
                        <el-select v-model="domain.k" placeholder="字段">
                            <el-option :label="k" :value="v" v-for="(k, v) in acceptKeys" :key="k"></el-option>
                        </el-select>

                        <el-select v-model="domain.c" placeholder="条件" style="width: 80px; ">
                            <el-option label="等于" value="="></el-option>
                            <el-option label="大于" value=">"></el-option>
                            <el-option label="小于" value="<"></el-option>
                            <el-option label="不等于" value="!"></el-option>
                        </el-select>
                        <el-input v-model="domain.v" placeholder="结果" style="width: 220px"></el-input>
                        <el-button @click.prevent="removeDomain(domain)">删除</el-button>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button @click="addDomain()">新增条件</el-button>
                </el-form-item>

                <div class="title-line">结算条件</div>
                <p>默认条件：结算套餐名称=受理套餐名称，结算用户号码=受理用户号码</p>

                <el-form-item
                    v-for="(domain, index) in ruleForm.js_rules"
                    :label="'条件' + (index + 1)"
                    :key="domain.key"
                    :prop="'rules.' + index"
                >
                    <div class="flex">
                        <el-select v-model="domain.k" placeholder="字段">
                            <el-option :label="k" :value="v" v-for="(k, v) in formatKeys" :key="k"></el-option>
                        </el-select>

                        <el-select v-model="domain.c" placeholder="条件" style="width: 80px; ">
                            <el-option label="等于" value="="></el-option>
                            <el-option label="大于" value=">"></el-option>
                            <el-option label="小于" value="<"></el-option>
                            <el-option label="不等于" value="!"></el-option>
                        </el-select>
                        <el-input v-model="domain.v" placeholder="结果" style="width: 220px"></el-input>
                        <el-button @click.prevent="removeDomain(domain, 'js')">删除</el-button>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button @click="addDomain('js')">新增条件</el-button>
                </el-form-item>

                <el-form-item prop="law_desc" label="备注信息、结算说明">
                    <el-input v-model="ruleForm['law_desc']" type="textarea"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="选择账期" :visible.sync="dialogSelectDate">
            <el-form>
                <el-form-item label="活动区域" label-width="200">
                    <el-date-picker v-model="zhangqiDate" type="month" placeholder="选择账期"> </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="importNoneDatas">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import xlsx from 'xlsx'
const customParseFormat = require('dayjs/plugin/customParseFormat')
const fs = require('fs')

dayjs.extend(customParseFormat)
import {
    insertZhangqi,
    TCupdateZQ,
    deleteZhangqi,
    importSLNoneJS,
    importJSNoneSL,
    computedZhangqiState2
} from '@/utils/zhangqi2'
import download from '@/utils/download.js'
import { v4 as uuidv4 } from 'uuid'

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
            acceptKeys: {
                area: '地区',
                addr: '渠道名称',
                acceptor: '受理人',
                product_name: '产品名称',
                product_type: '角色名称',
                action: '业务动作',
                status: '工单状态',
                user: '揽收人'
            },
            jsKeys: {
                commission_policy: '佣金结算策略',
                commission_type: '佣金结算类型',
                product_name: '产品类型',
                status: '是否成功结算',
                branch: '网点名称'
            },
            jfKeys: {
                company: '县公司',
                jf_type: '积分类型',
                jf_name: '积分规则名称',
                event_name: '活动名称',
                xs_id: '销售人员工号',
                xs_name: '销售人员',
                md_id: '门店工号',
                md_code: '门店编码',
                md_name: '门店名称',
                cp_type: '产品类型',
                hyjh: '合约计划'
            },
            downloadNoneloading: false,
            dialogSelectDate: false,
            zhangqiDate: '',
            dateFormatArr: ['YYYY/M/D HH:mm:ss', 'YYYY-M-D HH:mm:ss'],
            loading: false,
            page: 1,
            product_mains: [], //所有套餐
            isShowAddTaocan: false,
            isedit: false, //是否是修改。
            ruleForm: {
                type: 1,
                fuka: 2, //是否关联副卡， 1：关联，2：不关联
                rules: [{ k: 'action', c: '=', v: '新装' }],
                // 结算规则
                js_rules: [],
                name: '', //名称
                count: 1, //结算次数
                law: '1', //结算规律
                desc: '' //规律说明
            },
            rules: {
                name: [{ required: true, message: '请输入发展套餐名称', trigger: 'blur' }],
                count: [{ required: true, message: '请输入结算次数', trigger: 'blur' }],
                law: [{ required: true, message: '请输入结算规律', trigger: 'blur' }, { validator: validatePass }],
                fuka: [{ required: true, message: '请选择是否关联副卡' }],
                type: [{ required: true, message: '请选结算类型' }]
            },
            datas: []
        }
    },
    created() {
        this.fetchDatas()
    },
    watch: {
        'ruleForm.type'(v) {
            this.$set(this.ruleForm, 'js_rules', [])
        }
    },
    computed: {
        aliasList() {
            const { alias } = this.ruleForm
            return this.formatAlias(alias)
        },

        formatKeys() {
            if (this.ruleForm.type === 1) {
                return this.jsKeys
            } else {
                return this.jfKeys
            }
        }
    },
    methods: {
        computedZhangqiState2,
        removeDomain(item, js) {
            let rules = js ? this.ruleForm.js_rules : this.ruleForm.rules
            let index = rules.indexOf(item)

            if (index !== -1) {
                rules.splice(index, 1)
            }
        },
        addDomain(key) {
            if (key === 'js') {
                this.ruleForm.js_rules.push({ v: '', c: '', k: '' })
            } else this.ruleForm.rules.push({ v: '', c: '', k: '' })
        },
        importTaocan(data) {
            console.log(data)

            let fileList = this.$electron.remote.dialog.showOpenDialog({
                properties: ['openFile'],
                filters: { name: 'xlsx', extensions: ['xlsx', 'xls'] }
            })
            console.log(fileList)

            if (!fileList || !fileList[0]) {
                return
            }
            this.onOpenFile(fileList[0])
        },
        async onOpenFile(path, i) {
            // 获取数据
            const excelBuffer = fs.readFileSync(path)
            let _this = this

            // 解析数据
            var result = xlsx.read(excelBuffer, {
                type: 'buffer',
                cellHTML: false
            })

            // 分析数据
            const fun = []

            const field = {
                name: '套餐名',
                alias: '套餐别名',
                count_js: '结算次数',
                law_js: '结算规律',
                count_jf: '积分结算次数',
                law_jf: '积分结算规律',
                count_gs: '改数率结算次数',
                law_gs: '改数率结算规律',
                law_desc: '备注'
            }
            let key = result.SheetNames[0]

            let json = xlsx.utils.sheet_to_json(result.Sheets[key])
            let _field = { ...field }
            console.log({ json })
            const pgk_name = []
            for (var i = 0; i < json.length; i++) {
                let obj = {}
                let e = json[i]
                for (let k in _field) {
                    // console.log({ k, v: _field[k], e })
                    let v = e[_field[k]]
                    if (v === undefined && k === 'name') {
                        continue
                    }
                    if (k === 'name') {
                        pgk_name.push(v)
                    }
                    if (v === undefined && k !== 'law_desc' && k !== 'alias') {
                        v = 0
                    }
                    if (k === 'law_js' || k === 'law_gs' || k === 'law_jf') {
                        v = String(v).replace(/，/, ',')
                    }

                    obj[k] = v || ''
                }
                await new Promise(reslove => {
                    const sql = `select id from pkg where name='${obj.name}'`
                    this.$db.get(sql, (err, res) => {
                        if (res && res.id) {
                            obj.id = res.id
                        }
                        fun.push(obj)
                        reslove()
                    })
                })
            }
            console.log(fun)
            for (var i = 0; i < fun.length; i++) {
                await this.addTaocan2(fun[i], fun[i].id)
            }
            // this.addTaocan2(field, id)
            // pgk_name

            /*       // 查找已存在的
            const sql = `select id, name from pkg where name in ('${pgk_name.join("','")}')`
            const hasd = new Promise(reslove => {
                this.$db.all(sql, (err, res = []) => {
                    reslove(res)
                })
            })*/
        },
        openNoneDatas(data) {
            if (this.downloadNoneloading) {
                return false
            }
            this.selectRow = data
            this.dialogSelectDate = true
            this.downloadNoneloading = true
            this.zhangqiDate = ''
        },
        async importNoneDatas() {
            let { id, name } = this.selectRow
            /*            this.selectPGK_ID = row.id
            this.selectRow = row
            this.dialogSelectDate = true
        },
         importNoneDatasHelp() {
            const id = this.selectPGK_ID*/
            let date = false
            if (this.zhangqiDate) {
                date = dayjs(this.zhangqiDate).format('YYYYMM')
                name += ' ' + date
            }
            console.log(id, name, date)

            const sl = await importSLNoneJS(id, date)
            const js = await importJSNoneSL(id, date)

            const datas = [
                { bookName: '未受理的结算清单', datas: js },
                { bookName: '未结算的受理清单', datas: sl }
            ]
            // console.log(datas)

            download
                .excel2(datas, name)
                .then(res => {
                    this.$message({
                        showClose: true,
                        message: `数据表格创建${!res ? '成功' : '失败'}`,
                        type: !res ? 'success' : 'error'
                    })
                    this.downloadNoneloading = false
                    this.dialogSelectDate = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        formatAlias(alias) {
            return String(alias)
                .split(/[\n,]/g)
                .filter(e => e && e !== 'undefined' && e != 'null')
        },
        formatRules(rules = '[]') {
            try {
                return JSON.parse(rules).map(e => {
                    return `${this.acceptKeys[e.k]} ${e.c} ${e.v}`
                })
            } catch (err) {
                return []
            }
        },
        openAddTaocan(v) {
            // 从tag添加套餐
            this.ruleForm = {
                type: 1,
                fuka: 2, //是否关联副卡， 1：关联，2：不关联
                rules: [{ k: 'action', c: '=', v: '新装' }],
                // 结算规则
                js_rules: [],
                name: v, //名称
                count: 1, //结算次数
                law: '1', //结算规律
                desc: '' //规律说明
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
                    console.log(err)
                } else {
                    // this.dataListTotalCount = res.totalCount;
                    const data = res.map(e => e.val).filter(e => e && !hasd.includes(e))
                    this.$set(this, `${key}s`, data)
                }
            })
        },
        editTaocan(datas) {
            // 修改套餐
            this.isedit = datas.id

            this.ruleForm = { ...datas, rules: JSON.parse(datas.rules), js_rules: JSON.parse(datas.js_rules) }
            this.isShowAddTaocan = true
        },
        fetchDatas() {
            const sql =
                'select p.*,(select count(z.id) from zhangqi z where pgk_id=p.id) as accept_count,(select count(z.id) from zhangqi z where z.pgk_id=p.id and z.state=1) as yjs from pgk p'

            this.$db.all(sql, (err, res) => {
                console.log('fetchDatas', err, res)
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
            const data = this.ruleForm
            const id = this.isedit
            this.addTaocan2(data, id)
        },
        addTaocan2(__datas, __ID) {
            __datas = { ...__datas }
            console.log(__datas)
            /*         __datas = {
                name: '5G畅享129元套餐201910', //名称
                count: 1, //结算次数
                law: 1, //结算规律
                type: 1,
                rules: [{ k: 'product_name', c: '=', v: '移动产品' }],
                desc: '说明' //规律说明
            }
*/
            /*            let __action = {}
            if(__datas.type === 1){
__action = { k: 'action', c: '=', v: '新装' }
            }else if(__datas.type === 3){
__action = { k: 'action', c: '=', v: '改速率' }
*/

            __datas.rules = JSON.stringify(__datas.rules)
            __datas.js_rules = JSON.stringify(__datas.js_rules)

            // 写入数据库
            return new Promise(reslove => {
                let sql = ''
                let isedit = !!__ID
                if (__ID) {
                    // 如果存在就更新
                    let params = []
                    for (let k in __datas) {
                        let v = __datas[k]
                        if (k === 'name') {
                            v = v.toString().trim()
                        }
                        if (k !== 'accept_count' && k !== 'yjs') {
                            params.push(`${k}='${v}'`)
                        }
                    }
                    params = params.join(',')
                    console.log('params', params)
                    sql = `update pgk set ${params} where id='${__ID}'`
                } else {
                    // 不存在，创建新套餐
                    __ID = uuidv4()
                    __datas.id = __ID
                    const keys = Object.keys(__datas)
                    const values = Object.values(__datas).join(`','`)
                    sql = `INSERT INTO pgk (${keys}) VALUES ('${values}')`
                    console.log(sql, keys)
                }
                this.loading = true
                this.$db.run(sql, async (err, res) => {
                    if (err) {
                        console.log('addTaocan', err)
                        this.loading = false

                        this.$message({
                            type: 'error',
                            message: '改套餐已存在'
                        })
                        reslove()
                    } else {
                        await TCupdateZQ(__ID, isedit)
                        this.fetchDatas()
                        this.loading = false
                        this.isShowAddTaocan = false
                        this.ruleForm = {
                            type: '1',
                            rules: [{ k: 'action', c: '=', v: '新装' }],
                            name: '', //名称
                            count: 1, //结算次数
                            law: '1', //结算规律
                            desc: '' //规律说明
                        }

                        reslove()
                        // 更新账期数据
                    }
                })
            })
        },

        /*
         * 重写账期，以及更新账期state
         * 1. 先删除当前套餐关联的说有账期
         * 2. 根据套餐添加新账期
         * 3. 根据结算清单和积分清单 重新统计账期
         * id => 套餐id
         */

        // 重置form内容
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        deleteAllTaocan() {
            this.$confirm('确定要删除该套餐吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$db.all(`select id from pgk`, async (err, res = []) => {
                    console.log('select id from pgk', res)
                    for (var i = 0; i < res.length; i++) {
                        await deleteZhangqi(res[i].id)
                    }
                    this.$db.run(`delete from pgk`, (err, res) => {})
                    this.fetchDatas()
                })
            })
        },
        // 删除套餐，id: 套餐ID
        deleteTaocan(id) {
            this.$confirm('确定要删除该套餐吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    console.log(id)
                    // const { id } = this.datas[index]
                    const sql = `delete from pgk where id =?`
                    this.$db.run(sql, id, (err, res) => {
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
ul.alias {
    list-style: inside;
    li {
        line-height: 1.6;
        margin: 0;
    }
}
</style>
