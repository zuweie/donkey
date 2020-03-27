layui.use(['jquery', 'element','layer','table','form','api'], function(){
   var table = layui.table
   ,layer = layui.layer
   ,$ = layui.$
   ,api = layui.api
   ,add_form = ''
   ,form = layui.form;

   var user = layui.data('donkey').login_user;
    console.log('-----user-----',user)
 
   var loadTableData = function(){
     table.render({
       elem: '#bucket'
       ,url:api.requ_url+'/api/v1/bucket/show'
       ,headers:{Authorization:'Bearer '+user.access_token}
       ,where:{page:1,perpage:10}
       ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
       ,defaultToolbar: ['filter', 'exports', 'print', { //自定义头部工具栏右侧图标。如无需自定义，去除该参数即可
         title: '提示'
         ,layEvent: 'LAYTABLE_TIPS'
         ,icon: 'layui-icon-tips'
       }]
       ,title: 'Bucket'
       ,cellMinWidth: 80
       ,cols: [[
         {type: 'checkbox', fixed: 'left'}
         ,{field:'id', title:'ID', fixed: 'left', unresize: true, sort: true}
         ,{field:'user_id', title:'user_id',sort: true}
         ,{field:'bucket', title:'bucket', edit: 'text'}
         ,{field:'description', title:'description', edit: 'text'}
         ,{field:'is_private', title:'is_private',templet: '#is_private', unresize: true}
         ,{field:'createdAt', title:'createdAt'}
         ,{field:'updatedAt', title:'updatedAt'}
         ,{fixed: 'right', title:'操作', toolbar: '#barDemo'}
       ]]
       ,parseData: function(res){ //res 即为原始返回的数据
         return {
           "code": res.errcode, //解析接口状态
           "msg": res.errmsg, //解析提示文本
           "count": res.total, //解析数据长度
           "data": res.data //解析数据列表
         };
     }
       ,page: true
     });
   }()
 
   //监听性别操作
   form.on('switch(isPrivate)', function(obj){
      console.log('--------------------',obj)
     layer.tips(this.value + ' ' + this.name + '：'+ obj.elem.checked, obj.othis);
     updBucket({id:this.value,is_private:obj.elem.checked})
   });
   
   //头工具栏事件
   table.on('toolbar(test)', function(obj){
     var checkStatus = table.checkStatus(obj.config.id);
     switch(obj.event){
       case 'getCheckData':
         var data = checkStatus.data;
         layer.alert(JSON.stringify(data));
       break;
       case 'getCheckLength':
         var data = checkStatus.data;
         layer.msg('选中了：'+ data.length + ' 个');
       break;
       case 'isAll':
         layer.msg(checkStatus.isAll ? '全选': '未全选');
       break;
       
       //自定义头工具栏右侧图标 - 提示
       case 'LAYTABLE_TIPS':
         layer.alert('这是工具栏右侧自定义的一个图标按钮');
       break;
     };
   });
   
   //监听行工具事件
   table.on('tool(test)', function(obj){
     var data = obj.data;
     console.log(obj)
     if(obj.event === 'del'){
       layer.confirm('真的删除行么', function(index){
         obj.del();
         delBucket({id:data.id})
         layer.close(index);
       });
     } else if(obj.event === 'detail'){
      $('#iframeMain', parent.document).attr('src','../../public/putsoon-admin/web/media.html?bucket_name='+data.bucket)
      //parent.window.document.getElementById("iframeMain").src = '../../public/putsoon-admin/web/media.html';
    }else if(obj.event === 'edit'){
       
     }
   });
 
   //监听单元格编辑
   table.on('edit(test)', function(obj){
     var value = obj.value //得到修改后的值
     ,data = obj.data //得到所在行所有键值
     ,field = obj.field; //得到字段
 
     layer.msg('[ID: '+ data.id +'] ' + field + ' 字段更改为：'+ value);
     let params = ''
     switch(field){
        case 'bucket':  params = {id:data.id,bucket:value};break
        case 'description':  params = {id:data.id,description:value};break
     }
 
     updBucket(params)
   });
 
 
   var updBucket = function(params){
     onsole.log('----修改参数----',params)
     $.ajax({
       url:api.requ_url+'/api/v1/bucket/update'
       ,dataType:"json" //返回格式为json
       ,data:params //参数值
       ,type:"put" //请求方式
       ,headers:{Authorization:'Bearer '+user.access_token}
       ,success:function(res){
          //请求成功时处理
          console.log('-----success------',res)
          if(res.errcode==0){
             layer.msg('修改成功');
             return
          }
          layer.msg('修改失败');
       },
       error:function(err){
          //请求出错处理
          console.log('-----error------',err)
          layer.msg('修改失败');
       }
     });
   }

   var addBucket = function(params,that){
     console.log('----修改参数----',params)
     $.ajax({
       url:api.requ_url+'/api/v1/bucket/create'
       ,dataType:"json" //返回格式为json
       ,data:params //参数值
       ,type:"post" //请求方式
       ,headers:{Authorization:'Bearer '+user.access_token}
       ,success:function(res){
          //请求成功时处理
          console.log('-----success------',res)
          if(res.errcode==0){
             layer.msg('添加成功');
             table.reload('bucket', { page: { curr: 1 } }, 'data');
             layer.closeAll();
             insta()
          }else{
            layer.msg('添加失败');
          }
          
       },
       error:function(err){
          //请求出错处理
          console.log('-----error------',err)
          layer.msg('添加失败');
       }
     });
   }
 
   var delBucket = function(params){
     console.log('----修改参数----',params)
     $.ajax({
       url:api.requ_url+'/api/v1/bucket/delete'
       ,dataType:"json" //返回格式为json
       ,data:params //参数值
       ,type:"delete" //请求方式
       ,headers:{Authorization:'Bearer '+user.access_token}
       ,success:function(res){
          //请求成功时处理
          console.log('-----success------',res)
          if(res.errcode==0){
             layer.msg('删除成功');
             return
          }
          layer.msg('删除失败');
       },
       error:function(err){
          //请求出错处理
          console.log('-----error------',err)
          layer.msg('删除失败');
       }
     });
   }

   var insta = function(){
    $('#btnAdd').on('click',function(){
      console.log('----------------------------------------------------')
      $('#form_name').val('');
      $('#form_description').val('');
      layer.open({
        type: 1 //此处以iframe举例
        ,title: '当你选择该窗体时，即会在最顶端'
        ,area: ['690px', '340px']
        ,shade: 0.5
        ,maxmin: true
        ,content: $('#update_form')
        ,btn: ['添加', '关闭'] 
        ,yes: function(){
          //$(that).click(); 
          let name = $('#form_name').val();
          let description = $('#form_description').val();
          let private = $('#form_private em').text();
          addBucket({bucket:name,description:description,private:private=='ON'?true:false})
        }
        ,btn2: function(){
          layer.closeAll();
        }
        ,zIndex: layer.zIndex //重点1
        ,success: function(layero){
          layer.setTop(layero); //重点2
        }
      });
    })
   }
   insta()

  //  var addBucketFormClick = function(ddd){
    
  //  }()
 
   
 
 });