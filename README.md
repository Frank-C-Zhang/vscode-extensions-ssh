*欢迎使用 ssh*
  
> ssh 是一个简化ssh操作的vs code 插件

> 项目地址: https://github.com/FourLeafClover/vscode-extensions-ssh

> 基于node-ssh: https://github.com/steelbrain/node-ssh

*介绍*

> 对于部分未安装自动部署环境的服务器，普遍操作是登录服务器通过sftp上传代码包，手动执行命令, light-ssh可为您简化此操作，通过配置config文件就能实现 登录服务器->上传文件/文件夹->支持cmd命令。

> light-ssh 支持多配置，主要用于不同环境的发布。

> 日志发布过程可在OUTPUT里面查看


*如何打包visix*

> npm install -g vsce

> npm i

> vsce package

*如何配置*

> 项目根路径下.vscode下创建ssh.config.json

> 项目中配置的时候请去掉右侧//备注，否则Json序列号会报错

> 配置是打开项目时读取一次，若修改了配置，请重启新项目/重新加载插件

```
[
  {
    "name": "Deploy 1",
    "connect": {  
      "host": "xx.xx.xx.xx",  // 服务器连接地址
      "port": 22,
      "username": "root",
      "password": "xxxx"
    },
    "beforeExecCommands": [], // 上传文件之前执行的命令,比如前端加了hash的dist包，需要提前删除
    "putFiles": [ // 上传多个文件
      {
        "local": "./package.json", // 本地地址
        "remote": "/usr/local/deploy/package.json" // 本地地址
      }
    ],
    "putDirectories": [ // 上传文件夹
      {
        "local": "./", // 本地地址
        "remote": "/usr/local/deploy", // 本地地址
        "ignore": ["node_modules", ".git", ".vscode"] // 忽略文件夹
      }
    ],
    "execCommands": [ // 服务端执行命令
      {
        "command": "npm i",  // 命令
        "cwd": "/usr/local/deploy" // 命令执行路径
      },
      {
        "command": "npm run build",  // 命令
        "cwd": "/usr/local/deploy" // 命令执行路径
      }
    ]
  },
  {
    "name": "Deploy 2",
  }
]

```

*界面展示*

> 底部StatusBar 会有一个 [SSH] 标签，鼠标放上去会显示配置的SSH结点列表

> 点击后会在面板的OUTPUT输入SSH Logs日志

![](https://fourleafclover.github.io/vscode/light-ssh/images/step.png)



 
  