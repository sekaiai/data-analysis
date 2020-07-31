<template>
    <div id='home' v-loading.lock="loading"  element-loading-text="正在解析数据">
        <div class="form-line">
            <!-- <div class="flex">
                <el-upload class="upload-demo" :on-change='onChange' ref="upload" multiple accept='.xls,.xlsx' action="/" :auto-upload="false">
                    <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    <el-button slot="trigger" type="primary" :loading="loading">请选择要筛选的文件<i class="el-icon-upload"></i></el-button>
                    <el-button style="margin-left: 10px;" type="success" @click="submitUpload">开始分析</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传xls/xlxs文件，且不超过500M</div>
                </el-upload>
            </div> -->

            <el-button type="primary" @click="submitUpload">请选择要筛选的文件</el-button>
        </div>
        <!--       <div class="title-line">数据筛选</div>
  <div class="flex">
      <div class="flex-item">
          <el-select v-model="qudao" placeholder="渠道名称">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
          </el-select>
      </div>
      <div class="flex-item">
          <el-select v-model="qudao" placeholder="请先上传文件">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
          </el-select>
      </div>
      <div class="flex-item">
          <el-select v-model="qudao" placeholder="请先上传文件">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
          </el-select>
      </div>
  </div> -->
        <div class="title-line">数据分析</div>
        <div class="data-analysis">
            <el-tabs v-model="analysisActiveName" @tab-click="handleAnalysisClick">
                <el-tab-pane :label="`全部数据 (${datas.length})`" name="all">
                </el-tab-pane>
                <el-tab-pane :label="`成功数据 (${success.length})`" name="success">
                </el-tab-pane>
                <el-tab-pane :label="`失败数据 (${errors.length})`" name="errors">
                </el-tab-pane>
                <el-tab-pane :label="`未找到数据 (${notfound.length})`" name="lose">
                </el-tab-pane>
            </el-tabs>
            <el-button class='button' :loading='outputLoading' type="success" @click="handleAnalysisDownload" size='mini'>导出该分类数据</el-button>
        </div>
        <div class="table-box flex1" ref='tableBox'>
            <template v-if='tableHeight'>
                <el-table :data="splitDatas" style="width: 100%" :height="tableHeight" v-if='analysisActiveName !== "lose"'>
                    <el-table-column v-for="(v, i) in items" :prop="i" :label="i"> </el-table-column>
                    <!-- <el-table-column prop="no" label="购物车流水号"> </el-table-column> -->
                </el-table>
                <el-table :data="splitDatas" style="width: 100%" :height="tableHeight" v-else>
                    <el-table-column v-for="(v, i) in notfoundItems" :prop="i" :label="v"> </el-table-column>
                    <!-- <el-table-column prop="no" label="购物车流水号"> </el-table-column> -->
                </el-table>
            </template>
        </div>
              <el-pagination class='pagination' @current-change='handleCurrentChange' :hide-on-single-page="false" background layout="prev, pager, next" :current-page.sync='page' :total="splitDatas.length">
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
            outputLoading: false,
            loading: false,
            qudao: '',
            analysisActiveName: 'all',
            fileList: [],
            datas: [], //所有
            success: [], //成功条数
            errors: [], //错误的条数
            notfound: [], //没找到数据
            page: 1, 
            items: {
                '产品类型': '',
                '佣金结算段落': '',
                '佣金结算策略': '',
                '佣金结算类型': '',
                '佣金结算金额（元）': '',
                '原因': '',
                '发展套餐名': '',
                '是否成功结算': '',
                '用户ID': '',
                '用户号码': '',
                '订单号': '',
                '订单竣工时间': '',
                '账期': '',
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
            }
        }
    },
    computed: {
        currentData() {
            // 显示的数据粗
            const k = this.analysisActiveName
            if (k === 'success') {
                return this.success
            } else if (k === 'errors') {
                return this.errors
            } else if (k === 'all') {
                // 没有找到的数据
                return this.datas
            } else {
                return this.notfound
            }
        },
          splitDatas(){
// 分页显示数据
const limit = 100
let start = (this.page -1) * limit -1
if(start < 0){
    start = 0
}


return this.currentData.slice(start, start + limit)
        },
    },
    methods: {

        handleCurrentChange(page){
this.page = page
        },
        handleAnalysisDownload() {
            const type = this.analysisActiveName
            let datas = this.currentData


            if (datas.length < 1) {
                return this.$message({
                    showClose: true,
                    message: '当前分类下面没有数据哦',
                    type: 'warning'
                });
            }
this.outputLoading = true
            let txt = '分析数据-'


            if (type === 'all') {
                txt += '全部数据'
            } else if (type === 'success') {
                txt += '成功数据'
            } else if (type === 'errors') {
                txt += '失败数据'
            } else if (type === 'lose') {
                txt += '未找到数据'
            }


         let excelType = 'json'
                if (type === 'lose') {

                    datas = this.parseAoaData(datas)
                    excelType = 'aoa'

                } else {
                    // datas = this.parseJsonData(datas)
                }
                // 下载
                const name = `[${txt}]`
                const book_name = 'book_name'
                console.log(datas)

                download.excel2(datas, name, book_name, excelType).then(res => {
this.outputLoading = false
console.log(res)
this.$message({
    showClose: true,
    message: `数据表格创建${!res ? '成功' : '失败'}`,
    type: !res ? 'success': 'error'
});

                }).catch(err => {
this.outputLoading = false
                    console.log(err)
                })


        },
        parseAoaData(datas) {
            // json转成execl需要的数组

            const line1 = Object.values(this.notfoundItems)
            const keys = Object.keys(this.notfoundItems)
            console.log(line1, keys)
            datas = datas.map(v => {
                return keys.map(k => v[k])
            })
            datas.unshift(line1)
            console.log(datas)
            return datas
        },
        parseJsonData() {
            // json转数据

        },
        onChange(e) {
            // 文件发生变化
            console.log('onChange', e)
        },
        submitUpload() {

            /*console.log(this.$refs.upload)
            const upload = this.$refs.upload

            const input = upload.$el.querySelector('.el-upload__input')
            console.log(input.files)
            window.inputs = input

            this.fileList = input.files
*/
 let fileList = this.$electron.remote.dialog.showOpenDialog({
                    properties: ['openFile', 'multiSelections'],
                    filters: { name: 'xlsx', extensions: ['xlsx', 'xls'] }
                })

                if (!fileList || fileList.length < 1) {
                    this.$message({
                              message: '没有获取到相关文件',
                              type: 'error'
                            });
                    return
                }
            this.loading = true

            fileList.forEach((e, i) => {
                this.onOpenFile(e, i)
            })

this.loading = false
 this.$message({
                    showClose: true,
                    message: '数据解析完毕',
                    type: 'success'
                });

            // this.onOpenFile(input.files)

        },
        onParseSuccess(key) {


            let arr = []
            const json = xlsx.utils.sheet_to_json(this.result.Sheets[key])

            if (key === '成功') {
                this.success = json
            } else {
                this.errors = json
                console.log({ json })
            }






        },
        onOpenFile(path, i) {
            // return new Promise((resolve, reject) => {

            // this.$electron.shell.openItem(path)
            /*    let x = this.$electron.remote.dialog.showOpenDialog({
                    properties: ['openFile'],
                    filters: { name: 'xlxs', extensions: ['xlsx', 'xls'] }
                })
                console.log(x, xlsx)
                if (!x) {
                    return
                }*/
            // 获取数据
            const excelBuffer = readFileSync(path)

            // 解析数据
            var result = xlsx.read(excelBuffer, {
                type: 'buffer',
                cellHTML: false
            })

            console.log('TCL: result', result)

            this.result = result


            // 分析数据
            // this.onParseSuccess()
            console.log(result)
            const _data = []
            result.SheetNames.forEach(key => {
                console.log('TCL: result', key)
                // const data = this.onParseSuccess(e)
                // console.log(data)
                // _data.push(...this.onParseSuccess(e))

            const json = xlsx.utils.sheet_to_json(result.Sheets[key])

            if (key === '成功') {
                this.success = json
            } else if(key==='失败') {
                this.errors = json
                console.log({ json })
            }
            console.log({json})
            _data.push(...json)

            })

            // 分析未找到数据
            this.datas =_data

// 返回用户号码，用来做查询
            let users = this.datas.map(e => e['用户号码']).join(`','`)
            users = `'${users}'`
            console.log({ users })


            this.handleParseLose(users)
            // 插入数据库
            // })

            // download.excel('xxx.xlxs', result2)
        },
        handleParseLose(user) {
            // 查询未找到的数据
            const sql = `select * from ITEMS where action_no not in (${user})`
            this.$db.all(sql, (err, res) => {
                console.log({ err })
                console.log(res)

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
            console.log(e)
            // 数据分析tab点击事件
        },
    }
}
</script>
<style lang="less">
</style>