/*globals angular, google */
'use strict';

try{
	angular.module('viewDeal');
}
catch(e){
	angular.module('viewDeal',[]);
}

angular.module('viewDeal')
	.directive('googleMap', function(){
		return {
			restrict: 'A',
			link: function(scope, elem, attrs){
				console.log(elem[0]);
				var myLatLng = {
						lat: 60.168765,
						lng:24.93833599,
					};
				var map = new google.maps.Map(elem[0],{
					center: myLatLng,
					scrollwheel: true,
					zoom: 16
				});

				var myMarker = new google.maps.Marker({
					map: map,
					position: myLatLng,
					title: 'Forum'
				});
			}
		};
	});