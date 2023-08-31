/*! Copyright 2016 - 2023 Ayogo Health Inc. */

import cleanup from 'rollup-plugin-cleanup';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    output: {
        format: 'umd',
        banner: '/*! Copyright 2016 - 2023 Ayogo Health Inc. */',
        sourcemap: true
    },
    plugins: [
        cleanup(),
        sourcemaps()
    ]
};
