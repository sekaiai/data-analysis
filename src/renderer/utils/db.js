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

db.serialize(() => {
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
    db.run(
        `CREATE TABLE accept(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      no VARCHAR(255),
      area VARCHAR(255),
      addr VARCHAR(255),
      acceptor VARCHAR(255),
      product_name VARCHAR(255),
      product_type VARCHAR(255),
      product_main VARCHAR(255),
      action VARCHAR(255),
      action_no VARCHAR(255),
      created VARCHAR(255),
      status VARCHAR(255),
      date_end VARCHAR(255),
      user VARCHAR(255),
      remark VARCHAR(255),
      js_count INTEGER DEFAULT 0 NOT NULL,
      import_date VARCHAR(255),
      user_number VARCHAR(255)
  )`,
        err => {
            console.log(err)
        }
    )

    db.run('DROP INDEX `action_no` ON `accept`', (err, res) => {
        console.log({ err, res })
    })

    db.run(`CREATE UNIQUE INDEX action_no ON accept (action_no,product_main)`, err => {
        console.log(err)
    })

    db.run(`CREATE INDEX action_no ON accept (action_no)`, err => {
        console.log(err)
    })
    db.run(`CREATE INDEX user_number ON accept (user_number)`, err => {
        console.log(err)
    })
    db.run(`CREATE INDEX js_count ON accept (js_count)`, err => {
        console.log(err)
    })
    db.run(`CREATE INDEX product_main ON accept (product_main)`, err => {
        console.log(err)
    })
    db.run(`CREATE INDEX addr ON accept (addr)`, err => {
        console.log(err)
    })

    /**
     * 结算规则表 package
     * name: 套餐名称
     * count_js： 结算结算次数
     * count_jf： 积分结算次数
     * law_js:   结算清单结算规律
     * law_jf:   积分结算规律
     * law_desc: 结算规律说明
     */
    // db.run(`drop table package`)

    db.run(
        `CREATE TABLE pgk(
     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
     name VARCHAR(200) NOT NULL,
     count_js INTEGER NOT NULL,
     count_jf INTEGER NOT NULL,
     law_js VARCHAR(255) NOT NULL,
     law_jf VARCHAR(255) NOT NULL,
     law_desc VARCHAR(255)
    )`,
        err => {
            console.log(err && err.message)
        }
    )

    db.run(`CREATE UNIQUE INDEX package_name ON pgk (name)`, err => {
        console.log(err)
    })

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
    // db.run(`drop table bill`, err => {
    //     console.log(err)
    // })
    db.run(
        `create table bill(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
date varchar(200),
order_id varchar(200),
complete_date varchar(200),
commission_policy varchar(200),
commission_type varchar(200),
commission_money varchar(200),
package_name varchar(200) NOT NULL,
product_name varchar(200),
user_id varchar(200),
user_number varchar(200) NOT NULL,
not_found_user INTEGER DEFAULT 0,
status INTEGER,
cause varchar(200),
branch varchar(200),
created varchar(200),
branch_id varchar(100)
    )`,
        err => {
            console.log(err)
        }
    )

    // db.run('DROP INDEX `order_id` ON `bill`', (err, res) => {
    //     console.log({ err, res })
    // })

    // db.run(`CREATE UNIQUE INDEX order_id_status ON bill (order_id,status)`, err => {
    //     console.log(err)
    // })

    db.run(`CREATE INDEX branch_id ON bill (branch_id)`, err => {
        console.log(err)
    })
    db.run(`CREATE INDEX order_id ON bill (order_id)`, err => {
        console.log(err)
    })
    db.run(`CREATE INDEX status ON bill (status)`, err => {
        console.log(err)
    })
    db.run(`create index date ON bill (date)`, err => {
        console.log(err)
    })

    db.run(`create index user_number ON bill (user_number)`, err => {
        console.log(err)
    })
    db.run(`create index status ON bill (status)`, err => {
        console.log(err)
    })
    db.run(`create index branch ON bill (branch)`, err => {
        console.log(err)
    })
    db.run(`create index package_name ON bill (package_name)`, err => {
        console.log(err)
    })
    db.run(`create index created ON bill (created)`, err => {
        console.log(err)
    })

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
    db.run(
        `create table related_user(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
a1 varchar(200) NOT NULL,
a2 varchar(200),
a3 varchar(200),
a4 varchar(200),
a5 varchar(200),
a6 varchar(200)
    )`,
        err => {
            console.log(err)
        }
    )

    db.run(`create UNIQUE index a1 ON related_user (a1)`, err => {
        console.log(err)
    })
    db.run(`create index a ON related_user (a2,a3,a4,a5,a6)`, err => {
        console.log(err)
    })

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
    db.run(
        `CREATE TABLE IF NOT EXISTS jifen(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
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
        rw_name varchar(200),
        rw_date varchar(200),
        hyjh varchar(200),
        jf_jiesuan varchar(200),
        bqdh varchar(200),
        qs varchar(200),
        ydjf varchar(200),
        created_at varchar(200)
        )`,
        err => {
            console.log(err)
        }
    )
    db.run(`create index jifen_date ON related_user (date)`, err => {
        console.log(err)
    })
    db.run(`create index jifen_user_member ON related_user (user_member)`, err => {
        console.log(err)
    })
    db.run(`create index jifen_rw_name ON related_user (rw_name)`, err => {
        console.log(err)
    })
    db.run(`create index jifen_xs_name ON related_user (xs_name)`, err => {
        console.log(err)
    })
    db.run(`create index jifen_xs_instance_id ON related_user (xs_instance_id)`, err => {
        console.log(err)
    })

    /**
     * 账期表
     * 储存每个受理清单的所有结算账期
     */
    db.run(
        `CREATE TABLE IF NOT EXISTS zhangqi(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        list_id INTEGER NOT NULL,
        pgk_id INTEGER NOT NULL,
        date varchar(10) NOT NULL,
        state INTEGER DEFAULT 0
        )`,
        err => {
            console.log(err)
        }
    )

    db.run(`create index zhangqi_list_id ON zhangqi (list_id)`, err => {
        console.log(err)
    })

    db.run(`create index zhangqi_pgk_id ON zhangqi (pgk_id)`, err => {
        console.log(err)
    })

    db.run(`create index zhangqi_date ON zhangqi (date)`, err => {
        console.log(err)
    })

    db.run(`create index zhangqi_state ON zhangqi (state)`, err => {
        console.log(err)
    })
})

export default db
