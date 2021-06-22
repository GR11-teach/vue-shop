<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="CloseAddRoleEdit"
    >
      <el-form :model="newrole" label-width="100px" ref="addRoleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="newrole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="newrole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="dialogFormVisible" width="40%">
      <el-form :model="showrole" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="showrole.roleName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="showrole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo(showrole.roleId)"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <!-- 树状权限展示 -->
    <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree show-checkbox :data="rightslist" :props="treeProps" :default-checked-keys="defKeys" 
      default-expand-all node-key="id" ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加角色 -->
      <el-button type="primary" @click="addDialogVisible = true"
        >添加角色</el-button
      >
      <!-- 用户信息展 示 -->
      <el-table :data="rolelist" border style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="330">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="330">
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="showDeleteDialog(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="small"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolelist: [],
      // 新添加的角色对象
      newrole: {
        roleName: null,
        roleDesc: null,
      },
      //   控制添加对话框的展示
      addDialogVisible: false,
      //   点击修改展示的角色信息
      showrole: {},
      //   控制修改对话框的展示
      dialogFormVisible: null,
      // 控制权限分配的显示
      setRightDialogVisible: false,
      // 角色分配权限的数据
      rightslist:[],
      // 树状对象的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children',
      },
      // 选中的权限id
      defKeys:[],
      // 当前被操作的角色id
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 角色列表请求，在页面中显示
    async getRolesList() {
      const { data: res } = await this.$http.get("/roles");
      this.rolelist = res.data;
      console.log("输出rolelist");
      console.log(this.rolelist);
      if (res.meta.status !== 200) {
        return this.$message.error("用户列表请求失败");
      }
      this.$message.success("用户列表请求成功");
    },
    // 添加用户信息
    async addRole() {
      const { data: res } = await this.$http.post("roles", this.newrole);
      if (res.meta.status !== 201) {
        return this.$message.error("角色添加失败");
      }
      this.$message.success("角色添加成功");
      this.getRolesList();
      this.addDialogVisible = false;
      console.log("添加用户的网络请求");
      console.log(res);
    },
    //点击编辑， 根据id查询角色
    async showEditDialog(id) {
      this.dialogFormVisible = true;
      // 两种方法都可
      // const {data:res} = await this.$http.get(`roles/${id}`)
      const { data: res } = await this.$http.get("roles/" + id);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("用户信息获取失败");
      }
      this.$message.success("用户信息获取成功");
      // console.log(res.data);
      this.showrole = res.data;
      console.log(this.showrole);
    },
    // 编辑角色信息
    async saveRoleInfo(id) {
      const { data: res } = await this.$http.put(`roles/${id}`, this.showrole);
      if (res.meta.status != 200) {
        return this.$message.error("用户信息修改失败");
      }
      this.$message.success("用户信息修改成功");
      this.getRolesList();
      this.dialogFormVisible = false;
    },
    // 控制确认删除对话框的展示
    // 删除角色
    async showDeleteDialog(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("角色删除失败");
      }
      this.$message.success("角色删除成功");
      this.getRolesList();
    },
    // 监听添加用户对话框关闭
    CloseAddRoleEdit() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 删除角色权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久取消该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("取消权限失败");
      }
      this.$message.success("取消权限成功");
      // 数据双向绑定，实现响应式，进而改变页面
      // 其中涉及作用域插槽将子组件data中的rolelist数据v-bind绑定到父组件中，
      // 对传入的参数修改就修改了子组件中data中的数据
      role.children = res.data;
    },
    //分配权限功能
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const{data:res} = await this.$http.get("rights/tree")
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightslist = res.data;
      this.getLeafKeys(role,this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 得到角色所拥有的的角色权限id
    getLeafKeys(node,arr){
      if(!node.children){
      return  arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeafKeys(item,arr));
    },
    // 监听分配权限的关闭
    setRightDialogClosed(){
      this.defKeys=[];
    },
    // 点击确定为角色分配权限
    async allotRights(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(",");
      const{data:res} = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {rids : idStr }
      )
      if(res.meta.status !== 200){
        return this.$message.error("角色权限分配失败");
      }
      this.$message.success("角色权限分配成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  },
};
</script>
<style lang="less" scoped>
.bdtop {
  border-top: 1px solid #ccc;
}
.bdbottom {
  border-bottom: 1px solid #ccc;
}
.el-tag {
  margin: 12px 15px 12px 0;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>