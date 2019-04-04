/*! Copyright 2016 Ayogo Health Inc. */

import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';

export default {
    output: {
        format: "esm"
    },
    external: ['vue'],
    plugins: [
        typescript({
            tsconfig: 'tsconfig.es5.json'
        }),
        commonjs(),
        vue()
    ],
};
