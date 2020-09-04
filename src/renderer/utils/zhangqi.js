import dayjs from 'dayjs'
import DB from './db'

const updateAllData = async () => {
    // 2. 更新套餐信息
    // 2.1 获取所有套餐
    /*    await new Promise(reslove => {
        DB.all()
    })*/
    const ids = await new Promise(reslove => {
        sqlAll('select id from pgk').then((res = []) => {
            const id = res.map(e => e.id)
            reslove(id)
        })
    })
    for (var i = 0; i < ids.length; i++) {
        await TCupdateZQ(ids[i], true)
    }
    return true
    // console.log('更新完成？')
    // TCupdateZQ(tc_id)

    // 3. 受理清单： 更新账期
    // 4. 更新账期
}

// pgk_id = 'arr obj str'
// type = 'null, jf, js'
const computedZhangqiState2 = async (pgk_id, type) => {
    /*    ;`SELECT zq.*,j.date as j_date,b.date as b_date,a.product_main, b.package_name,b.id as b_id,a.uuid as a_id,j.id as j_id from zhangqi zq 
    left join accept a on a.pgk_id=zq.pgk_id 
    left join bill b on b.pgk_id=zq.pgk_id 
    left join jifen j on j.pgk_id=zq.pgk_id
    where zq.date=b.date or zq.date=b.date``SELECT zq.*,a.product_main, b.package_name,b.id as b_id,a.uuid as a_id from zhangqi zq 
left join accept a on a.pgk_id=zq.pgk_id and a.uuid=zq.list_id
left join bill b on (b.pgk_id=zq.pgk_id and zq.date<=b.date)
where zq.pgk_id=109
group by zq.id
`*/
    let pgk = typeof pgk_id
    if (pgk === 'object') {
        pgk = `in ('${pgk_id.join("','")}')`
    } else if (pgk === 'string') {
        pgk = `='${pgk_id}'`
    } else {
        pgk = `!=0`
    }

    // 1. 查询出所有未结算的清单

    // 2. 查询出未结算的账期
    //
    return new Promise(reslove => {
        DB.serialize(async () => {
            DB.run('BEGIN TRANSACTION;')

            // console.log({ ZQ_LIST })

            const sqlArr = []
            const sqlArrE = []
            // 更新结算清单
            if (type !== 'jf') {
                const js_sql = `
                select a.uuid,a.pgk_id,a.action,jf.id,jf.date,jf.status
                from bill jf 
                left join accept a on a.pgk_id=jf.pgk_id and a.action_r like '%'||jf.user_number||'%'
                where a.uuid is not null and jf.flag <>1 and jf.pgk_id ${pgk}
                `
                const JS_LIST = await sqlAll(js_sql)

                // desc， 大的排前面，js结算的时候先把打的结算了。避免小的账期无法结算
                const zq_js_sql = `select * from zhangqi where state !=1 and type!=2 and pgk_id ${pgk} order by date desc`
                let ZQ_JS_LIST = await sqlAll(zq_js_sql)

                JS_LIST.forEach(jf => {
                    let idx = ZQ_JS_LIST.findIndex(zq => {
                        let type = jf.action === '新装' ? 1 : 3

                        /*                    console.log(
                            zq.list_id === jf.uuid,
                            zq.pgk_id === jf.pgk_id,
                            zq.date <= jf.date,
                            zq.type === type
                        )*/

                        return (
                            zq.list_id === jf.uuid && zq.pgk_id === jf.pgk_id && zq.date <= jf.date && zq.type === type
                        )
                    })
                    // console.log(idx)

                    if (idx !== -1) {
                        let zq = ZQ_JS_LIST[idx]

                        let state = jf.status | 0
                        if (state !== 1) {
                            state = -1
                        }

                        let upzq = `update zhangqi set state=${state},qd_id='${jf.id}' where id='${zq.id}'`
                        let upbl = `update bill set flag=1 where id='${jf.id}'`

                        if (state === -1) {
                            // console.log('sqlArrE', state)
                            sqlArrE.push(upzq, upbl)
                        } else {
                            // 删除数据
                            // console.log(zq.id, state)
                            ZQ_JS_LIST.splice(idx, 1)
                            sqlArr.push(upzq, upbl)
                        }

                        // sqlArr.push(runSql(`update zhangqi set state=${state},qd_id='${jf.id}' where id='${zq.id}'`))
                        // sqlArr.push(runSql(`update bill set flag=1 where id='${jf.id}'`))
                    }
                })
            }
            // 更新积分清单
            if (type !== 'js') {
                const jf_sql = `select a.uuid,a.pgk_id,a.action,jf.id,jf.date,jf.ydjf 
                from jifen jf 
                left join accept a on a.pgk_id=jf.pgk_id and a.action_r like '%'||jf.user_number||'%' 
                where a.uuid is not null and jf.flag <>1 and jf.pgk_id ${pgk}`
                const JF_LIST = await sqlAll(jf_sql)

                // asc，日期小的先结算
                const zq_jf_sql = `select * from zhangqi where state !=1 and type=2 and pgk_id ${pgk} order by date asc`
                let ZQ_JF_LIST = await sqlAll(zq_jf_sql)

                // console.log({ JF_LIST })
                // && zq.date <= jf.date
                JF_LIST.forEach(jf => {
                    // 先找出未结算的，更新信息。
                    let idx = ZQ_JF_LIST.findIndex(
                        zq => zq.list_id === jf.uuid && zq.pgk_id === jf.pgk_id && zq.type === 2 && zq.state == 0
                    )
                    // 如果没有未结算的，则找出已结算且结算失败的来更新。
                    if (idx === -1) {
                        idx = ZQ_JF_LIST.findIndex(
                            zq => zq.list_id === jf.uuid && zq.pgk_id === jf.pgk_id && zq.type === 2 && zq.state == -1
                        )
                    }

                    if (idx !== -1) {
                        let zq = ZQ_JF_LIST[idx]
                        let state = jf.ydjf > 0 ? 1 : -1

                        let upzq = `update zhangqi set state=${state},qd_id='${jf.id}' where id='${zq.id}'`
                        let upbl = `update jifen set flag=1 where id='${jf.id}'`

                        if (state === -1) {
                            // console.log('sqlArrE', state)
                            sqlArrE.push(upzq, upbl)
                        } else {
                            // 删除数据
                            // console.log('删除数据', idx, zq)
                            ZQ_JF_LIST.splice(idx, 1)
                            sqlArr.push(upzq, upbl)
                        }

                        // let [zq] = ZQ_JF_LIST.splice(idx, 1)
                        // console.log(zq, idx)
                        // sqlArr.push(`update zhangqi set state=1,qd_id='${jf.id}' where id='${zq.id}'`)
                        // sqlArr.push(`update jifen set flag=1 where id='${jf.id}'`)
                    }
                })
            }
            // 先插入state=-1的
            // console.log({ sqlArrE, sqlArr })
            if (sqlArrE.length) {
                await new Promise(reslove => {
                    sqlArrE.map(e => runSql(e))
                    Promise.all(sqlArrE).then(res => {
                        reslove(res)
                    })
                })
            }

            sqlArr.map(e => runSql(e))
            Promise.all(sqlArr).then(res => {
                DB.run('COMMIT TRANSACTION;')
                // console.log(6, Date.now())
                reslove(true)
            })
        })
    })
}

