

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

const Utils = {

    getType(val) {
        return Object.prototype.toString.call(val)
            .replace('[object ', '')
            .replace(']', '')
            .toLowerCase()
    },

    /* 
        操作package.json文件
        @param url 当前项目路径
        @param key 属性
        @param val 值（不传则为获取key属性，传则为设置key属性）
    */
    packageJSON(url = '', key, val) {
        try {
            const pt = `${url}/package.json`
            if (fs.existsSync(pt)) {
                const jsonObj = JSON.parse(fs.readFileSync(pt))
                if (typeof val === 'undefined') {
                    return jsonObj[key]
                } else {
                    jsonObj[key] = val
                    fs.writeFileSync(pt, JSON.stringify(jsonObj, null, 2))
                }
            }
        } catch(e) {
            console.log(e)
        }
    },

    deleteAll(path) {
        // 清空文件夹
        if(fs.existsSync(path)) {
            let files = fs.readdirSync(path)
            files.forEach((file, index) => {
                var curPath = `${path}/${file}`
                execSync(`rm -rf ${path}/${file}`, err => {
                    if (err) { console.log('remove dir error: ', err) }
                })
                // TODO
                // if(fs.statSync(curPath).isDirectory()) {
                //     execSync(`rm -rf ${path}/${file}`, err => {
                //         if (err) { console.log('remove dir error: ', err) }
                //     })
                // } else {
                //     execSync(`rm ${file}`, err => {
                //         if (err) { console.log('remove file error: ', err) }
                //     })
                // }
            })
        }
    },

    isEmptyDirectory(path) {
        return !fs.readdirSync(path).length
    },

    deleteDir(path) {
        if (fs.existsSync(path)) {
            this.deleteAll(path)
        }
    },
}

module.exports = Utils