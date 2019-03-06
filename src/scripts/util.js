/**
 * Global Util Functions
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import _ from 'underscore';

export const Utils = {
    onlyUnique : (value, index, self)=>{
        return self.indexOf(value) === index;
    },
    randomDataSet:(dataSetSize, minValue, maxValue)=>{

        let randomiseArray =  new Array(dataSetSize).fill(0).map(function(n) {
            return Math.floor(Math.random() * (maxValue - minValue) + minValue);
        });

        do {
            randomiseArray =  new Array(dataSetSize).fill(0).map(function(n) {
                return Math.floor(Math.random() * (maxValue - minValue) + minValue);
            });
        }
        while (randomiseArray.filter(Utils.onlyUnique).length != randomiseArray.length);

        return randomiseArray;
    },
    chunkArray :(array, numberOfChunk)=>{
        return [].concat.apply([],
            array.map(function(elem,i) {
                return i%numberOfChunk ? [] : [array.slice(i,i+numberOfChunk)];
            })
        );
    },
  /**
    * Test if Obj is empty
    */
  objIsEmpty: (obj) => {
    if (typeof obj === 'object' && !(obj instanceof Array)) {
      if (Object.keys(obj).length === 0) return true;
    }
    return false;
  },

  /**
    * Convert Obj to Arr
    */
  objToArr: (obj, orderBy = null) => {
    let array = [];
    _.mapObject(obj, function(val, key) {
	    val.key = key;
      return array.push(val);
    });

    if(orderBy != null){
        array.sort(function(a, b){
            return a[orderBy] - b[orderBy]
        });
    }

    return array;
  }
};