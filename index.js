#!/usr/bin/env node


const fs = require('fs')
const path = require('path')
const colors = require('colors')
const getUserParam = require('./commander')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const readline = require('readline')
const readlineSync = require('readline-sync')
const Util = require('./util')


const version = Util.packageJSON(__dirname + '/', 'version')
const { 
    cmdType: CMD_TYPE,
    typeOrder: CMD_TYPE_ORDER,
    projectName: PRO_NAME,
    type: PRO_TYPE,
    repository: PRO_REPOSITORY,
    force: FORCE_BUILD,
    branch: PRO_BRANCH } = getUserParam(version) 

const gen = {

    curPath: process.cwd(),
    desc: '',
    proType: PRO_TYPE,
    branch: PRO_BRANCH,
    projectTypeIndex: 0,
    loadingDoneTag: false,
    isCreateNewRepo: false,
    isAddRemoteRepo: false,
    projectName: PRO_NAME || 'webapp',
    remoteRepoUrl: PRO_REPOSITORY || '',
    projectTypes: ['PC', 'H5'],
    RepoTypes: ['Create an repository', 'Add an remote repository'],
    proSourceUrl: [{
        type: 'PC',
        url: 'git@git.elenet.me:mengmeng.du/gen-PC.git'
    }, {
        type: 'H5',
        url: 'git@git.elenet.me:fed/h5-template.git'
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

    quesDesc() {
        // 代码提交的描述
        this.desc = readlineSync.question(colors.green(`Your commit desc`))
    },

    cleanCurDir(path) {
        // 若当前已存在目录文件，则询问是否清空
        if (!Util.isEmptyDirectory(path)) {
            const isRewrite = readlineSync.keyInYN(colors.green("Your directory isn't clean, ensure to rewrite it?"))
            if (isRewrite) {
                Util.deleteAll(path)
            } else {
                this._exitProcess()
            }
        }
    },

    confirm() {
        // 确认开始创建项目
        console.log('\nYour project info:')
        if (CMD_TYPE_ORDER === 0) {
            console.log({
                projectName: PRO_NAME,
                type: this.proType,
                repository: PRO_REPOSITORY
            })
        } else {
            console.log({ repository: PRO_REPOSITORY })
        }

        const isConfirmed = readlineSync.keyInYN(colors.green('Confirm to build your project?'))
        
        if (isConfirmed) {
            console.log(colors.green(`I'm going to build your app...`))
            this._setLoadingAction()
            this.buildPro()
        } else {
            this._exitProcess()
        }
    },

    buildPro() {
        
        // const proUrl = this._getProUrl(this.projectTypeIndex)

        if (this.remoteRepoUrl) {
            exec(`git clone ${this.remoteRepoUrl}`, (error) => {
                if(error) {
                    console.error('clone error2: ' + error)
                    this._exitProcess()
                }

                if (CMD_TYPE_ORDER === 0) {

                    if (this.isCreateNewRepo && !this.isAddRemoteRepo) {
                        Util.deleteAll(`${this.curPath}/.git`)
                        exec('git init', (error) => {
                            if(error) {
                                console.error('init error : ' + error)
                                this._exitProcess()
                            }
                            this._workDone('All work done!')
                        })
                    }
        
                    if (this.isAddRemoteRepo && !this.isCreateNewRepo) {
                        exec(`git remote set-url origin ${this.remoteRepoUrl}`, (error) => {
                            if(error) {
                                console.error('add remote error : ' + error)
                                this._exitProcess()
                            }
                            this._workDone('All work done!')
                        })
                    }

                    Util.packageJSON(this.curPath, 'name', this.projectName)
                } 

                if (CMD_TYPE_ORDER === 1) {
                    const name = this._getRepoName(PRO_REPOSITORY)
                    exec(`cd ${name} && git checkout -b ${PRO_BRANCH}`, err => {
                        if (err) { console.log(err) }
                        this._workDone(`All work done, and has checked to branch ${PRO_BRANCH}!`)
                    })
                }
                
            })
        } else {
            console.log('项目仓库路径为空！')
            this.quesRepo()
        }
    },

    _getRepoName(url) {
        return path.basename(url, '.git')
    },

    pushCode(repoUrl, desc) {
        if (!repoUrl || !desc) {
            this.quesRepo()
            this.quesDesc()
        }
        // TODO 
        execSync(`git update && git add . && git commit -m ${desc} && git push origin ${branch}`)
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
    
    _exitProcess() {
        // 退出当前进程
        console.log('\nFailed to build your app! \n')
        process.exit()
    },

    _workDone(str) {
        this.loadingDoneTag = true
        console.log(colors.yellow(`\r${str}`))
    },

    showHelp(type = '') {
        exec(`elefed-cli ${type} -h`, (e, output) => {
            if (e) { console.log(e) }
            console.log(output)
        })
    },

    _hasParam(val = /^-/) {
        // 是否传指定参数
        return process.argv.some((item) => {
            if (typeof val === 'string') {
                return item === val
            } else {
                return /^-/.test(item)
            }
        })
    },


    init() {
        
        if (this._hasParam()) {

            if (!this._hasParam('-p')) {

                if (CMD_TYPE_ORDER === 0) {
                    // create模式 特需参数
                    !PRO_NAME && this.quesName()
                    !PRO_TYPE && this.quesType()
    
                }
        
                if (CMD_TYPE_ORDER !== undefined) {
                    // create、dev模式 共需参数
                    !PRO_REPOSITORY && this.quesRepo()
                }

                if (!this._hasParam('-f') && CMD_TYPE_ORDER === 0) {
                    this.cleanCurDir(this.curPath)
                }

                this.confirm()
    
                // this.buildPro()

            } else {
                this.pushCode(this.remoteRepoUrl)
            }

        } else {
            this.showHelp(CMD_TYPE)
        }
    }
}

gen.init()

