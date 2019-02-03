const webpack = require('webpack');
const chalk = require('chalk');
const config = require('./configs/webpack.config.prod');

function compile() {
    return webpack(config, (_, e) => {
        const { compilation: { errors, warnings } } = e;
        console.log(chalk.magentaBright(warnings));
        if (!!errors && errors != '') {
            console.log(chalk.yellow('compile failed!!!\r\n'),
                chalk.red(`${errors}`),
                chalk.cyanBright(_));
        } else {
            console.log("compile success!!");
        }
    });
}
compile();