// 更新账期状态
// 如果出现相同的两个账期
// 根据套餐和受理清单获取所有账期
// 查找当前账期的状态，如果状态为1则往下状态非1的。
// 更新状态
// SELECT zq.*,a.product_main, b.package_name from zhangqi zq left join accept a on a.pgk_id=zq.pgk_id left join bill b on b.pgk_id=zq.pgk_id where zq.date=b.date
const updateZhangqiState = ({ accept_id, pgk_id, date, type, state, qd_id }) => {
    // console.log({ accept_id, pgk_id, date, type, state, qd_id })
    return new Promise(reslove => {
        // 1. 先查找当前账期及以下的数据
        let sql = ''
        if (state === 1) {
            sql = `select id from zhangqi where list_id=${accept_id} and pgk_id='${pgk_id}' and date<=${date} and type=${type} and state<>1`

            DB.get(sql, (err, res) => {
                // console.log('updateZhangqiState', ...arguments, res)
                reslove()
                if (res && res.id) {
                    let sql = `update zhangqi set state=${state},qd_id=${qd_id} where id=${res.id}`

                    DB.run(sql, (err, res) => {
                        // console.log('update zhangqi', state, err, res)
                    })
                }
            })
        } else if (state === -1) {
            // 直接获取当前账期状态，如果为1这不处理
            sql = `select id,state from zhangqi where list_id='${accept_id}' and pgk_id='${pgk_id}' and date=${date} and type=${type}`
            DB.get(sql, (err, res) => {
                reslove()
                if (res) {
                    if (res.state == 0) {
                        let sql = `update zhangqi set state=${state},qd_id=${qd_id} where id=${res.id}`
                        DB.run(sql, (err, res) => {
                            // console.log('update zhangqi', state, err, res)
                        })
                    }
                }
            })
        }
    })
}

/**
 * 计算账期是否结算
 * 1. 通过相关参数获取账单ID
 * 2. 通过套餐名和
 * id(自增)    清单ID(list_id)   套餐ID(pgk_id)    账期(date)    是否已结算(state)    结算类型(type)
 */
