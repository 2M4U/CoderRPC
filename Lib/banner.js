const logoMaker = require("asciiart-logo");
const pkg = require("../package.json");
const Banner = async() => {
    return console.log(logoMaker({
            name: "C O D E R R P C",
            font: "Calvin S",
            lineChars: 15,
            padding: 7,
            margin: 1,
            borderColor: "red"
        }).emptyLine()
        .center(`v${pkg.version}`)
        .center(`Developed By ${pkg.author}`)
        .emptyLine()
        .center('CoderRPC Client Started Successfully.')
        .emptyLine()
        .center('Everyone can now see when you are asleep and when you are awake!')
        .render());
};

module.exports.render = Banner;