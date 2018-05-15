#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const colors = require('colors')
const program = require('commander')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const readline = require('readline')
const readlineSync = require('readline-sync')
program.parse(process.argv)


const gen = {

    curPath: process.cwd(),
    projectName: program.args[0]|| 'webapp',
    projectTypeIndex: 0,
    loadingDoneTag: false,
    remoteRepoUrl: '', // 远程仓库路径
    projectTypes: ['PC', 'H5'],
    RepoTypes: ['Create an repository', 'Add an remote repository'],
    isCreateNewRepo: false,
    isAddRemoteRepo: false,
    proSourceUrl: [{
        type: 'PC',
        url: 'git@git.elenet.me:mengmeng.du/gen-PC.git'
    }, {
        type: 'H5',
        url: 'git@git.elenet.me:mengmeng.du/gen-H5.git'
    }],
    
    quesName() {
        // 项目的名称 default:webapp
        this.projectName = readlineSync.question(colors.green(`Your project name：(${this.projectName})`), {
            defaultInput: this.projectName
        })
    },

    quesType() {
        // 项目的类型 default:PC
        this.projectTypeIndex = readlineSync.keyInSelect(this.projectTypes, colors.green('Choose your project type：'))
    },

    quesRepo() {
        // 询问是否添加远程仓库
        const repoTypeIndex = readlineSync.keyInSelect(this.RepoTypes, colors.green("How to deal with the repository?"))
        if (repoTypeIndex === 0) {  
            this.isCreateNewRepo = true
        }
        if (repoTypeIndex === 1) {
            this.isAddRemoteRepo = true
            this.remoteRepoUrl = readlineSync.question(colors.green(`Input repository url：`), {
                limit: /^(https:\/\/|git\@)git.elenet.me(\:|\/)[\w|\.|\-]+/i,
                limitMessage: colors.red('Sorry, the url is incorrect!')
            })
        }
    },

    prepare(path) {
        // 若当前已存在目录文件，则询问是否清空
        if (!this._isEmptyDirectory(path)) {
            const isRewrite = readlineSync.keyInYN(colors.green("Your directory isn't clean, ensure to rewrite it?"))
            if (isRewrite) {
                this._deleteall(path)
            } else {
                this._exitProcess()
            }
        }
    },

    confirm() {
        // 确认开始创建项目
        const isConfirmed = readlineSync.keyInYN(colors.green('Confirm to build your project?'))
        if (isConfirmed) {
            console.log(colors.green(`I'm going to build your app...`))
            this._setLoadingAction()
        } else {
            this._exitProcess()
        }
    },

    buildPro() {
        // 从远程克隆目录文件
        const proUrl = this._getProUrl(this.projectTypeIndex)
        if (proUrl) {
            exec(`git clone ${proUrl} ${this.curPath}`, (error) => {
                this.initPro()
                if(error) {
                    console.error('clone error: ' + error)
                    this._exitProcess()
                }

                if (this.isCreateNewRepo && !this.isAddRemoteRepo) {
                    this._deleteGitDic(`${this.curPath}/.git`)
                    exec('git init', (error) => {
                        if(error) {
                            console.error('init error : ' + error)
                            this._exitProcess()
                        }
                        this._workDone()
                    })
                }
    
                if (this.isAddRemoteRepo && !this.isCreateNewRepo) {
                    exec(`git remote set-url origin ${this.remoteRepoUrl}`, (error) => {
                        if(error) {
                            console.error('add remote error : ' + error)
                            this._exitProcess()
                        }
                        this._workDone()
                    })
                }
            })
        } else {
            console.log('项目仓库路径为空！')
        }
    },

    initPro() {
        // 自定义package.json文件
        const jsonFilePath = `${this.curPath}/package.json`
        const jsonContent = JSON.parse(fs.readFileSync(jsonFilePath))
        jsonContent.name = this.projectName
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2))
    },

    _setLoadingAction() {
        const fix = ['-', '\\', '/']
        let num = 0
        let loadTimer = setInterval(() => {
            process.stdout.write(`\r${fix[(num++) % 3]}`)
            if (this.loadingDoneTag) {
                clearInterval(loadTimer)
                readline.clearLine(process.stdout, 0)
            }
        }, 200)
    },
    
    _getProUrl(idx = 0) {
        // 获取项目路径
        return this.proSourceUrl ? this.proSourceUrl[idx].url : ''
    },
    
    _deleteall(path) {
        // 清空文件夹
        if(fs.existsSync(path)) {
            let files = fs.readdirSync(path)
            files.forEach((file, index) => {
                var curPath = `${path}/${file}`
                if(fs.statSync(curPath).isDirectory()) {
                    execSync(`rm -rf ${path}/${file}`, err => {
                        console.log('remove dir error: ', err)
                    })
                } else {
                    execSync(`rm ${path}/${file}`, err => {
                        console.log('remove file error: ', err)
                    })
                }
            })
        }
    },

    _deleteGitDic(path) {
        // 删除.git文件夹
        if (fs.existsSync(path)) {
            this._deleteall(path)
        }
    },

    _exitProcess() {
        // 退出当前进程
        console.log('\nFailed to build your app! \n')
        process.exit()
    },

    _isEmptyDirectory(path) {
        // 是否为空目录
        return !fs.readdirSync(path).length
    },

    _workDone() {
        this.loadingDoneTag = true
        console.log(colors.yellow('\rAll work done!'))
    },
}

try {
    gen.quesName()
    gen.quesType()
    gen.quesRepo()
    gen.prepare(gen.curPath)
    gen.confirm()
    gen.buildPro()
    // gen.initPro()
} catch (e) {
    console.log('Some error occured:', JSON.stringify(e))
}
