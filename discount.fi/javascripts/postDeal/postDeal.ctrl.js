var ctrl;

try{
	ctrl = angular.module('postDeal');
}catch(e){
	ctrl = angular.module('postDeal',[]);
}

ctrl.controller('postDealCtrl', function($scope){
    var s = $scope;


    s.hasImages = false;
    s.afterPostImages = afterPostImages;
    s.defaultImages = ["http://demandware.edgesuite.net/aagb_prd/on/demandware.static/-/Sites-pim-catalog/default/dw9d57e11f/pim-static/main/12102956_RedDahlia_001_Main.jpg",
        "http://demandware.edgesuite.net/sits_pod39/dw/image/v2/AAGB_PRD/on/demandware.static/-/Sites-pim-catalog/default/dw67bb36e9/pim-static/main/12105726_NavyBlazer_504792_001_Main.jpg?sw=300",
        "http://demandware.edgesuite.net/sits_pod39/dw/image/v2/AAGB_PRD/on/demandware.static/-/Sites-pim-catalog/default/dw76262a04/pim-static/main/12102956_BlueWingTeal_001_Main.jpg?sw=300"];

    s.ofDiscount = {
        oriPrice : 0,
        discountPrice :0,
        clientSaving :0,
        discountPercent:0
    };

    s.ofPointSaving = {
        point :0,
    };

    s.startDate = new Date();
    s.endDate = new Date();
    s.startTime = new Date();
    s.endTime = new Date();


    s.ofDiscount.calculate = calculate;
    ///
    function afterPostImages(){
        s.hasImages = true;
    }
    function calculate(){
        s.ofDiscount.clientSaving = s.ofDiscount.oriPrice - s.ofDiscount.discountPrice;
        s.ofDiscount.discountPercent = Math.round(s.ofDiscount.discountPrice / s.ofDiscount.oriPrice * 10000)/100;
        s.ofDiscount.discountPercent  = (s.ofDiscount.discountPercent == Infinity)? 0 : s.ofDiscount.discountPercent;


    }


});