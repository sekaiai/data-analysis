<template>
  <div
    id="relate"
    v-loading.lock="loading"
    :element-loading-text="`正在导入数据。写入成功${countSuccess}, 写入失败${countError}`"
  >
    <div class="title-line">
      关联副卡

      <el-button @click="deleteAllFuka" style="margin-left: 10px;" type="text" size="mini">
        删除全部副卡
      </el-button>
    </div>

    <div class="flex">
      <div class="flex-item">
        <el-input @keyup.enter.native="onFetchData" v-model="user_number" placeholder="号码查询, 可输入部分" />
      </div>

      <div class="flex-item">
        <el-button @click="onFetchData" type="primary">查询</el-button>
      </div>

      <div class="flex-item">
        <!-- <el-button @click="handleSearch" type="primary">添加副卡</el-button> -->
        <el-button @click="submitUpload" type="default">导入副卡数据</el-button>
      </div>
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
import { runSql2Arr, runSql2, getAllFuka } from '@/utils/zhangqi2'

export default {
  data() {
    return {
      loading: false,
      user_number: '', //
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
    deleteAllFuka() {
      this.$confirm('删除后请手动更新数据!', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$db.run(`delete from related_user`, (err, res) => {
            console.log(1, err, res)
            this.$db.run(`update accept set action_r=''`, (err, res) => {
              console.log('actionr', err, res)
              if (!err) {
                this.$notify.success({
                  duration: 20000,
                  title: '完成',
                  message: '数据删除完毕，重新添加数据后请在首页[重新统计]'
                })
                this.onInit()
              } else {
                this.$notify.error({
                  duration: 20000,
                  title: '删除失败',
                  message: err.message
                })
              }
            })
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    onSearch() {},
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
      let limit = ` limit ${star},${this.limit}`
      let sql = `select * from related_user`

      const id = this.user_number
      if (id) {
        sql += ` where a1 like '%${id}%' or a2 like '%${id}%' or a3 like '%${id}%' or a4 like '%${id}%' or a5 like '%${id}%' or a6 like '%${id}%' group by a1`
      }
      sql += limit

      this.$db.all(sql, (err, res = []) => {
        this.$logger(err, res)
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

      let sqlArr = []

      for (var i = _datas.length - 1; i >= 0; i--) {
        let e = _datas[i]
        // _datas = _datas.forEach(e => {
        if (e && e['业务号码']) {
          let vals = values.map(k => e[k]).join(`','`)
          // this.$logger(vals)
          const sql = `REPLACE INTO related_user (${keys}) values ('${vals}')`
          sqlArr.push(sql)
          this.countSuccess++

          /*await new Promise(reslove => {
            this.$db.run(sql, (err, res) => {
              // this.$logger({ err, res })
              if (!err) {
                this.countSuccess++
              } else {
                this.countError++
              }
              reslove()
            })
          })*/
        }
        // })
      }
      runSql2Arr(sqlArr).then(res => {
        this.loading = false
        this.onInit()
        this.$notify({
          title: '提示',
          message: `写入成功${this.countSuccess}, 写入失败${this.countError}`
        })
        this.updateRelation()
      })

      // 1. 查询出所有受理清单

      // 2. 更新匹配的受理清单
    },
    async updateRelation() {
      await new Promise(reslove => {
        this.$db.serialize(async () => {
          this.$db.run('BEGIN TRANSACTION;')

          const fks = await getAllFuka()
          let arr = []
          /*       const aps = await new Promise(reslove => {
            this.$db.all(`select uuid, action_no from accept`, (err, res = []) => {
              reslove(res)
            })
          })*/
          const aps = await sqlAll(`select uuid, action_no from accept`)
          console.log(fks, aps)

          aps.forEach(e => {
            let _ac = `#${e['action_no']}#`

            let _t = fks.find(tt => {
              return tt.indexOf(_ac) > -1
            })

            if (_t) {
              arr.push(runSql2(`update accept set action_r=? where uuid=?`, [_t, e.uuid]))
            }
          })
          console.log({ arr: arr.length, arr2: arr })

          Promise.all(arr).then(res => {
            this.$db.run('COMMIT TRANSACTION;')
            console.log(61, Date.now())
            reslove()
          })
        })
      })
    }
  }
}
</script>
