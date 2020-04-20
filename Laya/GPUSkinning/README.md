# U3D导出使用说明



![image-20200409204235644](C:\Users\FengZeng\AppData\Roaming\Typora\typora-user-images\image-20200409204235644.png)

###### 从美术给到的动作资源，一键导出

![image-20200409204653456](C:\Users\FengZeng\AppData\Roaming\Typora\typora-user-images\image-20200409204653456.png)



###### 导出已经存在的预设

![image-20200409204950267](C:\Users\FengZeng\AppData\Roaming\Typora\typora-user-images\image-20200409204950267.png)



# Laya使用说明

### 资源放置

![image-20200409203819180](C:\Users\FengZeng\AppData\Roaming\Typora\typora-user-images\image-20200409203819180.png)



### Shader放置

![image-20200409203943939](C:\Users\FengZeng\AppData\Roaming\Typora\typora-user-images\image-20200409203943939.png)





### 初始化

```typescript
// 设置资源根目录
GPUSkining.resRoot = "res3d/GPUSKinning-30/";
// 初始化，里面主要初始化shader
await GPUSkining.InitAsync();
```


### 使用
```typescript
// 异步创建一个角色, 里面会加载
var mono = await GPUSkining.CreateByNameAsync("Hero_1004_Dongzhuo_Skin1", true);
// 播放动作
mono.Player.Play("Idle");
// 添加到场景
this.scene.addChild(mono.owner);
```

### 消耗

```typescript
mono.owner.destroy();
```



