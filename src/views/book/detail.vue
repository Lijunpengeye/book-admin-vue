<template>
  <div class="book-container" v-loading="btnLoading">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="名称">
        <el-input v-model="form.bookname"></el-input>
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="form.author"></el-input>
      </el-form-item>
      <el-form-item label="书本类型">
        <el-select v-model="form.sortid" placeholder="请选择类型">
          <el-option v-for="(item,index) in sortData" :key="index" :label="item.sortname" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="显示类型">
        <el-select v-model="form.book_type_id" placeholder="请选择类型">
          <el-option v-for="(item,index) in bookTypeData" :key="index" :label="item.title" :value="item.type_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上架">
        <el-switch
          v-model="form.is_display"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-value="Y"
          inactive-value="N">
        </el-switch>
      </el-form-item>
      <el-form-item label="人群类型">
        <el-radio v-model="form.renqun_type" label="M">男生</el-radio>
        <el-radio v-model="form.renqun_type" label="W">女生</el-radio>
      </el-form-item>
      <el-form-item label="是否免费">
        <el-select v-model="form.is_free" placeholder="请选择类型">
          <el-option label="免费" value="Y"></el-option>
          <el-option label="付费" value="N"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="价格" v-if="form.is_free === 'N'">
        <el-input type="number" v-model="form.price"></el-input>
      </el-form-item>
      <el-form-item label="vip价格" v-if="form.is_free === 'N'">
        <el-input type="number" v-model="form.vip_price"></el-input>
      </el-form-item>
      <el-form-item label="封面">
        <my-upload @setImageUrl="setImageUrl" :imgUrl="imageUrl"></my-upload>
      </el-form-item>
      <el-form-item label="简介">
        <el-input type="textarea" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item label="目录(拖动排序)">
        <draggable v-model="chaptersData" @update="datadragEnd" :options="{animation:200}">
          <div class="chapter" v-for="(item,index) in chaptersData" :key="index"
            @click="goToChapter(item.book_id,item.chapter_id)">{{item.chapter_name}}</div>
        </draggable>
        <el-button type="primary" @click="addChapter()">新增章节</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width:100%" @click="onSubmit" :loading="btnLoading">确认修改</el-button>
      </el-form-item>
    </el-form>
    <!-- <img src="http://localhost:3000/public/upload/1577168729064.png" alt="" srcset=""> -->
  </div>
</template>


<script>
import { addBook, getBookDetails, updataBookDetails, getSortType, getBookType, sortOrder } from '@/api/book'
import { getToken } from '@/utils/auth'
import myUpload from '@/components/upload'
import draggable from 'vuedraggable'

export default {
  components: {
    myUpload,
    draggable
  },
  data() {
    return {
      form: {
        bookname: '',
        sortid: '',
        is_display: 'Y',
        description: '',
        author: '',
        price: '',
        is_free: '',
        vip_price: '',
        renqun_type: 'M',
        book_type_id: ''
      },
      sortData: [],
      imageName: '',
      imageUrl: '',
      bookid: '',
      headers: {
        Authorization: getToken()
      },
      listLoading: false,
      btnLoading: false,
      bookTypeData: [],
      chaptersData: []
    }
  },
  created() {
    console.log(this.$route.query.id)
    this.bookid = this.$route.query.id
    this.getBook()
    this.getSort()
    this.getType()
  },
  methods: {
    async datadragEnd(evt) {
      evt.preventDefault()
      let arr = this.chaptersData
      let newArr = await arr.map((item, i) => {
        return {
          order_num: i + 1,
          chapter_id: item.chapter_id,
          book_id: item.book_id
        }
      })

      console.log(newArr)
      this.btnLoading = true
      let data = {
        list: newArr
      }
      sortOrder(data).then(res => {
        this.btnLoading = false
        if (res.code === 0) {
          this.$message({
            message: '已修改排序',
            type: 'success'
          })
        } else {
          this.$message.error('修改排序失败')
        }
      })
    },
    addChapter() {
      this.$router.push(`/book/chapter?bookid=${this.bookid}`)
    },
    goToChapter(bookid, chapterid) {
      this.$router.push(`/book/chapter?bookid=${bookid}&chapterid=${chapterid}`)
    },
    getSort() {
      getSortType().then(res => {
        if (res.code === 0) {
          this.sortData = res.data
        }
      })
    },
    getType() {
      getBookType().then(res => {
        if (res.code === 0) {
          this.bookTypeData = res.data
        }
      })
    },
    getBook() {
      let data = {
        id: this.bookid
      }
      this.listLoading = true
      this.btnLoading = true
      getBookDetails(data).then(res => {
        console.log(res)
        this.listLoading = false
        this.btnLoading = false
        if (res.code === 0) {
          this.form = res.data.detail
          this.chaptersData = res.data.chapters
          this.imageUrl = `http://localhost:3000/upload` + res.data.detail.images
        }
      })
    },
    setImageUrl(name) {
      console.log(name)
      this.imageName = name
    },
    onSubmit() {
      this.listLoading = true
      const data = this.form
      data.imageName = this.imageName
      updataBookDetails(data).then(res => {
        this.listLoading = true
        if (res.code === 0) {
          this.$message({
            message: '修改成功！',
            type: 'success'
          })
          this.$router.push('/book/list')
        }
        console.log(res)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.book {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
.chapter {
  cursor: pointer;
}
</style>
