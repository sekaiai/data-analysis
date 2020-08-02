import fse from 'fs-extra';
import path from 'path';
import sq3 from 'sqlite3';
import logger from './logger';
import { docDir } from './settings';
// 将数据存至系统用户目录，防止用户误删程序
export const dbPath = path.join(docDir, 'data.sqlite3');
fse.ensureFileSync(dbPath);

console.log(dbPath)
const sqlite3 = sq3.verbose();
const db = new sqlite3.Database(dbPath);


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
     */
    db.run(`CREATE TABLE accept(
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
      UNIQUE(\`action_no\`)
  )`, err => {
        logger(err)
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
     * count： 结算次数
     * law: 结算规律
     * law: 结算规律说明
     */
    // db.run(`drop table package`)
    db.run(`CREATE TABLE package(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
     name VARCHAR(255) NOT NULL,
     count VARCHAR(255) NOT NULL,
     law VARCHAR(255) NOT NULL,
     law_desc VARCHAR(255),
     UNIQUE(\`name\`)
     
    )`, err => {
        logger(err);
    });

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
     */
    // db.run(`drop table bill`, err => {
    //     console.log(err)
    // })
    db.run(`create table bill(
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
     UNIQUE(\`order_id\`)

    )`, err => {
        logger(err);
    });

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
     * @param  {[type]} err [description]
     * @return {[type]}     [description]
     */
    db.run(`create table related_user(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
a1 varchar(200) NOT NULL,
a2 varchar(200),
a3 varchar(200),
a4 varchar(200),
a5 varchar(200),
     UNIQUE(\`a1\`)

    )`, err => {
        logger(err);
    });

    db.run(`create index a ON related_user (a2,a3,a4,a5)`, err => {
        console.log(err)
    })
});

export default db;