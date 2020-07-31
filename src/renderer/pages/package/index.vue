<template>
  <div id="package">
    <div class="title-line">
      套餐套餐管理<el-button @click="dialogVisible = true" style="margin-left: 10px;" type="text" size="mini">
        添加规则
      </el-button>
    </div>
    <div></div>
    <div class="table-box flex1" ref="tableBox">
      <el-table :data="datas" :height="tableHeight" v-if="tableHeight">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="需求名称">
                <span>{{ props.row.name || '-' }}</span>
              </el-form-item>

              <el-form-item label="产品类型">
                <span>{{ props.row.type || '-' }}</span>
              </el-form-item>
              <el-form-item label="渠道类型">
                <span>{{ props.row.qudao || '-' }}</span>
              </el-form-item>

              <el-form-item label="合约ID">
                <span>{{ props.row.heyue_id || '-' }}</span>
              </el-form-item>
              <el-form-item label="合约名称">
                <span>{{ props.row.heyue_name || '-' }}</span>
              </el-form-item>

              <el-form-item label="用户类型">
                <span>{{ props.row.yonghu_type || '-' }}</span>
              </el-form-item>

              <el-form-item label="佣金规则描述">
                <span>{{ props.row.jiesuan_desc || '-' }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>

        <!-- <el-table-column v-for="(v, i) in items" :prop="i" :label="v" /> -->
        <el-table-column prop="taocan_id" label="套餐ID"> </el-table-column>
        <el-table-column prop="taocan_name" label="佣金参考值"> </el-table-column>
        <el-table-column prop="yongjin" label="套餐ID"> </el-table-column>
        <el-table-column prop="yongjin_value" label="佣金结算比例"> </el-table-column>

        <el-table-column prop="jiesuan" label="结算条件"> </el-table-column>
        <el-table-column prop="jiesuan_star" label="结算开始"> </el-table-column>
        <el-table-column prop="jiesuan_month" label="共结算佣金月"> </el-table-column>
        <el-table-column prop="count" label="受理数量"> </el-table-column>

        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button @click.native.prevent="handleDeleteRow(scope.$index)" type="text" size="small">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm">
        <el-form-item prop="name" label="需求名称">
          <el-input v-model="ruleForm['name']"></el-input>
        </el-form-item>
        <el-form-item prop="type" label="产品类型">
          <el-input v-model="ruleForm['type']"></el-input>
        </el-form-item>
        <el-form-item prop="taocan_id" label="套餐ID">
          <el-input v-model="ruleForm['taocan_id']"></el-input>
        </el-form-item>
        <el-form-item prop="taocan_name" label="套餐名称">
          <div class="taocao-tip">*必须与受理清单表和结算表中的套餐名称一致！</div>
          <el-input v-model="ruleForm['taocan_name']"></el-input>
        </el-form-item>
        <el-form-item prop="jiesuan_star" label="结算开始">
          <el-input v-model="ruleForm['jiesuan_star']"></el-input>
        </el-form-item>
        <el-form-item prop="jiesuan_month" label="共结算佣金月">
          <!-- <el-input v-model="ruleForm['jiesuan_month']" type="number"></el-input> -->
          <div>
            <el-input-number v-model="ruleForm['jiesuan_month']" :min="1" :max="99999"></el-input-number>
          </div>
        </el-form-item>
        <el-form-item prop="qudao" label="渠道类型">
          <el-input v-model="ruleForm['qudao']"></el-input>
        </el-form-item>
        <el-form-item prop="heyue_id" label="合约ID">
          <el-input v-model="ruleForm['heyue_id']"></el-input>
        </el-form-item>
        <el-form-item prop="heyue_name" label="合约名称">
          <el-input v-model="ruleForm['heyue_name']"></el-input>
        </el-form-item>

        <el-form-item prop="yongjin" label="佣金参考值">
          <el-input v-model="ruleForm['yongjin']"></el-input>
        </el-form-item>
        <el-form-item prop="yongjin_value" label="佣金结算比例">
          <el-input v-model="ruleForm['yongjin_value']"></el-input>
        </el-form-item>
        <el-form-item prop="yonghu_type" label="用户类型">
          <el-input v-model="ruleForm['yonghu_type']"></el-input>
        </el-form-item>
        <el-form-item prop="jiesuan" label="结算条件">
          <el-input v-model="ruleForm['jiesuan']"></el-input>
        </el-form-item>

        <el-form-item prop="jiesuan_desc" label="佣金规则描述">
          <el-input v-model="ruleForm['jiesuan_desc']" type="textarea"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      ruleForm: {
        name: '',
        type: '',
        qudao: '',
        heyue_id: '',
        heyue_name: '',
        taocan_id: '',
        taocan_name: '',
        yongjin: '',
        yongjin_value: '',
        yonghu_type: '',
        jiesuan: '',
        jiesuan_star: '',
        jiesuan_month: '',
        jiesuan_desc: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入需求名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        jiesuan_star: [{ required: true, message: '请输入开始结算时间', trigger: 'change' }],
        jiesuan_month: [{ required: true, message: '最少1月', trigger: 'change' }]
      },
      datas: [],
      items: {
        id: '序号',
        name: '需求名称',
        type: '产品类型',
        qudao: '渠道类型',
        heyue_id: '合约ID',
        heyue_name: '合约名称',
        taocan_id: '套餐ID',
        taocan_name: '套餐名称',
        yongjin: '佣金参考值',
        yongjin_value: '佣金结算比例',
        yonghu_type: '用户类型',
        jiesuan: '结算条件',
        jiesuan_star: '结算开始',
        jiesuan_month: '共结算佣金月',
        jiesuan_desc: '佣金规则描述'
      }
    }
  },
  created() {
    this.onFetchDatas()
  },
  methods: {
    onFetchDatas() {
      const sql =
        'select p.*,(select count(*) from ITEMS i where i.product_main = p.taocan_name) as count from package p'
      this.$db.all(sql, (err, res) => {
        console.log(err, res)
        this.datas = res
      })
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
      const keys = Object.keys(this.ruleForm)
      const values = Object.values(this.ruleForm).join(`','`)
      const sql = `INSERT INTO package (${keys}) VALUES ('${values}')`
      // console.log(sql)

      this.$db.run(sql, err => {
        if (err) this.$logger(err)
        else {
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
              this.onInsertDatabase()
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
    handleEditRow(index, rows) {
      rows.splice(index, 1)
    }
  }
}
</script>

<style>
.taocao-tip {
  font-size: smaller;
  color: red;
}
</style>
