/**
 * Created by chuso_000 on 24/10/2015.
 */
try{
    angular.module('advancedSearch');
}catch(e){
    angular.module('advancedSearch',[]);
}

angular.module('advancedSearch')
    .controller('advancedSearchCtrl', function($scope){
        var s = $scope;

        $scope.$on('$viewContentLoaded',
            function(event){
                /* Add scollspy */
                $('[data-spy="scroll"]').each(function () {
                    var $spy = $(this).scrollspy('refresh')
                })
                console.log($('#fixed-nav').length);
            });

        s.init = function () {

        };

        /* Declare filter options */
        s.filterOptions = {};
        
        s.$watch('filterOptions', function (newVal, oldVal) {
            if (newVal !== oldVal){
                /* Check for price filter!  */
                if (s.filterOptions.price == 'noRanges'){}
                else if(s.filterOptions.price == 'ranges' && s.filterOptions.priceFrom && s.filterOptions.priceTo){
                    s.filter.push({

                    })
                }

            }
        }, true);

        /* Declare filter table */
        s.filters = [
            {
                type: 'category',
                name: 'Category',
                value: 'Food',
                sortable:false
            },
            {
                type:'price',
                name:'Price',
                value:{
                    "from":29,
                    "to": 99
                },
                sortable:true
            },{
                type: 'time',
                name: 'Time',
                value:'closing'
            },{
                type: 'typeOfDiscount',
                name: 'Type of discount',
                value: 'promotion'
            },{
                type: 'rating',
                name: 'Rating',
                value:{
                    "from":3,
                    "to":5
                },
                sortable: true
            }];

        /* Assign fake result */
        s.result = [{
            photo: 'http://takemetofoodieheaven.files.wordpress.com/2013/06/img_2577.jpg',
            title: 'Chocolate and Code ribs',
            category: 'Food And Drink',
            typeOfDiscount: 'Discount',
            merchant:'Shanghai Cowboy',
            address: 'Mikonkatu 4, Helsinki',
            oriPrice: 28.00,
            discountPrice: 20.00,
            quantity: 50,
            remaining: '6 days 5 hours 20 minutes',
            rating: 3,
            noReviews:122,
            noViews: 222
        }, {
            photo: 'https://asiakas.kotisivukone.com/files/hoku.helsinki.palvelee.fi/.album/1354036130923_1_large.jpg',
            title: 'Braised Crispi Pork Belly',
            category: 'Food And Drink',
            typeOfDiscount: 'Point saving',
            merchant: 'Hoku',
            address: 'Merimiehenkatu 18, Helsinki',
            oriPrice: 25.00,
            discountPrice: 20.00,
            quantity: 100,
            remaining: '5 hours 20 minutes',
            rating: 2,
            noReviews: 115,
            noViews: 300
        }, {
            photo: 'http://www.ravintolaborneo.fi/wp-content/uploads/2014/04/menu_satay_nasi_7.jpg',
            title: 'Satay Ayan Masi Kelapa',
            category: 'Food And Drink',
            typeOfDiscount: 'Promotion',
            merchant: 'Ravintola Bomeo',
            address: 'Ilmarinkatu 8, Tampere',
            oriPrice: 26.00,
            discountPrice: 18.00,
            quantity: 20,
            remaining: '1 day 3 hours 15 minutes',
            rating: 5,
            noReviews: 75,
            noViews: 99
        }, {
            photo: 'http://cdn.blessthisstuff.com/imagens/stuff/sushi-bazooka-5.jpg',
            title: 'Norimaki',
            category: 'Food And Drink',
            typeOfDiscount: 'Discount',
            merchant: 'Norimaki',
            address: 'Eerikinkatu 16, Tampere',
            oriPrice: 12.00,
            discountPrice: 8.00,
            quantity: 20,
            remaining: '4 days 10 hours 10 minute',
            rating: 4,
            noReviews: 42,
            noViews: 57
        }, {
            photo: 'http://montedaquintaresort.com/uploads/media/photos/spa-couple.jpg',
            title: 'ESPA Body Treatments',
            category: 'Beauty And Spa',
            typeOfDiscount: 'Discount',
            merchant: 'Kamp Spa',
            address: 'Kluuvikatu 48 8th floor, Helsinki',
            oriPrice: 45.00,
            discountPrice: 35.00,
            quantity: 15,
            remaining: '7 hours 3 minutes',
            rating: 3,
            noReviews: 35,
            noViews: 89
        }];
    });




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
/*global  angular:false */
(function(){
	'use strict';
	try {
		angular.module('viewDeal');
	} catch (e) {
		angular.module('viewDeal',[]);
	}

	angular.module('viewDeal')
		.controller('viewDealHomeCtrl', function($scope, $state){
			var s = $scope;
			s.deals = [
			{
				title: 'Classic flannel casual shirt',
				photo: 'http://demandware.edgesuite.net/sits_pod39/dw/image/v2/AAGB_PRD/on/demandware.static/-/Sites-pim-catalog/default/dw9a268e75/pim-static/main/12098925_Syrah_480895_002_Main.jpg?sw=300',
				merchantName: 'Jack & Jones',
				oriPrice: 39.95,
				discountPrice: 29.99,
				discountPercent: Math.round((39.95 - 29.99)/39.95* 1000) /10,
				quantity: 20,
				time: '20 hrs 10 mins'
			},
			{
				title: 'Big discount on Asian food',
				photo: 'data:image/jpeg;base64,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',
				merchantName: 'Fiku Ravintola',
				oriPrice: 39.99,
				discountPrice: 29.99,
				discountPercent: Math.round((39.99 - 29.99)/39.99 *1000)/10,
				quantity: 100,
				time: '06 hrs 54 mins'
			},{
				title: 'Com tam discount - Vietnamese food',
				photo: 'data:image/jpeg;base64,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',
				merchantName: 'Ba Beo Ravintola',
				oriPrice: 59.99,
				discountPrice: 29.99,
				discountPercent: Math.round((59.99 - 29.99)/59.99 *1000)/10,
				quantity: 51,
				time: '08 hrs 09 mins'
			},{
				title: 'Spa package',
				photo: 'data:image/jpeg;base64,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',
				merchantName: 'Leisure spa',
				oriPrice: 139.99,
				discountPrice: 81.99,
				discountPercent: Math.round((139.99 - 81.99)/139.99 *1000)/10,
				quantity: 10,
				time: '01 day 05 hrs'
			},{
				title: '30% discount on movie tickets',
				photo: 'data:image/jpeg;base64,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',
				merchantName: 'Finnkino',
				oriPrice: 9.99,
				discountPrice: 5.99,
				discountPercent: Math.round((9.99 - 5.99)/9.99 *1000)/10,
				quantity:159,
				time: '01 day 10 hrs'
			}];
			s.goToDeal = function(dealId){
				$state.go('viewDeal',{dealName: 'classic-flannel-casual-shirt'});
			};

			
		});
}(angular));
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