const computedZhangqiState = async pgk_id => {
    /*
     * 1. 结算清单: 通过套餐名获取所有 用户号码（）， 结算清单ID(qd_id)
     * 2. 受理清单：通过套餐名,用户号码 获取清单id(list_id)
     */
    let js_qingdan = await fetchPgkid2qingdan(pgk_id, 'bill')
    let jf_qingdan = await fetchPgkid2qingdan(pgk_id, 'jifen')

    // console.log({ js_qingdan, jf_qingdan })
    let promiseArr = []

    for (let i = 0; i < js_qingdan.length; i++) {
        let { id: qd_id, date, user_number, status } = js_qingdan[i]
        let { id: accept_id, action: accept_action } = await fetchAcceptId(user_number, pgk_id)

        let state = status | 0
        if (state !== 1) {
            state = -1
            // console.log('state -1', state)
        }
        let params = { accept_id, pgk_id, state, type: accept_action === '新装' ? 1 : 3, date, qd_id }
        // console.log('computedZhangqiState', params)
        promiseArr.push(updateZhangqiState(params))
    }

    for (let i = 0; i < jf_qingdan.length; i++) {
        let { id: qd_id, date, user_number } = jf_qingdan[i]
        let { id: accept_id } = await fetchAcceptId(user_number, pgk_id)

        let params = { accept_id, pgk_id, state: 1, type: 2, date, qd_id }
        promiseArr.push(updateZhangqiState(params))
    }

    return Promise.all(promiseArr)
}

const deleteZhangqi2Qingdan = (ids, type) => {
    type = type === 'bill' ? 1 : 2
    let sql = `update zhangqi set qd_id=NULL,state=0 where type=${type} and qd_id in ('${ids.join("','")}')`

    return new Promise(reslove => {
        DB.run(sql, (err, res) => {
            // console.log('deleteZhangqi2Qingdan', err, res)
            reslove()
        })
    })
}

// 通过 结算清单 更新账期状态
//
const updateZhangqiJifenState = async (last_id, type = 'bill') => {
    // 1. 先获取套餐id。
    // 2. 获取用户号码，如果没有号码的需要绑定到受理清单
    /*
    const accept_id = await fetchAcceptId(user_number, pgk_name)

    let sql = `select j.id as j_id, j.package_name,j.date,j.user_number as j_user_name, a.user_number as a_user_name,p.id as p_id
    from jifen j 
    left join accept a on j.package_name=a.product_name and (j.user_number=a.user_number or j.user_number=a.action_no) 
    left join pgk p on p.name=j.package_name where j.id > ${last_id}`

    DB.all(sql, (err, res) => {
        console.log('updateZhangqiJifenState', err, res)
    })*/

    // 1. 查询出相关的数据包括 id, a_id: 受理清单ID,p_id: 套餐ID,user_number
    // 1.1 如果没有a_id获取,就从副卡查找ID
    let sql = ''

    if (type === 'bill') {
        sql = `select b.id,b.package_name,b.user_number,a.uuid as a_id,p.id as p_id,b.date,b.status,a.action as accept_action
                    from ${type} b
                    left join accept a on (a.action_no=b.user_number or b.user_number=a.action_no)
                    left join pgk p on p.name=b.package_name
                    where p.id is not null and b.id > ${last_id}`
    } else {
        sql = `select b.id,b.package_name,b.user_number,a.uuid as a_id,p.id as p_id,b.date
                                from ${type} b
                                left join accept a on (a.action_no=b.user_number or b.user_number=a.action_no)
                                left join pgk p on p.name=b.package_name
                                where p.id is not null and b.id > ${last_id}`
    }

    DB.all(sql, async (err, res = []) => {
        // console.log('updateZhangqiJifenState', res, sql)
        if (!res || !res.length) {
            return
        }

        // 1. 查找没有受理ID的数据, 然后更新副卡
        // 如果没有副卡信息，就删除 该 清单
        for (var i = 0; i < res.length; i++) {
            let v = res[i]
            if (!v.a_id) {
                const { id = 0, action } = await fetchAcceptId2Re(v.user_number, v.pgk_id)
                v.a_id = id
                v.accept_action = action
            }

            let params = {
                accept_id: v.a_id,
                pgk_id: v.p_id,
                date: v.date,
                type: type !== 'bill' ? 2 : v.accept_action === '新装' ? 1 : 3,
                state: type === 'bill' ? (v.status | 0 ? 1 : -1) : 1,
                qd_id: v.id
            }
            // console.log('updateZhangqiJifenState', params)
            updateZhangqiState(params)
        }
        /*
        let notAcceptId = []
        res.forEach(e => {
            if (!e.a_id) {
                notAcceptId.push(fetchAcceptId2Re(e.user_number, e.package_name))
            }
        })
        if (notAcceptId.length) {
            notAcceptId = await Promise.all(notAcceptId)

            notAcceptId.forEach(e => {
                    let idx = res.findIndex(re => re.user_number === e.from)
                if (e.id) {
                    res[idx].a_id = e.id
                }else{
                    res.splice(idx,1)
                }
            })
        }

        // 开始更新信息
        updateZhangqiState()
*/
        // console.log({ notAcceptId })
    })

    /*    select  j.id,p.id as p_id,zq.id as z_id,j.user_number as j_user_number, a.uuid as a_id, a.user_number as a_user_number
        from jifen j 
        left join accept a on j.package_name=a.product_name and (j.user_number=a.user_number or j.user_number=a.action_no) 
        left join pgk p on p.name=j.package_name
        left join zhangqi zq on zq.list_id=a.uuid and zq.qd_id=j.id and zq.pgk_id=p.id
        where j.id > 3000*/
    /*
select  j.id,p.id as p_id,j.user_number as j_user_number, a.uuid as a_id, a.user_number as a_user_number, a.action_no, j.package_name, a.product_main
    from bill j 
    left join accept a on (j.user_number=a.user_number or j.user_number=a.action_no) 
    left join pgk p on p.name=j.package_name
    where j.id > 26000
    */
    // `update zhangqi set state=1,qd_id=${id} where date=${date} and `

    // let accept_id = await fetchAcceptId(user_number, package_name)
    // let pgk_id = await fetchTaocanId(package_name)
    // if(accept_id && pgk_id){

    // }

    // const params = { accept_id, pgk_id, state, type: 1, date, qd_id }
    // updateZhangqiState(params)
    // { accept_id, pgk_id, state, type: 1, date, qd_id }
}

