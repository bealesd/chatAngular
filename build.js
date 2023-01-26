const fs = require("fs");
const path = require('path');
const { execSync } = require('child_process');
let core;

try {
    //if running in github action us core for error messaging
    core = require("@actions/core");
}
catch {
    //if running locally print error to console
    core = { setFailed: (msg) => { console.log(msg); } };
}

class Build {
    outputDir = 'docs';
    buildCommand = `ng build --configuration production --output-path docs --base-href "/chatAngular/"`;

    constructor() {
        this.fiveMinuteTimeout = 1000 * 60 * 5;
    }

    main() {
        try {
            //clean static web files by removing docs directory
            if (fs.existsSync(this.outputDir))
                fs.rmdirSync(this.outputDir, { recursive: true });
            
            //generate static web files in doc directory
            execSync(this.buildCommand, { timeout: this.fiveMinuteTimeout, stdio: 'inherit' });

            //create a 404 file so uknown routes can be resolved
            fs.copyFileSync(path.join(this.outputDir, 'index.html'), path.join(this.outputDir, '404.html'));
        } catch (e) {
            core.setFailed(`Error in build.js, generating static web files.\nError: ${e.message}.`);
        } finally { }
    }
}

new Build().main();