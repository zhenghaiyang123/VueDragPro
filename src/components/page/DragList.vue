<template>
  <div class="board container" style="width: 100%">
    <el-row class="">
      <el-col :span="4" border='true' class="ResourceWrapper" style="height:84vh;">
        <el-card class="box-card" style='background: none;'>
          <div slot="header" class="clearfix">
            <span>组件区(单击添加)</span>
          </div>
          <el-scrollbar style="height:75vh">
            <grid-layout :layout="ResourceData" :col-num="colNum" :row-height="rowHeight" :is-draggable="isDraggable" :is-resizable="false" :is-mirrored="false" :vertical-compact="true" :margin="margin" :use-css-transforms="true">
              <grid-item v-for="(item) in ResourceData" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :key="'rescomp'+item.i" @resize="resizeHandler" @move="moveHandler" @resized="resizedHandler" @moved="movedHandler">
                <!-- 根据组件名动态加载组件 -->
                <!-- numPanel组件 -->
                <div :data-comp="item.Component" v-if="item.type=='numPanel'" @click="addNumPanel(item.Component,item.initW,item.initH,item.type,item.iconName,item.textContent,item.dataName)">
                  <el-card shadow="hover" class="" style="width: 100%;height:100%">
                    <component :is="item.Component" :height="item.h*rowHeight+(item.h-2)*10 +'px'"></component>
                  </el-card>
                </div>
                <!-- 折线组件 -->
                <div :data-comp="item.Component" v-else-if="item.type=='lineChart'" @click="addLineChart(item.Component,item.initW,item.initH,item.type,item.titleText,item.xArray,item.seriesData)">
                  <el-card shadow="hover" class="" style="width: 100%;height:100%">
                    <component :is="item.Component" :height="item.h*rowHeight+(item.h-2)*10 +'px'"></component>
                  </el-card>
                </div>
                <!-- 其他组件 -->
                <div :data-comp="item.Component" v-else @click="addItem(item.Component,item.initW,item.initH,item.type)">
                  <el-card shadow="hover" class="" style="width: 100%;height:100%">
                    <component :is="item.Component" :height="item.h*rowHeight+(item.h-2)*10 +'px'"></component>
                    <!-- <component :is="item.Component" :height="item.h* rowHeight+'px'"></component> -->
                  </el-card>
                </div>
              </grid-item>
            </grid-layout>
          </el-scrollbar>
        </el-card>
      </el-col>
      <el-col :span="20" class="layoutWrapper">
        <el-card class="box-card" style='background: none;'>
          <div slot="header" class="clearfix">
            <span>窗体区(高度超出蓝色线框生成的页面将会产生滚动条)</span>
            <el-button @click="saveLayout" style="float: right; padding: 3px 0" type="text">保存布局</el-button>
          </div>
          <el-scrollbar style="height:74.4vh" ref="card">
            <grid-layout :maxRows="6" :layout="layoutData" :col-num="colNum" :row-height="rowHeight" :is-draggable="isDraggable" :is-resizable="isResizable" :is-mirrored="false" :vertical-compact="true" :margin="margin" :use-css-transforms="true" @layout-updated="layoutUpdatedHandler">
              <grid-item v-for="(item) in layoutData" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :key="'comp'+item.i">
                <!-- 根据组件名动态加载组件 -->
                <!-- numPanel类型的组件 -->
                <el-card shadow="hover" v-if="item.type=='numPanel'" class="" style="width: 100%;height:100%">
                  <el-button @click="deleteItem(item.i)" icon="el-icon-delete" class="deleteButton" size="medium" type="text"></el-button>
                  <el-button @click="configPanel(item.i,item.Component,item.type)" icon="el-icon-setting" class="configButton" size="medium" type="text"></el-button>
                  <!-- 此处需要传递数据 -->
                  <component :is="item.Component" :numText="item.textContent" :num="$data.param[item.dataName]" :height="item.h*rowHeight+(item.h-2)*10 +'px'"></component>
                </el-card>
                <!-- 折线类型的组 -->
                <el-card shadow="hover" v-else-if="item.type=='lineChart'" class="" style="width: 100%;height:100%">
                  <el-button @click="deleteItem(item.i)" icon="el-icon-delete" class="deleteButton" size="medium" type="text"></el-button>
                  <el-button @click="configPanel(item.i,item.Component,item.type)" icon="el-icon-setting" class="configButton" size="medium" type="text"></el-button>
                  <!-- 此处需要传递数据 -->
                  <!-- <div>{{item.titleText}}</div> -->
                  <component :is="item.Component" :title-text="item.titleText" :x-array="$data.xArrayList[item.xArray]" :series-data="$data.yArrayList[item.seriesData]" :height="item.h*rowHeight+(item.h-2)*10 +'px'"></component>
                </el-card>
                <!-- 其他类型的组件 -->
                <el-card shadow="hover" v-else class="" style="width: 100%;height:100%">
                  <el-button @click="deleteItem(item.i)" icon="el-icon-delete" class="deleteButton" size="medium" type="text"></el-button>
                  <component :is="item.Component" :height="item.h*rowHeight+(item.h-2)*10 +'px'"></component>
                </el-card>
              </grid-item>
            </grid-layout>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
    <!-- numPanel配置对话框 -->
    <el-dialog title="数据配置" :visible.sync="numPanelConfigVisible" width="40%" :before-close="handleClose" center>
      <el-row style="height:100px" class="contentCenter">
        <el-col :span='24' class="contentCenter">
          <el-card shadow="hover" style="width: 80%;height:100%">
            <component :is="currentCompName" :height="'50px'"></component>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span='24' class="contentCenter">
          <el-card shadow="hover" style="width: 80%;height:100%">
            <el-form label-width="80px">
              <el-form-item label="图标名称">
                <el-input v-model="numPanelConfigData.iconName"></el-input>
              </el-form-item>
              <el-form-item label="显示内容">
                <el-input v-model="numPanelConfigData.textContent"></el-input>
              </el-form-item>
              <el-form-item label="参数名称">
                <el-select v-model="numPanelConfigData.dataName" style="width:100%" placeholder="请选择参数名称">
                  <el-option v-for="(item,index) in paramList" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="numPanelConfigVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveConfigData">保存</el-button>
      </span>
    </el-dialog>
    <!-- end numPanel配置对话框 -->
    <!-- linChart配置对话框 -->
    <el-dialog title="数据配置" :visible.sync="lineChartConfigVisible" width="40%" :before-close="handleClose" center>
      <el-row style="height:180px" class="contentCenter">
        <el-col :span='24' class="contentCenter">
          <el-card shadow="hover" style="width: 80%;height:100%">
            <component :is="currentCompName" :height="'150px'"></component>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span='24' class="contentCenter">
          <el-card shadow="hover" style="width: 80%;height:100%">
            <el-form label-width="80px">
              <el-form-item label="图表标题">
                <el-input v-model="lineChartConfigData.titleText"></el-input>
              </el-form-item>
              <el-form-item label="X轴数据">
                <el-select v-model="lineChartConfigData.xArray" style="width:100%" placeholder="请选择参数">
                  <el-option v-for="(item,index) in xList" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Y轴数据">
                <el-select v-model="lineChartConfigData.seriesData" style="width:100%" placeholder="请选择参数">
                  <el-option v-for="(item,index) in yList" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="lineChartConfigVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveConfigData">保存</el-button>
      </span>
    </el-dialog>
    <!-- end linChart配置对话框 -->
  </div>
