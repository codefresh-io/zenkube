import { at, omit, defaults } from "lodash";
import MurmurHash3 from "imurmurhash";
import React from "react";

const img = (...args)=> React.createElement('img', ...args);

export default (obj = {}) => {
    let defaultObj = defaults(obj, {
        width: 32,
        height: 32
    });

    return img(
       Object.assign(
            { src: `https://robohash.org/${MurmurHash3(obj["id"]).result().toString(16)}.png?size=${at(obj, 'width', 'height').join('x')}` },
            omit(defaultObj, 'src') // "..." object expander is a late es6 addition
        )
    );
};