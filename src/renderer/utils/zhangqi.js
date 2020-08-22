import dayjs from 'dayjs'
import DB from './db'

const computedZhangqiState2 = async pgk_id => {
    ;`SELECT zq.*,j.date as j_date,b.date as b_date,a.product_main, b.package_name,b.id as b_id,a.id as a_id,j.id as j_id from zhangqi zq 
    left join accept a on a.pgk_id=zq.pgk_id 
    left join bill b on b.pgk_id=zq.pgk_id 
    left join jifen j on j.pgk_id=zq.pgk_id
    where zq.date=b.date or zq.date=b.date``SELECT zq.*,a.product_main, b.package_name,b.id as b_id,a.id as a_id from zhangqi zq 
left join accept a on a.pgk_id=zq.pgk_id and a.id=zq.list_id
left join bill b on (b.pgk_id=zq.pgk_id and zq.date<=b.date)
where zq.pgk_id=109
group by zq.id
`
}

// 更新账期状态
// 如果出现相同的两个账期
// 根据套餐和受理清单获取所有账期
// 查找当前账期的状态，如果状态为1则往下状态非1的。
// 更新状态
// SELECT zq.*,a.product_main, b.package_name from zhangqi zq left join accept a on a.pgk_id=zq.pgk_id left join bill b on b.pgk_id=zq.pgk_id where zq.date=b.date
const updateZhangqiState = ({ accept_id, pgk_id, date, type, state, qd_id }) => {
    console.log({ accept_id, pgk_id, date, type, state, qd_id })
    return new Promise(reslove => {
        // 1. 先查找当前账期及以下的数据
        let sql = ''
        if (state === 1) {
            sql = `select id from zhangqi where list_id=${accept_id} and pgk_id=${pgk_id} and date<=${date} and type=${type} and state<>1`

            DB.get(sql, (err, res) => {
                // console.log('updateZhangqiState', ...arguments, res)
                reslove()
                if (res && res.id) {
                    let sql = `update zhangqi set state=${state},qd_id=${qd_id} where id=${res.id}`

                    DB.run(sql, (err, res) => {
                        console.log('update zhangqi', state, err, res)
                    })
                }
            })
        } else if (state === -1) {
            // 直接获取当前账期状态，如果为1这不处理
            sql = `select id,state from zhangqi where list_id=${accept_id} and pgk_id=${pgk_id} and date=${date} and type=${type}`
            DB.get(sql, (err, res) => {
                reslove()
                if (res) {
                    if (res.state == 0) {
                        let sql = `update zhangqi set state=${state},qd_id=${qd_id} where id=${res.id}`
                        DB.run(sql, (err, res) => {
                            console.log('update zhangqi', state, err, res)
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

    console.log({ js_qingdan, jf_qingdan })
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
        console.log('computedZhangqiState', params)
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
    let sql = `delete from zhangqi where type=${type} and qd_id in (${ids.join(',')})`

    DB.run(sql, (err, res) => {
        // console.log('deleteZhangqi2Qingdan', err, res, sql)
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
        sql = `select b.id,b.package_name,b.user_number,a.id as a_id,p.id as p_id,b.date,b.status,a.action as accept_action
                    from ${type} b
                    left join accept a on (a.action_no=b.user_number or b.user_number=a.action_no)
                    left join pgk p on p.name=b.package_name
                    where p.id is not null and b.id > ${last_id}`
    } else {
        sql = `select b.id,b.package_name,b.user_number,a.id as a_id,p.id as p_id,b.date
                                from ${type} b
                                left join accept a on (a.action_no=b.user_number or b.user_number=a.action_no)
                                left join pgk p on p.name=b.package_name
                                where p.id is not null and b.id > ${last_id}`
    }

    DB.all(sql, async (err, res = []) => {
        console.log('updateZhangqiJifenState', res, sql)
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
            console.log('updateZhangqiJifenState', params)
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

    /*    select  j.id,p.id as p_id,zq.id as z_id,j.user_number as j_user_number, a.id as a_id, a.user_number as a_user_number
        from jifen j 
        left join accept a on j.package_name=a.product_name and (j.user_number=a.user_number or j.user_number=a.action_no) 
        left join pgk p on p.name=j.package_name
        left join zhangqi zq on zq.list_id=a.id and zq.qd_id=j.id and zq.pgk_id=p.id
        where j.id > 3000*/
    /*
select  j.id,p.id as p_id,j.user_number as j_user_number, a.id as a_id, a.user_number as a_user_number, a.action_no, j.package_name, a.product_main
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
            console.log('fetchPgk2qingdan', res, sql, err)
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
            console.log('fetchAcceptId', res, sql)
            if (!res.id) {
                // 没有找到受理清单ID，从副卡中获取数据
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
        let sql = `select a1 from related_user where a2='${user_number}' or a3='${user_number}' or a4='${user_number}' or a5='${user_number}' or a6='${user_number}'`
        DB.get(sql, (err, res) => {
            if (res && res.a1) {
                // 更新受理清单副卡
                let action_no = res.a1
                let sql = `select id,action from accept where (user_number = '${user_number}' or action_no='${action_no}') and pgk_id='${pgk_id}'`

                DB.get(sql, (err, res) => {
                    if (res && res.id) {
                        let sql = `update accept set user_number='${user_number}' where id=${res.id}`
                        DB.run(sql, (err, res) => {
                            // console.log('更新受理清单副卡', user_number)
                        })
                        return reslove({ id: res.id, action: res.action, from: user_number, to: action_no })
                    }
                    reslove({ id: 0, to: 0 })
                })
            } else {
                reslove({ id: 0, to: 0 })
            }
        })
    })
}

/*
 * 添加账期
 * item 账期详细信息
 * accepts 手里清单
 */
const insertZhangqi = async (taocan, accepts) => {
    return new Promise(reslove => {
        if (!accepts || !accepts.length) {
            return reslove(true)
        }
        // 获取他套餐信息
        let { id, count_js, count_jf, count_gs, law_jf, law_js, law_gs } = taocan
        // 2. 添加新账期。 2.1获取受理清单
        console.log('ididididididididididididid', id, taocan)
        // 组装每月结算间隔
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

        // console.log({ law_jf, law_js, accepts })

        let promiseArr = []
        for (let i = 0; i < accepts.length; i++) {
            let { date_end, created, id: accept_id, action } = accepts[i]
            let date = dayjs.unix(date_end || created)

            // console.log('date begin', { date })
            if (action === '新装') {
                // 创建结算(js)清单账期数据
                for (let i = 0; i < law_js.length; i++) {
                    let date_js = dayjs(date)
                        .add(law_js[i], 'month')
                        .format('YYYYMM')

                    promiseArr.push(insertZhangqiItem(accept_id, id, date_js, 1))
                }

                // 创建结算积分(jf)账期数据
                for (let i = 0; i < law_jf.length; i++) {
                    let date_jf = dayjs(date)
                        .add(law_jf[i], 'month')
                        .format('YYYYMM')

                    promiseArr.push(insertZhangqiItem(accept_id, id, date_jf, 2))
                }
            } else {
                // 创建改数率账期数据
                for (let i = 0; i < law_gs.length; i++) {
                    let date_gs = dayjs(date_gs)
                        .add(law_gs[i], 'month')
                        .format('YYYYMM')

                    promiseArr.push(insertZhangqiItem(accept_id, id, date_gs, 3))
                }
            }
        }

        if (promiseArr.length) {
            Promise.all(promiseArr).then(async values => {
                console.log('Promise all promiseArr', values)
                await computedZhangqiState(id)
                // loading = false
                reslove(true)
            })
        } else {
            reslove(true)
        }
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
const updateZhangqi = async id => {
    //1. 删除账期
    await deleteZhangqi(id)

    // 1. 删除清单ID
    let arr = []
    arr.push(deletePgkid(id, 'bill'))
    arr.push(deletePgkid(id, 'accept'))
    arr.push(deletePgkid(id, 'jifen'))
    await Promise.all(arr)

    // 获取套餐详细
    let taocan = await fetchTaocanItem(id)

    console.log({ taocan })

    // 添加套餐ID
    arr = []
    arr.push(addPgkid(taocan, 'bill'))
    arr.push(addPgkid(taocan, 'accept'))
    arr.push(addPgkid(taocan, 'jifen'))
    await Promise.all(arr)

    // 更新账期
    // todo: 计算 结算清单和积分清单

    let accepts = await fetchAcceptLists2pgkid(id)

    console.log('这是相关的受理清单', accepts)

    return insertZhangqi(taocan, accepts)
}

// 清单更新 pgk_id
const addPgkid = async (taocan = {}, type) => {
    /* let [name, ...alias] = await fetchTaocanName(id, 'id')
    if (!name) {
        return ''
    }*/

    let { id, name, alias } = taocan
    if (!id) return

    alias = formatAlias(alias)
    // console.log('addPgkid', { taocan, type, alias })

    let clounm_name = 'package_name'
    if (type === 'accept') {
        clounm_name = 'product_main'
    }
    return new Promise(reslove => {
        if (alias && alias.length) {
            alias =
                ' or ' +
                alias
                    .map(e => {
                        return `${clounm_name}='${e}'`
                    })
                    .join(' or ')
        }

        const sql = `update ${type} set pgk_id=${id} where ${clounm_name}='${name}' ${alias}`
        console.log('addPgkid', sql)
        DB.run(sql, (err, res) => {
            console.log('addPgkid', err, res, sql)
            reslove(res)
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
    let arr = []

    DB.all(`select * from accept from id > max_id`, async (err, res = []) => {
        // console.log(err, res)
        // 删除账期
        for (var i = 0; i < res.length; i++) {
            if (res[i].pgk_id) {
                let item = await fetchTaocanItem(res[i].pgk_id)
                arr.push(insertZhangqi(item, res[i]))
            }
        }
    })

    return Promise.all(arr)
}
// 获取套餐通过套餐名
const fetchTaocanItem2name = name => {
    return new Promise(reslove => {
        DB.get(`select * from pgk where name=${name}`, (err, res = {}) => {
            reslove(res)
        })
    })
}

// 获取单个套餐内容
const fetchTaocanItem = id => {
    return new Promise(reslove => {
        DB.get(`select * from pgk where id=${id}`, (err, res = {}) => {
            reslove(res)
        })
    })
}

// 获取受理清单列表， name = 套餐名称
const fetchAcceptLists = name => {
    return new Promise(reslove => {
        const sql = `select * from accept where product_main = '${name}'`
        DB.all(sql, (err, res = []) => {
            // console.log('fetchAcceptLists', err, res, sql)
            reslove(res)
        })
    })
}

// 获取受理清单列表， name = 套餐名称
const fetchAcceptLists2pgkid = pgk_id => {
    return new Promise(reslove => {
        const sql = `select * from accept where pgk_id = '${pgk_id}'`
        DB.all(sql, (err, res = []) => {
            // console.log('fetchAcceptLists', err, res, sql)
            reslove(res)
        })
    })
}

/**
 * 删除账期
 * id int 套餐ID
 */
const deleteZhangqi = id => {
    const sql1 = `delete from zhangqi where pgk_id='${id}'`
    const sql2 = `update bill set pgk_id=0 where pgk_id=${id}`
    const sql3 = `update jifen set pgk_id=0 where pgk_id=${id}`

    DB.run(sql1, (err, res) => {
        console.log('deleteZhangqi', err, res)
    })
    DB.run(sql2, (err, res) => {
        console.log('deleteZhangqi', err, res)
    })
    DB.run(sql3, (err, res) => {
        console.log('deleteZhangqi', err, res)
    })
}

export { insertZhangqi, updateZhangqiJifenState, deleteZhangqi2Qingdan, updateZhangqi, deleteZhangqi, SLinsertZhangqi }
