<template>
    <div id="app" class="flex">
        <el-menu
            class="menu-vertical"
            default-active="1"
            :router="true"
            background-color="#545c64"
            color="#fff"
            text-color="#eee"
        >
            <el-menu-item index="1">
                <i class="el-icon-c-scale-to-original"></i>
                <span slot="title">结算分析</span>
            </el-menu-item>
            <el-menu-item index="10" :route="{ name: 'zhangqi' }">
                <i class="el-icon-s-marketing"></i>
                <span slot="title">账期</span>
            </el-menu-item>
            <el-menu-item index="2" :route="{ name: 'accept' }">
                <i class="el-icon-document"></i>
                <span slot="title">受理清单</span>
            </el-menu-item>
            <el-menu-item index="6" :route="{ name: 'bill.list' }">
                <i class="el-icon-data-line"></i>
                <span slot="title">结算清单</span>
            </el-menu-item>
            <el-menu-item index="7" :route="{ name: 'bill.jifen' }">
                <i class="el-icon-data-analysis"></i>
                <span slot="title">积分清单</span>
            </el-menu-item>
            <el-menu-item index="3" :route="{ name: 'package' }">
                <i class="el-icon-s-cooperation"></i>
                <span slot="title">套餐管理</span>
            </el-menu-item>
            <el-menu-item index="4" :route="{ name: 'relate' }">
                <i class="el-icon-connection"></i>
                <span slot="title">关联副卡</span>
            </el-menu-item>
        </el-menu>
        <!-- <el-scrollbar class='main'> -->
        <!-- <div > -->
        <el-scrollbar noresize class="continer flex1">
            <!-- exclude="bill,blist,jlist" -->
            <keep-alive exclude="bill">
                <router-view class="main flex1 flex-column flex"></router-view>
            </keep-alive>
        </el-scrollbar>

        <!-- </div> -->
        <!-- </el-scrollbar> -->
    </div>
</template>
<script>
export default {}
</script>
<style lang="less">
html,
body,
#app {
    height: 100%;
}

body {
    color: #333;
}

#app {
    display: flex;
    width: 100%;

    .main {
        padding: 10px 20px 10px 20px;
    }

    .continer {
        // max-width: calc(100vw - 104px);
        height: 100%;
    }
    .continer > .el-scrollbar__wrap {
        overflow-x: auto;
        .el-scrollbar__view {
            .main {
                min-height: 100vh;
            }
        }
    }
    .menu-vertical {
        flex-shrink: 0;
        position: sticky;
        left: 0;
        z-index: 999;
    }

    // .el-scrollbar__view {
    //     padding: 10px;
    //     height: 100vh;
    //     box-sizing: border-box;
    // }

    font-size: 14px;
}

/*------------------滚动条---------------------------------*/
::-webkit-scrollbar {
    height: 8px;
    width: 8px;
    background: transparent;
    border-radius: 4px;
}

::-webkit-scrollbar-button {
    display: none;
}

::-webkit-scrollbar-track {
    background-color: transparent;
}

::-webkit-scrollbar-track-piece {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    width: 8px;
    min-height: 15px;
    background: #c1c1c1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:active,
::-webkit-scrollbar-thumb:hover {
    background: #7d7d7d;
}
</style>
