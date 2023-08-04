// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH()
const path = require('path')
const fs = require('fs')
let outputChannel = null

const getRootPath = () => {
	return vscode.workspace.workspaceFolders[0]?.uri.fsPath || ''
}

const getConfigList = () => {
	const rootPath = getRootPath()
	const configText = fs.readFileSync(`${rootPath}/.vscode/ssh.config.json`, 'utf-8')
	const configList = configText ? JSON.parse(configText) : context
	return configList
}

const setLog = (str)=>{
	outputChannel.appendLine(str);
}

function activate(context) {
	// 获取配置
	const rootPath = getRootPath()
	const configList = getConfigList()
	outputChannel= vscode.window.createOutputChannel('SSH Logs')
	if (configList && Array.isArray(configList) && configList.length > 0) {
		for (let index in configList) {
			const config = configList[index]
			const { name, connect, putDirectories, putFiles, execCommands } = config

			// 通过不同配置注册事件
			const disposable = vscode.commands.registerCommand(`SSH.${name}`, async () => {
				outputChannel.show(true)
				// 上传多个文件夹
				const putDirectoryFun = async () => {
					if (putDirectories && Array.isArray(putDirectories) && putDirectories.length > 0) {
						for (let index in putDirectories) {
							const { local, remote, ignore } = putDirectories[index]
							const failed = []
							const successful = []
							setLog(`Upload Directory：${local} -> ${remote}`)
							await ssh.putDirectory(path.resolve(rootPath, local), remote, {
								recursive: true,
								concurrency: 10,
								validate: function (itemPath) {
									const baseName = path.basename(itemPath)
									return !ignore.includes(baseName)
								},
								tick: function (localPath, remotePath, error) {
									setLog(localPath)
									if (error) {
										failed.push(localPath)
									} else {
										successful.push(localPath)
									}
								}
							})
						}
					}
				}

				// 上传多个文件
				const putFilesFun = async () => {
					if (putFiles && Array.isArray(putFiles) && putFiles.length > 0) {
						setLog('Upload Files')
						await ssh.putFiles(putFiles.map(file => {
							return {
								local: path.resolve(rootPath, file.local),
								remote: file.remote
							}
						}))
					}
				}

				// 执行CMD命令
				const execCommandFun = async () => {
					setLog('Exec Command')
					if (execCommands) {
						for (let index in execCommands) {
							const cmd = execCommands[index]
							setLog(`[Command]:${cmd.command}`)
							const res = await ssh.execCommand(cmd.command, {
								cwd: cmd.cwd
							})
							setLog('STDOUT: \r\n' + res.stdout)
							if (res.stderr) {
								setLog('STDERR: \r\n' + res.stderr)
							}
						}
					}
				}

				ssh.connect(connect).then(async () => {
					setLog(`${connect.host} connected`)
					try {
						await putDirectoryFun()
						await putFilesFun()
						await execCommandFun()
					} catch (error) {
						setLog(error)
					}
					ssh.dispose()
					setLog(`${connect.host} disposed`)
					vscode.window.showInformationMessage('SSH 脚本执行完毕')
				})
			})
			context.subscriptions.push(disposable)
		}
	}
	setStatusBar(configList)
}

// 设置底部状态栏
const setStatusBar = (configList) => {
	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
	statusBar.text = `[SSH]`
	const commandList = configList.map(ssh => {
		return `[${ssh.name}](${vscode.Uri.parse(`command:SSH.${ssh.name}`)})`
	})
	const md = new vscode.MarkdownString()
	md.appendMarkdown(commandList.join(' | '))
	md.isTrusted = true;
	statusBar.tooltip = md
	statusBar.show()
}

module.exports = {
	activate
}