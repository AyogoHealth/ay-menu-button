/*! Copyright 2016 Ayogo Health Inc. */

import cleanup from 'rollup-plugin-cleanup';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    format: 'umd',
    banner: '/*! Copyright 2016 Ayogo Health Inc. */',
    sourceMap: 'inline',
    globals: {
        'angular': 'angular'
    },
    plugins: [
        cleanup(),
        sourcemaps()
    ]
};