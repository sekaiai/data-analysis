##### 受理表

1. 产品名称
2. 所属主销售品（套餐）
3. 业务动作
4. 业务号码（用户号码）
5. 受理时间
   默认没用，只有竣工时间不存在时，代替竣工时间。
6. 竣工时间
   如果没有竣工时间则取受理时间。

##### 结算清单表

1. 账期
   如果当月已结算，则往上继续结算。
   比如 5 月份结算了 2 次（有两个账期）则找小于当前账期的未结算的账期。进行结算。

2. 佣金结算金额（元）

3. 发展套餐名（套餐）
   套餐名关联受理表的套餐

4. 用户号码（用户号码）
   关联受理表的业务号码

5. 是否成功
   判断账期是否成功结算

#### 积分清单表

同上
结算清单没的失败

副卡表
关联业务号码。