const formatAlias = alias => {
    return String(alias)
        .split(/[\n,]/g)
        .filter(e => e && e !== 'undefined' && e != 'null')
}
/**
 * 获取套餐名称
 * @param  {string| ing} val
 * @param  {string} type name通过套餐名获取。id通过id获取套餐名
 * @return {Array}       返回名称和所有别名 数组
 */
const fetchTaocanName = (val, type = 'name') => {
    const sql = `select name, alias from pgk where ${type === 'name' ? 'name' : 'id'}=${val}`
    return new Promise(reslove => {
        DB.get(sql, (err, res) => {
            if (res && res.name) {
                let alias = []
                if (res.alias) {
                    alias = formatAlias(res.alias)
                }

                reslove([res.name, ...alias])
            }
        })
    })
}

/**
 * 通过套餐名或别名 获取套餐ID
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
const fetchTaocanId = name => {
    return new Promise(reslove => {
        let sql = `select id from pgk where name = '${name}' or alias like '%${name}%'`
        DB.all(sql, (err, res = []) => {
            const item = res.find(e => {
                if (e.name === 'name') {
                    return true
                } else if (e.alias) {
                    let alias = formatAlias(e.alias)
                    return alias.includes(name)
                }
                return false
            })
            let id = 0
            if (item) {
                id = item.id
            }

            reslove(id)
        })
    })
}

// 通过套餐名称获取所有相关的结算清单
const fetchPgkid2qingdan = (pgk_id, table = 'bill') => {
    // 1. 先获取所有套名称
    return new Promise(reslove => {
        let sql =
            table === 'bill'
                ? `select date,user_number,id,status from ${table} where pgk_id='${pgk_id}'`
                : `select date,user_number,id from ${table} where pgk_id='${pgk_id}'`
        DB.all(sql, (err, res = []) => {
            // console.log('fetchPgk2qingdan', res, sql, err)
            reslove(res)
        })
    })
}

// 通过套餐名称获取所有相关的结算清单
const fetchPgk2qingdan = (pgk_name, table = 'bill') => {
    // 1. 先获取所有套名称
    return new Promise(reslove => {
        let sql =
            table === 'bill'
                ? `select user_number,id,date,status from ${table} where package_name='${pgk_name}'`
                : `select date,user_number,package_name,id from ${table} where package_name='${pgk_name}'`
        DB.all(sql, (err, res = []) => {
            // console.log('fetchPgk2qingdan', res, sql, err)
            reslove(res)
        })
    })
}

// 获取受理清单ID
const fetchAcceptId = (user_number, pgk_id) => {
    return new Promise(reslove => {
        let sql = `select id,action from accept where (user_number = '${user_number}' or action_no='${user_number}') and pgk_id='${pgk_id}'`
        DB.get(sql, (err, res = {}) => {
            if (!res.id) {
                // 没有找到受理清单ID，从副卡中获取数据
                // console.log('没有找到受理清单ID，从副卡中获取数据', { user_number, pgk_id })
                fetchAcceptId2Re({ user_number, pgk_id }).then(res2 => {
                    reslove(res2)
                })
            } else {
                reslove(res)
            }
        })
    })
}
// return {id: accetp_id, to: 结果， from: user_member}
const fetchAcceptId2Re = ({ user_number, pgk_id }) => {
    return new Promise(reslove => {
        const sql = `select r.id as r_id,a.uuid, a.action, a.action_no from related_user r left 
        join accept a on a.action_no=r.a1 or a.action_no=r.a2 or a.action_no=r.a3 or a.action_no=r.a4 or a.action_no=r.a5 or a.action_no=r.a6 
        where a.action_no is not null and (a1='${user_number}' or a2='${user_number}' or a3='${user_number}' or a4='${user_number}' or a5='${user_number}' or a6='${user_number}')`

        // let sql = `select * from related_user where a1='${user_number}' or a2='${user_number}' or a3='${user_number}' or a4='${user_number}' or a5='${user_number}' or a6='${user_number}'`
        // let sql = `select * from related_user where a1='085104871344' or a2='085104871344' or a3='085104871344' or a4='085104871344' or a5='085104871344' or a6='085104871344'`
        DB.get(sql, (err, res) => {
            // console.log('获取副卡信息', sql, res)
            if (res && res.id) {
                // 更新受理清单副卡
                // let action_no = res.a1
                // `select r.id,r.a1,a.action_no,a.user_number from related_user r left
                // join accept a on a.action_no=r.a2 or a.action_no=r.a3 or a.action_no=r.a4 or a.action_no=r.a5 or a.action_no=r.a6
                // where a.action_no is not null`

                // let sql = `select id,action from accept where (user_number = '${user_number}' or action_no='${action_no}') and pgk_id='${pgk_id}'`

                const { id, action, action_no } = res
                let sql = `update accept set user_number='${user_number}' where id=${id}`
                DB.run(sql, (err, res) => {
                    // console.log('update 副卡', err, res)
                })
                return reslove({ id, action, from: user_number, to: action_no })
            } else {
                reslove({ id: 0, to: 0 })
            }
        })
    })
}

const createAcceptSQL = (keys, values) => {
    const keyStr = `'${keys.join("','")}'`

    return values.map(e => {
        const valStr = `'${e.join("','")}'`
        return `INSERT INTO accept (${keyStr}) VALUES (${valStr})`
    })
}

/*
 * 添加账期
 * item 账期详细信息
 * accepts 手里清单
 */
