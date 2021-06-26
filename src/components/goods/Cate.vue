<template>
  <div>
      <!-- 添加分类部分 -->
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 树状表格 -->
      <tree-table
      class="treeTable"
        :data="catelist"
        :show-index="true"
        index-text="#"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        border
        :show-row-hover="false"
      >
        <!-- 作用域插槽 -->
        <!-- 定义模板:是否有效 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <!--  -->
        <template v-slot:opt="scope">
          <el-button icon="el-icon-edit" type="primary" size="small" @click="editCate(scope.row)"
            >编辑</el-button
          >
          <el-button icon="el-icon-delete" type="danger" size="small" @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="40%"
      @close="addCateDialogClose"
    >
      <el-form
        ref="cateFormRef"
        :rules="addCateRules"
        :model="addCateForm"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options数据源，props配置选项 -->
          <!-- 首先展示级联选择器的数据，涉及到options,props,通过网络请求获得，
          就可以展示出正确的级联选择器，双向数据绑定元素的唯一标识selectKeys，
          绑定改变事件，当选择器改变时，将选择的对象的id值保存到selectKeys中 -->
          <el-cascader
            v-model="selectKeys"
            :options="ParantCateList"
            :props="CascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="40%">
      <el-form
        ref="editcateFormRef"
        :rules="editCateRules"
        :model="editCateForm"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="editCateName">
          <el-input v-model="editCateForm.editCateName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表格中要展示的数据
      catelist: [],
      // 网络请求传递的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // tree-table表格中的对应列
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示当前使用的是模板列，应用作用域插槽
          type: "template",
          // 使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          // 表示当前使用的是模板列，应用作用域插槽
          type: "template",
          // 使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          // 表示当前使用的是模板列，应用作用域插槽
          type: "template",
          // 使用的模板名称
          template: "opt",
        },
      ],
      // 总数据条数
      total: 0,
      // 添加分类对话框的显示
      addCatedialogVisible: false,
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      addCateRules: {
        cat_name: [
          { required: true, message: "分类名称不能为空", trigger: "blur" },
        ],
      },
      ParantCateList: [],
      //指定级联选择器的配置选项
      CascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: "true",
      },
      //选中的父级分类id数组
      selectKeys: [],
    //   修改分类对话框
      editCateDialogVisible:false,
    //   编辑商品分类的内容
      editCateForm: {
        editCateName: "",
        editCateId: ""
      },
      editCateRules: {
        editCateName: [
          { required: true, message: "分类名称不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    // 页面创建网络请求信息
    this.getCateList();
  },
  methods: {
    // 获取商品分类信息
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.$message.success("获取商品分类成功");
      // 更新用户列表，并赋值
      this.catelist = res.data.result;
      // 更新总数据条数
      this.total = res.data.total;
    },
    // 页面包含数据数量变化触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 页面当前页变化时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 展示级联选择器
    showAddCateDialog() {
      this.addCatedialogVisible = true;
      this.getParantCateList();

    },
    // 渲染级联选择器
    async getParantCateList(){
        const {data:res} = await this.$http.get('categories',{
            params:{
                type:2
            }
        })
    if (res.meta.status !== 200)
        return this.$message.erroe("获取父级分类数据失败");
      console.log(res.data);

      this.ParantCateList = res.data;    
      },
    //    选择项发生变化触发这个函数,将所选择的元素id保存到，
    // 添加功能网络请求的参数addCateForm中就可以天机成功
    parentCateChange(){
      console.log(this.selectKeys);
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        // 等级赋值
        this.addCateForm.cat_level = this.selectKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        // 等级赋值
        this.addCateForm.cat_level = 0;
      }
  },
   addCate() {
      console.log(this.addCateForm);
      //表单域验证
      this.$refs.cateFormRef.validate(async valid => {
        if (!valid) return this.$message.error("表单数据错误，请重新填写");
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error("添加分类失败");
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCatedialogVisible = false;
      });
    },
    //重置表单数据
    addCateDialogClose() {
      this.$refs.cateFormRef.resetFields();
      this.selectKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    async editCate(cate){
      this.editCateDialogVisible = true;
        const{data:res} = await this.$http.get(`categories/${cate.cat_id}`)
        if(res.meta.status !== 200){
            return this.$message.error("分类信息查询失败");
        }
        this.$message.success("分类信息查询成功");
        this.editCateForm.editCateName = res.data.cat_name;
        this.editCateForm.editCateId = res.data.cat_id;
        // console.log(res);
    },
    editConfirm() {
      //表单域验证
      this.$refs.editcateFormRef.validate(async valid => {
        if (!valid) return this.$message.error("表单内容错误，请重新输入");
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.editCateId}`,
          {
            cat_name: this.editCateForm.editCateName
          }
        );
        // console.log(res);

        if (res.meta.status !== 200)
          return this.$message.error("商品分类信息更新失败");
        // console.log(res.data);
        this.editCateDialogVisible = false;
        this.getCateList();
      });
    },
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      // console.log(confirmResult);
      if (confirmResult === "confirm") {
        const { data: res } = await this.$http.delete(`categories/${id}`);
        if (res.meta.status !== 200) return this.$message.error("删除分类失败");
        // console.log(res);
        this.$message.success("删除分类成功");
        this.getCateList();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader-panel {
  height: 200px;
  width: 100%;
}
</style>