/*! Copyright 2016 Ayogo Health Inc. */

import cleanup from 'rollup-plugin-cleanup';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    output: {
        format: 'umd',
        banner: '/*! Copyright 2017 Ayogo Health Inc. */',
        sourcemap: true,
        globals: {
            'angular': 'angular'
        }
    },
    plugins: [
        cleanup(),
        sourcemaps()
    ]
};