</template>

<script>
//组件资源数据
import resourcesData from '../../../public/layout/resourceData.json'
import VueGridLayout from 'vue-grid-layout'
import axios from 'axios'
const GridLayout = VueGridLayout.GridLayout
const GridItem = VueGridLayout.GridItem
import barChart from '../chart/newChart'
import lineChart from '../chart/newLineChart'
import parChart from '../chart/parChart'
import mapChart from '../chart/mapChart'
import borderChart from '../chart/borderChart'
import cdf from '../chart/cdf'
import electric from '../numPanel/electric'

export default {
  data () {
    return { // 布局数据
      layoutData: [],
      ResourceData: [],
      colNum: 12,//行数
      // 布局二维数组地图
      layoutMap: [],
      // 布局列数
      layoutColNum: 12,
      rowHeight: 80,//行高
      maxRows: 12,
      height: 600,
      isDraggable: true,
      isResizable: true,
      isMirrored: false,
      verticalCompact: true,
      margin: [10, 10],
      useCssTransforms: true,
      numPanelConfigVisible: false,
      lineChartConfigVisible: false,
      currentCompId: "",//记录当前激活配置的组件id
      currentCompName: "",//记录当前激活配置的组件name
      currentCompType: "",//记录当前激活配置组件类型
      //   传感参数
      param: {
        equipNum: 5,
        breakEquipNum: 10,
      },
      xArrayList: {
        timeArrar: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],

      },
      yArrayList: {
        valueArrary: [24.5, 26, 28, 24, 23, 15, 19],
      },
      //存放参数列表，供下拉列表框选择
      paramList: [
        { name: '正常设备', id: 'equipNum' },
        { name: '异常设备', id: 'breakEquipNum' },
      ],
      xList: [{ name: '时间数据', id: 'timeArrar' }],
      yList: [{ name: '温度', id: 'valueArrary' }],
      //   numPanel相关的配置数据
      numPanelConfigData: {
        "iconName": "",
        "textContent": "",
        "dataName": ""
      },
      //   linChart相关配置数据
      lineChartConfigData: {
        "titleText": "",
        "xArray": "",
        "seriesData": ""
      }
    }
  },
  mounted () {
    var h = document.documentElement.clientHeight || document.body.clientHeight;
    console.log(h)
    this.rowHeight = (h * 0.74 - 80) / 6
    // 加载完成后显示提示
    this.showInfo()

  },
  components: {
    GridLayout,
    GridItem,
    barChart,
    lineChart,
    parChart,
    mapChart,
    borderChart,
    cdf,
    electric
  },
  methods: {
    init () {
      //   this.layoutData = layoutdata.mainData
      this.ResourceData = resourcesData
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    // 弹出配置面板
    configPanel: function (compId, compName, compType) {
      this.currentCompId = compId;
      this.currentCompName = compName;
      this.currentCompType = compType;
      switch (compType) {
        case "numPanel":
          this.numPanelConfigVisible = true
          break;
        case "lineChart":
          this.lineChartConfigVisible = true
          break;
        default:
          break;
      }
    },
    // 保存配置数据
    saveConfigData: function () {
      switch (this.currentCompType) {
        case "numPanel":
          for (let i = 0; i < this.layoutData.length; i++) {
            if (this.layoutData[i].i == this.currentCompId) {
              this.layoutData[i].iconName = this.numPanelConfigData.iconName;
              this.layoutData[i].textContent = this.numPanelConfigData.textContent;
              this.layoutData[i].dataName = this.numPanelConfigData.dataName;
              //   清空数据
              this.numPanelConfigData.iconName = "";
              this.numPanelConfigData.textContent = "";
              this.numPanelConfigData.dataName = "";
            }
          }
          //   清空激活数据
          this.currentCompId = "";
          this.currentCompName = "";
          this.currentCompType = "";
          this.numPanelConfigVisible = false
          break;
        case "lineChart":
          for (let i = 0; i < this.layoutData.length; i++) {
            if (this.layoutData[i].i == this.currentCompId) {
              this.layoutData[i].titleText = this.lineChartConfigData.titleText;
              this.layoutData[i].xArray = this.lineChartConfigData.xArray;
              this.layoutData[i].seriesData = this.lineChartConfigData.seriesData;
              //   清空数据
              this.lineChartConfigData.titleText = "";
              this.lineChartConfigData.xArray = "";
              this.lineChartConfigData.seriesData = "";
            }
          }
          //   清空激活数据
          this.currentCompId = "";
          this.currentCompName = "";
          this.currentCompType = "";
          this.lineChartConfigVisible = false
          break;
        default:
          break;
      }

    },
    // 添加数字面板组件
    addNumPanel: function (comp, w, h, type, iconName, contentText, dataName) {
      // 宽高
      var itemW = w;
      var itemH = h;

      var addItem = {
        "x": 0,
        "y": this.layoutMap.length,
        "w": itemW,
        "h": itemH,
        "i": this.layoutData[this.layoutData.length - 1] ? parseInt(this.layoutData[this.layoutData.length - 1].i) + 1 : 0,
        "Component": comp,
        "IsResource": true,
        "type": type,
        "iconName": iconName,
        "textContent": contentText,
        "dataName": dataName
      };
      if (this.layoutMap.length) {
        // console.log(this.layoutMap.length);
        for (let r = 0, rLen = this.layoutMap.length; r < rLen; r++) {
          for (let c = 0; c <= (this.layoutColNum - itemW); c++) {
            let res = this.regionalTest(
              c,
              r,
              itemW,
              rLen > (r + itemH) ? itemH : rLen - r
            );

            if (res.result) {
              // 更新添加数据内容
              let compId = 0
              if (this.layoutData.length < 1) {
                compId = 0

              } else {
                compId = parseInt(this.layoutData[this.layoutData.length - 1].i) + 1
              }
              addItem = {
                "x": res.x,
                "y": res.y,
                "w": itemW,
                "h": itemH,
                // "i": parseInt(this.layoutData[this.layoutData.length - 1].i) + 1,
                "i": compId,
                "Component": comp,
                "IsResource": true,
                "type": type,
                "iconName": iconName,
                "textContent": contentText,
                "dataName": dataName
              };

              c = this.layoutColNum + 1;
              r = rLen + 1;
            } else {
              c = res.offsetX;
            }
          }
        }
      }
      // 更新二维数组地图
      for (let itemR = 0; itemR < itemH; itemR++) {
        for (let itemC = 0; itemC < itemW; itemC++) {
          // 如果没有该行，初始化
          if (!this.layoutMap[addItem.y + itemR]) {
            this.layoutMap[addItem.y + itemR] = new Array(this.layoutColNum);
            for (let i = 0; i < this.layoutColNum; i++) {
              this.layoutMap[addItem.y + itemR][i] = 0;
            }
          }
          // 标记点
          this.layoutMap[addItem.y + itemR][addItem.x + itemC] = 1;
        }
      }
      // console.log(this.layoutMap);
      // 添加数据
      this.layoutData.push(addItem);

    },
    // 添加折线组件
    addLineChart: function (comp, w, h, type, titleText, xArray, seriesData) {
      // 宽高
      var itemW = w;
      var itemH = h;

      var addItem = {
        "x": 0,
        "y": this.layoutMap.length,
        "w": itemW,
        "h": itemH,
        "i": this.layoutData[this.layoutData.length - 1] ? parseInt(this.layoutData[this.layoutData.length - 1].i) + 1 : 0,
        "Component": comp,
        "IsResource": true,
        "type": type,
        "titleText": titleText,
        "xArray": xArray,
        "seriesData": seriesData
      };
      if (this.layoutMap.length) {
        // console.log(this.layoutMap.length);
        for (let r = 0, rLen = this.layoutMap.length; r < rLen; r++) {
          for (let c = 0; c <= (this.layoutColNum - itemW); c++) {
            let res = this.regionalTest(
              c,
              r,
              itemW,
              rLen > (r + itemH) ? itemH : rLen - r
            );

            if (res.result) {
              // 更新添加数据内容
              let compId = 0
              if (this.layoutData.length < 1) {
                compId = 0

              } else {
                compId = parseInt(this.layoutData[this.layoutData.length - 1].i) + 1
              }
              addItem = {
                "x": res.x,
                "y": res.y,
                "w": itemW,
                "h": itemH,
                // "i": parseInt(this.layoutData[this.layoutData.length - 1].i) + 1,
                "i": compId,
                "Component": comp,
                "IsResource": true,
                "type": type,
                "titleText": titleText,
                "xArray": xArray,
                "seriesData": seriesData
              };

              c = this.layoutColNum + 1;
              r = rLen + 1;
            } else {
              c = res.offsetX;
            }
          }
        }
      }
      // 更新二维数组地图
      for (let itemR = 0; itemR < itemH; itemR++) {
        for (let itemC = 0; itemC < itemW; itemC++) {
          // 如果没有该行，初始化
          if (!this.layoutMap[addItem.y + itemR]) {
            this.layoutMap[addItem.y + itemR] = new Array(this.layoutColNum);
            for (let i = 0; i < this.layoutColNum; i++) {
              this.layoutMap[addItem.y + itemR][i] = 0;
            }
          }
          // 标记点
          this.layoutMap[addItem.y + itemR][addItem.x + itemC] = 1;
        }
      }
      // console.log(this.layoutMap);
      // 添加数据
      this.layoutData.push(addItem);

    },
    // 添加常规组件
    addItem: function (comp, w, h, type) {
      // 宽高
      var itemW = w;
      var itemH = h;

      var addItem = {
        "x": 0,
        "y": this.layoutMap.length,
        "w": itemW,
        "h": itemH,
        "i": this.layoutData[this.layoutData.length - 1] ? parseInt(this.layoutData[this.layoutData.length - 1].i) + 1 : 0,
        "Component": comp,
        "IsResource": true,
        "type": type
      };
      if (this.layoutMap.length) {
        // console.log(this.layoutMap.length);
        for (let r = 0, rLen = this.layoutMap.length; r < rLen; r++) {
          for (let c = 0; c <= (this.layoutColNum - itemW); c++) {
            let res = this.regionalTest(
              c,
              r,
              itemW,
              rLen > (r + itemH) ? itemH : rLen - r
            );

            if (res.result) {
              // 更新添加数据内容
              let compId = 0
              if (this.layoutData.length < 1) {
                compId = 0

              } else {
                compId = parseInt(this.layoutData[this.layoutData.length - 1].i) + 1
              }
              addItem = {
                "x": res.x,
                "y": res.y,
                "w": itemW,
                "h": itemH,
                // "i": parseInt(this.layoutData[this.layoutData.length - 1].i) + 1,
                "i": compId,
                "Component": comp,
                "IsResource": true,
                "type": type
              };

              c = this.layoutColNum + 1;
              r = rLen + 1;
            } else {
              c = res.offsetX;
            }
          }
        }
      }
      // 更新二维数组地图
      for (let itemR = 0; itemR < itemH; itemR++) {
        for (let itemC = 0; itemC < itemW; itemC++) {
          // 如果没有该行，初始化
          if (!this.layoutMap[addItem.y + itemR]) {
            this.layoutMap[addItem.y + itemR] = new Array(this.layoutColNum);
            for (let i = 0; i < this.layoutColNum; i++) {
              this.layoutMap[addItem.y + itemR][i] = 0;
            }
          }
          // 标记点
          this.layoutMap[addItem.y + itemR][addItem.x + itemC] = 1;
        }
      }
      // console.log(this.layoutMap);
      // 添加数据
      this.layoutData.push(addItem);

    },
    // 区域检测 x,y 二维数据地图起始坐标点  w,h 检测区域宽高
    regionalTest: function (x, y, w, h) {
      // 定义返回 x,y 偏移 及 是否有空位置
      let offsetX = 0, offsetY = 0, res = true;
      // 按区域循环检测 二维数组地图
      for (let r = 0; r < w; r++) {
        for (let c = 0; c <= h; c++) {
          let point = this.layoutMap[y + r] ? this.layoutMap[y + r][x + c] : 0;
          // 如该点被占据 记录偏移值
          if (point === 1) {
            res = false;
            offsetX = offsetX > (x + c) ? offsetX : x + c;
            offsetY = offsetY > (y + r) ? offsetY : y + r;
          }
        }
      }

      return {
        result: res,
        offsetX: offsetX,
        x: x,
        y: y
      };
    },
    //组件删除事件
    deleteItem (compId) {
      for (let j = 0; j < this.layoutData.length; j++) {
        if (compId == this.layoutData[j].i) {
          this.layoutData.splice(j, 1);
          this.layoutMap.splice(j, 1);
        }
      }

      //   this.layoutData.push(addComp)

    },
    //保存布局
    saveLayout () {
      // 将json转换成字符串
      let that = this
      axios({
        method: 'post',
        //url: 'http://39.106.26.202:8089/savedata',
        url: '/api/savedata',

        data: this.layoutData,
      }).then(function (response) {
        if (response.status == '200') {
          that.$message('布局保存成功,请转至‘布局预览’页面查看');
          //   console.log(response.status);
        }

      }).catch(function (error) {
        that.$message('布局保存失败，请稍后重试');
        console.log(error);
      });

      //   axios.get("/api/layoutdata").then((data) => {
      //     console.log(data.data.data.mainData)
      //   })
    },
    log (arg1 = 'log', ...logs) {
      if (logs.length === 0) {
        console.log(arg1)
      } else {
        console.group(arg1)
        logs.forEach(e => {
          console.log(e)
        })
        console.groupEnd()
      }
    },
    // 显示提示
    showInfo () {
      this.$notify({
        title: '提示',
        message: '点击组件区的组件可向窗体区添加新组件；双击窗体区组件可实现删除；按住卡片拖拽改变位置；每个卡片的右下角拖动可调整卡片大小'
      })
    },

    // 监听组件的移动缩放
    layoutUpdatedHandler (newLayout) {
      console.group('layoutUpdatedHandler')
      newLayout.forEach(e => {
        console.log(`{'x': ${e.x}, 'y': ${e.y}, 'w': ${e.w}, 'h': ${e.h}, 'i': '${e.i}'},`)
      })
      console.groupEnd()
    },
    resizeHandler (i, newH, newW) {
      this.log('resizeHandler', `i: ${i}, newH: ${newH}, newW: ${newW}`)
    },
    moveHandler (i, newX, newY) {
      this.log('moveHandler', `i: ${i}, newX: ${newX}, newY: ${newY}`)
    },
    resizedHandler (i, newH, newW, newHPx, newWPx) {
      this.log('resizedHandler',
        `i: ${i}, newH: ${newH}, newW: ${newW}, newHPx: ${newHPx}, newWPx: ${newWPx}`)
    },
    movedHandler (i, newX, newY) {
      this.log('movedHandler', `i: ${i}, newX: ${newX}, newY: ${newY}`)
    }
  },
  created () {
    this.init()
  }
}
</script>

<style scoped>
.container {
    background: none;
    border: none;
    padding: 0px;
}
.el-row >>> .el-col {
    padding: 0;
}
.page_card {
    height: 100%;
}
.el-card >>> .el-card__header {
    background: #ffffff;
}
.el-card >>> .el-card__body {
    padding: 5px;
    /* background-image: url('../../assets/img/panel.png');
    background-repeat: no-repeat;
    background-size: 100% 100%; */
}
.ResourceWrapper {
    border: 1.5px solid #2d8cf0;
    border-right: none;
}
.layoutWrapper {
    border: 1.5px solid #2d8cf0;
}
.deleteButton {
    float: right;
    padding: 0;
    position: absolute;
    z-index: 2;
    top: 6px;
    right: 6px;
}
.configButton {
    float: right;
    padding: 0;
    position: absolute;
    z-index: 2;
    top: 6px;
    right: 25px;
}
.contentCenter {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
}
</style>