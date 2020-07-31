import fse from 'fs-extra';
import path from 'path';
import sq3 from 'sqlite3';
import logger from './logger';
import { docDir } from './settings';
// 将数据存至系统用户目录，防止用户误删程序
export const dbPath = path.join(docDir, 'data.sqlite3');
fse.ensureFileSync(dbPath);

const sqlite3 = sq3.verbose();
const db = new sqlite3.Database(dbPath);
db.serialize(() => {

    // CREATE TABLE `x2test`.`xxx` ( 
    // `id` INT NOT NULL AUTO_INCREMENT , 
    // `id2` VARCHAR(200) NOT NULL , 
    // `idx` INT NOT NULL , PRIMARY KEY (`id`), INDEX (`idx`), UNIQUE (`id2`)) ENGINE = InnoDB;
    db.run(`CREATE TABLE ITEMS(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      no VARCHAR(255),
      area VARCHAR(255),
      addr VARCHAR(255),
      acceptor VARCHAR(255),
      product_name VARCHAR(255),
      product_type VARCHAR(255),
      product_main VARCHAR(255),
      action VARCHAR(255),
      action_no VARCHAR(255) UNIQUE,
      created VARCHAR(255),
      status VARCHAR(255),
      date_end VARCHAR(255),
      user VARCHAR(255),
      remark VARCHAR(255),
      import_date VARCHAR(255)
  )`, err => {
        logger(err)
    })


    /**
     * 结算规则表 package
     */
// db.run(`drop table package`)
    db.run(`CREATE TABLE package(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
     name VARCHAR(255) NOT NULL,
     type VARCHAR(255),
     qudao VARCHAR(255),
     heyue_id VARCHAR(255),
     heyue_name VARCHAR(255),
     taocan_id VARCHAR(255),
     taocan_name VARCHAR(255),
     yongjin VARCHAR(255),
     yongjin_value VARCHAR(255),
     yonghu_type VARCHAR(255),
     jiesuan VARCHAR(255),
     jiesuan_star VARCHAR(255),
     jiesuan_month INTEGER NOT NULL,
     jiesuan_desc VARCHAR(255)
    )`, err => {
        logger(err);
    });
});

export default db;