const createZhangqiSQL = (taocan, accept) => {
    // 获取他套餐信息
    let { id, count_js, count_jf, count_gs, law_jf, law_js, law_gs } = taocan
    if (!count_js) {
        law_js = []
    } else {
        law_js = law_js.toString().split(',')
        law_js.length = count_js
        law_js = Array.from(law_js, e => {
            e = e * 1
            if (isNaN(e)) e = 1
            return e
        })
    }

    // 组装每月结算间隔
    if (!count_jf) {
        law_jf = []
    } else {
        law_jf = law_jf.toString().split(',')
        law_jf.length = count_jf
        law_jf = Array.from(law_jf, e => {
            e = e * 1
            if (isNaN(e)) e = 1
            return e
        })
    }

    // 组装每月结算间隔
    if (!count_gs) {
        law_gs = []
    } else {
        law_gs = law_gs.toString().split(',')
        law_gs.length = count_jf
        law_gs = Array.from(law_gs, e => {
            e = e * 1
            if (isNaN(e)) e = 1
            return e
        })
    }

    let { date_end, created, uuid: accept_id, action } = accept

    let date = !date_end ? created : date_end
    if (date < 1000) {
        // console.log({ date, date1: isNaN(date), accept })
    }
    if (isNaN(date)) {
        date = dayjs(date)
    } else {
        date = dayjs.unix(date)
    }

    // const date = dayjs.unix(date_end || created)

    let sqlArr = []

    if (action === '新装') {
        let date_js = date
        for (let i = 0; i < law_js.length; i++) {
            date_js = dayjs(date_js)
                .add(law_js[i], 'month')
                .format('YYYYMM')
            let q = getZhangqiSql(accept_id, id, date_js, 1)
            sqlArr.push(q)
        }

        // 创建结算积分(jf)账期数据
        let date_jf = date
        for (let i = 0; i < law_jf.length; i++) {
            date_jf = dayjs(date_jf)
                .add(law_jf[i], 'month')
                .format('YYYYMM')
            let q = getZhangqiSql(accept_id, id, date_jf, 2)
            sqlArr.push(q)
        }
    } else {
        // 创建改数率账期数据
        let date_gs = date
        for (let i = 0; i < law_gs.length; i++) {
            date_gs = dayjs(date_gs)
                .add(law_gs[i], 'month')
                .format('YYYYMM')

            let q = getZhangqiSql(accept_id, id, date_gs, 3)
            sqlArr.push(q)
        }
    }
    return sqlArr
}

const getZhangqiSql = (accept_id, id, date, type) => {
    return `insert into zhangqi (list_id, pgk_id, date, type) values ('${accept_id}','${id}',${date}, ${type})`
}

// 删除重复数据
// 删除重复的accept
// 删掉重复的账期
const deleteReplaceData = () => {
    // 查询出非重复的ID
    const sql1 = `SELECT uuid FROM accept where uuid not in(SELECT d.uuid FROM ( SELECT uuid,import_date ,action_no, product_main, ACTION, created, product_name FROM accept ORDER BY ACTION DESC, created ASC, import_date desc
) d GROUP BY d.action_no,d.product_name)`
    return new Promise(async reslove => {
        const replaceId = await new Promise(reslove => {
            DB.all(sql1, (err, res = []) => {
                // console.log(err, res)
                reslove(res)
            })
        })
        // console.log(replaceId.length)
        if (replaceId.length) {
            await deleteZhangqi2accept(replaceId)
        }
        reslove(true)
    })
}

