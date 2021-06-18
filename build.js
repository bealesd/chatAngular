const fs = require("fs");
const path = require('path');
const { execSync } = require('child_process');

try {
    const core = require("@actions/core");
}
catch {
    const core = { setFailed: (msg) => { console.log(msg); } };
}

class Build {
    outputDir = 'docs';
    buildCommand = `ng build --prod --output-path docs --base-href "/chatAngular/"`;

    constructor() {
        this.fiveMinuteTimeout = 1000 * 60 * 5;
    }

    main() {
        try {
            fs.existsSync(this.outputDir)
            fs.rmdirSync(this.outputDir, { recursive: true });

            execSync(this.buildCommand, { timeout: this.fiveMinuteTimeout, stdio: 'inherit' });

            fs.copyFileSync(path.join(this.outputDir, 'index.html'), path.join(this.outputDir, '404.html'));
        } catch (e) {
            core.setFailed(e.message);
        } finally { }
    }
}

new Build().main();