/*globals angular*/
'use strict';

try{
	angular.module('viewDeal');
}
catch(e){
	angular.module('viewDeal',[]);
}

angular.module('viewDeal')
	.controller('viewDealCtrl', function($scope, $stateParams){
		var s = $scope;
		s.deal = fakeAPI().get($stateParams.dealName);
		s.rate = function(){
			s.isRated = !s.isRated;
		};
		s.fakeSubmitReview = function(user, star, title, review){
			s.deal.userRating.push({
				user: user,
				star: star,
				review: review,
				title: title
			});
		};

		/// Google Maps
		

	});




function fakeAPI(){
	return {
		get:function(url){
			return {
				title: '40% discount classic flannel casual shirt',
				merchantName: 'Jack & Jones',
				description:"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
				images:["http://demandware.edgesuite.net/aagb_prd/on/demandware.static/-/Sites-pim-catalog/default/dw9d57e11f/pim-static/main/12102956_RedDahlia_001_Main.jpg",
        "http://demandware.edgesuite.net/sits_pod39/dw/image/v2/AAGB_PRD/on/demandware.static/-/Sites-pim-catalog/default/dw67bb36e9/pim-static/main/12105726_NavyBlazer_504792_001_Main.jpg?sw=300",
        "http://demandware.edgesuite.net/sits_pod39/dw/image/v2/AAGB_PRD/on/demandware.static/-/Sites-pim-catalog/default/dw76262a04/pim-static/main/12102956_BlueWingTeal_001_Main.jpg?sw=300"],
				termsAndConditions:['Free returns','Does not ship to PO boxes/AK/HI/Canada/Puerto Rico.','Most orders are delivered within 7 business days from the purchase date.'],
				oriPrice:79.50,
				discountPrice:19.99,
				discountPercent:75,
				clientSaving: 59.51,
				userRating:[
					{
						star:4,
						user:'Son',
						title:'Love it',
						review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget velit egestas, porttitor turpis ultrices, dignissim ligula. Etiam ac elit nunc. Aenean fringilla lorem ex, nec varius felis finibus ac.'
					},
					{
						star:2,
						user:'Vinh',
						title:'Not very comfortable',
						review: 'Nullam lacinia urna in dui pretium sollicitudin. Nam nec tristique sapien. '
					},
					{
						star:2,
						user:'Lieu',
						title:'Not satisfied',
						review:'Nulla viverra imperdiet urna ut pellentesque. Sed ac elit pulvinar, sollicitudin erat id, dictum ante. Integer ornare lacus sit amet tempus dapibus. '
					}
				]
			};
		}
	};
}