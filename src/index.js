#!/usr/bin/env node

const leven = require('leven')
const colors = require('colors')
const program = require('commander')
const Main = require('./common/main')
const Util = require('./common/utils')

function suggestCommands(unknownCommand) {
    const availableCommands = program.commands.map(cmd => cmd._name)

    let suggestion

    availableCommands.forEach(cmd => {
        const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
        if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
            suggestion = cmd
        }
    })

    if (suggestion) {
        console.log(`  ` + colors.red(`Did you mean ${colors.yellow(suggestion)} ?`))
    }
}

program
    .version(`cosmos ${require('../package').version}`)
    .usage('<command> [options]')

program
    .command('create <app-name>')
    .description('create a new project by default template')
    .option('-d, --usedefault', `Skip prompts and use default template type of【${Util.getTemplate().type}】`)
    .option('-p, --path <path>', `Path to create your project`)
    .option('-t, --type <type>', `Template type of:【${Util.getTemplateTypeList().join(' | ')}】`)
    .action((name, cmd) => {
        const {
            usedefault,
            type,
            path
        } = cmd
        if (usedefault && type && type.toLowerCase() !== Util.getTemplate().type.toLowerCase()) {
            console.log(`  ` + colors.red(`Template type not sure.`))
            process.exit(0)
        }
        Main.init({
            name,
            usedefault,
            type,
            path
        })
    })

program
    .command('init <app-name> <template>')
    .description('generate a project from a remote template')
    .option('-p, --path <path>', `Path to create your project`)
    .action((name, cmd) => {
        Main.init({
            name,
            url: cmd
        })
    })


// output help information on unknown commands
program
    .arguments('<command>')
    .action((cmd) => {
        program.outputHelp()
        console.log(`  ` + colors.red(`Unknown command ${colors.yellow(cmd)}.`))
        suggestCommands(cmd)
        console.log()
    })

// add some useful info on help
program.on('--help', () => {
    console.log()
    console.log(`  Run ${colors.yellow(`cosmos <command> --help`)} for detailed usage of given command. ✨`)
    console.log()
})

program.parse(process.argv)