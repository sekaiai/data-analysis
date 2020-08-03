<template>
  <div
    id="relate"
    v-loading.lock="loading"
    :element-loading-text="`正在导入数据。写入成功${countSuccess}, 写入失败${countError}`"
  >
    <div class="title-line">关联副卡</div>
    <div class="flex">
      <!-- <el-button @click="handleSearch" type="primary">添加副卡</el-button> -->
      <el-button @click="submitUpload" type="default">导入副卡数据</el-button>
    </div>

    <div class="table-box flex1" ref="tableBox">
      <el-table :data="datas" :height="tableHeight" v-if="tableHeight">
        <el-table-column v-for="(v, i) in colums" :prop="i" :label="v"> </el-table-column>
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
import fs from 'fs'
import xlsx from 'xlsx'

export default {
  data() {
    return {
      loading: false,
      datas: [],
      page: 0,
      total: 0,
      limit: 20,
      countError: 0,
      countSuccess: 0,
      colums: {
        a1: '业务号码',
        a2: '主卡',
        a3: '副卡1',
        a4: '副卡2',
        a5: '副卡3',
        a6: '副卡4'
      }
    }
  },
  created() {
    this.onInit()
  },
  methods: {
    onInit() {
      this.page = 1
      this.onFetchData()
      this.onFetchDataCount()
    },
    handleCurrentChange(page) {
      this.page = page
      this.onFetchData()
    },
    onFetchData() {
      let star = (this.page - 1) * this.limit
      const sql = `select * from related_user limit ${star},${this.limit}`

      this.$db.all(sql, (err, res = []) => {
        console.log(err, res)
        this.datas = res
      })
    },
    onFetchDataCount() {
      const sql = `select count(*) as total from related_user`

      this.$db.get(sql, (err, res) => {
        if (!err) {
          this.total = res.total
        }
      })
    },
    submitUpload() {
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

      this.loading = true

      setTimeout(() => {
        fileList.forEach((e, i) => {
          try {
            this.onOpenFile(e)
          } catch (err) {
            this.onOpenFile(e)
          }
        })
      }, 100)
    },
    async onOpenFile(path) {
      this.countError = 0
      this.countSuccess = 0

      // 获取数据
      const excelBuffer = fs.readFileSync(path)

      // 解析数据
      const result = xlsx.read(excelBuffer, {
        type: 'buffer',
        cellHTML: false
      })

      let _datas = xlsx.utils.sheet_to_json(result.Sheets[result.SheetNames[0]])

      let keys = Object.keys(this.colums).join(',')
      let values = Object.values(this.colums)

      for (var i = _datas.length - 1; i >= 0; i--) {
        let e = _datas[i]
        // _datas = _datas.forEach(e => {
        if (e && e['业务号码']) {
          let vals = values.map(k => e[k]).join(`','`)
          // console.log(vals)
          const sql = `INSERT INTO related_user (${keys}) values ('${vals}')`
          await new Promise(reslove => {
            this.$db.run(sql, (err, res) => {
              // console.log({ err, res })
              if (!err) {
                this.countSuccess++
              } else {
                this.countError++
              }
              reslove()
            })
          })
        }
        // })
      }
      this.loading = false
      this.onInit()
      this.$notify({
        title: '提示',
        message: `写入成功${this.countSuccess}, 写入失败${this.countError}`
      })
      // console.log(_datas)
      // this.datas.push(..._datas)
    }
  }
}
</script>
