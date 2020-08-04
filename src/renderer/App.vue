<template>
    <div id="app" class="flex">
        <el-menu class="menu-vertical" default-active="1" :router="true" :collapse="true" background-color="#545c64">
            <el-menu-item index="1">
                <i class="el-icon-menu"></i>
                <span slot="title">结算分析</span>
            </el-menu-item>
            <el-menu-item index="2" :route="{ name: 'accept' }">
                <i class="el-icon-document"></i>
                <span slot="title">受理清单</span>
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
        <div class="continer flex1 flex">
            <keep-alive exclude="blist,bill">
                <router-view class="main flex1 flex-column flex"></router-view>
            </keep-alive>
        </div>
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
        padding: 10px 20px;
    }

    .continer {
        max-width: calc(100vw - 104px);
    }

    .menu-vertical {
        flex-shrink: 0;
        position: sticky;
        left: 0;
        z-index: 999;
    }

    .el-scrollbar__view {
        padding: 10px;
        height: 100vh;
        box-sizing: border-box;
    }

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