// 删除所有关联的账期
const deleteZhangqi2accept = apts => {
    return new Promise(async reslove => {
        if (!apts || !apts.length) return reslove(false)
        let ids = `'${apts.map(e => e.uuid).join("','")}'`

        // 1. 先更新清单flag,再删除账期
        const upSQL = [
            `UPDATE jifen SET flag=0 where id in ( SELECT qd_id FROM zhangqi zq WHERE zq.list_id in(${ids}) and zq.qd_id is not null )`,
            `UPDATE bill SET flag=0 where id in ( SELECT qd_id FROM zhangqi zq WHERE zq.list_id in(${ids}) and zq.qd_id is not null )`
        ]

        await new Promise(reslove => {
            let arr = []
            DB.serialize(() => {
                DB.run('BEGIN TRANSACTION;')
                let i = 0
                let len = upSQL.length
                while (i < len) {
                    arr.push(runSql(upSQL[i]))
                    i++
                }

                Promise.all(arr).then(res => {
                    DB.run('COMMIT TRANSACTION;')
                    // console.log(61, Date.now())
                    reslove()
                })
            })
        })

        // 删除所有关联的账期
        let arr = []
        const sqls = [`delete from zhangqi where list_id in (${ids})`, `delete from accept where uuid in (${ids})`]
        // console.log(sqls)
        DB.serialize(() => {
            DB.run('BEGIN TRANSACTION;')
            let i = 0
            let len = sqls.length
            while (i < len) {
                arr.push(runSql(sqls[i]))
                i++
            }

            Promise.all(arr).then(res => {
                DB.run('COMMIT TRANSACTION;')
                // console.log(6, Date.now())
                reslove(true)
            })
        })
    })
}
// sql写入数据库
const runSql2Arr = sqlArr => {
    let arr = []
    let len = sqlArr.length
    let i = 0
    // console.log(0, Date.now())

    return new Promise(reslove => {
        if (!len) {
            return reslove(true)
        }

        DB.serialize(() => {
            DB.run('BEGIN TRANSACTION;')
            // console.log(1, Date.now())

            while (i < len) {
                // console.log(sqlArr[i])
                arr.push(runSql(sqlArr[i]))
                /*             DB.run(sqlArr[i], (err, res = []) => {
                    // console.log('runSql2', err, res)
                    // reslove(res, sql)
                })*/
                i++
                if (i >= len) {
                    // console.log(5, Date.now())
                }
            }

            Promise.all(arr).then(res => {
                DB.run('COMMIT TRANSACTION;')
                // console.log(6, Date.now())
                reslove(true)
            })
        })
    })
}

const sqlAll = (sql, params = []) => {
    return new Promise(reslove => {
        DB.all(sql, params, (err, res = []) => {
            if (err) {
                // console.log(err, sql)
            }
            // console.log('runSql2', err, res, sql)
            reslove(res)
        })
    })
}
const runSql = sql => {
    // console.log('runSql', sql)
    return new Promise(reslove => {
        DB.run(sql, (err, res = []) => {
            if (err) {
                // console.log(err, sql)
            }
            // console.log('runSql2', err, res, sql)
            reslove(res)
        })
    })
}

const runSql2 = (sql, param) => {
    // console.log('runSql', sql)
    return new Promise(reslove => {
        DB.run(sql, param, (err, res = []) => {
            reslove(res)
        })
    })
}

/**
 * date 结算时间 账期
 * @param  {[type]} accept_id [description]
 * @param  {[type]} id        [description]
 * @param  {[type]} date      [description]
 * @param  {[type]} type      1.结算清单，2积分清单，3改速率
 * @return {[type]}           [description]
 */
const insertZhangqiItem = (accept_id, id, date, type) => {
    return new Promise(reslove => {
        DB.run(
            `insert into zhangqi (list_id, pgk_id, date, type) values (${accept_id},${id},${date}, ${type})`,
            (err, res) => {
                // console.log('zhangqi', err, res)
                reslove(res)
            }
        )
    })
}

/*
 * 重写账期，以及更新账期state
 * 1. 先删除当前套餐关联的说有账期
 * 2. 根据套餐添加新账期
 * 3. 根据结算清单和积分清单 重新统计账期
 * id => 套餐id
 */
const TCupdateZQ = async (id, isedit = false) => {
    //1. 删除账期
    if (isedit) {
        await deleteZhangqi(id)
    }

    // 获取套餐详细
    let taocan = await fetchTaocanItem(id)

    // 添加套餐ID
    await addPgkid(taocan, ['bill', 'accept', 'jifen'])

    // 创建账期sql
    let accepts = await fetchAcceptLists2pgkid(id)

    let sqlArr = []
    for (var i = 0; i < accepts.length; i++) {
        sqlArr.push(...createZhangqiSQL(taocan, accepts[i]))
    }
    // console.log(sqlArr)

    // 添加账期
    await runSql2Arr(sqlArr)

    // 更新账期，结算表。
    return computedZhangqiState2(id)
}

