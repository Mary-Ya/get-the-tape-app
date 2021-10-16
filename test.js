
    a1 = [121, 144, 19, 161, 19, 144, 19, 11];
    a2 = [11*11, 121*121, 144*144, 19*19, 161*161, 19*19, 144*144, 19*19];

function comp(array1, array2) {
    //your code here
      if (!array2 || !array1 || array1.length !== array2.length) return false;
      let array1HasABro = [];
      let array2HasABro = [];
    
    array2.forEach((val2, ind2) => {
        let res =
            array1.forEach((val1, ind1) => {
                if (val1 * val1 === val2) {
                    if (!array1HasABro[ind1]) {
                        array1HasABro[ind1] = ind2;
                        array2HasABro[ind2] = ind1;
                    }
                }
            })
    });
    
      const res1 = array1HasABro.filter(i => Boolean(i));
      const res2 = array2HasABro.filter(j => Boolean(j));
      console.log(res1, res2);
      return res1.length === array1.length && res2.length === array2.length;
  }