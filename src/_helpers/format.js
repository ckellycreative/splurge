import moment from 'moment';

const format = {
	formatDate(mydate , format){
		return moment.utc(mydate).format(format);
	},
	subtractDate(mydate , subtractVal, subtractParam ,format){
		return moment.utc(mydate).subtract(subtractVal , subtractParam).format(format);
	},
	currency(prefix , value){
		var num = '';
		if(!isNaN(value)){
	    	num = prefix + parseFloat(value).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
		}
		if(value === 0){
			num = prefix + 0;
		}
		return num;
	},
 	parseCurrency( num ) {
 		if(num === ''){
    		return 0 			
 		} else if (isNaN(num)){
 			return parseFloat( num.replace( /,/g, '') ).toFixed(2)
 		}else {
  			return parseFloat(num).toFixed(2)		
 		}
	}

}

export default format