// 清单更新 pgk_id
const addPgkid = async (taocan = {}, types = []) => {
    // return new Promise(reslove => {})

    return new Promise(reslove => {
        let { id, name, alias } = taocan
        // console.log('addPgkid 1', id, taocan)
        if (!id) return reslove()

        alias = formatAlias(alias)
        // console.log('addPgkid', { taocan, type, alias })
        // console.log({ alias })
        DB.serialize(() => {
            DB.run('BEGIN TRANSACTION;')

            let sqlArr = []
            for (var i = 0; i < types.length; i++) {
                let clounm_name = types[i] === 'accept' ? 'product_main' : 'package_name'

                let _alias = ''
                if (alias && alias.length) {
                    _alias =
                        ' or ' +
                        alias
                            .map(e => {
                                return `${clounm_name}='${e}'`
                            })
                            .join(' or ')
                }

                let sql = `update ${types[i]} set pgk_id='${id}' where ${clounm_name}='${name}' ${_alias}`
                // console.log(sql)
                sqlArr.push(runSql(sql))

                /*    DB.run(sql, id, (err, res) => {
                    reslove(res)
                })*/
            }
            // console.log(sqlArr)

            Promise.all(sqlArr).then(res => {
                DB.run('COMMIT TRANSACTION;')
                reslove(true)
            })
            // DB.run('COMMIT TRANSACTION;')

            /*runSql2Arr(sqlArr).then(res => {
               
            })*/
        })
    })
}

// 更新表的pak_id = 0
const deletePgkid = async (id, type) => {
    return new Promise(reslove => {
        DB.run(`update accept set pgk_id=0 where pgk_id=${id}`, (err, res) => {
            reslove(res)
        })
    })
}

const SLinsertZhangqi = async max_id => {
    // console.log({ max_id })
    return new Promise(reslove => {
        let arr = []
        DB.all(`select * from accept where id > ${max_id}`, async (err, res = []) => {
            // console.log('SLinsertZhangqi', err, res)
            for (var i = 0; i < res.length; i++) {
                if (res[i].pgk_id) {
                    let item = await fetchTaocanItem(res[i].pgk_id)
                    // console.log('res[i].pgk_id', res[i].pgk_id, item)
                    arr.push(insertZhangqi(item, [res[i]]))
                }
            }

            Promise.all(arr).then(res => {
                // console.log('xxxxxxxxxxxxxxxxxxxxxx', res, arr)
                reslove(res)
            })
        })
    })
}
// 获取套餐通过套餐名
const fetchTaocanItem2name = name => {
    return new Promise(reslove => {
        const sql = `select * from pgk where name='${name}' or alias like '%${name}%'`
        DB.get(sql, (err, res = {}) => {
            // console.log('fetchTaocanItem2name', sql, res)
            if (res && res.alias) {
                if (res.name === name) {
                    reslove(res)
                } else {
                    const alias = formatAlias(res.alias)
                    if (alias.includes(name)) {
                        reslove(res)
                    } else {
                        reslove({})
                    }
                }
            } else {
                reslove(res)
            }
        })
    })
}

// 获取单个套餐内容
const fetchTaocanItem = id => {
    return new Promise(reslove => {
        DB.get(`select * from pgk where id=?`, id, (err, res = {}) => {
            reslove(res)
        })
    })
}

// 获取受理清单列表， name = 套餐名称
const fetchAcceptLists = name => {
    return new Promise(reslove => {
        const sql = `select * from accept where product_main = ?`
        DB.all(sql, name, (err, res = []) => {
            // console.log('fetchAcceptLists', err, res, sql)
            reslove(res)
        })
    })
}

// 获取受理清单列表， name = 套餐名称
const fetchAcceptLists2pgkid = pgk_id => {
    return new Promise(reslove => {
        const sql = `select * from accept where pgk_id = ?`
        DB.all(sql, pgk_id, (err, res = []) => {
            // console.log('fetchAcceptLists', err, res, pgk_id)
            reslove(res)
        })
    })
}

/**
 * 删除账期
 * id int 套餐ID
 */
const deleteZhangqi = id => {
    const sql1 = `delete from zhangqi where pgk_id=?`
    const sql2 = `update bill set pgk_id=0,flag=0 where pgk_id=?`
    const sql3 = `update jifen set pgk_id=0,flag=0 where pgk_id=?`
    const sql4 = `update accept set pgk_id=0 where pgk_id=?`

    const arr = [sql1, sql2, sql3, sql4]
    return new Promise(reslove => {
        DB.serialize(() => {
            DB.run('BEGIN TRANSACTION;')
            // console.log(1, Date.now())
            let i = 0
            while (i < arr.length) {
                DB.run(arr[i], id, (err, res) => {})
                i++
            }

            DB.run('COMMIT TRANSACTION;')
            reslove(true)
        })
    })
}

