import fse from 'fs-extra'
import path from 'path'
import sq3 from 'sqlite3'
// import console.log from './console.log'
import { docDir } from './settings'
// 将数据存至系统用户目录，防止用户误删程序
export const dbPath = path.join(docDir, 'data.sqlite3')
fse.ensureFileSync(dbPath)

console.log(dbPath)
const sqlite3 = sq3.verbose()
const db = new sqlite3.Database(dbPath)

const runSQL = sql => {
  return new Promise(reslove => {
    db.run(sql, (err, res) => {
      console.log(err, res)
      reslove()
    })
  })
}

db.serialize(async () => {
  let sqlArr = []
  db.run('BEGIN TRANSACTION;')
  /*/ 受理表
   * no: '购物车流水号',
   * area: '地区',
   * addr: '渠道名称',
   * acceptor: '受理人',
   * product_name: '产品名称',
   * product_type: '角色名称',
   * product_main: '所属主销售品',
   * action: '业务动作',
   * action_no: '业务号码',
   * created: '受理时间',
   * status: '工单状态',
   * date_end: '竣工时间',
   * user: '揽收人',
   * remark: '备注',
   * import_date: '导入时间'
   * js_count 结算次数,
   * related_user: 用户关联账号，
   */
  sqlArr.push(
    runSQL(
      `CREATE TABLE accept(
      uuid CHAR(32) PRIMARY KEY NOT NULL,
      no VARCHAR(255),
      area VARCHAR(255),
      addr VARCHAR(255),
      acceptor VARCHAR(255),
      pgk_id CHAR(32) DEFAULT 0,
      product_name VARCHAR(255),
      product_type VARCHAR(255),
      product_main VARCHAR(255),
      action VARCHAR(255),
      action_r VARCHAR(255),
      action_no VARCHAR(255),
      created VARCHAR(255),
      status VARCHAR(255),
      date_end VARCHAR(255),
      user VARCHAR(255),
      remark VARCHAR(255),
      js_count INTEGER DEFAULT 0 NOT NULL,
      import_date VARCHAR(255),
      user_number VARCHAR(255)
  )`
    )
  )

  sqlArr.push(runSQL(`CREATE INDEX acc_action_r ON accept (action_r)`))
  sqlArr.push(runSQL(`CREATE INDEX acc_pgk_id ON accept (pgk_id)`))
  sqlArr.push(runSQL(`CREATE INDEX acc_action ON accept (action)`))
  sqlArr.push(runSQL(`CREATE INDEX action_no_index ON accept (action_no)`))
  sqlArr.push(runSQL(`CREATE INDEX user_number ON accept (user_number)`))
  sqlArr.push(runSQL(`CREATE INDEX js_count ON accept (js_count)`))
  sqlArr.push(runSQL(`CREATE INDEX product_main ON accept (product_main)`))
  sqlArr.push(runSQL(`CREATE INDEX addr ON accept (addr)`))

  /**
   * 结算规则表 package
   * name: 套餐名称
   * count_js： 结算结算次数
   * count_jf： 积分结算次数
   * count_gs: 改数率结算次数
   * law_gs:   改数率结算规律
   * law_js:   结算清单结算规律
   * law_jf:   积分结算规律
   * law_desc: 结算规律说明
   * rules_jf: 需要结算的字段
   * type: 1普通结算，2积分结算
   */

  // rules VARCHAR(500),
  sqlArr.push(
    runSQL(
      `CREATE TABLE pgk(
     id CHAR(32) PRIMARY KEY NOT NULL,
     name VARCHAR(200) NOT NULL,
     alias VARCHAR(500),
     type INTEGER DEFAULT 1 NOT NULL,
     fuka  VARCHAR(500),
     law VARCHAR(255) NOT NULL,
     count INTEGER DEFAULT 0 NOT NULL,
     js_rules VARCHAR(500),
     desc VARCHAR(255)
    )`
    )
  )
  /*  count_gs INTEGER DEFAULT 0 NOT NULL,
  law_gs VARCHAR(255) NOT NULL,*/

  sqlArr.push(runSQL(`CREATE INDEX pgk_name ON pgk (name)`))

  /**
   * 结算表
   * date: 账期
   * order_id: 订单号
   * complete_date: 竣工时间
   * commission_policy: 佣金结算策略
   * commission_type: 佣金结算类型
   * commission_money: 佣金金额
   * package_name: 套餐名称
   * product_name: 产品名称
   * user_id: 用户ID
   * user_number: 用户号码
   * status: 是否结算成功
   * cause: 原因
   * not_found_user: 没有找到业务ID
   * branch: 网点
   * branch_id: 网点ID
   */
  // sqlArr.push(runSQL(`drop table bill`, err => {
  //     console.log(err)
  // })
  sqlArr.push(
    runSQL(
      `create table bill(
        id char(32) PRIMARY KEY NOT NULL,
        date varchar(200),
        order_id varchar(200),
        complete_date varchar(200),
        commission_policy varchar(200),
        commission_type varchar(200),
        commission_money varchar(200),
        pgk_id CHAR(32) DEFAULT 0,
        package_name varchar(200) NOT NULL,
        product_name varchar(200),
        user_id varchar(200),
        user_number varchar(200) NOT NULL,
        not_found_user INTEGER DEFAULT 0,
        status INTEGER,
        cause varchar(200),
        branch varchar(200),
        created varchar(200),
        branch_id varchar(100),
        flag INTEGER DEFAULT 0
    )`
    )
  )

  sqlArr.push(runSQL(`CREATE INDEX bill_flag ON bill (flag)`))
  sqlArr.push(runSQL(`CREATE INDEX bill_pgk_id ON bill (pgk_id)`))
  sqlArr.push(runSQL(`CREATE INDEX branch_id ON bill (branch_id)`))
  sqlArr.push(runSQL(`CREATE INDEX order_id ON bill (order_id)`))
  sqlArr.push(runSQL(`CREATE INDEX status ON bill (status)`))
  sqlArr.push(runSQL(`create index date ON bill (date)`))
  sqlArr.push(runSQL(`create index user_number ON bill (user_number)`))
  sqlArr.push(runSQL(`create index status ON bill (status)`))
  sqlArr.push(runSQL(`create index branch ON bill (branch)`))
  sqlArr.push(runSQL(`create index package_name ON bill (package_name)`))
  sqlArr.push(runSQL(`create index created ON bill (created)`))

  /**
     * 用户关联表
          a1: '业务号码',
          a2:'主卡',
          a3: '副卡1',
          a4: '副卡2',
          a5: '副卡3',
          a6: '副卡4'
     * @param  {[type]} err [description]
     * @return {[type]}     [description]
     */
  sqlArr.push(
    runSQL(
      `create table related_user(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        a1 varchar(200) NOT NULL,
        a2 varchar(200),
        a3 varchar(200),
        a4 varchar(200),
        a5 varchar(200),
        a6 varchar(200)
    )`
    )
  )

  sqlArr.push(runSQL(`create UNIQUE index a1 ON related_user (a1)`))
  sqlArr.push(runSQL(`create index a ON related_user (a2,a3,a4,a5,a6)`))

  /**
    date: varchar(200) NOT NULL, //'账期',
    local: '本地网',
    company: '县公司',
    jf_type: '积分类型',
    event_name: '活动名称',
    jf_name: '积分规则名称',
    xs_id: '销售人员工号',
    xs_name: '销售人员',
    md_id: '门店工号',
    md_code: '门店编码',
    md_name: '门店名称',
    cp_type: '产品名称',
    user_id: '用户ID',
    user_number: '用户号码',
    xs_instance_id: '销售品实例ID',
    rw_name: '入网套餐',
    rw_date: '入网时间',
    hyjh: '合约计划',
    jf_jiesuan: '结算积分',
    bqdh: '本期兑换',
    qs: '清算',
    ydjf: '应兑换积分'
    */
  sqlArr.push(
    runSQL(
      `CREATE TABLE IF NOT EXISTS jifen(
        id char(32) PRIMARY KEY NOT NULL,
        date varchar(200) NOT NULL,
        local varchar(200),
        company varchar(200),
        jf_type varchar(200),
        jf_name varchar(200),
        event_name varchar(200),
        xs_id varchar(200),
        xs_name varchar(200),
        md_id varchar(200),
        md_code varchar(200),
        md_name varchar(200),
        cp_type varchar(200),
        user_id varchar(200),
        user_number varchar(200),
        xs_instance_id varchar(200),
        package_name varchar(200),
        pgk_id CHAR(32) DEFAULT 0,
        rw_date varchar(200),
        hyjh varchar(200),
        jf_jiesuan varchar(200),
        bqdh varchar(200),
        qs varchar(200),
        ydjf varchar(200),
        created_at varchar(200),
        flag INTEGER DEFAULT 0
        )`
    )
  )
  sqlArr.push(runSQL(`CREATE INDEX jifen_flag ON jifen (flag)`))
  sqlArr.push(runSQL(`CREATE INDEX jifen_pgk_id ON jifen (pgk_id)`))
  sqlArr.push(runSQL(`create index jifen_date ON jifen (date)`))
  sqlArr.push(runSQL(`create index jifen_xs_name ON jifen (xs_name)`))
  sqlArr.push(runSQL(`create index jifen_xs_instance_id ON jifen (xs_instance_id)`))

  /**
     * 账期表
     * 储存每个受理清单的所有结算账期
     id(自增) | 受理清单ID(list_id) | 套餐ID(pgk_id) | 账期(date)  | 是否已结算(state) |  结算类型(type) |  结算清单ID(qd_id)
     --- | --- | --- | --- | --- | ---
     - | - | - | 202004 | 0:没有结算清单,1:结算成功, -1:结算失败 | 1:结算清单 2.积分清单 | 结算(积分) 清单ID
     rules = {k: key,v:value,c:=} 里面包含当前结算你需要匹配的值
     fuka //是否关联副卡， 1：关联，2：不关联
     */
  sqlArr.push(
    runSQL(
      `CREATE TABLE IF NOT EXISTS zhangqi(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        list_id CHAR(32) NOT NULL,
        pgk_id CHAR(32) NOT NULL,
        qd_id INTEGER,
        date INTEGER NOT NULL,
        state INTEGER DEFAULT 0,
        type INTEGER DEFAULT 1,
        fuka INTEGER DEFAULT 1,
        rules VARCHAR(500)
        )`
    )
  )
  sqlArr.push(runSQL(`create index zhangqi_qd_id ON zhangqi (qd_id)`))
  sqlArr.push(runSQL(`create index zhangqi_list_id ON zhangqi (list_id)`))
  sqlArr.push(runSQL(`create index zhangqi_pgk_id ON zhangqi (pgk_id)`))
  sqlArr.push(runSQL(`create index zhangqi_date ON zhangqi (date)`))
  sqlArr.push(runSQL(`create index zhangqi_state ON zhangqi (state)`))

  await Promise.all(sqlArr)

  db.run('COMMIT TRANSACTION;')
})

export default db
