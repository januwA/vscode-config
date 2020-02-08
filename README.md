## 在多台设备上同步vscode配置的命令行工具

> 原来写了个[vscode插件](https://github.com/januwA/your-vscode-config)，但不怎么好用

## use
```shell
vc -h
vc config -h
vc config token <your github token>
vc config id <your gist id>
vc push
vc pull
```

> 如果pull卡住了，就退出进程在执行一次