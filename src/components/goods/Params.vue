<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 警告区 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      ></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择器 -->
          <!-- options绑定数据源，props绑定限制信息，包括value，label等,
              v-model将选择的元素id会自动保存到v-model绑定的数据中 -->
          <el-cascader
            :options="catelist"
            :props="cateProps"
            v-model="selectCateKeys"
            @change="handleChange"
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <!-- v-model绑定的数据中存储了选定的活跃的导航栏name，tab-click：切换一次导航栏就会触发一次 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- label表示显示的名称，name不同的导航栏选项的唯一标识，被选中的会存储在 activeName-->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnStatu"
            @click="showAddDialog"
            >添加参数</el-button
          >
          <!-- 表格区域，展示商品信息。 -->
          <!-- data数据源 -->
          <el-table :data="manyTableData" border stripe>
             <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag class="tag"
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="showDeleteDialog(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnStatu"
            @click="showAddDialog"
            >添加属性</el-button
          >
          <el-table :data="onlyTableData">
          <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag class="tag"
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column>
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="showDeleteDialog(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamDialogVisible"
      width="40%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        ref="addFormRef"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑属性对话框 -->
    <el-dialog
      title="修改参数"
      :visible.sync="editParamDialogVisible"
      width="40%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        ref="editFormRef"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择器的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      // 级联选择器的双向绑定数组，存储选中的元素id
      selectCateKeys: [],
      // 导航栏中选中的活跃的导航栏元素名称,默认为动态
      activeName: "many",
      // 保存动态参数
      manyTableData: [],
      // 保存静态属性
      onlyTableData: [],
      //   控制添加参数对话框显示
      addParamDialogVisible: false,
      //   添加参数的表单中的数据
      addForm: {
        attr_name: "",
      },
      //   attr_name验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改对话框的显示
      editParamDialogVisible: false,
      // 修改表单对话框的信息
      editForm: {
        attr_name: "",
      },
      // 修改参数验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改的参数id
      attrid: null,
      // 控制添加参数表单的显示
      inputVisible:false,
      // 添加参数表单中的数据
      inputValue:'',
      
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品分类列表,渲染联级选择器
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.catelist = res.data;
      console.log(this.catelist);
    },
    // 监听联级选择器的改变
    handleChange() {
      this.getParamsData();
      // console.log(this.selectCateKeys);
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
         this.manyTableData = []
        this.onlyTableData = []
        return;
      }
    },
    // 监听导航栏的切换
    handleTabClick() {
      // console.log(this.activeName);
      this.getParamsData();
    },
    // 进行网络数据请求，根据不同的联级选择器和动态静态参数请求到不同数据,渲染表格
    async getParamsData() {
      const { data: res } = await this.$http.get(
        `categories/${
          this.selectCateKeys[this.selectCateKeys.length - 1]
        }/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类参数失败");
      }
      // 如果attr_vals为空则不创建标签，否则将字符串转换为数组
       res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      
      console.log("输出渲染表格数据");
      console.log(res);
    },
    // 点击添加参数按钮，开始添加参数
    showAddDialog() {
      this.addParamDialogVisible = true;
    },
    // 网络请求添加参数，首先进行表单验证，再添加
    addParamConfirm() {
      // 预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("表单信息错误，请重新填写");
        const { data: res } = await this.$http.post(
          `categories/${
            this.selectCateKeys[this.selectCateKeys.length - 1]
          }/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        console.log(res);
      });
      this.addParamDialogVisible = false;
      this.getParamsData();
    },
    // 监听添加参数对话框的关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 关闭修改对话框触发函数
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 开始编辑参数
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${
          this.selectCateKeys[this.selectCateKeys.length - 1]
        }/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }
      //   console.log(res);
      this.editForm.attr_name = res.data.attr_name;
      this.editParamDialogVisible = true;
      this.attrid = attrId;
    },
    // 确定修改参数,提交修改的信息
    editParamConfirm() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("表单信息错误，请重新填写");
        }
        const { data: res } = await this.$http.put(
          `categories/${
            this.selectCateKeys[this.selectCateKeys.length - 1]
          }/attributes/${this.attrid}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$massage.error("参数信息修改失败！");
        }
        this.$message.success("参数信息修改成功");
      });
      this.getParamsData();
      this.editParamDialogVisible = false;
    },
    // 删除参数
    async showDeleteDialog(p) {
      // 取消的确认操作首先在导入elementui的messagebox，其次将$confirm挂载到vue原型上
      // 返回值是promise，用户确认删除返回的是字符串confirm，如果取消删除会报错所以增加.catch捕获错误
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult === "confirm") {
        const { data: res } = await this.$http.delete(
          `categories/${
            this.selectCateKeys[this.selectCateKeys.length - 1]
          }/attributes/${p.attr_id}`
        );
        if (res.meta.status !== 200) return this.$message.error("参数删除失败");
        this.$message.success("参数删除成功");
        this.getParamsData();
      }
    },
    // 添加参数表单信息填写完成
    // (在按下enter键或者input表单失去焦点触发)
    async handleInputConfirm(row){
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
        row.attr_vals.push(row.inputValue.trim());
       row.inputVisible = false;
       row.inputValue = '';
      //  console.log(row.inputValue);
      // console.log(row.attr_vals);
       this.saveAttrVals(row);
       
    },
    // 添加参数的网络请求
    async saveAttrVals(row){
       const {data:res} = await this.$http.put(`categories/
       ${this.selectCateKeys[this.selectCateKeys.length-1]}
       /attributes/
       ${row.attr_id}`,
       {
         attr_name:row.attr_name,
         attr_sel:row.attr_sel,
         attr_vals:row.attr_vals.join(' ')
       }
      )
       console.log(res);
        if (res.meta.status !== 200) {
        return this.$message.error('操作失败！')
      }

      this.$message.success('操作成功！')
    },
    //添加参数显示表单隐藏添加参数按钮
    showInput(row){
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 标签关闭（删除）事件
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }

  },
  computed: {
    //   控制按钮禁用
    btnStatu() {
      return this.selectCateKeys.length === 0 ? true : false;
    },
    //   确定添加框的是静态添加框还是动态添加框
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.tag {
  margin-right: 10px;
}
.input-new-tag{
  width:120px;
}
</style>