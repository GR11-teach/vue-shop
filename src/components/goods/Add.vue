<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- alert提示信息 -->
      <el-alert
        title="添加商品信息"
        center
        show-icon
        type="info"
        :closable="false"
      ></el-alert>
      <!-- 步骤条 -->
      <!-- active属性与左侧导航栏的索引0-n相关，控制步骤条的进度记录步骤条处于哪个活跃步骤，
      v-model与每个导航栏的name相关联，确定导航栏右侧展示的是哪个导航栏的信息 ,
      此处将左侧每个导航栏的name起为0-n与索引相同-->
      <!-- 实现步骤条和左侧导航栏实现数据联动，让两者共用同一个数据项activeIndex -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息" ></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="100px" label-position="top">
      <!-- 左侧tab导航栏 -->
      <!-- 在标签页切换前会触发钩子函数before-leave -->
      <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
        <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="addForm.goods_cat" @change="handleChange"></el-cascader>
            </el-form-item>
        </el-tab-pane>
         <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!-- action表示上传图片的路径，on-preview处理图片的预览效果
           on-remove处理移除图片的操作-->
           <!-- 注意问题上传图片浏览器的network显示无效token，原因:el-upload没有使用axios的request拦截器
           组件内部自己封装了Ajax请求，自己封装的请求没有增加Authorization字段，
           解决方法：使用 el-upload的headers属性，设置上传的请求头-->
          <el-upload :action="uploadURL" :on-success="handleSuccess" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj">
            <!-- 预览效果实现，创建对话框+图片路径展示 -->
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <!--富文本编辑器组件， 使用富文本编辑器添加商品内容 -->
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <!-- 确认添加商品按钮 -->
          <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 ,添加对话框插入图片，动态绑定图片的src路径(通过handlePreview函数可以获取到)-->
    <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%">
  <img :src="previewPath" alt="" class="previewImg">
</el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条的活跃进度
      activeIndex: '0',
    //   添加商品的表单数据对象
    addForm:{
        goods_name:'',
        goods_price:0,
        goods_weight:0,
        goods_number:0,
        // 商品所属的分类数组
        goods_cat:[],
        // 上传图片的数组
        pics:[],
        // 商品的详情描述
        goods_introduce:'',
        attrs:[]

    },
    // 添加商品表单验证规则
    addFormRules:{
        goods_name:[
            {required:true,message:'请输入商品名称',trigger:'blur'}
        ],
        goods_price:[
            {required:true,message:'请输入商品参数',trigger:'blur'}
        ],
        goods_weight:[
            {required:true,message:"请输入商品重量",trigger:'blur'}
        ],
        goods_number:[
            {required:true,message:"请输入商品数量",trigger:'blur'}
        ],
         goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
    },
    // 商品分类数据
    catelist:[],
    // 商品分类列表配置对象
    cateProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children'
    },
    // 动态参数列表数据
    manyTableData:[],
    // 静态属性列表数据
    onlyTableData:[],
    // 上传图片的地址
    uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
    // 图片上传组件的headers请求头对象
    headerObj:{
        Authorization : window.sessionStorage.getItem('token')
        },
        // 图片预览路径
    previewPath:'',
  // 图片预览对话框的显示
    previewVisible:false,
    };
  },
  created() {
      this.getCateList();
  },
  methods: {
    //   获取联级选择器分类数据
      async getCateList(){
          const{data:res} = await this.$http.get('categories')
          this.catelist = res.data;
          if(res.meta.status !== 200){
              return this.$message.error("分类信息获取失败");
          }
          console.log(this.catelist);
          console.log(res);
      },
    //   级联选择器改变触发
      handleChange(){
          if(this.addForm.goods_cat.length !== 3){
              this.addForm.goods_cat=[];
          }
      },
      // 自带函数在切换标签页前会触发该函数，
      // 包含两个参数参数一切换之前的标签页的name
      // 参数二切换之后的标签页的name,通过return false阻止标签页的切换
      beforeTabLeave(activeName,oldActiveName){
        if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
          this.$message.error("请选择商品分类");
          return false;
        }
      },
      // 监听侧边导航栏切换
      async tabClicked() {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }

        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }

        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
  handlePreview(file){
    this.previewPath = file.response.data.url;
    this.previewVisible = true;
  },
  // 处理移除图片的操作
  handleRemove(file){
    console.log(file);
    // 得到删除的图片的路径
    const path = file.response.data.tmp_path;
    // 得到路径在addForm中对应的索引
    const i = this.addForm.pics.findIndex(x => x.pic === path);
    // 删除addForm的pics中图片的的路径
    this.addForm.pics.splice(i,1);
    console.log(this.addForm);
  },
  // 图片上传成功的事件,返回图片上传成功后的服务器返回信息
  // 包括图片在服务器端存储的地址
  handleSuccess(response){
    console.log(response);
    // 拼接得到一个图片信息对象
    const picInfo = {pic:response.data.tmp_path}
    // 将图片信息对象，push到addForm的pics数组中
    this.addForm.pics.push(picInfo)
  },
  // 添加商品
add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.replace('/goods')
        console.log(111);
      })
    }

    
  },
  computed:{
    cateId(){
      if(this.addForm.goods_cat.length === 3){
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>
<style lang="less" scoped>
.el-checkbox{
  margin:0 10px 0 0 !important;
}
.previewImg{
  width:100%;
}
.btnAdd{
  margin-top:15px;
}
</style>