/*global  angular:false */
'use strict';
angular.module('discountApp',['ui.router','postDeal','viewDeal','advancedSearch'])
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise("/home");
		$stateProvider
			.state('home',{
				url: '/home',
				views:{
					'header':{
						templateUrl: 'header.html',
					},
					'body':{
						templateUrl:'home-body2.html',
						controller:'viewDealHomeCtrl'
					}
				}
			})
			.state('home2',{
				url:'/home2',
				views:{
					'header':{
						templateUrl:'header.html'
					},
					'body':{
						templateUrl:'home-body.html',
					}
				}
			})
			.state('postDeal',{
				url: '/postDeal',
				views:{
					'header':{
						templateUrl: 'header.html',
					},
					'body':{
						templateUrl:'post-deal.html',
                        controller:'postDealCtrl'
					}
				}
			})
			.state('viewDeal',{
				url: '/deal/:dealName',
				views:{
					header:{
						templateUrl: 'header.html',
					},
					'body':{
						templateUrl:'deal.html',
						controller:'viewDealCtrl'
					}
				}
			})
            .state('advancedSearch',{
                url: '/advanced-search',
                views:{
                    header:{
                        templateUrl: 'header.html'
                    },
                    'body':{
                        templateUrl:'advanced-search.html',
                        controller:'advancedSearchCtrl'
                    }
                }
            })


	});  
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