// 导出[受理清单] 所有没有结算清单
const importSLNoneJS = (pgk_id, date) => {
    return new Promise(reslove => {
        let _date = date ? `zq.date=${date}` : true

        // const sql = `select zq.date,a.* from accept a left join zhangqi zq on zq.pgk_id=a.pgk_id where a.pgk_id=${pgk_id} and zq.date=${date} group by a.uuid`
        // const sql = `select a.*,zq.qd_id,zq.state,zq.date from accept a left join zhangqi zq on zq.list_id=a.uuid where a.pgk_id=${pgk_id} and zq.state=0 group by a.uuid`
        const sql = `select a.*,zq.qd_id,zq.state,zq.date from accept a left join zhangqi zq on zq.list_id=a.uuid and ${_date} where a.pgk_id='${pgk_id}' and zq.state=0  group by a.uuid`

        DB.all(sql, (err, res = []) => {
            let notfoundItems = {
                date: '账期',
                no: '购物车流水号',
                area: '地区',
                addr: '渠道名称',
                acceptor: '受理人',
                product_name: '产品名称',
                product_type: '角色名称',
                product_main: '所属主销售品',
                action: '业务动作',
                action_no: '业务号码',
                user_number: '结算号码(副卡)',
                created: '受理时间',
                status: '工单状态',
                date_end: '竣工时间',
                user: '揽收人',
                remark: '备注'
            }
            const datas = parseAoaData(res, notfoundItems)
            reslove(datas)

            // console.log(res, sql, datas)
            /*
             * 下载excel表格
             * datas array 表格数据
             * name string 表格名称
             */
            // download.excel2(datas, '没有找到结算清单的受理表')
        })
    })
}
const parseAoaData = (datas, json = '') => {
    // json转成execl需要的数组

    const line1 = Object.values(json || this.notfoundItems)
    const keys = Object.keys(json || this.notfoundItems)

    datas = datas.map(v => {
        return keys.map(k => {
            if (k === 'date_end' || k === 'created') {
                v[k] = dayjs.unix(v[k]).format('YYYY-MM-DD HH:mm:ss')
            }
            return v[k]
        })
    })
    datas.unshift(line1)
    // this.$logger(datas)
    return datas
}

// 导出[结算清单(未受理)] 所有没有受理清单的
const importJSNoneSL = (pgk_id, date) => {
    return new Promise(reslove => {
        let _date = date ? `b.date=${date}` : true
        const sql = `select * from bill b where b.flag !=1 and b.pgk_id=? and ${_date}`
        // const sql = `select b.* from bill b where ${_date} and b.pgk_id='${pgk_id}' and b.id not in (select zq.qd_id from zhangqi zq where zq.pgk_id='${pgk_id}' and zq.qd_id is not null)`
        // const sql = `select zq.date,zq.state,b.* from bill b left join zhangqi zq on zq.pgk_id=b.pgk_id where zq.state=0 and b.pgk_id=${pgk_id} and zq.date='${date}' group by b.id`
        DB.all(sql, pgk_id, (err, res) => {
            // console.log(sql, res)
            let notfoundItems = {
                date: '账期',
                order_id: '订单号',
                complete_date: '订单竣工时间',
                commission_policy: '佣金结算策略',
                commission_type: '佣金结算类型',
                commission_money: '佣金结算金额（元）',
                package_name: '发展套餐名',
                product_name: '产品类型',
                user_id: '用户ID',
                user_number: '用户号码',
                status: '是否成功结算',
                cause: '原因',
                branch: '网点名称'
            }

            const datas = parseAoaData(res, notfoundItems)
            reslove(datas)

            /*
             * 下载excel表格
             * datas array 表格数据
             * name string 表格名称
             */
            // download.excel2(datas, '没有找到结算清单的受理表')
        })
    })
}

// 返回 {id: #name#alias#}
const getAllTaocan = () => {
    return new Promise(reslove => {
        DB.all(`select * from pgk`, (err, res = []) => {
            // console.log('all taocan', err, res)
            // if (!res) return reslove([])

            const data = res.map(e => {
                let arr = [e.name]
                if (e.alias) {
                    let val = formatAlias(e.alias)
                    arr.push(...val)
                }
                return { ...e, val: `#${arr.join('#')}#` }
            })
            reslove(data)
        })
    })
}
// 返回 {id: #name#alias#}
const getAllFuka = () => {
    return new Promise(reslove => {
        DB.all(`select * from related_user`, (err, res = []) => {
            // if (!res) return reslove([])

            const data = res.map(e => {
                let val = []
                for (let n in e) {
                    if (n !== 'id') {
                        val.push(e[n])
                    }
                }
                return `#${val.join('#')}#`
            })
            return reslove(data)
        })
    })
}

export {
    runSql2,
    sqlAll,
    computedZhangqiState2,
    runSql2Arr,
    deleteZhangqi2accept,
    getAllFuka,
    getAllTaocan,
    importSLNoneJS,
    importJSNoneSL,
    createAcceptSQL,
    createZhangqiSQL,
    updateZhangqiJifenState,
    deleteZhangqi2Qingdan,
    fetchTaocanItem2name,
    deleteReplaceData,
    TCupdateZQ,
    deleteZhangqi,
    SLinsertZhangqi,
    updateAllData
}
