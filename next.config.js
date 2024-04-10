/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
/* eslint-enable @typescript-eslint/no-var-requires */

exports.default = {
    distDir: '_next',
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
};
